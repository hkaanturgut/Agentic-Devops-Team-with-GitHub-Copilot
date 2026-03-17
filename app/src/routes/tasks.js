const express = require('express');
const { validateCreateTask, validateUpdateTask } = require('../middleware/validate');

const router = express.Router();

let tasks = [];
let nextId = 1;

/**
 * Reset tasks store — used by tests
 */
function resetTasks() {
  tasks = [];
  nextId = 1;
}

/**
 * POST /tasks — Create a new task
 */
router.post('/', validateCreateTask, async (req, res) => {
  const { title, description = '', status = 'pending' } = req.body;
  const task = { id: nextId++, title, description, status };
  tasks.push(task);
  res.status(201).json(task);
});

/**
 * GET /tasks — List all tasks
 */
router.get('/', async (req, res) => {
  res.json(tasks);
});

/**
 * GET /tasks/:id — Get a single task by ID
 */
router.get('/:id', async (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id, 10));
  if (!task) {
    return res.status(404).json({ error: 'Task not found', code: 'NOT_FOUND' });
  }
  res.json(task);
});

/**
 * PUT /tasks/:id — Update a task
 */
router.put('/:id', validateUpdateTask, async (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id, 10));
  if (!task) {
    return res.status(404).json({ error: 'Task not found', code: 'NOT_FOUND' });
  }
  const { title, description, status } = req.body;
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  res.json(task);
});

/**
 * DELETE /tasks/:id — Delete a task
 */
router.delete('/:id', async (req, res) => {
  const index = tasks.findIndex(t => t.id === parseInt(req.params.id, 10));
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found', code: 'NOT_FOUND' });
  }
  const [deleted] = tasks.splice(index, 1);
  res.json(deleted);
});

module.exports = router;
module.exports.resetTasks = resetTasks;
