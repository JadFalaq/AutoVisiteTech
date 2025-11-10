const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'api-gateway', 
    timestamp: new Date(), 
    uptime: process.uptime() 
  });
});

// Manual proxy function
function proxyRequest(targetHost, targetPort) {
  return async (req, res) => {
    const options = {
      hostname: targetHost,
      port: targetPort,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: `${targetHost}:${targetPort}`
      }
    };

    console.log(`[PROXY] ${req.method} ${req.url} -> http://${targetHost}:${targetPort}${req.url}`);

    const proxyReq = http.request(options, (proxyRes) => {
      console.log(`[PROXY] Response: ${proxyRes.statusCode}`);
      
      res.status(proxyRes.statusCode);
      
      // Copy headers
      Object.keys(proxyRes.headers).forEach(key => {
        res.setHeader(key, proxyRes.headers[key]);
      });

      // Pipe response
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (error) => {
      console.error('[PROXY] Error:', error.message);
      if (!res.headersSent) {
        res.status(500).json({ 
          error: 'Proxy error', 
          details: error.message 
        });
      }
    });

    // Send body if present
    if (req.body && Object.keys(req.body).length > 0) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }

    proxyReq.end();
  };
}

// Routes
app.use('/api/auth', proxyRequest('auth-service', 8001));
app.use('/api/users', proxyRequest('auth-service', 8001));
app.use('/api/payments', proxyRequest('payment-service', 8002));
app.use('/api/appointments', proxyRequest('appointment-service', 8003));
app.use('/api/scans', proxyRequest('scan-service', 8004));
app.use('/api/parser', proxyRequest('parser-service', 8005));
app.use('/api/chat', proxyRequest('chatbot-service', 8006));
app.use('/api/inspections', proxyRequest('inspection-service', 8007));
app.use('/api/reports', proxyRequest('report-service', 8008));

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚪 API Gateway running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
