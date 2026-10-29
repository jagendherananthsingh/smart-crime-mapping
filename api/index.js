const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });
dotenv.config();

let app;
try {
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
      console.error('[Vercel Serverless] Failed to load application:', e1, e2, e3);
      // Fallback minimal express app if loading failed
      const express = require('express');
      app = express();
      app.all('*', (req, res) => {
        res.status(500).json({
          success: false,
          error: 'INITIALIZATION_FAILED',
          message: 'Backend serverless module failed to initialize',
          details: { e1: e1?.message, e2: e2?.message, e3: e3?.message }
        });
      });
    }
  }
}

// Export Express app directly for Vercel's native Express bridge
module.exports = app;
