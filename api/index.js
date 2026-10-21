const appModule = require('../backend/dist/app');
const app = appModule.default || appModule;
const { connectDatabase } = require('../backend/dist/config/database');

let isDbInitialized = false;

module.exports = async (req, res) => {
  // Initialize database once per serverless execution container
  if (!isDbInitialized) {
    try {
      await connectDatabase();
      isDbInitialized = true;
    } catch (err) {
      console.warn('[Vercel Serverless] DB connection note:', err?.message || err);
    }
  }

  // Forward request to Express application
  return app(req, res);
};
