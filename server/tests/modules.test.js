import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';
import db from '../src/config/db.js';
import { runMigrations } from '../src/config/migrate.js';

describe('Campus Services, Notes & Internships Suite (Modules C, D, F)', () => {
  let studentToken = '';
  let facultyToken = '';
  let noteId = null;
  let internshipId = null;
  let ticketId = null;

  before(async () => {
    await runMigrations();

    const resStudent = await request(app).post('/api/auth/register').send({
      email: `notes_student_${Date.now()}@campus.edu`,
      password: 'Password123!',
      fullName: 'Notes Student',
      role: 'student',
      department: 'Computer Science',
      semester: 4,
    });
    studentToken = resStudent.body.data.token;

    const resFaculty = await request(app).post('/api/auth/register').send({
      email: `faculty_coord_${Date.now()}@campus.edu`,
      password: 'Password123!',
      fullName: 'Prof. Sharma',
      role: 'faculty',
      department: 'Computer Science',
      designation: 'Placement Coordinator',
    });
    facultyToken = resFaculty.body.data.token;
  });

  after(async () => {
    if (db && db.end) {
      await db.end();
    }
  });

  // Module C: Notes Hub Tests
  it('POST /api/notes - should allow authenticated user to upload notes metadata', async () => {
    const res = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Operating Systems - Process Scheduling Notes',
        subject: 'Operating Systems',
        department: 'Computer Science',
        semester: 4,
        fileUrl: '/uploads/os_scheduling.pdf',
        fileName: 'os_scheduling.pdf',
        fileSizeBytes: 2048576,
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.title, 'Operating Systems - Process Scheduling Notes');
    noteId = res.body.data.id;
  });

  it('GET /api/notes - should filter notes by department and semester', async () => {
    const res = await request(app)
      .get('/api/notes?department=Computer%20Science&semester=4');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.length >= 1);
  });

  it('GET /api/notes/:id/download - should record download count and return download URL', async () => {
    const res = await request(app).get(`/api/notes/${noteId}/download`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.downloadCount, 1);
  });

  // Module D: Internships Tests
  it('POST /api/internships - should allow faculty/coordinator to publish internship opportunity', async () => {
    const res = await request(app)
      .post('/api/internships')
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({
        companyName: 'Google Cloud Labs',
        roleTitle: 'Cloud Platform Engineering Intern',
        location: 'Bengaluru, India',
        workType: 'Hybrid',
        stipendSalary: '₹45,000 / month',
        eligibility: 'B.Tech CS / IT 2026 Batch, CGPA >= 7.5',
        requiredSkills: ['Node.js', 'Go', 'Kubernetes'],
        applicationLink: 'https://careers.google.com/jobs/intern-cloud',
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.company_name, 'Google Cloud Labs');
    internshipId = res.body.data.id;
  });

  it('POST /api/internships/:id/save - should toggle saving/bookmarking an opportunity', async () => {
    const res = await request(app)
      .post(`/api/internships/${internshipId}/save`)
      .set('Authorization', `Bearer ${studentToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.is_saved, true);
  });

  it('POST /api/internships/applications - should update student application tracking pipeline', async () => {
    const res = await request(app)
      .post('/api/internships/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        internshipId,
        status: 'Interview',
        notes: 'Round 1 technical interview scheduled for Thursday',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.status, 'Interview');
  });

  it('GET /api/internships/applications - should retrieve user application pipeline', async () => {
    const res = await request(app)
      .get('/api/internships/applications')
      .set('Authorization', `Bearer ${studentToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.length, 1);
    assert.strictEqual(res.body.data[0].status, 'Interview');
  });

  // Module F: Service Tickets Tests
  it('POST /api/tickets - should allow student to submit campus service request', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        category: 'Wi-Fi & Network',
        description: 'AP-52 access point in CS Lab 4 dropping packets frequently.',
        location: 'CS Department Block B, Lab 4',
        priority: 'High',
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.status, 'Open');
    assert.ok(res.body.data.ticket_code.startsWith('TICK-'));
    ticketId = res.body.data.id;
  });

  it('PUT /api/tickets/:id/status - should transition ticket status and log in status history', async () => {
    const res = await request(app)
      .put(`/api/tickets/${ticketId}/status`)
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({
        status: 'In Progress',
        note: 'IT network team dispatched to replace router module.',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.status, 'In Progress');
    assert.ok(res.body.data.history.length >= 2, 'Should contain status history logs');
  });

  it('POST /api/tickets/:id/comments - should post comment on service ticket', async () => {
    const res = await request(app)
      .post(`/api/tickets/${ticketId}/comments`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        comment: 'Thank you, engineer tested connection and confirmed throughput.',
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
  });
});
