const OpenAI = require('openai');
const Groq = require('groq-sdk');

class MultiLLMService {
  constructor() {
    // Configuration des différents providers
    this.providers = {
      openai: null,
      groq: null,
      fallback: true
    };

    // Initialiser OpenAI si la clé existe
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_key_here') {
      this.providers.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    // Initialiser Groq si la clé existe
    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_key_here') {
      this.providers.groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
      });
    }
    
    // Contexte spécialisé pour Auto Visite Tech
    this.systemPrompt = `Tu es un assistant virtuel spécialisé pour Auto Visite Tech, un centre de contrôle technique automobile.

INFORMATIONS SUR L'ENTREPRISE:
- Auto Visite Tech est un centre agréé par l'État depuis 2009
- 15+ années d'expérience dans le contrôle technique automobile
- Plus de 10 000 véhicules contrôlés avec succès
- Équipements modernes de dernière génération (mise à jour 2024)
- Contrôle selon les 133 points réglementaires obligatoires
- Certification ISO 9001 pour la qualité de service
- Équipe de 8 techniciens certifiés et expérimentés
- Taux de réussite de 87% au premier passage
- Centre moderne de 500m² avec 4 lignes de contrôle
- Fondé par Jean Dupont, expert automobile depuis 25 ans

SERVICES PROPOSÉS:
1. Contrôle technique véhicules légers - À partir de 69€
2. Contre-visite - À partir de 25€
3. Scan et analyse de carte grise - Gratuit
4. Assistant virtuel - Gratuit

HORAIRES:
- Lundi à Vendredi: 8h00 - 18h00
- Samedi: 8h00 - 16h00
- Dimanche: Fermé

ADRESSE ET CONTACT:
- Adresse: 123 Avenue de la République, 75001 Paris
- Téléphone: 01 23 45 67 89
- Email: contact@autovisitetech.fr
- Parking gratuit disponible
- WiFi gratuit
- Espace d'attente climatisé

DOCUMENTS NÉCESSAIRES:
- Carte grise du véhicule
- Pièce d'identité du propriétaire
- Ancien certificat de contrôle (si disponible)

FONCTIONNALITÉS DISPONIBLES:
- Réservation en ligne 24h/24 via notre site web
- Consultation des créneaux disponibles
- Rappel automatique 24h avant le rendez-vous
- Paiement en ligne sécurisé ou sur place
- Rapport de contrôle numérique envoyé par email

INSTRUCTIONS:
- Réponds à toutes les questions sur l'entreprise, ses services, son histoire
- Pour les rendez-vous, explique le processus de réservation en ligne
- Si on te demande les créneaux disponibles, explique qu'il faut aller sur la page de réservation
- Sois professionnel, courtois et précis
- Propose toujours de rediriger vers la réservation en ligne si pertinent
- Si tu ne connais pas une information spécifique, propose de contacter directement le centre
- Utilise un ton amical mais professionnel
- Réponds en français
- Tu peux répondre aux questions générales sur l'automobile et le contrôle technique
- Si la question n'est pas liée au domaine automobile, redirige poliment vers le sujet`;
  }

  async generateResponse(message, conversationHistory = []) {
    // Essayer les providers dans l'ordre de préférence
    const providers = ['groq', 'openai'];
    
    for (const providerName of providers) {
      if (this.providers[providerName]) {
        try {
          console.log(`🤖 Tentative avec ${providerName.toUpperCase()}...`);
          const result = await this.callProvider(providerName, message, conversationHistory);
          console.log(`✅ Succès avec ${providerName.toUpperCase()}`);
          return result;
        } catch (error) {
          console.warn(`⚠️ ${providerName.toUpperCase()} échoué:`, error.message);
          continue;
        }
      }
    }

    // Fallback vers les réponses prédéfinies
    console.log('🔄 Utilisation du mode fallback');
    return this.getFallbackResponse(message);
  }

  async callProvider(providerName, message, conversationHistory) {
    const messages = [
      { role: 'system', content: this.systemPrompt }
    ];

    // Ajouter l'historique récent
    const recentHistory = conversationHistory.slice(-5);
    recentHistory.forEach(conv => {
      messages.push({ role: 'user', content: conv.message });
      messages.push({ role: 'assistant', content: conv.response });
    });

    messages.push({ role: 'user', content: message });

    if (providerName === 'openai') {
      const completion = await this.providers.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 300,
        temperature: 0.7,
      });

      return {
        response: completion.choices[0].message.content.trim(),
        tokens_used: completion.usage.total_tokens,
        model: 'gpt-3.5-turbo (OpenAI)'
      };
    }

    if (providerName === 'groq') {
      const completion = await this.providers.groq.chat.completions.create({
        model: 'llama-3.1-8b-instant', // Modèle gratuit et rapide
        messages: messages,
        max_tokens: 300,
        temperature: 0.7,
      });

      return {
        response: completion.choices[0].message.content.trim(),
        tokens_used: completion.usage.total_tokens,
        model: 'Llama-3.1-8B (Groq - Gratuit)'
      };
    }

    throw new Error(`Provider ${providerName} non supporté`);
  }

  getFallbackResponse(message) {
    const msg = message.toLowerCase();
    
    const responses = {
      greeting: "Bonjour ! Je suis l'assistant virtuel d'Auto Visite Tech. Comment puis-je vous aider avec votre contrôle technique ?",
      appointment: "Pour prendre rendez-vous, utilisez notre système de réservation en ligne disponible 24h/24. Vous pouvez choisir votre créneau parmi les disponibilités en temps réel. Souhaitez-vous que je vous guide vers la page de réservation ?",
      price: "Nos tarifs sont : Contrôle technique complet à partir de 69€, Contre-visite à partir de 25€. Le scan de carte grise est gratuit ! Nous acceptons les paiements en ligne et sur place.",
      documents: "Pour votre contrôle technique, apportez : votre carte grise, une pièce d'identité et l'ancien certificat de contrôle si vous en avez un. Pas besoin d'autres documents !",
      hours: "Nous sommes ouverts du lundi au vendredi de 8h à 18h, le samedi de 8h à 16h. Fermé le dimanche. Réservation en ligne possible 24h/24.",
      contact: "Contactez-nous au 01 23 45 67 89 ou par email à contact@autovisitetech.fr. Nous sommes au 123 Avenue de la République, 75001 Paris. Parking gratuit sur place !",
      company: "Auto Visite Tech est un centre agréé par l'État depuis 2009. Nous avons 15+ années d'expérience et avons contrôlé plus de 10 000 véhicules. Notre équipe de 8 techniciens certifiés vous garantit un service de qualité.",
      history: "Auto Visite Tech a été fondé en 2009 par Jean Dupont, expert automobile avec 25 ans d'expérience. Nous sommes certifiés ISO 9001 et avons un taux de réussite de 87% au premier passage.",
      services: "Nos services : Contrôle technique véhicules légers (69€), Contre-visite (25€), Scan de carte grise (gratuit), et assistance virtuelle. Nous disposons de 4 lignes de contrôle dans notre centre moderne de 500m².",
      availability: "Pour consulter les créneaux disponibles, rendez-vous sur notre page de réservation en ligne. Vous y verrez en temps réel tous les créneaux libres pour les prochaines semaines.",
      default: "Je peux vous renseigner sur Auto Visite Tech : nos services, tarifs, horaires, histoire de l'entreprise, prise de rendez-vous, ou toute question sur le contrôle technique automobile. Que souhaitez-vous savoir ?"
    };

    // Détection des intentions
    if (msg.match(/bonjour|salut|hello|hey|bonsoir/)) return { response: responses.greeting, tokens_used: 0, model: 'Fallback' };
    if (msg.match(/rendez-vous|réservation|rdv|appointment|créneau|disponible|libre/)) return { response: responses.appointment, tokens_used: 0, model: 'Fallback' };
    if (msg.match(/prix|tarif|coût|combien|€|euro|payer|paiement/)) return { response: responses.price, tokens_used: 0, model: 'Fallback' };
    if (msg.match(/document|papier|carte grise|pièce|identité|apporter/)) return { response: responses.documents, tokens_used: 0, model: 'Fallback' };
    if (msg.match(/horaire|heure|ouvert|fermé|quand|ouvre|ferme/)) return { response: responses.hours, tokens_used: 0, model: 'Fallback' };
    if (msg.match(/contact|téléphone|adresse|email|où|situé|localisation/)) return { response: responses.contact, tokens_used: 0, model: 'Fallback' };
    if (msg.match(/entreprise|société|qui êtes|histoire|fondé|création|depuis quand/)) return { response: responses.company, tokens_used: 0, model: 'Fallback' };
    if (msg.match(/créé|fondateur|jean dupont|historique|début|origine/)) return { response: responses.history, tokens_used: 0, model: 'Fallback' };
    if (msg.match(/service|que faites|proposez|offrez/)) return { response: responses.services, tokens_used: 0, model: 'Fallback' };
    if (msg.match(/disponibilité|planning|agenda|créneaux libres/)) return { response: responses.availability, tokens_used: 0, model: 'Fallback' };
    
    return { response: responses.default, tokens_used: 0, model: 'Fallback' };
  }

  async isServiceAvailable() {
    // Vérifier si au moins un provider est disponible
    if (this.providers.groq) {
      try {
        // Test simple avec Groq
        await this.providers.groq.chat.completions.create({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1,
        });
        return 'groq';
      } catch (error) {
        console.warn('Groq non disponible:', error.message);
      }
    }

    if (this.providers.openai) {
      try {
        await this.providers.openai.models.list();
        return 'openai';
      } catch (error) {
        console.warn('OpenAI non disponible:', error.message);
      }
    }

    return 'fallback';
  }
}

module.exports = MultiLLMService;
