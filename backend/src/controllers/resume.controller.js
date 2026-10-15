/**
 * Resume Controller
 */

const resumeService = require('../services/resume.service');
const { ValidationError } = require('../errors/AppError');

class ResumeController {
  async upload(req, res, next) {
    try {
      if (!req.file) {
        throw new ValidationError('No resume file provided. Please attach a PDF or DOCX file.');
      }

      const result = await resumeService.uploadAndQueue({
        userId: req.user._id,
        file: req.file,
      });

      return res.status(202).json({
        success: true,
        message: 'Resume uploaded and queued for analysis',
        resumeId: result.resumeId,
        fileName: result.fileName,
        analysisStatus: result.status,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async getResumes(req, res, next) {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const limit = parseInt(req.query.limit || '20', 10);

      const result = await resumeService.getUserResumes(req.user._id, { page, limit });

      return res.status(200).json({
        success: true,
        data: result.resumes,
        resumes: result.resumes,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  async getResumeById(req, res, next) {
    try {
      const resume = await resumeService.getResumeById(req.params.id, req.user._id);

      return res.status(200).json({
        success: true,
        data: resume,
        resume,
      });
    } catch (err) {
      next(err);
    }
  }

  async getStatus(req, res, next) {
    try {
      const status = await resumeService.getResumeStatus(req.params.id, req.user._id);

      return res.status(200).json({
        success: true,
        resumeId: status.resumeId,
        status: status.status,
        resumeScore: status.score || 0,
        errorMessage: status.error || null,
        updatedAt: status.updatedAt,
        data: status,
      });
    } catch (err) {
      next(err);
    }
  }

  async getAnalysis(req, res, next) {
    try {
      const analysisData = await resumeService.getResumeAnalysis(req.params.id, req.user._id);

      return res.status(200).json({
        success: true,
        source: 'database',
        ...analysisData,
        data: analysisData,
      });
    } catch (err) {
      next(err);
    }
  }

  async reanalyze(req, res, next) {
    try {
      const result = await resumeService.reanalyze(req.params.id, req.user._id);

      return res.status(202).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteResume(req, res, next) {
    try {
      const result = await resumeService.deleteResume(req.params.id, req.user._id);

      return res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ResumeController();
