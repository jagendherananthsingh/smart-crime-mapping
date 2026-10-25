const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from both root .env and backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
dotenv.config();

let appModule;
try {
  appModule = require('../backend/dist/app');
} catch (e) {
  try {
    appModule = require('./backend/dist/app');
  } catch (e2) {
    appModule = require(path.resolve(process.cwd(), 'backend/dist/app'));
  }
}

const app = appModule.default || appModule;

let connectDatabase;
try {
  connectDatabase = require('../backend/dist/config/database').connectDatabase;
} catch (e) {
  try {
    connectDatabase = require('./backend/dist/config/database').connectDatabase;
  } catch (e2) {
    connectDatabase = require(path.resolve(process.cwd(), 'backend/dist/config/database')).connectDatabase;
  }
}

let isDbInitialized = false;

module.exports = async (req, res) => {
  // Initialize database once per serverless execution container
  if (!isDbInitialized && connectDatabase) {
    try {
      await connectDatabase();
    } catch (err) {
      console.warn('[Vercel Serverless] DB connection note:', err?.message || err);
    } finally {
      isDbInitialized = true;
    }
  }

  // Forward request to Express application
  return app(req, res);
};
