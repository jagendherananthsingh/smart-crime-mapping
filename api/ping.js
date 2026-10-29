module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  
  let appStatus;
  try {
    const a = require('./app');
    appStatus = { success: true, type: typeof (a.default || a) };
  } catch (e) {
    appStatus = { success: false, error: e.message, stack: e.stack };
  }

  let rootModules;
  try {
    rootModules = require('fs').readdirSync(process.cwd());
  } catch (e) {
    rootModules = e.message;
  }

  let apiFiles;
  try {
    apiFiles = require('fs').readdirSync(__dirname);
  } catch (e) {
    apiFiles = e.message;
  }

  res.end(JSON.stringify({
    ok: true,
    uptime: process.uptime(),
    node: process.version,
    cwd: process.cwd(),
    dirname: __dirname,
    apiFiles,
    rootModules,
    appStatus,
  }, null, 2));
};
