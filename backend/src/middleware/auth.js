/**
 * JWT Authentication Middleware
 */

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const userRepo = require('../repositories/user.repository');
const { AuthenticationError } = require('../errors/AppError');

const requireAuth = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      throw new AuthenticationError('Authentication token missing. Please sign in.');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new AuthenticationError('Session expired. Please refresh your session or log in again.');
      }
      throw new AuthenticationError('Invalid authentication token.');
    }

    const user = await userRepo.findById(decoded.id);
    if (!user || !user.isActive) {
      throw new AuthenticationError('User account not found or deactivated.');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  requireAuth,
};
