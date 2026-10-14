import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';
import db from '../src/config/db.js';
import { runMigrations } from '../src/config/migrate.js';

describe('Authentication & Authorization Suite (Module A)', () => {
  before(async () => {
    await runMigrations();
  });

  after(async () => {
    if (db && db.end) {
      await db.end();
    }
  });

  const uniqueStudentEmail = `student_${Date.now()}@campus.edu`;
  let studentToken = '';

  it('POST /api/auth/register - should successfully register a new student with profile', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: uniqueStudentEmail,
        password: 'Password123!',
        fullName: 'Aarav Sharma',
        role: 'student',
        department: 'Computer Science',
        semester: 6,
        rollNumber: `CS2026_${Date.now().toString().slice(-4)}`,
        skills: ['React', 'Node.js', 'PostgreSQL'],
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.user.email, uniqueStudentEmail);
    assert.strictEqual(res.body.data.user.role, 'student');
    assert.ok(res.body.data.token, 'Token should be returned upon registration');
  });

  it('POST /api/auth/register - should reject duplicate email with 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: uniqueStudentEmail,
        password: 'AnotherPassword123!',
        fullName: 'Duplicate User',
        role: 'student',
      });

    assert.strictEqual(res.status, 409);
    assert.strictEqual(res.body.success, false);
  });

  it('POST /api/auth/register - should reject invalid data with 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'not-an-email',
        password: '123', // too short
        fullName: 'X',
        role: 'invalid_role',
      });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(Array.isArray(res.body.errors), 'Should return validation errors list');
  });

  it('POST /api/auth/login - should fail with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: uniqueStudentEmail,
        password: 'WrongPassword!',
      });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  it('POST /api/auth/login - should succeed with valid credentials and return JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: uniqueStudentEmail,
        password: 'Password123!',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.strictEqual(res.body.data.user.email, uniqueStudentEmail);
    assert.strictEqual(res.body.data.user.password_hash, undefined, 'password_hash must never be leaked');

    studentToken = res.body.data.token;
  });

  it('GET /api/auth/me - should reject unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/auth/me');
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  it('GET /api/auth/me - should return authenticated user profile with valid Bearer token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${studentToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.user.email, uniqueStudentEmail);
    assert.strictEqual(res.body.user.student_department, 'Computer Science');
  });

  it('GET /api/users - should search and retrieve users directory', async () => {
    const res = await request(app)
      .get('/api/users?role=student')
      .set('Authorization', `Bearer ${studentToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.length >= 1);
  });
});
