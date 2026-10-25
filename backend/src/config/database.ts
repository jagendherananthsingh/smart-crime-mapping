import mongoose from 'mongoose';
import { env } from './env';

let mongoMemoryServer: any = null;

export const isDbConnected = (): boolean => mongoose.connection.readyState === 1;

export const connectDatabase = async (): Promise<string> => {
  // Disable command buffering globally so queries don't hang for 10s when DB is offline
  mongoose.set('bufferCommands', false);
  mongoose.set('strictQuery', true);

  // If already connected, return cached connection (essential for Vercel serverless)
  if (mongoose.connection.readyState >= 1) {
    return env.MONGODB_URI;
  }

  const isServerless = Boolean(process.env.VERCEL || process.env.NOW_REGION || process.env.AWS_REGION);

  // On Vercel serverless, if no external remote Atlas URI is provided, run immediately in Cloud Resilient Mode
  if (isServerless && (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('127.0.0.1') || process.env.MONGODB_URI.includes('localhost'))) {
    console.log('[Database] Vercel Serverless: Running in Cloud Resilient Mode (Set MONGODB_URI in Vercel settings for Atlas cloud persistence).');
    return 'serverless_cloud_mode';
  }

  try {
    // Attempt connecting to the configured MONGODB_URI with a 3-second timeout
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] Connected to external MongoDB: ${env.MONGODB_URI}`);
    return env.MONGODB_URI;
  } catch (err: any) {
    if (isServerless) {
      console.warn(
        `[Database] Vercel serverless notice: External MongoDB not reachable (${err.message}). Entering Cloud Resilient Mode.`
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
