const express = require('express');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const tasks = [];

// POST /tasks — Create a new task
router.post('/', async (req, res) => {
  const { title, description, status } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required and must be a non-empty string' });
  }

  const allowedStatuses = ['pending', 'in-progress', 'completed'];
  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${allowedStatuses.join(', ')}` });
  }

  const now = new Date().toISOString();
  const task = {
    id: uuidv4(),
    title: title.trim(),
    description: description || '',
    status: status || 'pending',
    createdAt: now,
    updatedAt: now
  };

  tasks.push(task);
  res.status(201).json(task);
});

// GET /tasks — List all tasks
router.get('/', async (req, res) => {
  res.status(200).json(tasks);
});

// PUT /tasks/:id — Update an existing task
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const taskIndex = tasks.findIndex(t => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const { title, description, status } = req.body;

  const allowedStatuses = ['pending', 'in-progress', 'completed'];
  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${allowedStatuses.join(', ')}` });
  }

  const existing = tasks[taskIndex];
  const updated = {
    ...existing,
    title: (title && typeof title === 'string' && title.trim() !== '') ? title.trim() : existing.title,
    description: description !== undefined ? description : existing.description,
    status: status || existing.status,
    updatedAt: new Date().toISOString()
  };

  tasks[taskIndex] = updated;
  res.status(200).json(updated);
});

// DELETE /tasks/:id — Delete a task
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const taskIndex = tasks.findIndex(t => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const deleted = tasks.splice(taskIndex, 1)[0];
  res.status(200).json(deleted);
});

module.exports = router;
