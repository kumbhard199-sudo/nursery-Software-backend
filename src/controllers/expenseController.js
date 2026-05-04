const expenseService = require('../services/expenseService');
const { body, validationResult } = require('express-validator');

class ExpenseController {
  /**
   * POST /api/expenses/raw-materials
   * Add raw material expense
   */
  addRawMaterial = async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
        });
      }

      const { materialName, quantity, cost, purchaseDate, notes } = req.body;

      const material = await expenseService.addRawMaterial({
        materialName,
        quantity: parseInt(quantity),
        cost: parseFloat(cost),
        purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
        notes,
      });

      res.status(201).json({
        success: true,
        message: 'Raw material added successfully',
        data: { material },
      });
    } catch (error) {
      console.error('Add raw material controller error:', error);
      next(error);
    }
  };

  /**
   * GET /api/expenses/raw-materials
   * Get all raw materials
   */
  getAllRawMaterials = async (req, res, next) => {
    try {
      const materials = await expenseService.getAllRawMaterials();

      res.status(200).json({
        success: true,
        count: materials.length,
        data: { materials },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/expenses/raw-materials/:id
   * Get raw material by ID
   */
  getRawMaterialById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const material = await expenseService.getRawMaterialById(parseInt(id));

      res.status(200).json({
        success: true,
        data: { material },
      });
    } catch (error) {
      if (error.message === 'Raw material not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  };

  /**
   * PUT /api/expenses/raw-materials/:id
   * Update raw material
   */
  updateRawMaterial = async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
        });
      }

      const { id } = req.params;
      const updateData = req.body;

      const material = await expenseService.updateRawMaterial(parseInt(id), updateData);

      res.status(200).json({
        success: true,
        message: 'Raw material updated successfully',
        data: { material },
      });
    } catch (error) {
      console.error('Update raw material controller error:', error);
      if (error.message === 'Raw material not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  };

  /**
   * DELETE /api/expenses/raw-materials/:id
   * Delete raw material
   */
  deleteRawMaterial = async (req, res, next) => {
    try {
      const { id } = req.params;

      const result = await expenseService.deleteRawMaterial(parseInt(id));

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error('Delete raw material controller error:', error);
      if (error.message === 'Raw material not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  };

  /**
   * GET /api/expenses/monthly/:month/:year
   * Get monthly expenses
   */
  getMonthlyExpenses = async (req, res, next) => {
    try {
      const { month, year } = req.params;
      const result = await expenseService.getMonthlyExpenses(parseInt(month), parseInt(year));

      res.status(200).json({
        success: true,
        data: { expenses: result },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/expenses/summary
   * Get expense summary for date range
   */
  getExpenseSummary = async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required',
        });
      }

      const summary = await expenseService.getExpenseSummary(startDate, endDate);

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
const addRawMaterialValidation = [
  body('materialName')
    .trim()
    .notEmpty()
    .withMessage('Material name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Material name must be between 3 and 100 characters'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('cost')
    .notEmpty()
    .withMessage('Cost is required')
    .isFloat({ min: 0 })
    .withMessage('Cost must be a non-negative number'),
  body('purchaseDate')
    .optional()
    .isISO8601()
    .withMessage('Purchase date must be a valid date'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

const expenseController = new ExpenseController();

module.exports = {
  expenseController,
  addRawMaterialValidation,
};
