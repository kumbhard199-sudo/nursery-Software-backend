const express = require('express');
const router = express.Router();
const {
  expenseController,
  addRawMaterialValidation,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Add raw material
router.post('/raw-materials', addRawMaterialValidation, expenseController.addRawMaterial);

// Get all raw materials
router.get('/raw-materials', expenseController.getAllRawMaterials);

// Get monthly expenses
router.get('/monthly/:month/:year', expenseController.getMonthlyExpenses);

// Get expense summary
router.get('/summary', expenseController.getExpenseSummary);

// Get raw material by ID
router.get('/raw-materials/:id', expenseController.getRawMaterialById);

// Update raw material
router.put('/raw-materials/:id', expenseController.updateRawMaterial);

// Delete raw material
router.delete('/raw-materials/:id', expenseController.deleteRawMaterial);

module.exports = router;
