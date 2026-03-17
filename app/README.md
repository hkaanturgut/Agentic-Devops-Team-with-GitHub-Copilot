# Task Management REST API

A RESTful API for managing tasks, built with Express.js.

## Prerequisites

- Node.js (LTS recommended)
- npm

## Installation

```bash
cd app
npm install
```

## Running the Server

```bash
npm start
```

The server starts on `http://localhost:3000` by default. Set the `PORT` environment variable to change it.

## API Endpoints

| Method | Path          | Description        |
|--------|---------------|--------------------|
| GET    | /health       | Health check       |
| POST   | /tasks        | Create a task      |
| GET    | /tasks        | List all tasks     |
| GET    | /tasks/:id    | Get task by ID     |
| PUT    | /tasks/:id    | Update a task      |
| DELETE | /tasks/:id    | Delete a task      |

### Create a Task

```bash
curl -X POST http://localhost:3000/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title": "My task", "description": "Details", "status": "pending"}'
```

**Fields:**
- `title` (string, required)
- `description` (string, optional, defaults to `""`)
- `status` (string, optional, one of: `pending`, `in-progress`, `completed` — defaults to `pending`)

## Running Tests

```bash
npm test
```

Tests use Jest and supertest for integration testing of all endpoints.
