/**
 * AuditLog Data Access Repository
 */

const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

class AuditLogRepository {
  async log({ userId = null, action, resourceType = '', resourceId = '', metadata = {}, ipAddress = '', userAgent = '' }) {
    try {
      return await AuditLog.create({
        userId,
        action,
        resourceType,
        resourceId,
        metadata,
        ipAddress,
        userAgent,
      });
    } catch (err) {
      // Never let an audit logging failure crash the primary request
      logger.error({ err: err.message, action }, 'Failed to record audit log');
      return null;
    }
  }

  async findRecentByUserId(userId, limit = 50) {
    return AuditLog.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean();
  }
}

module.exports = new AuditLogRepository();
