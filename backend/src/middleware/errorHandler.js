const HttpError = require('../utils/HttpError');

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  const proposedStatus = error.status || error.statusCode;
  let status = Number.isInteger(proposedStatus) && proposedStatus >= 400 && proposedStatus <= 599
    ? proposedStatus
    : 500;

  let message = status >= 500 ? 'Internal server error' : 'Request could not be processed';
  let errors;
  if (error instanceof HttpError) {
    message = error.message;
    errors = error.errors;
  } else if (error.name === 'ValidationError') {
    status = 400;
    message = 'Employee validation failed';
    errors = Object.fromEntries(Object.entries(error.errors).map(([field, detail]) => [
      field, detail.kind === 'required' ? 'This field is required' : 'Invalid value',
    ]));
  } else if (error.name === 'CastError') {
    status = 400;
    message = 'Invalid employee field value';
  } else if (error.code === 11000) {
    status = 409;
    message = 'An employee with these unique details already exists';
  } else if (error.name === 'DocumentNotFoundError') {
    status = 404;
    message = 'Employee not found';
  }
  if (error.type === 'entity.parse.failed') message = 'Invalid JSON body';
  if (error.type === 'entity.too.large') message = 'Request body is too large';

  // Do not log raw database errors, request bodies, or credentials.
  if (status >= 500) console.error('API request failed with an internal server error');
  res.status(status).json({ success: false, message, ...(status === 401 ? { data: null } : {}), ...(errors ? { errors } : {}) });
}

module.exports = errorHandler;
