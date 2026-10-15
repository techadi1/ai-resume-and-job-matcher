const fs = require('fs');
const path = require('path');
const Resume = require('../models/Resume');
const JobMatch = require('../models/JobMatch');
const { addResumeJob } = require('../queues/resumeQueue');
const { get, set, invalidateResumeCache } = require('../services/redisService');

/**
 * Upload and start analysis for a resume
 * POST /api/resumes/upload
 */
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume file uploaded. Please upload a PDF or DOCX file.'
      });
    }

    const { originalname, mimetype, path: filePath, size } = req.file;

    // 1. Create Resume in MongoDB
    const resume = await Resume.create({
      userId: req.user._id,
      fileName: originalname,
      fileType: mimetype,
      filePath: filePath,
      fileSize: size,
      analysisStatus: 'UPLOADED'
    });

    // 2. Add job to BullMQ queue
    try {
      await addResumeJob({
        resumeId: resume._id.toString(),
        userId: req.user._id.toString(),
        filePath: filePath,
        fileName: originalname,
        fileType: mimetype
      });
    } catch (queueErr) {
      console.warn('[Queue Warning] BullMQ enqueue error:', queueErr.message);
      // Fallback: If Redis is offline, we can still inform user or process in worker
    }

    return res.status(202).json({
      success: true,
      message: 'Resume uploaded successfully. Analysis job has been queued.',
      resumeId: resume._id,
      fileName: resume.fileName,
      analysisStatus: resume.analysisStatus
    });
  } catch (err) {
    console.error('[Resume Controller Error - Upload]:', err.message);
    return res.status(500).json({
      success: false,
      message: `Failed to upload and process resume: ${err.message}`
    });
  }
};

/**
 * Get all resumes for current user
 * GET /api/resumes
 */
const getUserResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .select('-extractedText')
      .sort({ createdAt: -1 });

    // Fetch match counts for each resume
    const formattedResumes = await Promise.all(
      resumes.map(async (r) => {
        const matchCount = await JobMatch.countDocuments({ resumeId: r._id });
        return {
          id: r._id,
          _id: r._id,
          fileName: r.fileName,
          fileType: r.fileType,
          fileSize: r.fileSize,
          resumeScore: r.resumeScore,
          skillsCount: r.skills ? r.skills.length : 0,
          skills: r.skills || [],
          analysisStatus: r.analysisStatus,
          errorMessage: r.errorMessage,
          jobsMatchedCount: matchCount,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: formattedResumes.length,
      resumes: formattedResumes
    });
  } catch (err) {
    console.error('[Resume Controller Error - List]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve resume history.'
    });
  }
};

/**
 * Get single resume basic info
 * GET /api/resumes/:id
 */
const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found.'
      });
    }

    return res.status(200).json({
      success: true,
      resume
    });
  } catch (err) {
    console.error('[Resume Controller Error - GetById]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve resume.'
    });
  }
};

/**
 * Lightweight endpoint for polling analysis status
 * GET /api/resumes/:id/status
 */
const getResumeStatus = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).select('analysisStatus resumeScore errorMessage updatedAt');

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found.'
      });
    }

    return res.status(200).json({
      success: true,
      resumeId: resume._id,
      status: resume.analysisStatus,
      resumeScore: resume.resumeScore,
      errorMessage: resume.errorMessage,
      updatedAt: resume.updatedAt
    });
  } catch (err) {
    console.error('[Resume Controller Error - Status]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve resume status.'
    });
  }
};

/**
 * Detailed resume analysis with Redis caching
 * GET /api/resumes/:id/analysis
 */
const getResumeAnalysis = async (req, res) => {
  try {
    const resumeId = req.params.id;
    const cacheKey = `resume:${resumeId}:analysis`;

    // 1. Check Redis cache first
    const cachedData = await get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        source: 'cache',
        ...cachedData
      });
    }

    // 2. Fetch from MongoDB
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume analysis not found.'
      });
    }

    // 3. Fetch top job matches for this resume
    const topMatches = await JobMatch.find({ resumeId: resume._id })
      .populate('jobId')
      .sort({ matchPercentage: -1 })
      .limit(10);

    const responseData = {
      resume: {
        id: resume._id,
        _id: resume._id,
        fileName: resume.fileName,
        candidateName: resume.candidateName,
        email: resume.email,
        phone: resume.phone,
        linkedin: resume.linkedin,
        github: resume.github,
        skills: resume.skills,
        education: resume.education,
        experience: resume.experience,
        projects: resume.projects,
        certifications: resume.certifications,
        resumeScore: resume.resumeScore,
        analysisStatus: resume.analysisStatus,
        createdAt: resume.createdAt
      },
      analysis: resume.analysisResult,
      topMatches
    };

    // 4. Save to Redis cache (1 hour TTL)
    if (resume.analysisStatus === 'COMPLETED') {
      await set(cacheKey, responseData, 3600);
    }

    return res.status(200).json({
      success: true,
      source: 'database',
      ...responseData
    });
  } catch (err) {
    console.error('[Resume Controller Error - Analysis]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve resume analysis.'
    });
  }
};

