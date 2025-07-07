// backend/src/routes/departmentRoutes.js
const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Create a new department (Admin only)
router.post('/', protect, authorize('admin'), departmentController.createDepartment);

// Get all departments (Accessible by admin, doctor, receptionist, nurse)
router.get('/', protect, authorize('admin', 'doctor', 'receptionist', 'nurse'), departmentController.getAllDepartments);

// Get department by ID (Accessible by admin, doctor, receptionist, nurse)
router.get('/:id', protect, authorize('admin', 'doctor', 'receptionist', 'nurse'), departmentController.getDepartmentById);

// Update a department (Admin only)
router.put('/:id', protect, authorize('admin'), departmentController.updateDepartment);

// Delete a department (Admin only)
router.delete('/:id', protect, authorize('admin'), departmentController.deleteDepartment);

module.exports = router;
