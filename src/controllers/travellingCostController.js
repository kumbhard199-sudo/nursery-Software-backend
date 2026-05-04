const travellingCostService = require('../services/travellingCostService');
const { body, validationResult } = require('express-validator');

class TravellingCostController {
  /**
   * POST /api/travelling-costs
   * Create a new travelling cost entry
   */
  createTravellingCost = async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
        });
      }

      const entry = await travellingCostService.createTravellingCost(req.body);

      res.status(201).json({
        success: true,
        message: 'Travelling cost recorded successfully',
        data: { travellingCost: entry },
      });
    } catch (error) {
      console.error('Create travelling cost controller error:', error);
      next(error);
    }
  };

  /**
   * GET /api/travelling-costs
   * Get all travelling cost entries (supports ?month=&year= query params)
   */
  getAllTravellingCosts = async (req, res, next) => {
    try {
      const { month, year } = req.query;
      const entries = await travellingCostService.getAllTravellingCosts({ month, year });

      res.status(200).json({
        success: true,
        count: entries.length,
        data: { travellingCosts: entries },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/travelling-costs/:id
   * Get a single entry by ID
   */
  getTravellingCostById = async (req, res, next) => {
    try {
      const entry = await travellingCostService.getTravellingCostById(parseInt(req.params.id));

      res.status(200).json({
        success: true,
        data: { travellingCost: entry },
      });
    } catch (error) {
      if (error.message === 'Travelling cost record not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  };

  /**
   * PUT /api/travelling-costs/:id
   * Update a travelling cost entry
   */
  updateTravellingCost = async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
        });
      }

      const entry = await travellingCostService.updateTravellingCost(
        parseInt(req.params.id),
        req.body
      );

      res.status(200).json({
        success: true,
        message: 'Travelling cost updated successfully',
        data: { travellingCost: entry },
      });
    } catch (error) {
      if (error.message === 'Travelling cost record not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  };

  /**
   * DELETE /api/travelling-costs/:id
   * Delete a travelling cost entry
   */
  deleteTravellingCost = async (req, res, next) => {
    try {
      const result = await travellingCostService.deleteTravellingCost(parseInt(req.params.id));

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      if (error.message === 'Travelling cost record not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  };

  /**
   * GET /api/travelling-costs/summary/:year
   * Get monthly summary for a year
   */
  getMonthlySummary = async (req, res, next) => {
    try {
      const summary = await travellingCostService.getMonthlySummary(req.params.year);

      res.status(200).json({
        success: true,
        data: { summary },
      });
    } catch (error) {
      next(error);
    }
  };
}

// Validation rules
const createTravellingCostValidation = [
  body('customerName')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Customer name must be between 2 and 200 characters'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ min: 2, max: 300 })
    .withMessage('Location must be between 2 and 300 characters'),
  body('cost')
    .notEmpty()
    .withMessage('Cost is required')
    .isFloat({ min: 0 })
    .withMessage('Cost must be a non-negative number'),
  body('travelDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must be at most 1000 characters'),
];

const updateTravellingCostValidation = [
  body('customerName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Customer name must be between 2 and 200 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 300 })
    .withMessage('Location must be between 2 and 300 characters'),
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a non-negative number'),
  body('travelDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must be at most 1000 characters'),
];

const travellingCostController = new TravellingCostController();

module.exports = {
  travellingCostController,
  createTravellingCostValidation,
  updateTravellingCostValidation,
};