/**
 * Get skill gap analysis and recommendations for a resume
 * GET /api/resumes/:id/skill-gap
 */
const getResumeSkillGap = async (req, res) => {
  try {
    const resumeId = req.params.id;
    const cacheKey = `resume:${resumeId}:skill-gap`;

    const cached = await get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        source: 'cache',
        ...cached
      });
    }

    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found.'
      });
    }

    // Check if skillGap was saved in analysisResult
    if (resume.analysisResult && resume.analysisResult.skillGap) {
      const data = {
        resumeSkills: resume.skills || [],
        ...resume.analysisResult.skillGap
      };
      await set(cacheKey, data, 3600);
      return res.status(200).json({
        success: true,
        source: 'database',
        ...data
      });
    }

    // Fallback: Compute missing skills from JobMatch records
    const matches = await JobMatch.find({ resumeId: resume._id })
      .populate('jobId')
      .sort({ matchPercentage: -1 })
      .limit(10);

    const missingFreq = {};
    const missingJobTitles = {};

    matches.forEach((m) => {
      (m.missingSkills || []).forEach((sk) => {
        missingFreq[sk] = (missingFreq[sk] || 0) + 1;
        if (!missingJobTitles[sk]) missingJobTitles[sk] = [];
        const title = m.jobId ? m.jobId.title : 'Software Role';
        if (!missingJobTitles[sk].includes(title)) missingJobTitles[sk].push(title);
      });
    });

    const sortedMissing = Object.entries(missingFreq).sort((a, b) => b[1] - a[1]);
    const recommendedSkills = sortedMissing.slice(0, 8).map(([skill, freq]) => ({
      skill,
      frequency: freq,
      priority: freq >= 3 ? 'HIGH' : freq >= 2 ? 'MEDIUM' : 'LOW',
      category: 'Technical',
      whyMatters: `Required by ${freq} of your top matching job positions.`,
      jobsRequiring: (missingJobTitles[skill] || []).slice(0, 3),
      learningPath: [
        `Learn core principles and architecture of ${skill}`,
        `Build hands-on practical applications integrating ${skill}`,
        `Deploy and evaluate production best practices with ${skill}`
      ]
    }));

    const result = {
      resumeSkills: resume.skills || [],
      totalMissingSkills: sortedMissing.length,
      topMissingSkills: sortedMissing.slice(0, 10).map((s) => s[0]),
      recommendedSkills
    };

    await set(cacheKey, result, 3600);

    return res.status(200).json({
      success: true,
      source: 'computed',
      ...result
    });
  } catch (err) {
    console.error('[Resume Controller Error - SkillGap]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve skill gap analysis.'
    });
  }
};

/**
 * Delete resume and clean up related records and files
 * DELETE /api/resumes/:id
 */
const deleteResume = async (req, res) => {
  try {
    const resumeId = req.params.id;
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found.'
      });
    }

    // Delete file from filesystem if exists
    if (resume.filePath && fs.existsSync(resume.filePath)) {
      try {
        fs.unlinkSync(resume.filePath);
      } catch (fErr) {
        console.warn('[File Warning] Failed to delete resume file:', fErr.message);
      }
    }

    // Delete JobMatch records
    await JobMatch.deleteMany({ resumeId: resume._id });

    // Delete Resume document
    await Resume.findByIdAndDelete(resume._id);

    // Invalidate Redis Cache
    await invalidateResumeCache(resumeId);

    return res.status(200).json({
      success: true,
      message: 'Resume and associated analysis data deleted successfully.'
    });
  } catch (err) {
    console.error('[Resume Controller Error - Delete]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete resume.'
    });
  }
};

module.exports = {
  uploadResume,
  getUserResumes,
  getResumeById,
  getResumeStatus,
  getResumeAnalysis,
  getResumeSkillGap,
  deleteResume
};
