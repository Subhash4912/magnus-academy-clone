require('./env');

function getAuthConfig() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'JWT_SECRET must contain at least 32 characters. Configure backend/.env.',
    );
  }
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
  if (!/^[1-9]\d*[smhd]$/.test(expiresIn)) {
    throw new Error(
      'JWT_EXPIRES_IN must be a positive duration such as 15m, 1h, or 1d.',
    );
  }
  return {
    secret,
    expiresIn,
    issuer: 'magnus-academy',
    audience: 'magnus-web',
  };
}

module.exports = { getAuthConfig };
