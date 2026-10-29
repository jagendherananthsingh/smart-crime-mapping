const path = require('path');
const dotenv = require('dotenv');

// Load environment configurations
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });
dotenv.config();

let app;
let initError = null;

try {
  // First try the bundled self-contained application
  const appModule = require('./app');
  app = appModule.default || appModule;
} catch (e1) {
  try {
    const appModule = require('./backend/dist/app');
    app = appModule.default || appModule;
  } catch (e2) {
    try {
      const appModule = require('../backend/dist/app');
      app = appModule.default || appModule;
    } catch (e3) {
      initError = { e1: e1.message, e2: e2.message, e3: e3.message, stack: e3.stack };
      console.error('[Vercel Serverless] Failed to load Express app:', initError);
    }
  }
}

module.exports = (req, res) => {
  if (initError || !app) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: false,
      error: 'SERVERLESS_INIT_ERROR',
      message: 'Failed to initialize backend application',
      details: initError,
    }));
    return;
  }

  // Restore client-requested path from Vercel proxy headers
  const forwardedUri = req.headers['x-forwarded-uri'] || req.headers['x-real-url'] || req.headers['x-matched-path'];
  if (forwardedUri && forwardedUri.startsWith('/api')) {
    req.url = forwardedUri;
  }

  return app(req, res);
};
