const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8003;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'appointment-service', timestamp: new Date() });
});

app.get('/api/appointments', (req, res) => {
  res.json({ message: 'Appointment service is running' });
});

app.listen(PORT, () => {
  console.log(`📅 Appointment Service running on port ${PORT}`);
});
