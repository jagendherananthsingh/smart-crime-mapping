import app from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { seedDatabase } from './utils/seed';

const startServer = async () => {
  try {
    console.log('=====================================================');
    console.log('SMART CRIME MAPPING DATA ANALYSIS AND PREDICTIVE INSIGHTS');
    console.log('Dept: CSE (Data Science) | Geethanjali Institute of Science & Technology');
    console.log('=====================================================');

    await connectDatabase();

    // Auto-seed demo environment if empty
    await seedDatabase(false);

    const server = app.listen(env.PORT, () => {
      console.log(`[Server] Application running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      console.log(`[Server] API Base URL: http://localhost:${env.PORT}/api`);
      console.log(`[Server] Health Check: http://localhost:${env.PORT}/api/health`);
    });

    // Graceful Shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        await disconnectDatabase();
        console.log('[Server] Cleanup complete. Process exiting.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('[Server] Fatal Error during server initialization:', error);
    process.exit(1);
  }
};

startServer();
