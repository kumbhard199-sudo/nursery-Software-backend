const express = require('express');
const router = express.Router();
const { salesController, createSaleValidation } = require('../controllers/salesController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Record sale
router.post('/', createSaleValidation, salesController.createSale);

// Get sales report
router.get('/report', salesController.getSalesReport);

// Get all sales
router.get('/', salesController.getAllSales);

// Get sale by ID
router.get('/:id', salesController.getSaleById);

// Generate invoice
router.post('/:id/invoice', salesController.generateInvoice);

// Delete sale
router.delete('/:id', salesController.deleteSale);

module.exports = router;
