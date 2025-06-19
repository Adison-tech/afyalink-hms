const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All patients will be protected and require specific roles

// Create Patient
router.post('/', protect, authorize('admin', 'receptionist'), patientController.createPatient);

// Get All patients (authenticated)
router.get('/', protect, patientController.getAllPatients);

// Get patients by ID (authenticated)
router.get('/:id', protect, patientController.getPatientById);

// Update patient
router.put('/:id', protect, authorize('admin', 'receptionist'), patientController.updatePatient);

// Delete patient (admin only)
router.delete('/:id', protect, authorize('admin'), patientController.deletePatient);

module.exports = router;
