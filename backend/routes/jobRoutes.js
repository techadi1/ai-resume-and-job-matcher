const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET, authenticate } = require('../middleware/auth');
const {
  getJobs,
  getJobById,
  getRecommendedJobs,
  saveJob,
  unsaveJob,
  getSavedJobs
} = require('../controllers/jobController');

// Optional authentication middleware
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
      }
    } catch (e) {
      // Ignore invalid token for optional auth routes
    }
  }
  next();
};

router.get('/', optionalAuth, getJobs);
router.get('/recommended', authenticate, getRecommendedJobs);
router.get('/saved', authenticate, getSavedJobs);
router.get('/:id', optionalAuth, getJobById);
router.post('/:id/save', authenticate, saveJob);
router.delete('/:id/save', authenticate, unsaveJob);

module.exports = router;
