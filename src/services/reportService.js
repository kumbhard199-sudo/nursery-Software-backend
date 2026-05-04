const { prisma } = require('../config/db');
const { WORK_RATE } = require('../constants');

class ReportService {
  /**
   * Get comprehensive monthly report
   */
  async getMonthlyReport(month, year) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      // Get all sales for the month
      const sales = await prisma.sale.findMany({
        where: {
          saleDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          batch: true,
          customer: true,
        },
      });

      // Calculate total income
      const totalIncome = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

      // Get raw material expenses
      const rawMaterials = await prisma.rawMaterial.findMany({
        where: {
          purchaseDate: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      const rawMaterialExpenses = rawMaterials.reduce((sum, m) => sum + m.cost, 0);

      // Get worker attendance and calculate salaries
      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          worker: true,
        },
      });

      // Group by worker
      const workerSalaryMap = attendanceRecords.reduce((acc, record) => {
        if (!acc[record.workerId]) {
          acc[record.workerId] = {
            workerName: record.worker.name,
            fullDays: 0,
            halfDays: 0,
            extraHours: 0,
            borrowedAmount: 0,
          };
        }

        if (record.workType === 'FULL_DAY') acc[record.workerId].fullDays += 1;
        else if (record.workType === 'HALF_DAY') acc[record.workerId].halfDays += 1;

        acc[record.workerId].extraHours += record.extraHours;
        acc[record.workerId].borrowedAmount += record.borrowedAmount;

        return acc;
      }, {});

      // Calculate worker salaries
      const workerSalaries = Object.entries(workerSalaryMap).map(([workerId, data]) => {
        const grossSalary =
          data.fullDays * WORK_RATE.FULL_DAY +
          data.halfDays * WORK_RATE.HALF_DAY +
          data.extraHours * WORK_RATE.EXTRA_HOUR;
        const netSalary = grossSalary - data.borrowedAmount;

        return {
          workerId: parseInt(workerId),
          workerName: data.workerName,
          fullDays: data.fullDays,
          halfDays: data.halfDays,
          extraHours: data.extraHours,
          borrowedAmount: data.borrowedAmount,
          grossSalary,
          netSalary,
        };
      });

      const totalWorkerSalaries = workerSalaries.reduce((sum, w) => sum + w.netSalary, 0);

      // Calculate profit
      const totalExpenses = rawMaterialExpenses + totalWorkerSalaries;
      const profit = totalIncome - totalExpenses;

      // Get batch production summary
      const batches = await prisma.batch.findMany({
        where: {
          createdDate: {
            lte: endDate,
          },
        },
        include: {
          sales: {
            where: {
              saleDate: {
                lte: endDate,
              },
            },
            select: {
              cropQuantity: true,
            },
          },
        },
      });

      const batchSummary = batches.map(batch => {
        const soldCrops = batch.sales.reduce((sum, s) => sum + s.cropQuantity, 0);
        const remainingCrops = batch.totalProduced - soldCrops - batch.deadCrops;

        return {
          batchId: batch.id,
          batchName: batch.batchName,
          cropType: batch.cropType,
          totalProduced: batch.totalProduced,
          soldCrops,
          deadCrops: batch.deadCrops,
          remainingCrops,
        };
      });

      return {
        month,
        year,
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        income: {
          totalIncome,
          salesCount: sales.length,
        },
        expenses: {
          totalExpenses,
          rawMaterialExpenses,
          workerSalaries: totalWorkerSalaries,
        },
        profit: {
          grossProfit: totalIncome - rawMaterialExpenses,
          netProfit: profit,
          profitMargin: totalIncome > 0 ? ((profit / totalIncome) * 100).toFixed(2) : 0,
        },
        workers: {
          totalWorkers: workerSalaries.length,
          totalSalaries: totalWorkerSalaries,
          details: workerSalaries,
        },
        production: {
          totalBatches: batches.length,
          batches: batchSummary,
        },
        sales,
      };
    } catch (error) {
      console.error('Get monthly report service error:', error);
      throw error;
    }
  }

  /**
   * Get profit summary for a date range
   */
  async getProfitSummary(startDate, endDate) {
    try {
      // Get sales
      const sales = await prisma.sale.findMany({
        where: {
          saleDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
      });

      const totalIncome = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

      // Get raw material expenses
      const rawMaterials = await prisma.rawMaterial.findMany({
        where: {
          purchaseDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
      });

      const rawMaterialExpenses = rawMaterials.reduce((sum, m) => sum + m.cost, 0);

      // Get worker salaries (simplified - based on attendance in date range)
      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
      });

      const workerSalaryTotal = attendanceRecords.reduce((sum, record) => {
        const daySalary =
          record.workType === 'FULL_DAY'
            ? WORK_RATE.FULL_DAY
            : WORK_RATE.HALF_DAY;
        const extraPay = record.extraHours * WORK_RATE.EXTRA_HOUR;
        return sum + daySalary + extraPay - record.borrowedAmount;
      }, 0);

      const totalExpenses = rawMaterialExpenses + workerSalaryTotal;
      const profit = totalIncome - totalExpenses;

      return {
        startDate,
        endDate,
        totalIncome,
        totalExpenses,
        breakdown: {
          rawMaterialExpenses,
          workerSalaries: workerSalaryTotal,
        },
        profit,
        profitMargin: totalIncome > 0 ? ((profit / totalIncome) * 100).toFixed(2) : 0,
      };
    } catch (error) {
      console.error('Get profit summary service error:', error);
      throw error;
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    try {
      // Total batches
      const totalBatches = await prisma.batch.count();

      // Active batches (with remaining stock)
      const batches = await prisma.batch.findMany({
        include: {
          sales: {
            select: { cropQuantity: true },
          },
        },
      });

      const activeBatches = batches.filter(batch => {
        const soldCrops = batch.sales.reduce((sum, s) => sum + s.cropQuantity, 0);
        const remaining = batch.totalProduced - soldCrops - batch.deadCrops;
        return remaining > 0;
      }).length;

      // Total customers
      const totalCustomers = await prisma.customer.count();

      // Total workers
      const totalWorkers = await prisma.worker.count();

      // This month's sales
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const monthlySales = await prisma.sale.findMany({
        where: {
          saleDate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

      const monthlyRevenue = monthlySales.reduce((sum, sale) => sum + sale.totalAmount, 0);

      // Today's date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Today's attendance count
      const todayAttendance = await prisma.attendance.count({
        where: {
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
      });

      return {
        batches: {
          total: totalBatches,
          active: activeBatches,
        },
        customers: {
          total: totalCustomers,
        },
        workers: {
          total: totalWorkers,
          presentToday: todayAttendance,
        },
        revenue: {
          thisMonth: monthlyRevenue,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        },
      };
    } catch (error) {
      console.error('Get dashboard stats service error:', error);
      throw error;
    }
  }
}

module.exports = new ReportService();
