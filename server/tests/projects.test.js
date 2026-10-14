import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';
import db from '../src/config/db.js';
import { runMigrations } from '../src/config/migrate.js';

describe('Project Collaboration & Tasks Suite (Module B)', () => {
  let leaderToken = '';
  let memberToken = '';
  let outsiderToken = '';
  let memberUserId = null;
  let createdProjectId = null;
  let createdTaskId = null;

  before(async () => {
    await runMigrations();

    // 1. Create Leader User
    const resLeader = await request(app).post('/api/auth/register').send({
      email: `leader_${Date.now()}@campus.edu`,
      password: 'Password123!',
      fullName: 'Vikram Leader',
      role: 'student',
      department: 'Computer Science',
      semester: 6,
    });
    leaderToken = resLeader.body.data.token;

    // 2. Create Member User
    const resMember = await request(app).post('/api/auth/register').send({
      email: `member_${Date.now()}@campus.edu`,
      password: 'Password123!',
      fullName: 'Priya Member',
      role: 'student',
      department: 'Information Technology',
      semester: 4,
    });
    memberToken = resMember.body.data.token;
    memberUserId = resMember.body.data.user.id;

    // 3. Create Outsider User
    const resOutsider = await request(app).post('/api/auth/register').send({
      email: `outsider_${Date.now()}@campus.edu`,
      password: 'Password123!',
      fullName: 'Rohan Outsider',
      role: 'student',
      department: 'Mechanical',
      semester: 2,
    });
    outsiderToken = resOutsider.body.data.token;
  });

  after(async () => {
    if (db && db.end) {
      await db.end();
    }
  });

  it('POST /api/projects - should create a new project and set owner as leader', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${leaderToken}`)
      .send({
        title: 'Smart Campus IoT Navigation',
        description: 'Building indoor beacon routing and lab occupancy heatmaps for the university campus.',
        category: 'Internet of Things',
        technologies: ['React', 'Node.js', 'PostgreSQL', 'MQTT'],
        status: 'in_progress',
        maxMembers: 4,
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.title, 'Smart Campus IoT Navigation');
    assert.strictEqual(res.body.data.members.length, 1);
    assert.strictEqual(res.body.data.members[0].project_role, 'leader');

    createdProjectId = res.body.data.id;
  });

  it('GET /api/projects - should retrieve projects list with search & category filters', async () => {
    const res = await request(app)
      .get('/api/projects?search=IoT')
      .set('Authorization', `Bearer ${leaderToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.length >= 1);
    assert.strictEqual(res.body.data[0].id, createdProjectId);
  });

  it('POST /api/projects/:id/members - should add a member to the project squad', async () => {
    const res = await request(app)
      .post(`/api/projects/${createdProjectId}/members`)
      .set('Authorization', `Bearer ${leaderToken}`)
      .send({
        userId: memberUserId,
        role: 'member',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.members.length, 2);
  });

  it('POST /api/projects/:id/tasks - should allow project member to create a task', async () => {
    const res = await request(app)
      .post(`/api/projects/${createdProjectId}/tasks`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        title: 'Wire BLE Sensors to Gateway',
        description: 'Mount BLE beacon hardware on 2nd floor library corridors.',
        status: 'todo',
        priority: 'high',
        assignedTo: memberUserId,
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.title, 'Wire BLE Sensors to Gateway');
    assert.strictEqual(res.body.data.status, 'todo');

    createdTaskId = res.body.data.id;
  });

  it('PUT /api/tasks/:id - should update task status across Kanban columns', async () => {
    const res = await request(app)
      .put(`/api/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        status: 'in_progress',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.status, 'in_progress');
  });

  it('PUT /api/projects/:id - should reject update from non-member outsider (403 Forbidden)', async () => {
    const res = await request(app)
      .put(`/api/projects/${createdProjectId}`)
      .set('Authorization', `Bearer ${outsiderToken}`)
      .send({
        title: 'Unauthorized Rename Attempt',
      });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
  });

  it('GET /api/projects/:id - should return project details with calculated progress metrics', async () => {
    // Complete the task first
    await request(app)
      .put(`/api/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ status: 'completed' });

    const res = await request(app)
      .get(`/api/projects/${createdProjectId}`)
      .set('Authorization', `Bearer ${leaderToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.task_stats.total, 1);
    assert.strictEqual(res.body.data.task_stats.completed, 1);
    assert.strictEqual(res.body.data.task_stats.progress_percent, 100);
  });

  it('DELETE /api/tasks/:id - should delete a task', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${leaderToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
  });
});
