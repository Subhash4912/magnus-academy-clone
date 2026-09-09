const assert = require('node:assert/strict');
const { test } = require('node:test');
const { once } = require('node:events');
const { randomUUID } = require('node:crypto');
const app = require('../src/app');
const { connectDatabase, disconnectDatabase } = require('../src/config/database');
const Employee = require('../src/models/Employee');
const User = require('../src/models/User');

test('live employee CRUD, validation, search, and health', { skip: process.env.RUN_EMPLOYEE_API_TESTS !== '1' }, async (t) => {
  const ids = new Set();
  let userId;
  let token;
  await connectDatabase();
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => {
    try {
      // Only remove documents created and recorded by this test; never clear a collection.
      for (const id of ids) await Employee.deleteOne({ _id: id });
      if (userId) await User.deleteOne({ _id: userId });
    } finally {
      await new Promise((resolve) => server.close(resolve));
      await disconnectDatabase();
    }
  });
  const base = 'http://127.0.0.1:' + server.address().port;
  async function request(path, method = 'GET', body) {
    const response = await fetch(base + path, {
      method,
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    return { status: response.status, body: await response.json() };
  }
  const tag = 'Phase6-' + randomUUID();
  assert.equal((await request('/api/auth/me')).status, 401);
  assert.equal((await request('/api/employees')).status, 401);
  const password = randomUUID();
  const user = await User.create({ name: 'Integration test', email: `${tag}@example.com`, password });
  userId = user._id;
  const storedUser = await User.findById(userId).select('+password');
  assert.notEqual(storedUser.password, password);
  assert.match(storedUser.password, /^\$2[aby]\$/);
  assert.equal((await User.findById(userId)).password, undefined);
  const login = await request('/api/auth/login', 'POST', { email: user.email, password });
  assert.equal(login.status, 200);
  token = login.body.data.token;
  assert.equal(login.body.data.user.password, undefined);
  assert.equal((await request('/api/auth/me')).status, 200);
  assert.equal((await request('/api/auth/login', 'POST', { email: user.email, password: 'incorrect' })).status, 401);
  const payload = {
    firstName: '  ' + tag + '  ', lastName: 'ApiTest', email: '  ' + tag.toUpperCase() + '@example.com  ',
    mobile: '+91 0012345678', gender: 'Male', dateOfBirth: '1998-05-15',
    country: 'India', state: 'Karnataka', city: 'Bengaluru', otherCity: false,
    address: ' Test address ', skills: [' JavaScript ', 'React'],
  };
  const created = await request('/api/employees', 'POST', payload);
  if (created.body.data?._id) ids.add(created.body.data._id);
  assert.equal(created.status, 201);
  const id = created.body.data._id;
  assert.equal(created.body.data.firstName, tag);
  assert.equal(created.body.data.email, tag.toLowerCase() + '@example.com');
  assert.equal(created.body.data.mobile, payload.mobile);
  assert.deepEqual(created.body.data.skills, ['JavaScript', 'React']);
  assert.equal(created.body.data.__v, undefined);
  assert(created.body.data.createdAt && created.body.data.updatedAt);
  const all = await request('/api/employees');
  assert.equal(all.status, 200);
  assert(all.body.data.some((employee) => employee._id === id));
  assert.equal((await request('/api/employees/' + id)).body.data._id, id);
  for (const query of [
    '?name=' + tag.toLowerCase(), '?name=apitest', '?mobile=001234',
    '?name=' + tag + '&mobile=001234',
  ]) {
    const result = await request('/api/employees' + query);
    assert.equal(result.status, 200);
    assert(result.body.data.some((employee) => employee._id === id), query);
  }
  for (const query of ['?name=' + tag + '&mobile=does-not-match', '?name=' + tag + '-missing', '?name=' + encodeURIComponent('.*' + tag)]) {
    const result = await request('/api/employees' + query);
    assert.equal(result.status, 200);
    assert.deepEqual(result.body, { success: true, message: 'No employees found', data: [] });
  }
  const updated = await request('/api/employees/' + id, 'PUT', { lastName: 'Updated', skills: ['Node.js'] });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.data.lastName, 'Updated');
  assert.equal(updated.body.data.firstName, tag);
  assert.equal(updated.body.data.createdAt, created.body.data.createdAt);
  assert(new Date(updated.body.data.updatedAt) > new Date(created.body.data.updatedAt));
  for (const body of [
    { firstName: 'Only' }, { ...payload, email: 'invalid' }, { ...payload, mobile: 123 },
    { ...payload, skills: 'React' }, { ...payload, skills: [{}] }, { ...payload, otherCity: 'false' },
    { ...payload, dateOfBirth: 'invalid' }, { ...payload, firstName: '  ' },
    { ...payload, password: 'must-not-store' }, { $set: { firstName: 'Unsafe' } }, [],
  ]) {
    const result = await request('/api/employees', 'POST', body);
    if (result.body.data?._id) ids.add(result.body.data._id);
    assert.equal(result.status, 400);
    assert.equal(result.body.success, false);
  }
  assert.equal((await request('/api/employees/' + id, 'PUT', { firstName: '' })).status, 400);
  assert.equal((await request('/api/employees/' + id, 'PUT', { email: 'invalid' })).status, 400);
  assert.equal((await request('/api/employees/' + id)).body.data.firstName, tag);
  for (const method of ['GET', 'PUT', 'DELETE']) {
    assert.equal((await request('/api/employees/not-an-id', method, method === 'PUT' ? { firstName: 'Test' } : undefined)).status, 400);
    assert.equal((await request('/api/employees/000000000000000000000000', method, method === 'PUT' ? { firstName: 'Test' } : undefined)).status, 404);
  }
  assert.equal((await request('/api/employees?name=a&name=b')).status, 400);
  assert.equal((await request('/api/employees?name[$ne]=x')).status, 400);
  // Shared emails are explicitly supported, not an accidental missing unique index.
  const shared = await request('/api/employees', 'POST', { ...payload, firstName: tag + '-shared' });
  if (shared.body.data?._id) ids.add(shared.body.data._id);
  assert.equal(shared.status, 201);
  const health = await request('/api/health');
  assert.equal(health.status, 200);
  assert.equal(health.body.data.database, 'connected');
  const deleted = await request('/api/employees/' + id, 'DELETE');
  assert.equal(deleted.status, 200);
  assert.deepEqual(deleted.body, { success: true, message: 'Employee deleted successfully', data: null });
  const missing = await request('/api/employees/' + id);
  assert.equal(missing.status, 404);
  assert.deepEqual(missing.body, { success: false, message: 'Employee not found' });
  assert.equal((await request('/api/employees/' + id, 'DELETE')).status, 404);
  await request('/api/employees/' + shared.body.data._id, 'DELETE');
  for (const createdId of ids) assert.equal(await Employee.exists({ _id: createdId }), null);
  console.log('Created and removed 2 temporary employees tagged ' + tag + '; no existing records changed.');
});

