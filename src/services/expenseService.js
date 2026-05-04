const { prisma } = require('../config/db');

class ExpenseService {
  /**
   * Add raw material expense
   */
  async addRawMaterial(materialData) {
    try {
      const rawMaterial = await prisma.rawMaterial.create({
        data: materialData,
      });

      return rawMaterial;
    } catch (error) {
      console.error('Add raw material service error:', error);
      throw error;
    }
  }

  /**
   * Get all raw materials
   */
  async getAllRawMaterials() {
    try {
      const materials = await prisma.rawMaterial.findMany({
        orderBy: { purchaseDate: 'desc' },
      });

      return materials;
    } catch (error) {
      console.error('Get all raw materials service error:', error);
      throw error;
    }
  }

  /**
   * Get raw material by ID
   */
  async getRawMaterialById(id) {
    try {
      const material = await prisma.rawMaterial.findUnique({
        where: { id },
      });

      if (!material) {
        throw new Error('Raw material not found');
      }

      return material;
    } catch (error) {
      console.error('Get raw material by ID service error:', error);
      throw error;
    }
  }

  /**
   * Update raw material
   */
  async updateRawMaterial(id, updateData) {
    try {
      const material = await prisma.rawMaterial.findUnique({
        where: { id },
      });

      if (!material) {
        throw new Error('Raw material not found');
      }

      const updatedMaterial = await prisma.rawMaterial.update({
        where: { id },
        data: updateData,
      });

      return updatedMaterial;
    } catch (error) {
      console.error('Update raw material service error:', error);
      throw error;
    }
  }

  /**
   * Delete raw material
   */
  async deleteRawMaterial(id) {
    try {
      await prisma.rawMaterial.delete({
        where: { id },
      });

      return { message: 'Raw material deleted successfully' };
    } catch (error) {
      console.error('Delete raw material service error:', error);
      throw error;
    }
  }

  /**
   * Get monthly raw material expenses
   */
  async getMonthlyExpenses(month, year) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const materials = await prisma.rawMaterial.findMany({
        where: {
          purchaseDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { purchaseDate: 'desc' },
      });

      const totalExpense = materials.reduce((sum, m) => sum + m.cost, 0);

      return {
        month,
        year,
        totalExpense,
        count: materials.length,
        materials,
      };
    } catch (error) {
      console.error('Get monthly expenses service error:', error);
      throw error;
    }
  }

  /**
   * Get expense summary for a date range
   */
  async getExpenseSummary(startDate, endDate) {
    try {
      const materials = await prisma.rawMaterial.findMany({
        where: {
          purchaseDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
      });

      const totalExpense = materials.reduce((sum, m) => sum + m.cost, 0);

      // Group by material type
      const byMaterial = materials.reduce((acc, m) => {
        acc[m.materialName] = (acc[m.materialName] || 0) + m.cost;
        return acc;
      }, {});

      return {
        startDate,
        endDate,
        totalExpense,
        count: materials.length,
        byMaterial,
        materials,
      };
    } catch (error) {
      console.error('Get expense summary service error:', error);
      throw error;
    }
  }
}

module.exports = new ExpenseService();
