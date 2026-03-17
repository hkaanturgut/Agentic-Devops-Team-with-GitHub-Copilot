const VALID_STATUSES = ['pending', 'in-progress', 'completed'];

/**
 * Validates the request body for creating a task.
 * - title is required
 * - status (if provided) must be one of: pending, in-progress, completed
 */
function validateCreateTask(req, res, next) {
  const { title, status } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required', code: 'VALIDATION_ERROR' });
  }

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
      code: 'VALIDATION_ERROR',
    });
  }

  next();
}

/**
 * Validates the request body for updating a task.
 * - title (if provided) must be a non-empty string
 * - status (if provided) must be one of: pending, in-progress, completed
 */
function validateUpdateTask(req, res, next) {
  const { title, status } = req.body;

  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    return res.status(400).json({ error: 'Title must be a non-empty string', code: 'VALIDATION_ERROR' });
  }

  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
      code: 'VALIDATION_ERROR',
    });
  }

  next();
}

module.exports = { validateCreateTask, validateUpdateTask };
