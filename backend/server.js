require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

// Import database pool
const pool = require('./src/config/db');

// Middleware to parse JSON request bodies
app.use(express.json());

app.get('/', (req, res) => {
  res.send('AfyaLink HMS BAckend is Running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access it at: http://localhost:${PORT}`);
});