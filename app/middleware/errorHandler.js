/**
 * Global error handling middleware
 * Catches unhandled errors and returns a structured response
 */
const errorHandler = (err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  res.status(500).json({
    error: 'Internal Server Error',
    code: 'INTERNAL_ERROR'
  });
};

module.exports = errorHandler;
