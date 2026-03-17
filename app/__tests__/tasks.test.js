const request = require('supertest');
const app = require('../src/app');
const { resetTasks } = require('../src/routes/tasks');

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
      id: 1,
      title: 'Test task',
      description: 'A test',
      status: 'pending',
    });
  });

  it('should create a task with specified status', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Task', status: 'in-progress' });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('in-progress');
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
  it('should return empty array initially', async () => {
    const res = await request(app).get('/tasks');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('should return all tasks', async () => {
    await request(app).post('/tasks').send({ title: 'Task 1' });
    await request(app).post('/tasks').send({ title: 'Task 2' });
    const res = await request(app).get('/tasks');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe('GET /tasks/:id', () => {
  it('should return a task by id', async () => {
    await request(app).post('/tasks').send({ title: 'Task 1' });
    const res = await request(app).get('/tasks/1');
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Task 1');
  });

  it('should return 404 for non-existent task', async () => {
    const res = await request(app).get('/tasks/999');
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });
});

describe('PUT /tasks/:id', () => {
  it('should update a task', async () => {
    await request(app).post('/tasks').send({ title: 'Task 1' });
    const res = await request(app)
      .put('/tasks/1')
      .send({ title: 'Updated', status: 'completed' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated');
    expect(res.body.status).toBe('completed');
  });

  it('should partially update a task', async () => {
    await request(app).post('/tasks').send({ title: 'Task 1', description: 'Desc' });
    const res = await request(app)
      .put('/tasks/1')
      .send({ status: 'in-progress' });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Task 1');
    expect(res.body.status).toBe('in-progress');
  });

  it('should return 404 for non-existent task', async () => {
    const res = await request(app)
      .put('/tasks/999')
      .send({ title: 'Nope' });
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });

  it('should return 400 for invalid status on update', async () => {
    await request(app).post('/tasks').send({ title: 'Task 1' });
    const res = await request(app)
      .put('/tasks/1')
      .send({ status: 'invalid' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 for empty title on update', async () => {
    await request(app).post('/tasks').send({ title: 'Task 1' });
    const res = await request(app)
      .put('/tasks/1')
      .send({ title: '' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });
});

describe('DELETE /tasks/:id', () => {
  it('should delete a task', async () => {
    await request(app).post('/tasks').send({ title: 'Task 1' });
    const res = await request(app).delete('/tasks/1');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);

    const listRes = await request(app).get('/tasks');
    expect(listRes.body).toHaveLength(0);
  });

  it('should return 404 for non-existent task', async () => {
    const res = await request(app).delete('/tasks/999');
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });
});
