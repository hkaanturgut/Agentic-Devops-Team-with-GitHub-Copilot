const { Router } = require('express');
const crypto = require('crypto');

const router = Router();

const tasks = [];

const VALID_STATUSES = ['pending', 'in-progress', 'completed'];

// GET /tasks — List all tasks
router.get('/', async (req, res) => {
  res.json(tasks);
});

// GET /tasks/:id — Get a single task
router.get('/:id', async (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

// POST /tasks — Create a new task
router.post('/', async (req, res) => {
  const { title, description, status } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  const now = new Date().toISOString();
  const task = {
    id: crypto.randomUUID(),
    title,
    description: description || '',
    status: status || 'pending',
    createdAt: now,
    updatedAt: now,
  };

  tasks.push(task);
  res.status(201).json(task);
});

// PUT /tasks/:id — Update a task
router.put('/:id', async (req, res) => {
  const index = tasks.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const { title, description, status } = req.body;

  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  const existing = tasks[index];
  tasks[index] = {
    ...existing,
    title: title !== undefined ? title : existing.title,
    description: description !== undefined ? description : existing.description,
    status: status !== undefined ? status : existing.status,
    updatedAt: new Date().toISOString(),
  };

  res.json(tasks[index]);
});

// DELETE /tasks/:id — Delete a task
router.delete('/:id', async (req, res) => {
  const index = tasks.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const [deleted] = tasks.splice(index, 1);
  res.json(deleted);
});

module.exports = router;
