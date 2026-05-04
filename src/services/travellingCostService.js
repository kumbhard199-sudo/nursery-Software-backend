const { prisma } = require('../config/db');

class TravellingCostService {
  /**
   * Create a new travelling cost entry
   */
  async createTravellingCost(data) {
    try {
      const entry = await prisma.travellingCost.create({
        data: {
          customerName: data.customerName,
          location: data.location,
          cost: parseFloat(data.cost),
          travelDate: data.travelDate ? new Date(data.travelDate) : new Date(),
          notes: data.notes || null,
        },
      });
      return entry;
    } catch (error) {
      console.error('Create travelling cost service error:', error);
      throw error;
    }
  }

  /**
   * Get all travelling cost entries (optionally filtered by month/year)
   */
  async getAllTravellingCosts({ month, year } = {}) {
    try {
      let where = {};

      if (month && year) {
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
        where.travelDate = { gte: startDate, lte: endDate };
      } else if (year) {
        const startDate = new Date(parseInt(year), 0, 1);
        const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59);
        where.travelDate = { gte: startDate, lte: endDate };
      }

      const entries = await prisma.travellingCost.findMany({
        where,
        orderBy: { travelDate: 'desc' },
      });

      return entries;
    } catch (error) {
      console.error('Get all travelling costs service error:', error);
      throw error;
    }
  }

  /**
   * Get a single travelling cost entry by ID
   */
  async getTravellingCostById(id) {
    try {
      const entry = await prisma.travellingCost.findUnique({
        where: { id },
      });

      if (!entry) {
        throw new Error('Travelling cost record not found');
      }

      return entry;
    } catch (error) {
      console.error('Get travelling cost by ID service error:', error);
      throw error;
    }
  }

  /**
   * Update a travelling cost entry
   */
  async updateTravellingCost(id, data) {
    try {
      const existing = await prisma.travellingCost.findUnique({ where: { id } });
      if (!existing) {
        throw new Error('Travelling cost record not found');
      }

      const updateData = {};
      if (data.customerName !== undefined) updateData.customerName = data.customerName;
      if (data.location !== undefined) updateData.location = data.location;
      if (data.cost !== undefined) updateData.cost = parseFloat(data.cost);
      if (data.travelDate !== undefined) updateData.travelDate = new Date(data.travelDate);
      if (data.notes !== undefined) updateData.notes = data.notes;

      const entry = await prisma.travellingCost.update({
        where: { id },
        data: updateData,
      });

      return entry;
    } catch (error) {
      console.error('Update travelling cost service error:', error);
      throw error;
    }
  }

  /**
   * Delete a travelling cost entry
   */
  async deleteTravellingCost(id) {
    try {
      const existing = await prisma.travellingCost.findUnique({ where: { id } });
      if (!existing) {
        throw new Error('Travelling cost record not found');
      }

      await prisma.travellingCost.delete({ where: { id } });
      return { message: 'Travelling cost record deleted successfully' };
    } catch (error) {
      console.error('Delete travelling cost service error:', error);
      throw error;
    }
  }

  /**
   * Get monthly summary of travelling costs
   */
  async getMonthlySummary(year) {
    try {
      const targetYear = parseInt(year) || new Date().getFullYear();
      const startDate = new Date(targetYear, 0, 1);
      const endDate = new Date(targetYear, 11, 31, 23, 59, 59);

      const entries = await prisma.travellingCost.findMany({
        where: {
          travelDate: { gte: startDate, lte: endDate },
        },
        orderBy: { travelDate: 'asc' },
      });

      // Group by month
      const monthlyData = {};
      for (let m = 1; m <= 12; m++) {
        monthlyData[m] = { month: m, year: targetYear, totalCost: 0, count: 0, entries: [] };
      }

      entries.forEach(entry => {
        const month = new Date(entry.travelDate).getMonth() + 1;
        monthlyData[month].totalCost += entry.cost;
        monthlyData[month].count += 1;
        monthlyData[month].entries.push(entry);
      });

      return {
        year: targetYear,
        totalCost: entries.reduce((sum, e) => sum + e.cost, 0),
        totalEntries: entries.length,
        monthly: Object.values(monthlyData),
      };
    } catch (error) {
      console.error('Get monthly summary service error:', error);
      throw error;
    }
  }
}

module.exports = new TravellingCostService();
