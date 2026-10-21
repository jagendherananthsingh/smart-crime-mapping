import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { env } from './env';

let mongoMemoryServer: MongoMemoryServer | null = null;

export const connectDatabase = async (): Promise<string> => {
  try {
    // Attempt connecting to the configured MONGODB_URI with a 3-second timeout
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] Connected to external MongoDB: ${env.MONGODB_URI}`);
    return env.MONGODB_URI;
  } catch (err: any) {
    console.warn(`[Database] External MongoDB not reachable (${err.message}). Initializing embedded in-memory MongoDB...`);
    
    try {
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
