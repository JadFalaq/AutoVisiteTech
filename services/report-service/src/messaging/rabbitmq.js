const amqp = require('amqplib');

let connection = null;
let channel = null;

/**
 * Connexion à RabbitMQ avec retry
 */
async function connectRabbitMQ() {
  const maxRetries = 10;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
      connection = await amqp.connect(rabbitmqUrl);
      channel = await connection.createChannel();

      console.log('✅ Connecté à RabbitMQ');

      // Déclarer les exchanges
      await channel.assertExchange('inspection_events', 'topic', { durable: true });
      await channel.assertExchange('payment_events', 'topic', { durable: true });
      await channel.assertExchange('report_events', 'topic', { durable: true });

      // Déclarer les queues
      await channel.assertQueue('report_generation', { durable: true });
      await channel.assertQueue('invoice_creation', { durable: true });
      await channel.assertQueue('email_notifications', { durable: true });

      // Binding des queues aux exchanges
      await channel.bindQueue('report_generation', 'inspection_events', 'inspection.completed');
      await channel.bindQueue('invoice_creation', 'payment_events', 'payment.succeeded');

      // Gestion des erreurs de connexion
      connection.on('error', (err) => {
        console.error('❌ Erreur de connexion RabbitMQ:', err.message);
      });

      connection.on('close', () => {
        console.log('⚠️  Connexion RabbitMQ fermée, tentative de reconnexion...');
        setTimeout(connectRabbitMQ, 5000);
      });

      return channel;
    } catch (error) {
      retries++;
      console.log(`⏳ Tentative de connexion RabbitMQ ${retries}/${maxRetries}...`);
      if (retries >= maxRetries) {
        console.error('❌ Impossible de se connecter à RabbitMQ:', error.message);
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
}

/**
 * Publier un événement
 */
async function publishEvent(exchange, routingKey, message) {
  try {
    if (!channel) {
      await connectRabbitMQ();
    }

    const messageBuffer = Buffer.from(JSON.stringify(message));
    channel.publish(exchange, routingKey, messageBuffer, {
      persistent: true,
      contentType: 'application/json',
      timestamp: Date.now(),
    });

    console.log(`📤 Événement publié: ${exchange}.${routingKey}`);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la publication:', error);
    throw error;
  }
}

/**
 * Consommer des messages d'une queue
 */
async function consumeQueue(queueName, handler) {
  try {
    if (!channel) {
      await connectRabbitMQ();
    }

    console.log(`👂 Écoute de la queue: ${queueName}`);

    await channel.consume(queueName, async (msg) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());
          console.log(`📥 Message reçu de ${queueName}:`, content);

          await handler(content);

          // Acknowledge le message
          channel.ack(msg);
        } catch (error) {
          console.error('❌ Erreur lors du traitement du message:', error);
          // Rejeter le message et le remettre dans la queue
          channel.nack(msg, false, true);
        }
      }
    });
  } catch (error) {
    console.error('❌ Erreur lors de la consommation:', error);
    throw error;
  }
}

/**
 * Fermer la connexion RabbitMQ
 */
async function closeConnection() {
  try {
    if (channel) {
      await channel.close();
    }
    if (connection) {
      await connection.close();
    }
    console.log('✅ Connexion RabbitMQ fermée');
  } catch (error) {
    console.error('❌ Erreur lors de la fermeture:', error);
  }
}

/**
 * Publier un événement de rapport généré
 */
async function publishReportGenerated(reportData) {
  return publishEvent('report_events', 'report.generated', {
    event: 'report.generated',
    timestamp: new Date().toISOString(),
    data: reportData,
  });
}

/**
 * Publier un événement de facture créée
 */
async function publishInvoiceCreated(invoiceData) {
  return publishEvent('report_events', 'invoice.created', {
    event: 'invoice.created',
    timestamp: new Date().toISOString(),
    data: invoiceData,
  });
}

/**
 * Publier un événement de facture payée
 */
async function publishInvoicePaid(invoiceData) {
  return publishEvent('report_events', 'invoice.paid', {
    event: 'invoice.paid',
    timestamp: new Date().toISOString(),
    data: invoiceData,
  });
}

/**
 * Publier un événement d'email envoyé
 */
async function publishEmailSent(emailData) {
  return publishEvent('report_events', 'email.sent', {
    event: 'email.sent',
    timestamp: new Date().toISOString(),
    data: emailData,
  });
}

module.exports = {
  connectRabbitMQ,
  publishEvent,
  consumeQueue,
  closeConnection,
  publishReportGenerated,
  publishInvoiceCreated,
  publishInvoicePaid,
  publishEmailSent,
};
