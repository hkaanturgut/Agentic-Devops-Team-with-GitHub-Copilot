const request = require('supertest');
const app = require('../index');
const { resetTasks } = require('../routes/tasks');

beforeEach(() => {
  resetTasks();
});

describe('GET /health', () => {
  it('should return status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('timestamp');
  });
});

describe('POST /tasks', () => {
  it('should create a task with default status', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Test task', description: 'A test' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title: 'Test task',
      description: 'A test',
      status: 'todo',
    });
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('createdAt');
    expect(res.body).toHaveProperty('updatedAt');
  });

  it('should create a task with specified status', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Task', status: 'in-progress' });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('in-progress');
  });

  it('should default description to null', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Task' });
    expect(res.status).toBe(201);
    expect(res.body.description).toBeNull();
  });

  it('should return 400 when title is missing', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ description: 'No title' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 when title is empty string', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: '  ' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 for invalid status', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Task', status: 'invalid' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });
});

describe('GET /tasks', () => {
  it('should return empty tasks array initially', async () => {
    const res = await request(app).get('/tasks');
    expect(res.status).toBe(200);
    expect(res.body.tasks).toEqual([]);
  });

  it('should return all tasks', async () => {
    await request(app).post('/tasks').send({ title: 'Task 1' });
    await request(app).post('/tasks').send({ title: 'Task 2' });
    const res = await request(app).get('/tasks');
    expect(res.status).toBe(200);
    expect(res.body.tasks).toHaveLength(2);
  });
});

describe('GET /tasks/:id', () => {
  it('should return a task by id', async () => {
    const createRes = await request(app).post('/tasks').send({ title: 'Task 1' });
    const { id } = createRes.body;
    const res = await request(app).get(`/tasks/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Task 1');
    expect(res.body.id).toBe(id);
  });

  it('should return 404 for non-existent task', async () => {
    const res = await request(app).get('/tasks/non-existent-id');
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });
});

describe('PUT /tasks/:id', () => {
  it('should update a task', async () => {
    const createRes = await request(app).post('/tasks').send({ title: 'Task 1' });
    const { id } = createRes.body;
    const res = await request(app)
      .put(`/tasks/${id}`)
      .send({ title: 'Updated', status: 'done' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated');
    expect(res.body.status).toBe('done');
  });

  it('should partially update a task', async () => {
    const createRes = await request(app)
      .post('/tasks')
      .send({ title: 'Task 1', description: 'Desc' });
    const { id } = createRes.body;
    const res = await request(app)
      .put(`/tasks/${id}`)
      .send({ status: 'in-progress' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Task 1');
    expect(res.body.status).toBe('in-progress');
  });

  it('should update the updatedAt timestamp', async () => {
    const createRes = await request(app).post('/tasks').send({ title: 'Task 1' });
    const { id, updatedAt: originalUpdatedAt } = createRes.body;
    const res = await request(app)
      .put(`/tasks/${id}`)
      .send({ title: 'Updated' });
    expect(res.status).toBe(200);
    expect(new Date(res.body.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(originalUpdatedAt).getTime()
    );
  });

  it('should return 404 for non-existent task', async () => {
    const res = await request(app)
      .put('/tasks/non-existent-id')
      .send({ title: 'Nope' });
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });

  it('should return 400 for invalid status on update', async () => {
    const createRes = await request(app).post('/tasks').send({ title: 'Task 1' });
    const { id } = createRes.body;
    const res = await request(app)
      .put(`/tasks/${id}`)
      .send({ status: 'invalid' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 for empty title on update', async () => {
    const createRes = await request(app).post('/tasks').send({ title: 'Task 1' });
    const { id } = createRes.body;
    const res = await request(app)
      .put(`/tasks/${id}`)
      .send({ title: '' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });
});

describe('DELETE /tasks/:id', () => {
  it('should delete a task and return 204', async () => {
    const createRes = await request(app).post('/tasks').send({ title: 'Task 1' });
    const { id } = createRes.body;
    const res = await request(app).delete(`/tasks/${id}`);
    expect(res.status).toBe(204);

    const listRes = await request(app).get('/tasks');
    expect(listRes.body.tasks).toHaveLength(0);
  });

  it('should return 404 for non-existent task', async () => {
    const res = await request(app).delete('/tasks/non-existent-id');
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });
});
