const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const connectDB = require('./config/db').connectDB;

// Import routes
const authRoutes = require('./routes/authRoutes');
const batchRoutes = require('./routes/batchRoutes');
const customerRoutes = require('./routes/customerRoutes');
const salesRoutes = require('./routes/salesRoutes');
const workerRoutes = require('./routes/workerRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const reportRoutes = require('./routes/reportRoutes');
const travellingCostRoutes = require('./routes/travellingCostRoutes');

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.CORS_ORIGIN || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

// Security middleware
app.use(helmet());

// CORS middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, health checks, server-to-server).
    if (!origin) return callback(null, true);

    if (allowedOrigins.length === 0) {
      return callback(null, process.env.NODE_ENV !== 'production');
    }

    return callback(null, allowedOrigins.includes(origin));
  },
  credentials: true,
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files for invoices
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/travelling-costs', travellingCostRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Nursery Management System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      batches: '/api/batches',
      customers: '/api/customers',
      sales: '/api/sales',
      workers: '/api/workers',
      expenses: '/api/expenses',
      reports: '/api/reports',
      travellingCosts: '/api/travelling-costs',
      health: '/health',
    },
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
