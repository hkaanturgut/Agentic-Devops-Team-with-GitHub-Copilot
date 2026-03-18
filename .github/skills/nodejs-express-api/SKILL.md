---
name: nodejs-express-api
description: >
  Build a Node.js 20 + Express REST API for this project. Use this skill when asked to build the API,
  create the express app, write the node app, implement REST endpoints, scaffold the application, or
  create the task management API. Covers full folder structure under app/, entry point standards,
  package.json scripts, code standards, and the complete Task API spec with CRUD endpoints.
---

# Node.js Express REST API Skill

## Folder Structure

Create all application files under `app/`:

```
app/
├── index.js              # Express app entry point
├── routes/
│   ├── tasks.js          # Task resource CRUD handlers
│   └── health.js         # Health check endpoint
├── middleware/
│   ├── errorHandler.js   # Global error handling middleware
│   └── logger.js         # Request logging middleware
└── package.json          # Dependencies and scripts
```

## Entry Point Standards (`app/index.js`)

- Use `process.env.PORT || 3000` — Azure injects PORT env var at runtime
- Expose `GET /health` returning `{ "status": "ok", "timestamp": "<ISO>" }`
- Export `app` for testing: `module.exports = app`
- Log startup: `console.log(\`Server running on port \${PORT}\`)`
- Never hardcode secrets — always use `process.env` variables

## package.json Scripts

```json
{
  "name": "task-management-api",
  "version": "1.0.0",
  "scripts": {
    "start": "node index.js",
    "test": "jest --coverage",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^4.18.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "nodemon": "^3.0.0",
    "supertest": "^6.3.0"
  }
}
```

## Code Standards

- Use `async/await` only — no callbacks or `.then()` chains
- Add JSDoc comments on all route handlers and exported functions
- Validate all request inputs; return structured error responses:
  ```json
  { "error": "Descriptive message", "code": "ERROR_CODE" }
  ```
- HTTP status codes to use:
  - `200` OK
  - `201` Created
  - `204` No Content (DELETE)
  - `400` Bad Request (validation errors)
  - `404` Not Found
  - `500` Internal Server Error

## Task API Specification

### Task Schema

```json
{
  "id": "uuid-v4",
  "title": "string (required, non-empty)",
  "description": "string (optional, may be null)",
  "status": "todo | in-progress | done",
  "createdAt": "ISO 8601 timestamp",
  "updatedAt": "ISO 8601 timestamp"
}
```

### Endpoints

| Method | Path | Description | Request Body | Success Response |
|--------|------|-------------|--------------|-----------------|
| GET | /tasks | List all tasks | — | 200 `{ "tasks": [...] }` |
| POST | /tasks | Create a task | `{ title, description?, status? }` | 201 task object |
| GET | /tasks/:id | Get task by ID | — | 200 task object |
| PUT | /tasks/:id | Update a task | `{ title?, description?, status? }` | 200 task object |
| DELETE | /tasks/:id | Delete a task | — | 204 No Content |
| GET | /health | Health check | — | 200 `{ "status": "ok", "timestamp": "<ISO>" }` |

### Validation Rules

- `title` is required on POST — must be a non-empty string
- `status` must be one of: `todo`, `in-progress`, `done`; defaults to `todo` on create
- On validation failure: return `400` with `{ "error": "...", "code": "VALIDATION_ERROR" }`
- On unknown ID: return `404` with `{ "error": "Task not found", "code": "NOT_FOUND" }`

### Example: POST /tasks

Request:
```json
{ "title": "Implement login", "description": "OAuth2 via GitHub", "status": "todo" }
```

Response (201):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Implement login",
  "description": "OAuth2 via GitHub",
  "status": "todo",
  "createdAt": "2026-03-19T10:00:00.000Z",
  "updatedAt": "2026-03-19T10:00:00.000Z"
}
```

## Git Workflow

- Branch: `feature/app-task-api` from `dev`
- PR title: `feat: build Task Management REST API (Software Developer Agent)`
- PR body must include:
  - Summary of what was built
  - List of all endpoints implemented
  - Environment variables required (`PORT`)
  - How to run locally: `npm install && npm start`
  - Link to the originating GitHub Issue
