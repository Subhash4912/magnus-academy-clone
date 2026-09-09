const mongoose = require('mongoose');
const HttpError = require('../utils/HttpError');

const stringFields = ['firstName', 'lastName', 'email', 'mobile', 'gender', 'country', 'state', 'city', 'address'];
const allowedFields = [...stringFields, 'dateOfBirth', 'otherCity', 'skills'];

function validateEmployeeBody(req, res, next) {
  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Request body must be a JSON object');
  }
  if (!Object.keys(body).length) throw new HttpError(400, 'Provide at least one employee field');
  if (Object.keys(body).some((key) => !allowedFields.includes(key))) {
    throw new HttpError(400, 'Request contains unsupported employee fields');
  }
  const errors = {};
  for (const field of stringFields) {
    if (Object.hasOwn(body, field) && typeof body[field] !== 'string') errors[field] = 'Must be a string';
  }
  if (Object.hasOwn(body, 'skills') && (!Array.isArray(body.skills) || body.skills.some((skill) => typeof skill !== 'string'))) {
    errors.skills = 'Must be an array of strings';
  }
  if (Object.hasOwn(body, 'otherCity') && typeof body.otherCity !== 'boolean') errors.otherCity = 'Must be a boolean';
  if (Object.hasOwn(body, 'dateOfBirth') && body.dateOfBirth !== null &&
    (typeof body.dateOfBirth !== 'string' || !body.dateOfBirth.trim() || Number.isNaN(Date.parse(body.dateOfBirth)))) {
    errors.dateOfBirth = 'Must be a valid date string or null';
  }
  if (Object.keys(errors).length) throw new HttpError(400, 'Employee validation failed', errors);
  next();
}

function validateEmployeeId(req, res, next) {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) throw new HttpError(400, 'Invalid employee ID');
  next();
}

module.exports = { validateEmployeeBody, validateEmployeeId };
