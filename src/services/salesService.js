const { prisma } = require('../config/db');
const invoiceGenerator = require('../utils/invoiceGenerator');
const path = require('path');
const fs = require('fs');

class SalesService {
  /**
   * Record a new sale
   */
  async createSale(saleData) {
    try {
      const { batchId, customerId, cropQuantity, pricePerCrop, travelingCost, plantationCost } =
        saleData;

      // Verify batch exists and has sufficient stock
      const batch = await prisma.batch.findUnique({
        where: { id: batchId },
      });

      if (!batch) {
        throw new Error('Batch not found');
      }

      // Calculate current sold crops
      const existingSales = await prisma.sale.aggregate({
        where: { batchId },
        _sum: { cropQuantity: true },
      });

      const soldCrops = existingSales._sum.cropQuantity || 0;
      const availableStock = batch.totalProduced - soldCrops - batch.deadCrops;

      if (cropQuantity > availableStock) {
        throw new Error(
          `Insufficient stock. Available: ${availableStock}, Requested: ${cropQuantity}`
        );
      }

      // Calculate total amount
      const totalAmount = cropQuantity * pricePerCrop + travelingCost + plantationCost;

      // Create sale
      const sale = await prisma.sale.create({
        data: {
          batchId,
          customerId,
          cropQuantity,
          pricePerCrop,
          travelingCost: travelingCost || 0,
          plantationCost: plantationCost || 0,
          totalAmount,
        },
        include: {
          batch: true,
          customer: true,
        },
      });

      return sale;
    } catch (error) {
      console.error('Create sale service error:', error);
      throw error;
    }
  }

  /**
   * Get all sales
   */
  async getAllSales() {
    try {
      const sales = await prisma.sale.findMany({
        include: {
          batch: {
            select: {
              batchName: true,
              cropType: true,
            },
          },
          customer: {
            select: {
              name: true,
              mobileNumber: true,
            },
          },
        },
        orderBy: { saleDate: 'desc' },
      });

      return sales;
    } catch (error) {
      console.error('Get all sales service error:', error);
      throw error;
    }
  }

  /**
   * Get sale by ID
   */
  async getSaleById(id) {
    try {
      const sale = await prisma.sale.findUnique({
        where: { id },
        include: {
          batch: true,
          customer: true,
        },
      });

      if (!sale) {
        throw new Error('Sale not found');
      }

      return sale;
    } catch (error) {
      console.error('Get sale by ID service error:', error);
      throw error;
    }
  }

  /**
   * Generate invoice for a sale
   */
  async generateInvoice(saleId) {
    try {
      const sale = await this.getSaleById(saleId);

      // Ensure uploads directory exists
      const uploadsDir = path.join(process.cwd(), 'uploads', 'invoices');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fileName = `invoice_${saleId}_${Date.now()}.pdf`;
      const invoicePath = path.join(uploadsDir, fileName);

      const result = await invoiceGenerator.generateInvoice(sale, invoicePath);

      return {
        ...result,
        sale: {
          id: sale.id,
          customerName: sale.customer.name,
          totalAmount: sale.totalAmount,
        },
      };
    } catch (error) {
      console.error('Generate invoice service error:', error);
      throw error;
    }
  }

  /**
   * Get sales report with filters
   */
  async getSalesReport(filters = {}) {
    try {
      const { startDate, endDate, batchId, customerId } = filters;

      const where = {};

      if (startDate || endDate) {
        where.saleDate = {};
        if (startDate) where.saleDate.gte = new Date(startDate);
        if (endDate) where.saleDate.lte = new Date(endDate);
      }

      if (batchId) where.batchId = parseInt(batchId);
      if (customerId) where.customerId = parseInt(customerId);

      const sales = await prisma.sale.findMany({
        where,
        include: {
          batch: {
            select: {
              batchName: true,
              cropType: true,
            },
          },
          customer: {
            select: {
              name: true,
              mobileNumber: true,
            },
          },
        },
        orderBy: { saleDate: 'desc' },
      });

      // Calculate summary
      const totalSales = sales.length;
      const totalQuantity = sales.reduce((sum, sale) => sum + sale.cropQuantity, 0);
      const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
      const totalTravelingCost = sales.reduce((sum, sale) => sum + sale.travelingCost, 0);
      const totalPlantationCost = sales.reduce((sum, sale) => sum + sale.plantationCost, 0);

      return {
        summary: {
          totalSales,
          totalQuantity,
          totalRevenue,
          totalTravelingCost,
          totalPlantationCost,
          netRevenue: totalRevenue - totalTravelingCost - totalPlantationCost,
        },
        sales,
      };
    } catch (error) {
      console.error('Get sales report service error:', error);
      throw error;
    }
  }

  /**
   * Delete sale
   */
  async deleteSale(id) {
    try {
      const sale = await prisma.sale.findUnique({
        where: { id },
      });

      if (!sale) {
        throw new Error('Sale not found');
      }

      await prisma.sale.delete({
        where: { id },
      });

      return { message: 'Sale deleted successfully' };
    } catch (error) {
      console.error('Delete sale service error:', error);
      throw error;
    }
  }
}

module.exports = new SalesService();
