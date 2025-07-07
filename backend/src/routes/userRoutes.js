// backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get all users (with optional role filter, e.g., /api/users?role=doctor)
// Only authorized personnel should be able to list users
router.get('/', protect, authorize('admin', 'doctor', 'receptionist', 'nurse'), userController.getAllUsers);

// Get user by ID (accessible by admin, or the user themselves)
router.get('/:id', protect, authorize('admin'), userController.getUserById); // Admin can get any user by ID

// Update user (admin can update any user, users can update their own profile via a separate route if needed)
router.put('/:id', protect, authorize('admin'), userController.updateUser); // Admin can update any user

// Delete user (admin only)
router.delete('/:id', protect, authorize('admin'), userController.deleteUser);

module.exports = router;
