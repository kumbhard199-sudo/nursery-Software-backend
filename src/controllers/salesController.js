const salesService = require('../services/salesService');
const { body, validationResult } = require('express-validator');

class SalesController {
  /**
   * POST /api/sales
   * Record a new sale
   */
  createSale = async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
        });
      }

      const { batchId, customerId, cropQuantity, pricePerCrop, travelingCost, plantationCost } =
        req.body;

      const sale = await salesService.createSale({
        batchId: parseInt(batchId),
        customerId: parseInt(customerId),
        cropQuantity: parseInt(cropQuantity),
        pricePerCrop: parseFloat(pricePerCrop),
        travelingCost: parseFloat(travelingCost || 0),
        plantationCost: parseFloat(plantationCost || 0),
      });

      res.status(201).json({
        success: true,
        message: 'Sale recorded successfully',
        data: { sale },
      });
    } catch (error) {
      console.error('Create sale controller error:', error);
      if (error.message.includes('not found') || error.message.includes('Insufficient stock')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  };

  /**
   * GET /api/sales
   * Get all sales
   */
  getAllSales = async (req, res, next) => {
    try {
      const sales = await salesService.getAllSales();

      res.status(200).json({
        success: true,
        count: sales.length,
        data: { sales },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/sales/:id
   * Get sale by ID
   */
  getSaleById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const sale = await salesService.getSaleById(parseInt(id));

      res.status(200).json({
        success: true,
        data: { sale },
      });
    } catch (error) {
      if (error.message === 'Sale not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  };

  /**
   * POST /api/sales/:id/invoice
   * Generate invoice for a sale
   */
  generateInvoice = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await salesService.generateInvoice(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Invoice generated successfully',
        data: {
          invoiceNumber: result.invoiceNumber,
          invoicePath: result.invoicePath,
          downloadUrl: `/uploads/invoices/${result.invoicePath.split('/').pop()}`,
          sale: result.sale,
        },
      });
    } catch (error) {
      console.error('Generate invoice controller error:', error);
      if (error.message === 'Sale not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  };

  /**
   * GET /api/sales/report
   * Get sales report with filters
   */
  getSalesReport = async (req, res, next) => {
    try {
      const { startDate, endDate, batchId, customerId } = req.query;

      const filters = {};
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      if (batchId) filters.batchId = parseInt(batchId);
      if (customerId) filters.customerId = parseInt(customerId);

      const report = await salesService.getSalesReport(filters);

      res.status(200).json({
        success: true,
        data: { report },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/sales/:id
   * Delete sale
   */
  deleteSale = async (req, res, next) => {
    try {
      const { id } = req.params;

      const result = await salesService.deleteSale(parseInt(id));

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error('Delete sale controller error:', error);
      if (error.message === 'Sale not found') {
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
const createSaleValidation = [
  body('batchId')
    .notEmpty()
    .withMessage('Batch ID is required')
    .isInt({ min: 1 })
    .withMessage('Batch ID must be a positive integer'),
  body('customerId')
    .notEmpty()
    .withMessage('Customer ID is required')
    .isInt({ min: 1 })
    .withMessage('Customer ID must be a positive integer'),
  body('cropQuantity')
    .notEmpty()
    .withMessage('Crop quantity is required')
    .isInt({ min: 1 })
    .withMessage('Crop quantity must be a positive integer'),
  body('pricePerCrop')
    .notEmpty()
    .withMessage('Price per crop is required')
    .isFloat({ min: 0 })
    .withMessage('Price per crop must be a non-negative number'),
  body('travelingCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Traveling cost must be a non-negative number'),
  body('plantationCost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Plantation cost must be a non-negative number'),
];

const salesController = new SalesController();

module.exports = {
  salesController,
  createSaleValidation,
};
