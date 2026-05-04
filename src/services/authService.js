const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');

class AuthService {
  /**
   * Login admin and generate JWT token
   */
  async login(username, password) {
    try {
      // Find admin by username
      const admin = await prisma.admin.findUnique({
        where: { username },
      });

      if (!admin) {
        throw new Error('Invalid credentials');
      }

      // Check password
      const isMatch = await bcrypt.compare(password, admin.password);

      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      // Generate JWT token
      const payload = {
        id: admin.id,
        username: admin.username,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
      });

      return {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          createdAt: admin.createdAt,
        },
      };
    } catch (error) {
      console.error('Login service error:', error);
      throw error;
    }
  }

  /**
   * Create initial admin account (only if no admin exists)
   */
  async createInitialAdmin(username, password) {
    try {
      // Check if any admin exists
      const existingAdmin = await prisma.admin.count();

      if (existingAdmin > 0) {
        throw new Error('Admin account already exists. Cannot create multiple admins.');
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create admin
      const admin = await prisma.admin.create({
        data: {
          username,
          password: hashedPassword,
        },
        select: {
          id: true,
          username: true,
          createdAt: true,
        },
      });

      return admin;
    } catch (error) {
      console.error('Create initial admin service error:', error);
      throw error;
    }
  }

  /**
   * Change admin password
   */
  async changePassword(adminId, currentPassword, newPassword) {
    try {
      // Find admin
      const admin = await prisma.admin.findUnique({
        where: { id: adminId },
      });

      if (!admin) {
        throw new Error('Admin not found');
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, admin.password);

      if (!isMatch) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      await prisma.admin.update({
        where: { id: adminId },
        data: { password: hashedPassword },
      });

      return { message: 'Password changed successfully' };
    } catch (error) {
      console.error('Change password service error:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();
