const express = require('express');
const tasksRouter = require('./routes/tasks');

const app = express();

app.use(express.json());

/** GET /health — Health check endpoint */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/tasks', tasksRouter);

/** Global error handler */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
});

module.exports = app;
