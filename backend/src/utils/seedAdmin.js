const { connectDatabase, disconnectDatabase } = require('../config/database');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
  const name = process.env.ADMIN_NAME?.trim() || 'Admin';
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (
    !email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !password ||
    password.length < 8 ||
    bcrypt.truncates(password)
  ) {
    throw new Error(
      'Configure ADMIN_EMAIL and ADMIN_PASSWORD (8+ characters, at most 72 UTF-8 bytes).',
    );
  }
  await connectDatabase();
  await User.init();
  if (await User.exists({ email })) {
    console.log('Admin account already exists; credentials were not changed.');
    return;
  }
  // The User save hook hashes the password before MongoDB receives it.
  try {
    await User.create({ name, email, password, role: 'admin' });
    console.log(
      'Development admin created. Use the credentials in your local backend/.env.',
    );
  } catch (error) {
    if (error.code === 11000)
      console.log(
        'Admin account already exists; credentials were not changed.',
      );
    else
      throw new Error(
        'Admin creation failed. Check configuration and database availability.',
      );
  }
}

seedAdmin()
  .catch(() => {
    console.error(
      'Admin seed failed. Check ADMIN_EMAIL, ADMIN_PASSWORD (8+ characters, at most 72 UTF-8 bytes), and database availability.',
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await disconnectDatabase();
    } catch {
      console.error('Database cleanup failed.');
      process.exitCode = 1;
    }
  });
