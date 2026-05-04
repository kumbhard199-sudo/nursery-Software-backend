const customerService = require('../services/customerService');
const { body, validationResult } = require('express-validator');

class CustomerController {
  /**
   * POST /api/customers
   * Create a new customer
   */
  createCustomer = async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
        });
      }

      const { name, mobileNumber, address } = req.body;

      const customer = await customerService.createCustomer({
        name,
        mobileNumber,
        address,
      });

      res.status(201).json({
        success: true,
        message: 'Customer created successfully',
        data: { customer },
      });
    } catch (error) {
      console.error('Create customer controller error:', error);
      if (error.code === 'P2002') {
        return res.status(400).json({
          success: false,
          message: 'Customer with this mobile number already exists',
        });
      }
      next(error);
    }
  };

  /**
   * GET /api/customers
   * Get all customers
   */
  getAllCustomers = async (req, res, next) => {
    try {
      const customers = await customerService.getAllCustomers();

      res.status(200).json({
        success: true,
        count: customers.length,
        data: { customers },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/customers/:id
   * Get customer by ID
   */
  getCustomerById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const customer = await customerService.getCustomerById(parseInt(id));

      res.status(200).json({
        success: true,
        data: { customer },
      });
    } catch (error) {
      if (error.message === 'Customer not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  };

  /**
   * PUT /api/customers/:id
   * Update customer
   */
  updateCustomer = async (req, res, next) => {
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

      const customer = await customerService.updateCustomer(parseInt(id), updateData);

      res.status(200).json({
        success: true,
        message: 'Customer updated successfully',
        data: { customer },
      });
    } catch (error) {
      console.error('Update customer controller error:', error);
      if (error.message === 'Customer not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  };

  /**
   * DELETE /api/customers/:id
   * Delete customer
   */
  deleteCustomer = async (req, res, next) => {
    try {
      const { id } = req.params;

      const result = await customerService.deleteCustomer(parseInt(id));

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error('Delete customer controller error:', error);
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
   * GET /api/customers/search
   * Search customers
   */
  searchCustomers = async (req, res, next) => {
    try {
      const { q } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters',
        });
      }

      const customers = await customerService.searchCustomers(q);

      res.status(200).json({
        success: true,
        count: customers.length,
        data: { customers },
      });
    } catch (error) {
      next(error);
    }
  };
}

// Validation rules
const createCustomerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),
  body('mobileNumber')
    .trim()
    .notEmpty()
    .withMessage('Mobile number is required')
    .matches(/^[0-9]{10}$/)
    .withMessage('Mobile number must be 10 digits'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address cannot exceed 500 characters'),
];

const updateCustomerValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),
  body('mobileNumber')
    .optional()
    .trim()
    .matches(/^[0-9]{10}$/)
    .withMessage('Mobile number must be 10 digits'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address cannot exceed 500 characters'),
];

const customerController = new CustomerController();

module.exports = {
  customerController,
  createCustomerValidation,
  updateCustomerValidation,
};
