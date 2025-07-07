// backend/src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get admin dashboard statistics (Admin only)
router.get('/stats', protect, authorize('admin'), adminController.getAdminStats);

module.exports = router;
