const express = require('express');
const router = express.Router();
const {
  batchController,
  createBatchValidation,
  updateDeadCropsValidation,
  updateBatchValidation,
} = require('../controllers/batchController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Create batch
router.post('/', createBatchValidation, batchController.createBatch);

// Get all batches
router.get('/', batchController.getAllBatches);

// Get batch stock
router.get('/:id/stock', batchController.getBatchStock);

// Get batch sales summary
router.get('/:id/sales-summary', batchController.getBatchSalesSummary);

// Get batch by ID
router.get('/:id', batchController.getBatchById);

// Update dead crops
router.put('/:id/dead-crops', updateDeadCropsValidation, batchController.updateDeadCrops);

// Update batch
router.put('/:id', updateBatchValidation, batchController.updateBatch);

// Delete batch
router.delete('/:id', batchController.deleteBatch);

module.exports = router;
