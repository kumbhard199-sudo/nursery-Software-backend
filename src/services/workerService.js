const { prisma } = require('../config/db');
const { WORK_RATE, WORK_TYPES } = require('../constants');

class WorkerService {
  /**
   * Create a new worker
   */
  async createWorker(workerData) {
    try {
      const worker = await prisma.worker.create({
        data: workerData,
      });

      return worker;
    } catch (error) {
      console.error('Create worker service error:', error);
      throw error;
    }
  }

  /**
   * Get all workers
   */
  async getAllWorkers() {
    try {
      const workers = await prisma.worker.findMany({
        include: {
          attendance: {
            select: {
              id: true,
              date: true,
              workType: true,
              extraHours: true,
              borrowedAmount: true,
            },
            orderBy: { date: 'desc' },
            // No limit — return all attendance records
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return workers;
    } catch (error) {
      console.error('Get all workers service error:', error);
      throw error;
    }
  }

  /**
   * Get worker by ID
   */
  async getWorkerById(id) {
    try {
      const worker = await prisma.worker.findUnique({
        where: { id },
        include: {
          attendance: {
            orderBy: { date: 'desc' },
          },
        },
      });

      if (!worker) {
        throw new Error('Worker not found');
      }

      return worker;
    } catch (error) {
      console.error('Get worker by ID service error:', error);
      throw error;
    }
  }

  /**
   * Update worker
   */
  async updateWorker(id, updateData) {
    try {
      const worker = await prisma.worker.findUnique({
        where: { id },
      });

      if (!worker) {
        throw new Error('Worker not found');
      }

      const updatedWorker = await prisma.worker.update({
        where: { id },
        data: updateData,
      });

      return updatedWorker;
    } catch (error) {
      console.error('Update worker service error:', error);
      throw error;
    }
  }

  /**
   * Delete worker
   */
  async deleteWorker(id) {
    try {
      // Check if worker has attendance records
      const attendanceCount = await prisma.attendance.count({
        where: { workerId: id },
      });

      if (attendanceCount > 0) {
        throw new Error('Cannot delete worker with existing attendance records.');
      }

      await prisma.worker.delete({
        where: { id },
      });

      return { message: 'Worker deleted successfully' };
    } catch (error) {
      console.error('Delete worker service error:', error);
      throw error;
    }
  }

  /**
   * Record attendance for a worker.
   * If attendance already exists for the date:
   *   - If only extraHours / borrowedAmount are supplied (no workType change),
   *     the extra hours and borrowed amount are ADDED to the existing record.
   *   - Otherwise an error is thrown so the caller can use the update endpoint.
   */
  async recordAttendance(attendanceData) {
    try {
      const { workerId, date, workType, extraHours, borrowedAmount } = attendanceData;

      // Check if attendance already exists for this date
      const existingAttendance = await prisma.attendance.findUnique({
        where: {
          workerId_date: {
            workerId,
            date: new Date(date),
          },
        },
      });

      if (existingAttendance) {
        // If the caller is adding extra hours on the same day, accumulate them
        const incomingExtra = extraHours || 0;
        const incomingBorrowed = borrowedAmount || 0;

        if (incomingExtra > 0 || incomingBorrowed > 0) {
          // Accumulate extra hours and borrowed amount on the existing record
          const updatedAttendance = await prisma.attendance.update({
            where: { id: existingAttendance.id },
            data: {
              extraHours: existingAttendance.extraHours + incomingExtra,
              borrowedAmount: existingAttendance.borrowedAmount + incomingBorrowed,
            },
            include: { worker: true },
          });
          return updatedAttendance;
        }

        throw new Error('Attendance already recorded for this date. Use update to change work type.');
      }

      const attendance = await prisma.attendance.create({
        data: {
          workerId,
          date: new Date(date),
          workType,
          extraHours: extraHours || 0,
          borrowedAmount: borrowedAmount || 0,
        },
        include: {
          worker: true,
        },
      });

      return attendance;
    } catch (error) {
      console.error('Record attendance service error:', error);
      throw error;
    }
  }

  /**
   * Update attendance
   */
  async updateAttendance(id, updateData) {
    try {
      const attendance = await prisma.attendance.findUnique({
        where: { id },
      });

      if (!attendance) {
        throw new Error('Attendance record not found');
      }

      const updatedAttendance = await prisma.attendance.update({
        where: { id },
        data: updateData,
        include: {
          worker: true,
        },
      });

      return updatedAttendance;
    } catch (error) {
      console.error('Update attendance service error:', error);
      throw error;
    }
  }

  /**
   * Calculate monthly salary for a worker
   */
  async calculateMonthlySalary(workerId, month, year) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          workerId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          worker: true,
        },
      });

      if (attendanceRecords.length === 0) {
        return {
          workerId,
          month,
          year,
          fullDays: 0,
          halfDays: 0,
          totalExtraHours: 0,
          totalBorrowed: 0,
          grossSalary: 0,
          netSalary: 0,
          details: [],
        };
      }

      // Calculate components
      const fullDays = attendanceRecords.filter(r => r.workType === WORK_TYPES.FULL_DAY).length;
      const halfDays = attendanceRecords.filter(r => r.workType === WORK_TYPES.HALF_DAY).length;
      const totalExtraHours = attendanceRecords.reduce((sum, r) => sum + r.extraHours, 0);
      const totalBorrowed = attendanceRecords.reduce((sum, r) => sum + r.borrowedAmount, 0);

      // Calculate salary
      const fullDaySalary = fullDays * WORK_RATE.FULL_DAY;
      const halfDaySalary = halfDays * WORK_RATE.HALF_DAY;
      const extraHourSalary = totalExtraHours * WORK_RATE.EXTRA_HOUR;

      const grossSalary = fullDaySalary + halfDaySalary + extraHourSalary;
      const netSalary = grossSalary - totalBorrowed;

      return {
        workerId,
        workerName: attendanceRecords[0].worker.name,
        month,
        year,
        fullDays,
        halfDays,
        totalExtraHours,
        totalBorrowed,
        grossSalary,
        netSalary,
        breakdown: {
          fullDayAmount: fullDaySalary,
          halfDayAmount: halfDaySalary,
          extraHourAmount: extraHourSalary,
        },
        attendanceCount: attendanceRecords.length,
        details: attendanceRecords,
      };
    } catch (error) {
      console.error('Calculate monthly salary service error:', error);
      throw error;
    }
  }

  /**
   * Get worker salary report
   */
  async getWorkerSalaryReport(workerId, month, year) {
    try {
      const salaryData = await this.calculateMonthlySalary(workerId, month, year);

      return {
        success: true,
        data: { salary: salaryData },
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new WorkerService();
