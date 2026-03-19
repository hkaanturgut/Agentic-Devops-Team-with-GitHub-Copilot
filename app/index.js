const express = require('express');
const healthRouter = require('./routes/health');
const tasksRouter = require('./routes/tasks');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON request bodies
app.use(express.json());

// Request logging
app.use(logger);

// Routes
app.use('/health', healthRouter);
app.use('/tasks', tasksRouter);

// Global error handler
app.use(errorHandler);

// Start server only when run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
