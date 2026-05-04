const reportService = require('../services/reportService');
const { query, validationResult } = require('express-validator');

class ReportController {
  /**
   * GET /api/reports/monthly/:month/:year
   * Get comprehensive monthly report
   */
  getMonthlyReport = async (req, res, next) => {
    try {
      const { month, year } = req.params;

      const report = await reportService.getMonthlyReport(parseInt(month), parseInt(year));

      res.status(200).json({
        success: true,
        data: { report },
      });
    } catch (error) {
      console.error('Monthly report controller error:', error);
      next(error);
    }
  };

  /**
   * GET /api/reports/profit-summary
   * Get profit summary for date range
   */
  getProfitSummary = async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
        });
      }

      const { startDate, endDate } = req.query;

      const summary = await reportService.getProfitSummary(startDate, endDate);

      res.status(200).json({
        success: true,
        data: { summary },
      });
    } catch (error) {
      console.error('Profit summary controller error:', error);
      next(error);
    }
  };

  /**
   * GET /api/reports/dashboard
   * Get dashboard statistics
   */
  getDashboardStats = async (req, res, next) => {
    try {
      const stats = await reportService.getDashboardStats();

      res.status(200).json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      console.error('Dashboard stats controller error:', error);
      next(error);
    }
  };
}

// Validation rules
const profitSummaryValidation = [
  query('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid ISO date'),
  query('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('End date must be a valid ISO date'),
];

const reportController = new ReportController();

module.exports = {
  reportController,
  profitSummaryValidation,
};
