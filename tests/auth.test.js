const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');

beforeEach(() => {
  User._clear();
});

describe('POST /api/auth/register', () => {
  it('registers a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', password: 'secret123' });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('User registered successfully');
  });

  it('rejects a username shorter than 3 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'ab', password: 'secret123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Username/);
  });

  it('rejects a password shorter than 6 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Password/);
  });

  it('rejects duplicate usernames', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', password: 'secret123' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', password: 'secret456' });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/taken/);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', password: 'secret123' });
  });

  it('returns a JWT token on successful login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'alice', password: 'secret123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'alice', password: 'wrongpass' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('rejects unknown username', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'nobody', password: 'secret123' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('rejects missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'alice' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/auth/me', () => {
  let token;

  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'alice', password: 'secret123' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'alice', password: 'secret123' });

    token = res.body.token;
  });

  it('returns the current user when authenticated', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.username).toBe('alice');
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
  });

  it('returns 401 with an invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalidtoken');

    expect(res.status).toBe(401);
  });
});
