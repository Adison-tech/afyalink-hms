// server.js
require('dotenv').config();

const express = require('express');
const http = require('http'); // Import http module for WebSocket server
const WebSocket = require('ws'); // Import WebSocket library

const app = express();
const PORT = process.env.PORT || 5000; // Backend server will listen on 5005

// Import database pool
const pool = require('./src/config/db');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const patientRoutes = require('./src/routes/patientRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const clinicalNoteRoutes = require('./src/routes/clinicalNoteRoutes');
const userRoutes = require('./src/routes/userRoutes');
const departmentRoutes = require('./src/routes/departmentRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
// Middleware to parse JSON request bodies
app.use(express.json());

// Basic root route for testing API status
app.get('/', (req, res) => {
  res.status(200).json({ message: 'AfyaLink HMS Backend is Running' });
});

// Mount your API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/clinical-notes', clinicalNoteRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/admin', adminRoutes);

// ⭐ NEW: Generic 404 Not Found Handler (MUST be after all other routes) ⭐
app.use((req, res, next) => {
  res.status(404).json({ message: 'API Endpoint Not Found' });
});

// ⭐ NEW: Global Error Handler (MUST be after all app.use and route handlers) ⭐
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || 'An unexpected server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// Create an HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
const wss = new WebSocket.Server({ server, path: '/ws' }); // WebSocket server shares the HTTP server and listens on /ws path

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket.');

  // Send a welcome message
  ws.send(JSON.stringify({ type: 'info', message: 'Welcome to the live data stream!' }));

  // Example: Send dummy live data every 3 seconds
  const interval = setInterval(() => {
    const availableBeds = Math.floor(Math.random() * 20) + 5; // Random number between 5 and 24
    const totalBeds = 50;
    const newAlerts = [
      { id: Date.now(), message: `New critical event detected! Bed ${Math.floor(Math.random() * totalBeds) + 1} status changed.`, type: 'critical', timestamp: new Date().toISOString() },
    ];
    ws.send(JSON.stringify({ type: 'bed_update', availableBeds, totalBeds }));
    if (Math.random() > 0.7) { // Send an alert occasionally
        ws.send(JSON.stringify({ type: 'new_alert', alert: newAlerts[0] }));
    }
  }, 3000);

  ws.on('message', (message) => {
    console.log(`Received message from client: ${message}`);
    // You can handle messages from the client here
  });

  ws.on('close', () => {
    console.log('Client disconnected from WebSocket.');
    clearInterval(interval); // Clear the interval when client disconnects
  });

  ws.on('error', (error) => {
    console.error('WebSocket error occurred:', error);
  });
});


server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access backend API at: http://localhost:${PORT}`);
  console.log(`WebSocket server accessible at: ws://localhost:${PORT}/ws`); // Highlight WebSocket URL
  console.log(`Ensure your frontend is configured to fetch from http://localhost:${PORT} and ws://localhost:${PORT}/ws`);
});