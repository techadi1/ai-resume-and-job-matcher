/**
 * Authentication Controller
 */

const authService = require('../services/auth.service');
const { registerSchema, loginSchema, refreshSchema } = require('../validators/auth.validator');
const { ValidationError } = require('../errors/AppError');

class AuthController {
  async register(req, res, next) {
    try {
      const validated = registerSchema.parse(req.body);
      const result = await authService.register(validated);

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        data: result,
        token: result.token,
        user: result.user,
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const validated = loginSchema.parse(req.body);
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || '';
      const userAgent = req.headers['user-agent'] || '';

      const result = await authService.login({
        ...validated,
        ipAddress,
        userAgent,
      });

      return res.status(200).json({
        success: true,
        message: 'Logged in successfully.',
        data: result,
        token: result.token,
        user: result.user,
      });
    } catch (err) {
      next(err);
    }
  }

  async refresh(req, res, next) {
    try {
      const validated = refreshSchema.parse(req.body);
      const result = await authService.refresh(validated.refreshToken);

      return res.status(200).json({
        success: true,
        message: 'Token refreshed successfully.',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      const userId = req.user ? req.user._id : null;
      const result = await authService.logout(userId);

      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await authService.getMe(req.user._id);

      return res.status(200).json({
        success: true,
        user,
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
