const express = require('express');
const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', async (req, res) => {
  res.json({ status: 'healthy' });
});

app.use('/tasks', taskRoutes);

app.listen(PORT, () => {
  console.log(`Task Management API running on port ${PORT}`);
});

module.exports = app;
