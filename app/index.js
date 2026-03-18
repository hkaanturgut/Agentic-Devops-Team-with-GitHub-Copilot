const express = require('express');
const taskRoutes = require('./routes/tasks');

const app = express();

app.use(express.json());

app.get('/health', async (req, res) => {
  res.json({ status: 'healthy' });
});

app.use('/tasks', taskRoutes);

module.exports = app;
