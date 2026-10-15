/**
 * Authentication Routes (/api/v1/auth)
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, (req, res, next) => authController.register(req, res, next));
router.post('/login', authLimiter, (req, res, next) => authController.login(req, res, next));
router.post('/refresh', (req, res, next) => authController.refresh(req, res, next));
router.post('/logout', requireAuth, (req, res, next) => authController.logout(req, res, next));
router.get('/me', requireAuth, (req, res, next) => authController.getMe(req, res, next));

module.exports = router;
