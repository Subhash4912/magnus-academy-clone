const assert = require('node:assert/strict');
const { test } = require('node:test');
const { once } = require('node:events');
const { randomUUID } = require('node:crypto');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const User = require('../src/models/User');
const {
  connectDatabase,
  disconnectDatabase,
} = require('../src/config/database');

test(
  'live authenticated profile and password settings',
  { skip: process.env.RUN_AUTH_SETTINGS_TESTS !== '1' },
  async (t) => {
    await connectDatabase();
    const server = app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    let userId;
    t.after(async () => {
      try {
        if (userId) await User.deleteOne({ _id: userId });
      } finally {
        await new Promise((resolve) => server.close(resolve));
        await disconnectDatabase();
      }
    });

    const base = `http://127.0.0.1:${server.address().port}/api`;
    const suffix = randomUUID();
    const email = `settings-${suffix}@example.com`;
    const oldPassword = `Old-${suffix}`;
    const newPassword = `New-${suffix}`;
    const user = await User.create({
      name: 'Settings Test User',
      email,
      password: oldPassword,
    });
    userId = user.id;
    let token;
    async function request(path, method = 'GET', body, suppliedToken = token) {
      const response = await fetch(base + path, {
        method,
        headers: {
          ...(suppliedToken
            ? { Authorization: `Bearer ${suppliedToken}` }
            : {}),
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      return { status: response.status, body: await response.json() };
    }

    assert.equal(
      (await request('/auth/profile', 'PUT', { name: 'No token' }, null))
        .status,
      401,
    );
    assert.equal(
      (
        await request(
          '/auth/password',
          'PUT',
          { currentPassword: oldPassword, newPassword },
          null,
        )
      ).status,
      401,
    );
    const login = await request(
      '/auth/login',
      'POST',
      { email, password: oldPassword },
      null,
    );
    assert.equal(login.status, 200);
    token = login.body.data.token;

    for (const invalid of [
      { name: '  ' },
      { name: 'a'.repeat(81) },
      { name: 'Unsafe', role: 'owner' },
      { name: 'Unsafe', password: 'do-not-accept' },
      { name: 'Unsafe', userId: 'another-user' },
    ])
      assert.equal(
        (await request('/auth/profile', 'PUT', invalid)).status,
        400,
      );

    const profile = await request('/auth/profile', 'PUT', {
      name: '  Updated Settings User  ',
    });
    assert.equal(profile.status, 200);
    assert.deepEqual(profile.body.data.user, {
      id: userId,
      name: 'Updated Settings User',
      email,
      role: 'admin',
    });
    assert.equal(profile.body.data.user.password, undefined);
    assert.equal((await User.findById(userId)).name, 'Updated Settings User');
    assert.equal((await User.findById(userId)).role, 'admin');

    assert.equal(
      (
        await request('/auth/password', 'PUT', {
          currentPassword: 'incorrect',
          newPassword,
        })
      ).status,
      400,
    );
    for (const invalid of [
      { currentPassword: oldPassword, newPassword: 'short' },
      { currentPassword: oldPassword, newPassword, role: 'owner' },
      { currentPassword: oldPassword, newPassword, userId: 'another-user' },
    ])
      assert.equal(
        (await request('/auth/password', 'PUT', invalid)).status,
        400,
      );

    const changed = await request('/auth/password', 'PUT', {
      currentPassword: oldPassword,
      newPassword,
    });
    assert.equal(changed.status, 200);
    assert.deepEqual(changed.body, {
      success: true,
      message: 'Password updated successfully',
      data: null,
    });
    const stored = await User.findById(userId).select('+password');
    assert.equal(await bcrypt.compare(newPassword, stored.password), true);
    assert.equal(stored.password === newPassword, false);
    assert.equal((await request('/auth/me')).status, 200);
    assert.equal(
      (
        await request(
          '/auth/login',
          'POST',
          { email, password: oldPassword },
          null,
        )
      ).status,
      401,
    );
    const newLogin = await request(
      '/auth/login',
      'POST',
      { email, password: newPassword },
      null,
    );
    assert.equal(newLogin.status, 200);
    assert.equal(newLogin.body.data.user.password, undefined);
  },
);
