const assert = require('node:assert/strict');
const { test } = require('node:test');
const mongoose = require('mongoose');
const { connectDatabase } = require('../src/config/database');

test('missing URI fails before attempting a database connection', async (t) => {
  const original = process.env.MONGODB_URI;
  t.after(() => {
    if (original === undefined) delete process.env.MONGODB_URI;
    else process.env.MONGODB_URI = original;
  });
  process.env.MONGODB_URI = '';
  const connect = t.mock.method(mongoose, 'connect', async () => {});
  await assert.rejects(connectDatabase(), /MONGODB_URI is required/);
  assert.equal(connect.mock.callCount(), 0);
});

test('connection failures discard credential-bearing driver messages', async (t) => {
  const original = process.env.MONGODB_URI;
  t.after(() => {
    if (original === undefined) delete process.env.MONGODB_URI;
    else process.env.MONGODB_URI = original;
  });
  process.env.MONGODB_URI = 'mongodb://example.invalid/test';
  t.mock.method(mongoose, 'connect', async () => {
    const error = new Error('mongodb://user:private-password@example.invalid/test');
    error.cause = { code: 'ECONNREFUSED' };
    throw error;
  });
  await assert.rejects(connectDatabase(), (error) => {
    assert.match(error.message, /ECONNREFUSED/);
    assert.doesNotMatch(error.stack, /private-password|mongodb:\/\//);
    return true;
  });
});
