require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

// Import database pool
const pool = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const patientRoutes = require('./src/routes/patientRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const clinicalNoteRoutes = require('./src/routes/clinicalNoteRoutes');

// Middleware to parse JSON request bodies
app.use(express.json());

// Basic route for testing
app.get('/', (req, res) => {
  res.send('AfyaLink HMS BAckend is Running');
});

// User authentication routes
app.use('/auth', authRoutes); // All auth routes will be prefixed /auth

// Use patient routes
app.use('/patients', patientRoutes); // All patient routes will be prefixed with /patients

// Use appointment routes
app.use('/appointments', appointmentRoutes); // All appointment routes will be prefixes with /appointents

// Use clinical note routes
app.use('/clinical_notes', clinicalNoteRoutes); 

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access it at: http://localhost:${PORT}`);
});