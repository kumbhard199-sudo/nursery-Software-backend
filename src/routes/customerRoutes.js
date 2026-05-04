const express = require('express');
const router = express.Router();
const {
  customerController,
  createCustomerValidation,
  updateCustomerValidation,
} = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Create customer
router.post('/', createCustomerValidation, customerController.createCustomer);

// Search customers
router.get('/search', customerController.searchCustomers);

// Get all customers
router.get('/', customerController.getAllCustomers);

// Get customer by ID
router.get('/:id', customerController.getCustomerById);

// Update customer
router.put('/:id', updateCustomerValidation, customerController.updateCustomer);

// Delete customer
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;
