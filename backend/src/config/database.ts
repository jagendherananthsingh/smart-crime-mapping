import mongoose from 'mongoose';
import { env } from './env';

let mongoMemoryServer: any = null;

export const connectDatabase = async (): Promise<string> => {
  // If already connected, return cached connection (essential for Vercel serverless)
  if (mongoose.connection.readyState >= 1) {
    return env.MONGODB_URI;
  }

  const isServerless = Boolean(process.env.VERCEL || process.env.NOW_REGION || process.env.AWS_REGION);

  try {
    // Attempt connecting to the configured MONGODB_URI with a 3-second timeout
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] Connected to external MongoDB: ${env.MONGODB_URI}`);
    return env.MONGODB_URI;
  } catch (err: any) {
    if (isServerless) {
      console.warn(
        `[Database] Vercel serverless notice: External MongoDB not reachable (${err.message}). Set MONGODB_URI in Vercel settings for cloud database persistence.`
      );
      return 'serverless_offline_mode';
    }

    console.warn(`[Database] External MongoDB not reachable (${err.message}). Initializing embedded in-memory MongoDB...`);
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const dbPath = require('path').resolve(__dirname, '../../../data/db');
      require('fs').mkdirSync(dbPath, { recursive: true });

      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'smart_crime_mapping',
          port: 27017,
          launchTimeout: 120000,
          dbPath: dbPath,
        },
      });
      const uri = mongoMemoryServer.getUri();
      await mongoose.connect(uri);
      console.log(`[Database] Connected to embedded in-memory MongoDB: ${uri}`);
      return uri;
    } catch (memErr: any) {
      console.error('[Database] Fatal: Failed to initialize embedded MongoDB', memErr);
      throw memErr;
    }
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
  console.log('[Database] Disconnected');
};
