const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createProxyMiddleware } = require('http-proxy-middleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'api-gateway', 
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// Services status endpoint
app.get('/api/status', async (req, res) => {
  const services = [
    { name: 'auth-service', url: 'http://auth-service:8001/health', port: 8001 },
    { name: 'payment-service', url: 'http://payment-service:8002/health', port: 8002 },
    { name: 'appointment-service', url: 'http://appointment-service:8003/health', port: 8003 },
    { name: 'scan-service', url: 'http://scan-service:8004/health', port: 8004 },
    { name: 'parser-service', url: 'http://parser-service:8005/health', port: 8005 },
    { name: 'chatbot-service', url: 'http://chatbot-service:8006/health', port: 8006 },
    { name: 'inspection-service', url: 'http://inspection-service:8007/health', port: 8007 },
    { name: 'report-service', url: 'http://report-service:8008/health', port: 8008 }
  ];

  const statuses = services.map(service => ({
    name: service.name,
    port: service.port,
    status: 'unknown'
  }));

  res.json({
    gateway: 'healthy',
    services: statuses,
    timestamp: new Date()
  });
});

// Proxy configuration with error handling
const proxyOptions = (target) => ({
  target,
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error(`Proxy error for ${target}:`, err.message);
    res.status(503).json({
      error: 'Service temporarily unavailable',
      service: target,
      message: err.message
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    // Log proxy requests
    console.log(`→ Proxying ${req.method} ${req.path} to ${target}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    // Log proxy responses
    console.log(`← Response from ${target}: ${proxyRes.statusCode}`);
  }
});

// Proxy routes to microservices
app.use('/api/auth', createProxyMiddleware(proxyOptions('http://auth-service:8001')));
app.use('/api/users', createProxyMiddleware(proxyOptions('http://auth-service:8001')));
app.use('/api/payments', createProxyMiddleware(proxyOptions('http://payment-service:8002')));
app.use('/api/appointments', createProxyMiddleware(proxyOptions('http://appointment-service:8003')));
app.use('/api/scans', createProxyMiddleware(proxyOptions('http://scan-service:8004')));
app.use('/api/parser', createProxyMiddleware(proxyOptions('http://parser-service:8005')));
app.use('/api/chat', createProxyMiddleware({
  ...proxyOptions('http://chatbot-service:8006'),
  pathRewrite: {
    '^/api/chat': '/api/chat' // Garder le chemin complet pour le chatbot
  }
}));
app.use('/api/inspections', createProxyMiddleware(proxyOptions('http://inspection-service:8007')));
app.use('/api/reports', createProxyMiddleware(proxyOptions('http://report-service:8008')));
app.use('/api/invoices', createProxyMiddleware(proxyOptions('http://report-service:8008')));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method,
    timestamp: new Date()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Gateway error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date()
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚪 API Gateway running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Services status: http://localhost:${PORT}/api/status`);
});
