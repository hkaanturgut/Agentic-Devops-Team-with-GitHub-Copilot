const express = require('express');
const router = express.Router();

/**
 * GET /health
 * Returns the health status of the API.
 */
router.get('/', async (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
