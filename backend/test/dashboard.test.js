const assert = require('node:assert/strict');
const { test } = require('node:test');
const { once } = require('node:events');
const { randomUUID } = require('node:crypto');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const Employee = require('../src/models/Employee');
const User = require('../src/models/User');
const service = require('../src/services/dashboardService');
const { getAuthConfig } = require('../src/config/auth');
const {
  connectDatabase,
  disconnectDatabase,
} = require('../src/config/database');

process.env.JWT_SECRET ||= randomUUID() + randomUUID();

async function serve(t) {
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const config = getAuthConfig();
  const token = jwt.sign({}, config.secret, {
    subject: '507f1f77bcf86cd799439011',
    expiresIn: '1h',
    issuer: config.issuer,
    audience: config.audience,
  });
  return {
    url: `http://127.0.0.1:${server.address().port}/api/dashboard/stats`,
    headers: { Authorization: `Bearer ${token}` },
  };
}

test('dashboard requires authentication and hides internal failures', async (t) => {
  const { url, headers } = await serve(t);
  assert.equal((await fetch(url)).status, 401);
  assert.equal(
    (await fetch(url, { headers: { Authorization: 'Bearer invalid' } })).status,
    401,
  );
  t.mock.method(User, 'findById', async () => ({
    toPublicUser: () => ({ id: 'test' }),
  }));
  t.mock.method(service, 'getDashboardStats', async () => {
    throw new Error('private database detail');
  });
  const failure = await fetch(url, { headers });
  assert.equal(failure.status, 500);
  assert.deepEqual(await failure.json(), {
    success: false,
    message: 'Internal server error',
  });
});

test(
  'live dashboard aggregation: empty data, groups, distinct skills, latest five',
  { skip: process.env.RUN_DASHBOARD_API_TESTS !== '1' },
  async (t) => {
    await connectDatabase();
    // A uniquely named temporary collection isolates empty-data tests from real employees.
    const collection = Employee.db.collection(
      'dashboard_test_' + randomUUID().replaceAll('-', ''),
    );
    t.after(async () => {
      try {
        await collection.drop();
      } catch (error) {
        if (error.code !== 26) throw error;
      } finally {
        await disconnectDatabase();
      }
    });
    t.mock.method(Employee, 'aggregate', (pipeline) =>
      collection.aggregate(pipeline).toArray(),
    );
    t.mock.method(User, 'findById', async () => ({
      toPublicUser: () => ({ id: 'test' }),
    }));
    const { url, headers } = await serve(t);
    const empty = await fetch(url, { headers });
    assert.equal(empty.status, 200);
    assert.deepEqual((await empty.json()).data, {
      totalEmployees: 0,
      maleEmployees: 0,
      femaleEmployees: 0,
      otherGenderEmployees: 0,
      employeesByCountry: [],
      employeesByState: [],
      employeesBySkill: [],
      recentEmployees: [],
    });
    const records = [
      {
        gender: 'Male',
        country: 'India',
        state: 'Maharashtra',
        skills: ['React', 'React', 'JavaScript'],
      },
      {
        gender: ' male ',
        country: 'India',
        state: 'Maharashtra',
        skills: ['React', ''],
      },
      {
        gender: 'Female',
        country: 'USA',
        state: 'California',
        skills: ['JavaScript'],
      },
      { gender: 'FEMALE', country: 'USA', state: 'California', skills: [] },
      { gender: 'Other', country: '', state: '' },
      { gender: '', country: null, state: null, skills: null },
      {},
    ].map((record, i) => ({
      ...record,
      firstName: `Test${i}`,
      lastName: 'Dashboard',
      email: `test${i}@example.com`,
      mobile: '1234567890',
      address: 'Not returned',
      createdAt: new Date(1700000000000 + i * 1000),
    }));
    await collection.insertMany(records);
    const response = await fetch(url, { headers });
    assert.equal(response.status, 200);
    const { data } = await response.json();
    assert.deepEqual(
      [
        data.totalEmployees,
        data.maleEmployees,
        data.femaleEmployees,
        data.otherGenderEmployees,
      ],
      [7, 2, 2, 3],
    );
    assert.deepEqual(data.employeesByCountry, [
      { _id: 'Unspecified', count: 3 },
      { _id: 'India', count: 2 },
      { _id: 'USA', count: 2 },
    ]);
    assert.deepEqual(data.employeesByState, [
      { _id: 'Unspecified', count: 3 },
      { _id: 'California', count: 2 },
      { _id: 'Maharashtra', count: 2 },
    ]);
    assert.deepEqual(data.employeesBySkill, [
      { _id: 'JavaScript', count: 2 },
      { _id: 'React', count: 2 },
    ]);
    assert.deepEqual(
      data.recentEmployees.map((e) => e.firstName),
      ['Test6', 'Test5', 'Test4', 'Test3', 'Test2'],
    );
    assert.deepEqual(
      Object.keys(data.recentEmployees[0]).sort(),
      ['_id', 'firstName', 'lastName', 'email', 'mobile', 'createdAt'].sort(),
    );
  },
);
