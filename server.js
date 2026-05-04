const app = require('./src/app');
const { connectDB, disconnectDB } = require('./src/config/db');
const backupScheduler = require('./src/utils/backupScheduler');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDB();

    // Start backup scheduler
    if (process.env.NODE_ENV !== 'test') {
      backupScheduler.start();
    }

    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🌱 Nursery Management System API Server                 ║
║                                                           ║
║   Server running on port ${PORT}                            ║
║   Environment: ${process.env.NODE_ENV || 'development'}                             ║
║                                                           ║
║   Endpoints:                                              ║
║   - API: http://localhost:${PORT}/api                      ║
║   - Health: http://localhost:${PORT}/health                ║
║   - Docs: http://localhost:${PORT}/                        ║
║                                                           ║
║   Press Ctrl+C to stop                                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM received. Shutting down...');
  await disconnectDB();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', reason => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

// Start the server
startServer();
