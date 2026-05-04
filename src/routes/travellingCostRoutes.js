const express = require('express');
const router = express.Router();
const {
  travellingCostController,
  createTravellingCostValidation,
  updateTravellingCostValidation,
} = require('../controllers/travellingCostController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Monthly summary (must come before /:id to avoid param conflict)
router.get('/summary/:year', travellingCostController.getMonthlySummary);

// CRUD
router.post('/', createTravellingCostValidation, travellingCostController.createTravellingCost);
router.get('/', travellingCostController.getAllTravellingCosts);
router.get('/:id', travellingCostController.getTravellingCostById);
router.put('/:id', updateTravellingCostValidation, travellingCostController.updateTravellingCost);
router.delete('/:id', travellingCostController.deleteTravellingCost);

module.exports = router;
