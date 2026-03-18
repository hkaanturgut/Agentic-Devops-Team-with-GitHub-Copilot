/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
};

module.exports = errorHandler;
