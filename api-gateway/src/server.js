const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createProxyMiddleware } = require('http-proxy-middleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'api-gateway', timestamp: new Date() });
});

// Proxy routes to microservices
app.use('/api/auth', createProxyMiddleware({ 
  target: 'http://auth-service:8001', 
  changeOrigin: true 
}));

app.use('/api/payments', createProxyMiddleware({ 
  target: 'http://payment-service:8002', 
  changeOrigin: true 
}));

app.use('/api/appointments', createProxyMiddleware({ 
  target: 'http://appointment-service:8003', 
  changeOrigin: true 
}));

app.use('/api/scans', createProxyMiddleware({ 
  target: 'http://scan-service:8004', 
  changeOrigin: true 
}));

app.use('/api/parser', createProxyMiddleware({ 
  target: 'http://parser-service:8005', 
  changeOrigin: true 
}));

app.use('/api/chat', createProxyMiddleware({ 
  target: 'http://chatbot-service:8006', 
  changeOrigin: true 
}));

app.use('/api/inspections', createProxyMiddleware({ 
  target: 'http://inspection-service:8007', 
  changeOrigin: true 
}));

app.use('/api/reports', createProxyMiddleware({ 
  target: 'http://report-service:8008', 
  changeOrigin: true 
}));

app.listen(PORT, () => {
  console.log(`🚪 API Gateway running on port ${PORT}`);
});
