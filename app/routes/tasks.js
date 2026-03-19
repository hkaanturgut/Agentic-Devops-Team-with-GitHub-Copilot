const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const tasks = [];

const VALID_STATUSES = ['todo', 'in-progress', 'done'];

/**
 * GET /tasks
 * Returns all tasks
 */
router.get('/', async (req, res) => {
  res.status(200).json({ tasks });
});

/**
 * POST /tasks
 * Creates a new task
 */
router.post('/', async (req, res) => {
  const { title, description, status } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({
      error: 'Title is required and must be a non-empty string',
      code: 'VALIDATION_ERROR'
    });
  }

  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
      code: 'VALIDATION_ERROR'
    });
  }

  const now = new Date().toISOString();
  const task = {
    id: uuidv4(),
    title: title.trim(),
    description: description || null,
    status: status || 'todo',
    createdAt: now,
    updatedAt: now
  };

  tasks.push(task);
  res.status(201).json(task);
});

/**
 * GET /tasks/:id
 * Returns a single task by ID
 */
router.get('/:id', async (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);

  if (!task) {
    return res.status(404).json({
      error: 'Task not found',
      code: 'NOT_FOUND'
    });
  }

  res.status(200).json(task);
});

/**
 * PUT /tasks/:id
 * Updates a task by ID
 */
router.put('/:id', async (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);

  if (!task) {
    return res.status(404).json({
      error: 'Task not found',
      code: 'NOT_FOUND'
    });
  }

  const { title, description, status } = req.body;

  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    return res.status(400).json({
      error: 'Title must be a non-empty string',
      code: 'VALIDATION_ERROR'
    });
  }

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
      code: 'VALIDATION_ERROR'
    });
  }

  if (title !== undefined) task.title = title.trim();
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  task.updatedAt = new Date().toISOString();

  res.status(200).json(task);
});

/**
 * DELETE /tasks/:id
 * Deletes a task by ID
 */
router.delete('/:id', async (req, res) => {
  const index = tasks.findIndex(t => t.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      error: 'Task not found',
      code: 'NOT_FOUND'
    });
  }

  tasks.splice(index, 1);
  res.status(204).send();
});

module.exports = router;
