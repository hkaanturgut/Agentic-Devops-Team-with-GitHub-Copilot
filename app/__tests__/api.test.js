const request = require('supertest');
const app = require('../index');

describe('GET /health', () => {
  it('should return 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });
});

describe('Task CRUD', () => {
  let taskId;

  it('POST /tasks — should create a task', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Test task', description: 'A test', status: 'todo' });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.title).toBe('Test task');
    taskId = res.body.id;
  });

  it('GET /tasks — should list tasks', async () => {
    const res = await request(app).get('/tasks');
    expect(res.status).toBe(200);
    expect(res.body.tasks).toBeInstanceOf(Array);
    expect(res.body.tasks.length).toBeGreaterThan(0);
  });

  it('GET /tasks/:id — should return a task', async () => {
    const res = await request(app).get(`/tasks/${taskId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(taskId);
  });

  it('PUT /tasks/:id — should update a task', async () => {
    const res = await request(app)
      .put(`/tasks/${taskId}`)
      .send({ title: 'Updated task', status: 'done' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated task');
    expect(res.body.status).toBe('done');
  });

  it('DELETE /tasks/:id — should delete a task', async () => {
    const res = await request(app).delete(`/tasks/${taskId}`);
    expect(res.status).toBe(204);
  });

  it('GET /tasks/:id — should return 404 after delete', async () => {
    const res = await request(app).get(`/tasks/${taskId}`);
    expect(res.status).toBe(404);
  });
});
