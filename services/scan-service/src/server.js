const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8004;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'scan-service', timestamp: new Date() });
});

app.get('/api/scans', (req, res) => {
  res.json({ message: 'Scan service is running' });
});

app.listen(PORT, () => {
  console.log(`📷 Scan Service running on port ${PORT}`);
});
