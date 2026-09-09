const assert = require('node:assert/strict');
const { test } = require('node:test');
const { once } = require('node:events');
const { randomBytes } = require('node:crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const User = require('../src/models/User');
const { getAuthConfig } = require('../src/config/auth');

process.env.JWT_SECRET ||= randomBytes(48).toString('hex');

async function serve(t) {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve) => server.close(resolve)));
  return `http://127.0.0.1:${server.address().port}`;
}

test('protected employee and account methods reject missing tokens before database access', async (t) => {
  const base = await serve(t);
  for (const [method, path] of [
    ['GET', '/auth/me'],
    ['PUT', '/auth/profile'],
    ['PUT', '/auth/password'],
    ['GET', '/employees'],
    ['POST', '/employees'],
    ['GET', '/employees/123'],
    ['PUT', '/employees/123'],
    ['DELETE', '/employees/123'],
  ]) {
    const response = await fetch(`${base}/api${path}`, { method });
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), {
      success: false,
      message: 'Authentication required',
      data: null,
    });
  }
});

test('invalid, expired, wrong-algorithm, and malformed-subject tokens are rejected', async (t) => {
  const base = await serve(t);
  const config = getAuthConfig();
  const options = {
    issuer: config.issuer,
    audience: config.audience,
    subject: '507f1f77bcf86cd799439011',
  };
  const tokens = [
    'not-a-jwt',
    jwt.sign({}, config.secret, { ...options, expiresIn: -1 }),
    jwt.sign({}, config.secret, {
      ...options,
      algorithm: 'HS384',
      expiresIn: '1h',
    }),
    jwt.sign({}, config.secret, {
      ...options,
      subject: 'not-an-id',
      expiresIn: '1h',
    }),
  ];
  for (const token of tokens) {
    const response = await fetch(`${base}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), {
      success: false,
      message: 'Invalid or expired token',
      data: null,
    });
  }
});

test('login returns only public user fields; unknown email and wrong password share 401', async (t) => {
  const base = await serve(t);
  const password = randomBytes(24).toString('hex');
  const user = new User({
    name: 'Test User',
    email: 'unit-test@example.com',
    password: await bcrypt.hash(password, 4),
  });
  t.mock.method(User, 'findOne', () => ({ select: async () => user }));
  const send = (credentials) =>
    fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
  const valid = await send({ email: ' UNIT-TEST@EXAMPLE.COM ', password });
  assert.equal(valid.status, 200);
  const result = await valid.json();
  assert.deepEqual(Object.keys(result.data.user).sort(), [
    'email',
    'id',
    'name',
    'role',
  ]);
  const config = getAuthConfig();
  assert.equal(jwt.verify(result.data.token, config.secret).sub, user.id);
  assert.equal(user.toJSON().password, undefined);
  const wrong = await send({ email: user.email, password: 'incorrect' });
  assert.equal(wrong.status, 401);
  const expected = await wrong.json();
  t.mock.method(User, 'findOne', () => ({ select: async () => null }));
  const missing = await send({ email: 'missing@example.com', password });
  assert.equal(missing.status, 401);
  assert.deepEqual(await missing.json(), expected);
  assert.equal((await send({ email: { $ne: null }, password })).status, 400);
  assert.equal(
    (await send({ email: user.email, password: 'a'.repeat(73) })).status,
    400,
  );
});

test('me sanitizes a valid user and rejects a user that no longer exists', async (t) => {
  const base = await serve(t);
  const user = new User({
    name: 'Test User',
    email: 'unit-test@example.com',
    password: 'not-returned',
  });
  const config = getAuthConfig();
  const token = jwt.sign({}, config.secret, {
    subject: user.id,
    issuer: config.issuer,
    audience: config.audience,
    expiresIn: '1h',
  });
  t.mock.method(User, 'findById', async () => user);
  const headers = { Authorization: `Bearer ${token}` };
  const response = await fetch(`${base}/api/auth/me`, { headers });
  assert.equal(response.status, 200);
  assert.deepEqual(Object.keys((await response.json()).data.user).sort(), [
    'email',
    'id',
    'name',
    'role',
  ]);
  t.mock.method(User, 'findById', async () => null);
  assert.equal((await fetch(`${base}/api/auth/me`, { headers })).status, 401);
});
