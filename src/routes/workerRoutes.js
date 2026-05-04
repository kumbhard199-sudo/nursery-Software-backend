const express = require('express');
const router = express.Router();
const {
  workerController,
  createWorkerValidation,
  recordAttendanceValidation,
  updateAttendanceValidation,
} = require('../controllers/workerController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Create worker
router.post('/', createWorkerValidation, workerController.createWorker);

// Get all workers
router.get('/', workerController.getAllWorkers);

// Get worker by ID
router.get('/:id', workerController.getWorkerById);

// Update worker
router.put('/:id', workerController.updateWorker);

// Delete worker
router.delete('/:id', workerController.deleteWorker);

// Record attendance
router.post('/:id/attendance', recordAttendanceValidation, workerController.recordAttendance);

// Calculate salary
router.get('/:id/salary/:month/:year', workerController.calculateSalary);

// Update attendance
router.put('/attendance/:id', updateAttendanceValidation, workerController.updateAttendance);

module.exports = router;
