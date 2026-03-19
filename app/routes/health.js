const express = require('express');
const router = express.Router();

/**
 * GET /health
 * Returns service health status and current timestamp.
 */
router.get('/', async (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
