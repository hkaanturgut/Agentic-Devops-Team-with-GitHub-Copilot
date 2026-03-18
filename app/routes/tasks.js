const express = require('express');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const VALID_STATUSES = ['todo', 'in-progress', 'done'];

let tasks = [];

/**
 * Reset tasks store — used by tests
 */
function resetTasks() {
  tasks = [];
}

/**
 * Validate create task request body
 * @param {object} body - Request body
 * @returns {string|null} Error message or null if valid
 */
function validateCreateBody(body) {
  const { title, status } = body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return 'Title is required';
  }

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`;
  }

  return null;
}

/**
 * Validate update task request body
 * @param {object} body - Request body
 * @returns {string|null} Error message or null if valid
 */
function validateUpdateBody(body) {
  const { title, status } = body;

  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    return 'Title must be a non-empty string';
  }

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`;
  }

  return null;
}

/**
 * POST /tasks — Create a new task
 */
router.post('/', async (req, res) => {
  const error = validateCreateBody(req.body);
  if (error) {
    return res.status(400).json({ error, code: 'VALIDATION_ERROR' });
  }

  const { title, description = null, status = 'todo' } = req.body;
  const now = new Date().toISOString();
  const task = {
    id: uuidv4(),
    title,
    description,
    status,
    createdAt: now,
    updatedAt: now,
  };
  tasks.push(task);
  res.status(201).json(task);
});

/**
 * GET /tasks — List all tasks
 */
router.get('/', async (req, res) => {
  res.json({ tasks });
});

/**
 * GET /tasks/:id — Get a single task by ID
 */
router.get('/:id', async (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found', code: 'NOT_FOUND' });
  }
  res.json(task);
});

/**
 * PUT /tasks/:id — Update a task
 */
router.put('/:id', async (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found', code: 'NOT_FOUND' });
  }

  const error = validateUpdateBody(req.body);
  if (error) {
    return res.status(400).json({ error, code: 'VALIDATION_ERROR' });
  }

  const { title, description, status } = req.body;
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  task.updatedAt = new Date().toISOString();
  res.json(task);
});

/**
 * DELETE /tasks/:id — Delete a task
 */
router.delete('/:id', async (req, res) => {
  const index = tasks.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found', code: 'NOT_FOUND' });
  }
  tasks.splice(index, 1);
  res.status(204).send();
});

module.exports = router;
module.exports.resetTasks = resetTasks;
