// backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); // Make sure this path is correct
const { protect, authorize } = require('../middleware/authMiddleware'); // Make sure this path is correct

// ⭐ This is the route that will handle GET /api/users?role=doctor ⭐
// Get all users (with optional role filter, e.g., /api/users?role=doctor)
// Only authorized personnel should be able to list users
router.get('/', protect, authorize('admin', 'doctor', 'receptionist', 'nurse'), userController.getAllUsers);

// You can add other user management routes here if needed, for example:
// router.get('/:id', protect, authorize(['admin', 'receptionist']), userController.getUserById);
// router.put('/:id', protect, authorize(['admin']), userController.updateUser); // For updating user details by admin
// router.delete('/:id', protect, authorize(['admin']), userController.deleteUser);

module.exports = router;