/**
 * User Profile Controller
 */

const userRepo = require('../repositories/user.repository');
const auditRepo = require('../repositories/auditLog.repository');
const { updateProfileSchema } = require('../validators/user.validator');
const { NotFoundError } = require('../errors/AppError');

class UserController {
  async getProfile(req, res, next) {
    try {
      const user = await userRepo.findById(req.user._id);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      return res.status(200).json({
        success: true,
        user,
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const validated = updateProfileSchema.parse(req.body);
      const updated = await userRepo.updateById(req.user._id, validated);

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: updated,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  }

  async getActivity(req, res, next) {
    try {
      const logs = await auditRepo.findRecentByUserId(req.user._id, 30);

      return res.status(200).json({
        success: true,
        data: logs,
        activities: logs,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new UserController();
