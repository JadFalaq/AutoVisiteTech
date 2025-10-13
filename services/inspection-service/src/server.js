const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8007;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'inspection-service', timestamp: new Date() });
});

app.get('/api/inspections', (req, res) => {
  res.json({ message: 'Inspection service is running' });
});

app.listen(PORT, () => {
  console.log(`🔍 Inspection Service running on port ${PORT}`);
});
