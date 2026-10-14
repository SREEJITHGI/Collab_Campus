import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';
import db from '../src/config/db.js';
import { runMigrations } from '../src/config/migrate.js';

describe('CollabCampus Backend API Health Test', () => {
  before(async () => {
    await runMigrations();
  });
  after(async () => {
    if (db && db.end) {
      await db.end();
    }
  });

  it('should return 200 OK and database operational status', async () => {
    const res = await request(app).get('/api/health');
    
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.service, 'CollabCampus API');
    assert.strictEqual(res.body.status, 'operational');
    assert.strictEqual(res.body.database.connected, true);
  });

  it('should return 404 for nonexistent routes', async () => {
    const res = await request(app).get('/api/non-existent-route-404');
    
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.success, false);
  });
});
