const express = require('express');
const router = express.Router();
const clinicalNoteController = require('../controllers/clinicalNoteController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Create clinical note (requires 'doctor' or 'admin' role)
router.post('/', protect, authorize('admin', 'doctor'), clinicalNoteController.createClinicalNote);

// Get all clinical notes for a patient (requires authentication, accessible to admin, doctor, nurse)
// This route uses patientId as a URL parameter, not a query parameter, making it specific to a patient
router.get('/patient/:patientId', protect, authorize('admin', 'doctor', 'nurse'), clinicalNoteController.getClinicalNotesByPatient);

// Get single clinical note by ID (accessible to admin, doctor, nurse)
router.get('/:id', protect, authorize('admin', 'doctor', 'nurse'), clinicalNoteController.getClinicalNoteById);

// Update clinical note (requires admin or original doctor role)
router.put('/:id', protect, authorize('admin', 'doctor'), clinicalNoteController.updateClinicalNote);

// Delete clinical note (requires admin or the original doctor role)
router.delete('/:id', protect, authorize('admin', 'doctor'), clinicalNoteController.deleteClinicalNote);

module.exports = router;