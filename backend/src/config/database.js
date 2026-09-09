const mongoose = require('mongoose');
require('./env');

// Only fixed diagnostic labels are logged: driver messages can contain credentials.
function connectionErrorMessage(error) {
  const errors = [error, error?.cause, ...Array.from(error?.reason?.servers?.values?.() || [], (server) => server.error)];
  if (errors.some((item) => item?.code === 'ECONNREFUSED' || item?.cause?.code === 'ECONNREFUSED')) {
    return 'MongoDB connection failed (ECONNREFUSED). Start MongoDB or check the configured host and port.';
  }
  if (error?.code === 18) return 'MongoDB authentication failed. Check database credentials.';
  if (error?.name === 'MongoParseError') return 'MongoDB URI is invalid. Check MONGODB_URI.';
  return 'MongoDB connection failed. Check MONGODB_URI, network access, and database availability.';
}

mongoose.connection.on('connected', () => console.log('MongoDB connected successfully'));
mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));
mongoose.connection.on('error', () => console.error('MongoDB connection error; check database availability and configuration.'));

async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri?.trim()) throw new Error('MONGODB_URI is required. Configure backend/.env before starting the server.');
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  } catch (error) {
    throw new Error(connectionErrorMessage(error));
  }
}

function getDatabaseStatus() {
  return ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unavailable';
}

async function disconnectDatabase() {
  await mongoose.disconnect();
}

module.exports = { connectDatabase, disconnectDatabase, getDatabaseStatus };
