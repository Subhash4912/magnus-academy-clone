const assert = require('node:assert/strict');
const { test } = require('node:test');
const { once } = require('node:events');
const express = require('express');
const app = require('../src/app');
const { clientOrigin } = require('../src/config/env');
const errorHandler = require('../src/middleware/errorHandler');
const databaseConnection = require('../src/config/database');

async function serve(t, application) {
  const server = application.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));
  return `http://127.0.0.1:${server.address().port}`;
}

test('health reports a disconnected database and provides frontend CORS headers', async (t) => {
  const base = await serve(t, app);
  const response = await fetch(`${base}/api/health`, { headers: { Origin: clientOrigin } });
  assert.equal(response.status, 503);
  assert.equal(response.headers.get('access-control-allow-origin'), clientOrigin);
  assert.deepEqual(await response.json(), {
    success: false, message: 'Database is unavailable', data: { status: 'degraded', database: 'disconnected' },
  });
  const preflight = await fetch(`${base}/api/health`, {
    method: 'OPTIONS',
    headers: { Origin: clientOrigin, 'Access-Control-Request-Method': 'GET' },
  });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('access-control-allow-origin'), clientOrigin);
});

test('unknown paths and unsupported methods return JSON 404 responses', async (t) => {
  const base = await serve(t, app);
  for (const [route, method] of [['/api/missing', 'GET'], ['/missing', 'GET'], ['/api/health', 'POST']]) {
    const response = await fetch(`${base}${route}`, { method });
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { success: false, message: 'Route not found' });
  }
});

test('health reports connected status when Mongoose is ready (mocked)', async (t) => {
  t.mock.method(databaseConnection, 'getDatabaseStatus', () => 'connected');
  const base = await serve(t, app);
  const response = await fetch(`${base}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    success: true, message: 'Backend API is running', data: { status: 'ok', database: 'connected' },
  });
});

test('malformed and oversized JSON receive clean client error responses', async (t) => {
  t.mock.method(console, 'error', () => {});
  const base = await serve(t, app);
  for (const [body, status, message] of [
    ['{invalid', 400, 'Invalid JSON body'],
    [JSON.stringify({ value: 'x'.repeat(110000) }), 413, 'Request body is too large'],
  ]) {
    const response = await fetch(`${base}/api/health`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body,
    });
    assert.equal(response.status, status);
    assert.deepEqual(await response.json(), { success: false, message });
  }
});

test('unexpected server errors never expose internal details in responses', async (t) => {
  t.mock.method(console, 'error', () => {});
  // Test-only route; the actual app has no failure/debug endpoint.
  const fixture = express();
  fixture.get('/failure', () => { throw new Error('private internal detail'); });
  fixture.use(errorHandler);
  const base = await serve(t, fixture);
  const response = await fetch(`${base}/failure`);
  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), { success: false, message: 'Internal server error' });
});
