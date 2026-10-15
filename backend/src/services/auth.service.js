/**
 * Authentication Service with Refresh Token Rotation
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userRepo = require('../repositories/user.repository');
const auditRepo = require('../repositories/auditLog.repository');
const env = require('../config/env');
const { AUDIT_ACTIONS, ROLES } = require('../constants');
const {
  ValidationError,
  AuthenticationError,
  ConflictError,
} = require('../errors/AppError');

class AuthService {
  generateTokens(user) {
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRY,
    });

    const refreshToken = crypto.randomBytes(40).toString('hex');

    return { accessToken, refreshToken };
  }

  async register({ name, email, password }) {
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await userRepo.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictError('An account with this email address already exists.');
    }

    const passwordHash = await userRepo.createModelPasswordHash
      ? await userRepo.createModelPasswordHash(password)
      : await require('../models/User').hashPassword(password);

    const user = await userRepo.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: ROLES.USER,
      lastLogin: new Date(),
    });

    const { accessToken, refreshToken } = this.generateTokens(user);
    await userRepo.updateRefreshToken(user._id, refreshToken);

    await auditRepo.log({
      userId: user._id,
      action: AUDIT_ACTIONS.USER_REGISTERED,
      resourceType: 'User',
      resourceId: user._id.toString(),
    });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: accessToken, // for backwards compatibility
      accessToken,
      refreshToken,
    };
  }

  async login({ email, password, ipAddress, userAgent }) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await userRepo.findByEmail(normalizedEmail);

    if (!user || !user.isActive) {
      throw new AuthenticationError('Invalid email or password.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AuthenticationError('Invalid email or password.');
    }

    const { accessToken, refreshToken } = this.generateTokens(user);
    await userRepo.updateById(user._id, {
      refreshToken,
      lastLogin: new Date(),
    });

    await auditRepo.log({
      userId: user._id,
      action: AUDIT_ACTIONS.USER_LOGIN,
      resourceType: 'User',
      resourceId: user._id.toString(),
      ipAddress,
      userAgent,
    });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
        careerInterests: user.careerInterests,
      },
      token: accessToken,
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw new AuthenticationError('Refresh token is required');
    }

    const User = require('../models/User');
    const user = await User.findOne({ refreshToken });

    if (!user || !user.isActive) {
      throw new AuthenticationError('Invalid or expired refresh token. Please sign in again.');
    }

    // Refresh token rotation: issue new pair
    const tokens = this.generateTokens(user);
    await userRepo.updateRefreshToken(user._id, tokens.refreshToken);

    return {
      token: tokens.accessToken,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async logout(userId) {
    if (userId) {
      await userRepo.updateRefreshToken(userId, null);
      await auditRepo.log({
        userId,
        action: AUDIT_ACTIONS.USER_LOGOUT,
        resourceType: 'User',
        resourceId: userId.toString(),
      });
    }
    return { success: true, message: 'Logged out successfully' };
  }

  async getMe(userId) {
    const user = await userRepo.findById(userId);
    if (!user) {
      throw new AuthenticationError('User not found.');
    }
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      location: user.location,
      education: user.education,
      skills: user.skills,
      careerInterests: user.careerInterests,
    };
  }
}

module.exports = new AuthService();
