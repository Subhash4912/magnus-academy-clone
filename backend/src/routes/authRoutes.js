const express = require('express');
const {
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const {
  validateProfile,
  validatePassword,
} = require('../middleware/validateAuthSettings');

const router = express.Router();
router.post('/login', login);
router.get('/me', authMiddleware, getCurrentUser);
router.put('/profile', authMiddleware, validateProfile, updateProfile);
router.put('/password', authMiddleware, validatePassword, changePassword);

module.exports = router;
