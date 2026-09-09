const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('node:crypto');
const User = require('../models/User');
const HttpError = require('../utils/HttpError');
const { getAuthConfig } = require('../config/auth');

// Keep the password comparison path similar even when no account matches.
const dummyHash = bcrypt.hashSync(randomBytes(32).toString('hex'), 12);

async function login(req, res) {
  const { email, password } = req.body || {};
  if (
    typeof email !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof password !== 'string' ||
    !password ||
    bcrypt.truncates(password)
  ) {
    throw new HttpError(
      400,
      'Enter a valid email and password (maximum 72 UTF-8 bytes).',
    );
  }
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select(
    '+password',
  );
  const matches = await bcrypt.compare(password, user?.password || dummyHash);
  if (!user || !matches) throw new HttpError(401, 'Invalid email or password');
  const config = getAuthConfig();
  const token = jwt.sign({}, config.secret, {
    algorithm: 'HS256',
    subject: user._id.toString(),
    expiresIn: config.expiresIn,
    issuer: config.issuer,
    audience: config.audience,
  });
  res.set('Cache-Control', 'no-store');
  res.json({
    success: true,
    message: 'Login successful',
    data: { token, user: user.toPublicUser() },
  });
}

function getCurrentUser(req, res) {
  res.set('Cache-Control', 'no-store');
  res.json({
    success: true,
    message: 'Current user fetched successfully',
    data: { user: req.user },
  });
}

async function updateProfile(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) throw new HttpError(401, 'Invalid or expired token');
  user.name = req.body.name;
  await user.save();
  res.set('Cache-Control', 'no-store');
  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user: user.toPublicUser() },
  });
}

async function changePassword(req, res) {
  const user = await User.findById(req.user.id).select('+password');
  if (!user) throw new HttpError(401, 'Invalid or expired token');
  const matches = await bcrypt.compare(req.body.currentPassword, user.password);
  if (!matches) throw new HttpError(400, 'Current password is incorrect');
  if (req.body.currentPassword === req.body.newPassword) {
    throw new HttpError(
      400,
      'New password must be different from the current password',
    );
  }
  user.password = req.body.newPassword;
  await user.save();
  res.set('Cache-Control', 'no-store');
  res.json({
    success: true,
    message: 'Password updated successfully',
    data: null,
  });
}

module.exports = { login, getCurrentUser, updateProfile, changePassword };
