const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createProxyMiddleware } = require('http-proxy-middleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// CORS
app.use(cors());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'api-gateway', timestamp: new Date(), uptime: process.uptime() });
});

// Configuration commune pour tous les proxies
const proxyOptions = {
  changeOrigin: true,
  ws: true,
  logLevel: 'silent'
};

// Proxy vers auth-service
app.use('/api/auth', createProxyMiddleware({
  ...proxyOptions,
  target: 'http://auth-service:8001'
}));

// Proxy vers payment-service
app.use('/api/payments', createProxyMiddleware({
  ...proxyOptions,
  target: 'http://payment-service:8002'
}));

// Proxy vers appointment-service
app.use('/api/appointments', createProxyMiddleware({
  ...proxyOptions,
  target: 'http://appointment-service:8003'
}));

// Proxy vers scan-service
app.use('/api/scans', createProxyMiddleware({
  ...proxyOptions,
  target: 'http://scan-service:8004'
}));

// Proxy vers parser-service
app.use('/api/parser', createProxyMiddleware({
  ...proxyOptions,
  target: 'http://parser-service:8005'
}));

// Proxy vers chatbot-service
app.use('/api/chat', createProxyMiddleware({
  ...proxyOptions,
  target: 'http://chatbot-service:8006'
}));

// Proxy vers inspection-service
app.use('/api/inspections', createProxyMiddleware({
  ...proxyOptions,
  target: 'http://inspection-service:8007'
}));

// Proxy vers report-service
app.use('/api/reports', createProxyMiddleware({
  ...proxyOptions,
  target: 'http://report-service:8008'
}));

// Proxy vers users (auth-service)
app.use('/api/users', createProxyMiddleware({
  ...proxyOptions,
  target: 'http://auth-service:8001'
}));

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
