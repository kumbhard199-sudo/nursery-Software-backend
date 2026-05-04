const express = require('express');
const router = express.Router();
const {
  authController,
  loginValidation,
  setupValidation,
  changePasswordValidation,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', loginValidation, authController.login);
router.post('/setup', setupValidation, authController.setup);

// Protected routes
router.put('/change-password', protect, changePasswordValidation, authController.changePassword);
router.get('/me', protect, authController.getMe);

module.exports = router;
