/**
 * API Integration and Security Test Suite
 * Execute with: cd backend && npm test
 */

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const app = require('../src/app');
const http = require('http');
const { disconnectRedis } = require('../src/config/redis');

let server;
let baseUrl;

before(async () => {
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api/v1`;
      resolve();
    });
  });
});

after(async () => {
  if (server) {
    server.close();
  }
  await disconnectRedis();
});

describe('1. Health and Probes', () => {
  test('GET /live returns 200 and alive status', async () => {
    const res = await fetch(`${baseUrl.replace('/api/v1', '')}/live`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'alive');
  });

  test('GET /ready returns probe response', async () => {
    const res = await fetch(`${baseUrl.replace('/api/v1', '')}/ready`);
    assert.ok(res.status === 200 || res.status === 503);
  });
});

describe('2. Authentication Validation & Flow', () => {
  test('POST /auth/register rejects missing fields with 400', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'T' }), // Invalid name & missing email/pass
    });
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.error.code, 'VALIDATION_ERROR');
  });

  test('POST /auth/login rejects invalid format', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: '' }),
    });
    assert.strictEqual(res.status, 400);
  });
});

describe('3. Protected Route Security & RBAC', () => {
  test('GET /resumes rejects unauthenticated request with 401', async () => {
    const res = await fetch(`${baseUrl}/resumes`);
    assert.strictEqual(res.status, 401);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.error.code, 'AUTHENTICATION_ERROR');
  });

  test('POST /jobs (Admin route) rejects unauthenticated request with 401', async () => {
    const res = await fetch(`${baseUrl}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Lead Architect' }),
    });
    assert.strictEqual(res.status, 401);
  });
});

describe('4. Swagger Documentation', () => {
  test('GET /api/docs returns 200 with OpenAPI specification', async () => {
    const res = await fetch(`${baseUrl.replace('/api/v1', '')}/api/docs/`);
    assert.strictEqual(res.status, 200);
  });
});
