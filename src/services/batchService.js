const { prisma } = require('../config/db');

class BatchService {
  /**
   * Create a new batch
   */
  async createBatch(batchData) {
    try {
      const batch = await prisma.batch.create({
        data: batchData,
        include: {
          sales: {
            select: {
              id: true,
              cropQuantity: true,
              saleDate: true,
            },
          },
        },
      });

      return batch;
    } catch (error) {
      console.error('Create batch service error:', error);
      throw error;
    }
  }

  /**
   * Get all batches with stock calculation
   */
  async getAllBatches() {
    try {
      const batches = await prisma.batch.findMany({
        include: {
          sales: {
            select: {
              cropQuantity: true,
            },
          },
        },
        orderBy: { createdDate: 'desc' },
      });

      // Calculate remaining stock for each batch
      const batchesWithStock = batches.map(batch => {
        const soldCrops = batch.sales.reduce((sum, sale) => sum + sale.cropQuantity, 0);
        const remainingCrops = batch.totalProduced - soldCrops - batch.deadCrops;

        return {
          ...batch,
          soldCrops,
          remainingCrops,
        };
      });

      return batchesWithStock;
    } catch (error) {
      console.error('Get all batches service error:', error);
      throw error;
    }
  }

  /**
   * Get batch by ID with stock calculation
   */
  async getBatchById(id) {
    try {
      const batch = await prisma.batch.findUnique({
        where: { id },
        include: {
          sales: {
            select: {
              id: true,
              cropQuantity: true,
              totalAmount: true,
              saleDate: true,
              customer: {
                select: {
                  name: true,
                  mobileNumber: true,
                },
              },
            },
          },
        },
      });

      if (!batch) {
        throw new Error('Batch not found');
      }

      const soldCrops = batch.sales.reduce((sum, sale) => sum + sale.cropQuantity, 0);
      const remainingCrops = batch.totalProduced - soldCrops - batch.deadCrops;

      return {
        ...batch,
        soldCrops,
        remainingCrops,
      };
    } catch (error) {
      console.error('Get batch by ID service error:', error);
      throw error;
    }
  }

  /**
   * Update dead crops in a batch
   */
  async updateDeadCrops(id, deadCrops) {
    try {
      const batch = await prisma.batch.findUnique({
        where: { id },
      });

      if (!batch) {
        throw new Error('Batch not found');
      }

      // Validate dead crops count
      const soldCrops = await prisma.sale
        .aggregate({
          where: { batchId: id },
          _sum: { cropQuantity: true },
        })
        .then(r => r._sum.cropQuantity || 0);

      if (deadCrops + soldCrops > batch.totalProduced) {
        throw new Error(
          `Cannot set dead crops to ${deadCrops}. Total produced: ${batch.totalProduced}, Sold: ${soldCrops}`
        );
      }

      const updatedBatch = await prisma.batch.update({
        where: { id },
        data: { deadCrops },
      });

      return updatedBatch;
    } catch (error) {
      console.error('Update dead crops service error:', error);
      throw error;
    }
  }

  /**
   * Update batch
   */
  async updateBatch(id, updateData) {
    try {
      const batch = await prisma.batch.findUnique({
        where: { id },
      });

      if (!batch) {
        throw new Error('Batch not found');
      }

      const updatedBatch = await prisma.batch.update({
        where: { id },
        data: updateData,
      });

      return updatedBatch;
    } catch (error) {
      console.error('Update batch service error:', error);
      throw error;
    }
  }

  /**
   * Delete batch
   */
  async deleteBatch(id) {
    try {
      // Check if batch has sales
      const salesCount = await prisma.sale.count({
        where: { batchId: id },
      });

      if (salesCount > 0) {
        throw new Error('Cannot delete batch with existing sales. Remove sales first.');
      }

      await prisma.batch.delete({
        where: { id },
      });

      return { message: 'Batch deleted successfully' };
    } catch (error) {
      console.error('Delete batch service error:', error);
      throw error;
    }
  }

  /**
   * Get batch stock summary
   */
  async getBatchStock(id) {
    try {
      const batch = await prisma.batch.findUnique({
        where: { id },
      });

      if (!batch) {
        throw new Error('Batch not found');
      }

      const soldCrops = await prisma.sale
        .aggregate({
          where: { batchId: id },
          _sum: { cropQuantity: true },
        })
        .then(r => r._sum.cropQuantity || 0);

      const remainingCrops = batch.totalProduced - soldCrops - batch.deadCrops;

      return {
        batchId: id,
        batchName: batch.batchName,
        cropType: batch.cropType,
        totalProduced: batch.totalProduced,
        soldCrops,
        deadCrops: batch.deadCrops,
        remainingCrops,
      };
    } catch (error) {
      console.error('Get batch stock service error:', error);
      throw error;
    }
  }

  /**
   * Get batch sales summary
   */
  async getBatchSalesSummary(id) {
    try {
      const batch = await prisma.batch.findUnique({
        where: { id },
        include: {
          sales: {
            include: {
              customer: {
                select: {
                  name: true,
                  mobileNumber: true,
                },
              },
            },
            orderBy: { saleDate: 'desc' },
          },
        },
      });

      if (!batch) {
        throw new Error('Batch not found');
      }

      const totalSales = batch.sales.length;
      const totalQuantitySold = batch.sales.reduce((sum, sale) => sum + sale.cropQuantity, 0);
      const totalRevenue = batch.sales.reduce((sum, sale) => sum + sale.totalAmount, 0);

      return {
        batchInfo: {
          id: batch.id,
          batchName: batch.batchName,
          cropType: batch.cropType,
          totalProduced: batch.totalProduced,
          deadCrops: batch.deadCrops,
        },
        salesSummary: {
          totalSales,
          totalQuantitySold,
          totalRevenue,
          remainingStock: batch.totalProduced - totalQuantitySold - batch.deadCrops,
        },
        sales: batch.sales,
      };
    } catch (error) {
      console.error('Get batch sales summary service error:', error);
      throw error;
    }
  }
}

module.exports = new BatchService();
