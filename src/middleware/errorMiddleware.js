// Centralized error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error response
  let error = { ...err };
  error.message = err.message || 'Internal Server Error';

  // Prisma specific errors
  if (err.code === 'P2002') {
    const message = `Duplicate value entered for field: ${err.meta?.target || 'unknown field'}`;
    error = { ...error, message, statusCode: 400 };
  }

  if (err.code === 'P2025') {
    const message = 'Record not found';
    error = { ...error, message, statusCode: 404 };
  }

  if (err.code === 'P2003') {
    const message = 'Foreign key constraint failed. Referenced record does not exist.';
    error = { ...error, message, statusCode: 400 };
  }

  // Validation errors (express-validator)
  if (err.array && typeof err.array === 'function') {
    const errors = err.array().map(e => ({
      field: e.path,
      message: e.msg,
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors,
    });
  }

  // Multer errors (file upload)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error.message = 'File size too large';
      error.statusCode = 400;
    } else {
      error.message = err.message;
      error.statusCode = 400;
    }
  }

  // Set status code
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Not found middleware
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = { errorHandler, notFound };
