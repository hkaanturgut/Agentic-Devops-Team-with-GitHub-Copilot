/**
 * Request logging middleware
 * Logs method, URL, and timestamp for each incoming request
 */
const logger = async (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
};

module.exports = logger;
