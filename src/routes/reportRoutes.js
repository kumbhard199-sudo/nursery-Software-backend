const express = require('express');
const router = express.Router();
const { reportController, profitSummaryValidation } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Dashboard statistics
router.get('/dashboard', reportController.getDashboardStats);

// Monthly comprehensive report
router.get('/monthly/:month/:year', reportController.getMonthlyReport);

// Profit summary for date range
router.get('/profit-summary', profitSummaryValidation, reportController.getProfitSummary);

module.exports = router;
