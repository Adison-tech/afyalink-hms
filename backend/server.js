// server.js
require('dotenv').config();

const express = require('express');
const app = express();
// ⭐ IMPORTANT: Ensure your frontend is configured to use the same port, e.g., 5005
// If you change this here, make sure your frontend's .env or fetch calls reflect it.
const PORT = process.env.PORT || 5005; // Changed default port to 5005 to match frontend logs

// Import database pool
const pool = require('./src/config/db');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const patientRoutes = require('./src/routes/patientRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const clinicalNoteRoutes = require('./src/routes/clinicalNoteRoutes');
const userRoutes = require('./src/routes/userRoutes'); // User routes (e.g., for doctors list)

// Middleware to parse JSON request bodies
app.use(express.json());

// Basic root route for testing API status
app.get('/', (req, res) => {
  res.status(200).json({ message: 'AfyaLink HMS Backend is Running' });
});

// Mount your API routes
app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/users', userRoutes); // User management routes (e.g., for fetching doctors)
app.use('/api/patients', patientRoutes); // Patient management routes
app.use('/api/appointments', appointmentRoutes); // Appointment management routes
app.use('/api/clinical-notes', clinicalNoteRoutes); // Clinical notes routes

// ⭐ NEW: Generic 404 Not Found Handler (MUST be after all other routes) ⭐
// If no route above has handled the request, this will catch it.
app.use((req, res, next) => {
  res.status(404).json({ message: 'API Endpoint Not Found' });
});

// ⭐ NEW: Global Error Handler (MUST be after all app.use and route handlers) ⭐
// This catches any errors thrown by route handlers or middleware above.
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack to the console for debugging
  res.status(err.statusCode || 500).json({
    message: err.message || 'An unexpected server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.stack : {} // Send stack in dev
  });
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access backend API at: http://localhost:${PORT}`);
  console.log(`Ensure your frontend is configured to fetch from http://localhost:${PORT}`);
});
