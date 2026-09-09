const bcrypt = require('bcryptjs');
const HttpError = require('../utils/HttpError');

function requireObject(body, allowedFields) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Request body must be a JSON object');
  }
  if (Object.keys(body).some((field) => !allowedFields.includes(field))) {
    throw new HttpError(400, 'Request contains unsupported account fields');
  }
}

function validateProfile(req, res, next) {
  requireObject(req.body, ['name']);
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  if (!name) throw new HttpError(400, 'Name is required');
  if (name.length > 80)
    throw new HttpError(400, 'Name must be 80 characters or fewer');
  req.body.name = name;
  next();
}

function validatePassword(req, res, next) {
  requireObject(req.body, ['currentPassword', 'newPassword']);
  const { currentPassword, newPassword } = req.body;
  if (typeof currentPassword !== 'string' || !currentPassword) {
    throw new HttpError(400, 'Current password is required');
  }
  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    throw new HttpError(400, 'New password must be at least 8 characters');
  }
  if (bcrypt.truncates(currentPassword) || bcrypt.truncates(newPassword)) {
    throw new HttpError(400, 'Passwords must not exceed 72 UTF-8 bytes');
  }
  next();
}

module.exports = { validateProfile, validatePassword };
