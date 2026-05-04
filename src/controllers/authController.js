const authService = require('../services/authService');
const { body, validationResult } = require('express-validator');

class AuthController {
  /**
   * POST /auth/login
   * Admin login
   */
  login = async (req, res, next) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
        });
      }

      const { username, password } = req.body;

      // Login
      const result = await authService.login(username, password);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      console.error('Login controller error:', error);
      if (error.message === 'Invalid credentials') {
        return res.status(401).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  };

  /**
   * POST /auth/setup
   * Create initial admin account (one-time setup)
   */
  setup = async (req, res, next) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
        });
      }

      const { username, password } = req.body;

      // Create initial admin
      const admin = await authService.createInitialAdmin(username, password);

      res.status(201).json({
        success: true,
        message: 'Admin account created successfully',
        data: { admin },
      });
    } catch (error) {
      console.error('Setup controller error:', error);
      if (error.message.includes('already exists')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  };

  /**
   * PUT /auth/change-password
   * Change admin password
   */
  changePassword = async (req, res, next) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
        });
      }

      const { currentPassword, newPassword } = req.body;
      const adminId = req.admin.id;

      // Change password
      const result = await authService.changePassword(adminId, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error('Change password controller error:', error);
      if (error.message.includes('incorrect') || error.message.includes('not found')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  };

  /**
   * GET /auth/me
   * Get current admin info
   */
  getMe = async (req, res, next) => {
    try {
      res.status(200).json({
        success: true,
        data: {
          admin: req.admin,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

// Validation rules
const loginValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const setupValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('New password must contain at least one number'),
];

const authController = new AuthController();

module.exports = {
  authController,
  loginValidation,
  setupValidation,
  changePasswordValidation,
};
