/**
 * Global error handling middleware
 * Catches unhandled errors and returns a structured JSON response
 */
const errorHandler = (err, req, res, _next) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
};

module.exports = errorHandler;
