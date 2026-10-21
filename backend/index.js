const appModule = require('./dist/app');
const app = appModule.default || appModule;
const { connectDatabase } = require('./dist/config/database');

let isDbInitialized = false;

const handler = async (req, res) => {
  if (!isDbInitialized) {
    try {
      await connectDatabase();
      isDbInitialized = true;
    } catch (err) {
      console.warn('[Vercel Backend Service] DB note:', err?.message || err);
    }
  }
  return app(req, res);
};

// Inherit app prototype so both handler(req,res) and app methods work seamlessly
Object.setPrototypeOf(handler, app);

module.exports = handler;
module.exports.default = handler;
