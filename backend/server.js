require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

// Import database pool
const pool = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');

// Middleware to parse JSON request bodies
app.use(express.json());

// Basic route for testing
app.get('/', (req, res) => {
  res.send('AfyaLink HMS BAckend is Running');
});

// User authentication routes
app.use('/api/auth', authRoutes); // All auth routes will be prefixed /api/auth
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access it at: http://localhost:${PORT}`);
});