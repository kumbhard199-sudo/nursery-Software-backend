const batchService = require('../services/batchService');
const { body, validationResult } = require('express-validator');

class BatchController {
  /**
   * POST /api/batches
   * Create a new batch
   */
  createBatch = async (req, res, next) => {
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

      const { batchName, cropType, totalProduced, notes } = req.body;

      const batch = await batchService.createBatch({
        batchName,
        cropType,
        totalProduced: parseInt(totalProduced),
        notes,
      });

      res.status(201).json({
        success: true,
        message: 'Batch created successfully',
        data: { batch },
      });
    } catch (error) {
      console.error('Create batch controller error:', error);
      next(error);
    }
  };

  /**
   * GET /api/batches
   * Get all batches with stock calculation
   */
  getAllBatches = async (req, res, next) => {
    try {
      const batches = await batchService.getAllBatches();

      res.status(200).json({
        success: true,
        count: batches.length,
        data: { batches },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/batches/:id
   * Get batch by ID
   */
  getBatchById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const batch = await batchService.getBatchById(parseInt(id));

      res.status(200).json({
        success: true,
        data: { batch },
      });
    } catch (error) {
      if (error.message === 'Batch not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  };

  /**
   * PUT /api/batches/:id/dead-crops
   * Update dead crops
   */
  updateDeadCrops = async (req, res, next) => {
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
      const { deadCrops } = req.body;

      const batch = await batchService.updateDeadCrops(parseInt(id), parseInt(deadCrops));

      res.status(200).json({
        success: true,
        message: 'Dead crops updated successfully',
        data: { batch },
      });
    } catch (error) {
      console.error('Update dead crops controller error:', error);
      if (error.message.includes('not found') || error.message.includes('Cannot')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  };

  /**
   * PUT /api/batches/:id
   * Update batch
   */
  updateBatch = async (req, res, next) => {
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

      const batch = await batchService.updateBatch(parseInt(id), updateData);

      res.status(200).json({
        success: true,
        message: 'Batch updated successfully',
        data: { batch },
      });
    } catch (error) {
      console.error('Update batch controller error:', error);
      if (error.message === 'Batch not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  };

  /**
   * DELETE /api/batches/:id
   * Delete batch
   */
  deleteBatch = async (req, res, next) => {
    try {
      const { id } = req.params;

      const result = await batchService.deleteBatch(parseInt(id));

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error('Delete batch controller error:', error);
      if (error.message.includes('not found') || error.message.includes('Cannot delete')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  };

  /**
   * GET /api/batches/:id/stock
   * Get batch stock summary
   */
  getBatchStock = async (req, res, next) => {
    try {
      const { id } = req.params;
      const stock = await batchService.getBatchStock(parseInt(id));

      res.status(200).json({
        success: true,
        data: { stock },
      });
    } catch (error) {
      if (error.message === 'Batch not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  };

  /**
   * GET /api/batches/:id/sales-summary
   * Get batch sales summary
   */
  getBatchSalesSummary = async (req, res, next) => {
    try {
      const { id } = req.params;
      const summary = await batchService.getBatchSalesSummary(parseInt(id));

      res.status(200).json({
        success: true,
        data: { summary },
      });
    } catch (error) {
      if (error.message === 'Batch not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  };
}

// Validation rules
const createBatchValidation = [
  body('batchName')
    .trim()
    .notEmpty()
    .withMessage('Batch name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Batch name must be between 3 and 100 characters'),
  body('cropType')
    .trim()
    .notEmpty()
    .withMessage('Crop type is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Crop type must be between 3 and 50 characters'),
  body('totalProduced')
    .notEmpty()
    .withMessage('Total produced is required')
    .isInt({ min: 1 })
    .withMessage('Total produced must be a positive integer'),
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string')
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
];

const updateDeadCropsValidation = [
  body('deadCrops')
    .notEmpty()
    .withMessage('Dead crops count is required')
    .isInt({ min: 0 })
    .withMessage('Dead crops must be a non-negative integer'),
];

const updateBatchValidation = [
  body('batchName')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Batch name must be between 3 and 100 characters'),
  body('cropType')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Crop type must be between 3 and 50 characters'),
  body('totalProduced')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Total produced must be a positive integer'),
  body('deadCrops')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Dead crops must be a non-negative integer'),
  body('notes')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
];

const batchController = new BatchController();

module.exports = {
  batchController,
  createBatchValidation,
  updateDeadCropsValidation,
  updateBatchValidation,
};
