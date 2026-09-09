const app = require('./app');
const { port } = require('./config/env');

const { connectDatabase, disconnectDatabase } = require('./config/database');
const { once } = require('node:events');
const { getAuthConfig } = require('./config/auth');

let server;
let stopping = false;

async function shutdown(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  const timeout = setTimeout(() => process.exit(1), 10000);
  timeout.unref();
  try {
    if (server?.listening) await new Promise((resolve) => server.close(resolve));
    await disconnectDatabase();
  } catch {
    console.error('Failed to close backend resources cleanly.');
    exitCode = 1;
  } finally {
    clearTimeout(timeout);
    process.exitCode = exitCode;
  }
}

async function start() {
  try {
    getAuthConfig();
    await connectDatabase();
  } catch (error) {
    console.error(error.message); // connectDatabase exposes only controlled messages.
    await shutdown(1);
    return;
  }
  if (stopping) {
    await disconnectDatabase();
    return;
  }
  try {
    server = app.listen(port);
    await once(server, 'listening');
    console.log(`Backend API listening on http://localhost:${port}`);
  } catch {
    console.error('HTTP server could not start. Check PORT and whether it is already in use.');
    await shutdown(1);
  }
}

process.once('SIGINT', () => shutdown());
process.once('SIGTERM', () => shutdown());
start();
