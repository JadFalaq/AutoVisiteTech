const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createProxyMiddleware } = require('http-proxy-middleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware CORS doit être avant tout
app.use(cors());

// Health check (avant les proxies)
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'api-gateway', timestamp: new Date() });
});

// Proxies - le body est transmis tel quel sans parsing
// Proxy vers auth-service
app.use('/api/auth', createProxyMiddleware({
  target: 'http://auth-service:8001',
  changeOrigin: true,
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[PROXY AUTH] ${req.method} ${req.url} -> http://auth-service:8001${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[PROXY AUTH] Response: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error('[PROXY AUTH] Error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Service auth temporairement indisponible', details: err.message });
    }
  }
}));

// Proxy vers payment-service
app.use('/api/payments', createProxyMiddleware({
  target: 'http://payment-service:8002',
  changeOrigin: true
}));

// Proxy vers appointment-service
app.use('/api/appointments', createProxyMiddleware({
  target: 'http://appointment-service:8003',
  changeOrigin: true
}));

// Proxy vers scan-service
app.use('/api/scans', createProxyMiddleware({
  target: 'http://scan-service:8004',
  changeOrigin: true
}));

// Proxy vers parser-service
app.use('/api/parser', createProxyMiddleware({
  target: 'http://parser-service:8005',
  changeOrigin: true
}));

// Proxy vers chatbot-service
app.use('/api/chat', createProxyMiddleware({
  target: 'http://chatbot-service:8006',
  changeOrigin: true
}));

// Proxy vers inspection-service
app.use('/api/inspections', createProxyMiddleware({
  target: 'http://inspection-service:8007',
  changeOrigin: true
}));

// Proxy vers report-service
app.use('/api/reports', createProxyMiddleware({
  target: 'http://report-service:8008',
  changeOrigin: true
}));

// Proxy vers users (auth-service)
app.use('/api/users', createProxyMiddleware({
  target: 'http://auth-service:8001',
  changeOrigin: true
}));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚪 API Gateway running on port ${PORT}`);
});
