/**
 * Dashboard & Analytics Controller
 */

const matchingService = require('../services/matching.service');

class DashboardController {
  async getSummary(req, res, next) {
    try {
      const summary = await matchingService.getDashboardSummary(req.user._id);

      return res.status(200).json({
        success: true,
        data: summary,
        ...summary,
      });
    } catch (err) {
      next(err);
    }
  }

  async getSkillGap(req, res, next) {
    try {
      const resumeId = req.query.resumeId || null;
      const skillGap = await matchingService.getSkillGap(req.user._id, resumeId);

      return res.status(200).json({
        success: true,
        data: skillGap,
        ...skillGap,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DashboardController();
