const express = require('express');
const healthRouter = require('./routes/health');
const tasksRouter = require('./routes/tasks');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());
app.use(logger);

app.use('/health', healthRouter);
app.use('/tasks', tasksRouter);

app.use(errorHandler);

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
