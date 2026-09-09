const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const HttpError = require('../utils/HttpError');
const { getAuthConfig } = require('../config/auth');

async function authMiddleware(req, res, next) {
  const header = req.get('Authorization');
  if (!header) throw new HttpError(401, 'Authentication required');
  const match = /^Bearer ([^\s]+)$/i.exec(header);
  if (!match) throw new HttpError(401, 'Invalid or expired token');
  const config = getAuthConfig();
  let payload;
  try {
    payload = jwt.verify(match[1], config.secret, {
      algorithms: ['HS256'],
      issuer: config.issuer,
      audience: config.audience,
    });
    if (
      typeof payload.sub !== 'string' ||
      !mongoose.isObjectIdOrHexString(payload.sub) ||
      typeof payload.exp !== 'number'
    ) {
      throw new Error('Invalid token claims');
    }
  } catch {
    throw new HttpError(401, 'Invalid or expired token');
  }
  // Database failures remain server errors; a removed user is no longer authenticated.
  const user = await User.findById(payload.sub);
  if (!user) throw new HttpError(401, 'Invalid or expired token');
  req.user = user.toPublicUser();
  next();
}

module.exports = authMiddleware;
