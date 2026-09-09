const express = require('express');
const databaseConnection = require('../config/database');
const employeeRoutes = require('./employeeRoutes');
const authRoutes = require('./authRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use('/auth', authRoutes);
router.use('/employees', authMiddleware, employeeRoutes);
router.use('/dashboard', authMiddleware, dashboardRoutes);

router.get('/health', (req, res) => {
  const database = databaseConnection.getDatabaseStatus();
  const connected = database === 'connected';
  res.status(connected ? 200 : 503).json({
    success: connected,
    message: connected ? 'Backend API is running' : 'Database is unavailable',
    data: { status: connected ? 'ok' : 'degraded', database },
  });
});

module.exports = router;
