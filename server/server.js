import dotenv from 'dotenv';
import app from './src/app.js';
import { runMigrations } from './src/config/migrate.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Ensure migrations run on server startup
    await runMigrations();

    const server = app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`🚀 CollabCampus Server is running on port ${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🌍 Environment:  ${process.env.NODE_ENV || 'development'}`);
      console.log(`=================================================`);
    });

    const shutdown = (signal) => {
      console.log(`\n[Server] Received ${signal}, closing HTTP server gracefully...`);
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('[Server Startup Failure]', err);
    process.exit(1);
  }
}

startServer();
