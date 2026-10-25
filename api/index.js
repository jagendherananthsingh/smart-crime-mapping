const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from both root .env and backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });
dotenv.config();

const appModule = require('../backend/dist/app');
const app = appModule.default || appModule;
const { connectDatabase } = require('../backend/dist/config/database');

let isDbInitialized = false;

module.exports = async (req, res) => {
  // Initialize database once per serverless execution container
  if (!isDbInitialized) {
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
