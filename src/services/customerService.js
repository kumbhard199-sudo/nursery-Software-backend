const { prisma } = require('../config/db');

class CustomerService {
  /**
   * Create a new customer
   */
  async createCustomer(customerData) {
    try {
      const customer = await prisma.customer.create({
        data: customerData,
      });

      return customer;
    } catch (error) {
      console.error('Create customer service error:', error);
      throw error;
    }
  }

  /**
   * Get all customers
   */
  async getAllCustomers() {
    try {
      const customers = await prisma.customer.findMany({
        include: {
          sales: {
            select: {
              id: true,
              totalAmount: true,
              saleDate: true,
              batch: {
                select: {
                  batchName: true,
                  cropType: true,
                },
              },
            },
            orderBy: { saleDate: 'desc' },
          },
          _count: {
            select: { sales: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return customers;
    } catch (error) {
      console.error('Get all customers service error:', error);
      throw error;
    }
  }

  /**
   * Get customer by ID
   */
  async getCustomerById(id) {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
          sales: {
            include: {
              batch: {
                select: {
                  batchName: true,
                  cropType: true,
                },
              },
            },
            orderBy: { saleDate: 'desc' },
          },
        },
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      // Calculate total purchases
      const totalPurchases = customer.sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
      const totalTransactions = customer.sales.length;

      return {
        ...customer,
        totalPurchases,
        totalTransactions,
      };
    } catch (error) {
      console.error('Get customer by ID service error:', error);
      throw error;
    }
  }

  /**
   * Update customer
   */
  async updateCustomer(id, updateData) {
    try {
      const customer = await prisma.customer.findUnique({
        where: { id },
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      const updatedCustomer = await prisma.customer.update({
        where: { id },
        data: updateData,
      });

      return updatedCustomer;
    } catch (error) {
      console.error('Update customer service error:', error);
      throw error;
    }
  }

  /**
   * Delete customer
   */
  async deleteCustomer(id) {
    try {
      // Check if customer has sales
      const salesCount = await prisma.sale.count({
        where: { customerId: id },
      });

      if (salesCount > 0) {
        throw new Error('Cannot delete customer with existing sales.');
      }

      await prisma.customer.delete({
        where: { id },
      });

      return { message: 'Customer deleted successfully' };
    } catch (error) {
      console.error('Delete customer service error:', error);
      throw error;
    }
  }

  /**
   * Search customers by name or mobile
   */
  async searchCustomers(query) {
    try {
      const customers = await prisma.customer.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { mobileNumber: { contains: query, mode: 'insensitive' } },
          ],
        },
        orderBy: { name: 'asc' },
      });

      return customers;
    } catch (error) {
      console.error('Search customers service error:', error);
      throw error;
    }
  }
}

module.exports = new CustomerService();
