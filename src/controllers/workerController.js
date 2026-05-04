const workerService = require('../services/workerService');
const { body, validationResult } = require('express-validator');

class WorkerController {
  /**
   * POST /api/workers
   * Create a new worker
   */
  createWorker = async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
        });
      }

      const { name, mobile } = req.body;

      const worker = await workerService.createWorker({
        name,
        mobile,
      });

      res.status(201).json({
        success: true,
        message: 'Worker created successfully',
        data: { worker },
      });
    } catch (error) {
      console.error('Create worker controller error:', error);
      if (error.code === 'P2002') {
        return res.status(400).json({
          success: false,
          message: 'Worker with this mobile number already exists',
        });
      }
      next(error);
    }
  };

  /**
   * GET /api/workers
   * Get all workers
   */
  getAllWorkers = async (req, res, next) => {
    try {
      const workers = await workerService.getAllWorkers();

      res.status(200).json({
        success: true,
        count: workers.length,
        data: { workers },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/workers/:id
   * Get worker by ID
   */
  getWorkerById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const worker = await workerService.getWorkerById(parseInt(id));

      res.status(200).json({
        success: true,
        data: { worker },
      });
    } catch (error) {
      if (error.message === 'Worker not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  };

  /**
   * PUT /api/workers/:id
   * Update worker
   */
  updateWorker = async (req, res, next) => {
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

      const worker = await workerService.updateWorker(parseInt(id), updateData);

      res.status(200).json({
        success: true,
        message: 'Worker updated successfully',
        data: { worker },
      });
    } catch (error) {
      console.error('Update worker controller error:', error);
      if (error.message === 'Worker not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  };

  /**
   * DELETE /api/workers/:id
   * Delete worker
   */
  deleteWorker = async (req, res, next) => {
    try {
      const { id } = req.params;

      const result = await workerService.deleteWorker(parseInt(id));

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error('Delete worker controller error:', error);
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
   * POST /api/workers/:id/attendance
   * Record attendance
   */
  recordAttendance = async (req, res, next) => {
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
      const { date, workType, extraHours, borrowedAmount } = req.body;

      const attendance = await workerService.recordAttendance({
        workerId: parseInt(id),
        date,
        workType,
        extraHours: parseInt(extraHours || 0),
        borrowedAmount: parseFloat(borrowedAmount || 0),
      });

      res.status(201).json({
        success: true,
        message: 'Attendance recorded successfully',
        data: { attendance },
      });
    } catch (error) {
      console.error('Record attendance controller error:', error);
      if (error.message.includes('already recorded')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  };

  /**
   * PUT /api/attendance/:id
   * Update attendance
   */
  updateAttendance = async (req, res, next) => {
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

      const attendance = await workerService.updateAttendance(parseInt(id), updateData);

      res.status(200).json({
        success: true,
        message: 'Attendance updated successfully',
        data: { attendance },
      });
    } catch (error) {
      console.error('Update attendance controller error:', error);
      if (error.message === 'Attendance record not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  };

  /**
   * GET /api/workers/:id/salary/:month/:year
   * Calculate monthly salary
   */
  calculateSalary = async (req, res, next) => {
    try {
      const { id, month, year } = req.params;

      const salaryData = await workerService.calculateMonthlySalary(
        parseInt(id),
        parseInt(month),
        parseInt(year)
      );

      res.status(200).json({
        success: true,
        data: { salary: salaryData },
      });
    } catch (error) {
      console.error('Calculate salary controller error:', error);
      if (error.message === 'Worker not found') {
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
const createWorkerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),
  body('mobile')
    .trim()
    .notEmpty()
    .withMessage('Mobile number is required')
    .matches(/^[0-9]{10}$/)
    .withMessage('Mobile number must be 10 digits'),
];

const recordAttendanceValidation = [
  body('date').notEmpty().withMessage('Date is required').isISO8601().withMessage('Invalid date format'),
  body('workType')
    .notEmpty()
    .withMessage('Work type is required')
    .isIn(['FULL_DAY', 'HALF_DAY'])
    .withMessage('Work type must be either FULL_DAY or HALF_DAY'),
  body('extraHours')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Extra hours must be a non-negative integer'),
  body('borrowedAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Borrowed amount must be a non-negative number'),
];

const updateAttendanceValidation = [
  body('workType')
    .optional()
    .isIn(['FULL_DAY', 'HALF_DAY'])
    .withMessage('Work type must be either FULL_DAY or HALF_DAY'),
  body('extraHours')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Extra hours must be a non-negative integer'),
  body('borrowedAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Borrowed amount must be a non-negative number'),
];

const workerController = new WorkerController();

module.exports = {
  workerController,
  createWorkerValidation,
  recordAttendanceValidation,
  updateAttendanceValidation,
};
