const dashboardService = require('../services/dashboardService');
async function getDashboardStats(req, res) {
  const data = await dashboardService.getDashboardStats();
  res.set('Cache-Control', 'no-store');
  res.json({
    success: true,
    message: 'Dashboard statistics fetched successfully',
    data,
  });
}
module.exports = { getDashboardStats };
