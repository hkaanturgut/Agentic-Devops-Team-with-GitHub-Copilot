const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const tasks = new Map();

const VALID_STATUSES = ['todo', 'in-progress', 'done'];

/**
 * Validates task input for create/update operations.
 * @param {object} body - Request body
 * @param {boolean} isCreate - Whether this is a create operation
 * @returns {{ valid: boolean, error?: string }}
 */
function validateTaskInput(body, isCreate = false) {
  if (isCreate && (!body.title || typeof body.title !== 'string' || body.title.trim() === '')) {
    return { valid: false, error: 'Title is required and must be a non-empty string' };
  }

  if (body.title !== undefined && (typeof body.title !== 'string' || body.title.trim() === '')) {
    return { valid: false, error: 'Title must be a non-empty string' };
  }

  if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
    return { valid: false, error: `Status must be one of: ${VALID_STATUSES.join(', ')}` };
  }

  return { valid: true };
}

/**
 * GET /tasks
 * Returns all tasks.
 */
router.get('/', async (req, res) => {
  const allTasks = Array.from(tasks.values());
  res.status(200).json({ tasks: allTasks });
});

/**
 * POST /tasks
 * Creates a new task.
 */
router.post('/', async (req, res) => {
  const validation = validateTaskInput(req.body, true);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error, code: 'VALIDATION_ERROR' });
  }

  const now = new Date().toISOString();
  const task = {
    id: uuidv4(),
    title: req.body.title.trim(),
    description: req.body.description || null,
    status: req.body.status || 'todo',
    createdAt: now,
    updatedAt: now
  };

  tasks.set(task.id, task);
  res.status(201).json(task);
});

/**
 * GET /tasks/:id
 * Returns a single task by ID.
 */
router.get('/:id', async (req, res) => {
  const task = tasks.get(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found', code: 'NOT_FOUND' });
  }
  res.status(200).json(task);
});

/**
 * PUT /tasks/:id
 * Updates an existing task.
 */
router.put('/:id', async (req, res) => {
  const task = tasks.get(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found', code: 'NOT_FOUND' });
  }

  const validation = validateTaskInput(req.body);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error, code: 'VALIDATION_ERROR' });
  }

  if (req.body.title !== undefined) task.title = req.body.title.trim();
  if (req.body.description !== undefined) task.description = req.body.description;
  if (req.body.status !== undefined) task.status = req.body.status;
  task.updatedAt = new Date().toISOString();

  tasks.set(task.id, task);
  res.status(200).json(task);
});

/**
 * DELETE /tasks/:id
 * Deletes a task by ID.
 */
router.delete('/:id', async (req, res) => {
  const task = tasks.get(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found', code: 'NOT_FOUND' });
  }
  tasks.delete(req.params.id);
  res.status(204).send();
});

module.exports = router;
