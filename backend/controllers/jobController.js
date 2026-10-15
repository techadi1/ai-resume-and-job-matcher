const Job = require('../models/Job');
const JobMatch = require('../models/JobMatch');
const SavedJob = require('../models/SavedJob');
const Resume = require('../models/Resume');
const { get, set } = require('../services/redisService');

/**
 * Get filtered and searched jobs with optional resume match ranking
 * GET /api/jobs
 */
const getJobs = async (req, res) => {
  try {
    const {
      search,
      location,
      skill,
      type,
      experience,
      minMatch,
      sortBy = 'match',
      resumeId: queryResumeId
    } = req.query;

    const filter = {};

    // Text / keyword search
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (type) {
      filter.type = type;
    }

    if (experience) {
      filter.experience = { $regex: experience, $options: 'i' };
    }

    if (skill) {
      filter.requiredSkills = { $in: [new RegExp(skill, 'i')] };
    }

    // Determine target resume for match scores
    let targetResumeId = queryResumeId;
    if (!targetResumeId && req.user) {
      const latestResume = await Resume.findOne({
        userId: req.user._id,
        analysisStatus: 'COMPLETED'
      }).sort({ createdAt: -1 });

      if (latestResume) {
        targetResumeId = latestResume._id;
      }
    }

    // Fetch base jobs matching query filters
    let jobs = await Job.find(filter).lean();

    // Map matches if target resume exists
    let matchMap = new Map();
    if (targetResumeId) {
      const matches = await JobMatch.find({ resumeId: targetResumeId }).lean();
      matches.forEach((m) => {
        matchMap.set(m.jobId.toString(), m);
      });
    }

    // Check saved status for authenticated user
    let savedJobSet = new Set();
    if (req.user) {
      const saved = await SavedJob.find({ userId: req.user._id }).lean();
      saved.forEach((s) => savedJobSet.add(s.jobId.toString()));
    }

    // Merge match percentage and details into jobs
    let enhancedJobs = jobs.map((job) => {
      const m = matchMap.get(job._id.toString());
      return {
        ...job,
        id: job._id,
        isSaved: savedJobSet.has(job._id.toString()),
        matchPercentage: m ? m.matchPercentage : null,
        similarityScore: m ? m.similarityScore : null,
        skillScore: m ? m.skillScore : null,
        experienceScore: m ? m.experienceScore : null,
        matchedSkills: m ? m.matchedSkills : [],
        missingSkills: m ? m.missingSkills : []
      };
    });

    // Min match filter
    if (minMatch) {
      const minVal = parseInt(minMatch, 10);
      enhancedJobs = enhancedJobs.filter(
        (j) => j.matchPercentage !== null && j.matchPercentage >= minVal
      );
    }

    // Sorting
    if (sortBy === 'match') {
      enhancedJobs.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
    } else if (sortBy === 'newest') {
      enhancedJobs.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
    }

    return res.status(200).json({
      success: true,
      count: enhancedJobs.length,
      targetResumeId: targetResumeId || null,
      jobs: enhancedJobs
    });
  } catch (err) {
    console.error('[Job Controller Error - getJobs]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve jobs.'
    });
  }
};

/**
 * Get single job details with match breakdown
 * GET /api/jobs/:id
 */
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).lean();
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job listing not found.'
      });
    }

    let matchInfo = null;
    let isSaved = false;

    if (req.user) {
      // Check saved
      const savedDoc = await SavedJob.findOne({
        userId: req.user._id,
        jobId: job._id
      });
      isSaved = !!savedDoc;

      // Check latest resume match
      const latestResume = await Resume.findOne({
        userId: req.user._id,
        analysisStatus: 'COMPLETED'
      }).sort({ createdAt: -1 });

      if (latestResume) {
        matchInfo = await JobMatch.findOne({
          resumeId: latestResume._id,
          jobId: job._id
        }).lean();
      }
    }

    return res.status(200).json({
      success: true,
      job: {
        ...job,
        id: job._id,
        isSaved,
        matchPercentage: matchInfo ? matchInfo.matchPercentage : null,
        similarityScore: matchInfo ? matchInfo.similarityScore : null,
        skillScore: matchInfo ? matchInfo.skillScore : null,
        experienceScore: matchInfo ? matchInfo.experienceScore : null,
        matchedSkills: matchInfo ? matchInfo.matchedSkills : [],
        missingSkills: matchInfo ? matchInfo.missingSkills : [],
        missingRequiredSkills: matchInfo ? matchInfo.missingRequiredSkills : []
      }
    });
  } catch (err) {
    console.error('[Job Controller Error - getJobById]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve job details.'
    });
  }
};

/**
 * Get top recommended jobs for user's latest resume
 * GET /api/jobs/recommended
 */
const getRecommendedJobs = async (req, res) => {
  try {
    const { resumeId: queryResumeId } = req.query;

    let resume = null;
    if (queryResumeId) {
      resume = await Resume.findOne({ _id: queryResumeId, userId: req.user._id });
    } else {
      resume = await Resume.findOne({
        userId: req.user._id,
        analysisStatus: 'COMPLETED'
      }).sort({ createdAt: -1 });
    }

    if (!resume) {
      return res.status(200).json({
        success: true,
        message: 'No completed resume found. Upload a resume to receive tailored recommendations.',
        recommendedJobs: []
      });
    }

    const cacheKey = `resume:${resume._id}:recommended-jobs`;
    const cached = await get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        source: 'cache',
        resumeId: resume._id,
        recommendedJobs: cached
      });
    }

    // Fetch top 10 matches
    const topMatches = await JobMatch.find({ resumeId: resume._id })
      .populate('jobId')
      .sort({ matchPercentage: -1 })
      .limit(10)
      .lean();

    const formattedMatches = topMatches
      .filter((m) => m.jobId)
      .map((m) => ({
        jobId: m.jobId._id,
        id: m.jobId._id,
        title: m.jobId.title,
        company: m.jobId.company,
        location: m.jobId.location,
        type: m.jobId.type,
        salary: m.jobId.salary,
        experience: m.jobId.experience,
        description: m.jobId.description,
        applicationUrl: m.jobId.applicationUrl,
        matchPercentage: m.matchPercentage,
        similarityScore: m.similarityScore,
        skillScore: m.skillScore,
        experienceScore: m.experienceScore,
        matchedSkills: m.matchedSkills,
        missingSkills: m.missingSkills
      }));

    if (formattedMatches.length > 0) {
      await set(cacheKey, formattedMatches, 3600);
    }

    return res.status(200).json({
      success: true,
      source: 'database',
      resumeId: resume._id,
      recommendedJobs: formattedMatches
    });
  } catch (err) {
    console.error('[Job Controller Error - getRecommendedJobs]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve job recommendations.'
    });
  }
};

/**
 * Save a job to user's saved jobs list
 * POST /api/jobs/:id/save
 */
const saveJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job listing not found.'
      });
    }

    await SavedJob.findOneAndUpdate(
      { userId: req.user._id, jobId: job._id },
      { userId: req.user._id, jobId: job._id },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Job saved successfully.',
      jobId: job._id
    });
  } catch (err) {
    console.error('[Job Controller Error - saveJob]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to save job.'
    });
  }
};

/**
 * Remove a job from user's saved list
 * DELETE /api/jobs/:id/save
 */
const unsaveJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    await SavedJob.findOneAndDelete({
      userId: req.user._id,
      jobId
    });

    return res.status(200).json({
      success: true,
      message: 'Job removed from saved list.',
      jobId
    });
  } catch (err) {
    console.error('[Job Controller Error - unsaveJob]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to unsave job.'
    });
  }
};

/**
 * Get all saved jobs for current user
 * GET /api/jobs/saved
 */
const getSavedJobs = async (req, res) => {
  try {
    const savedDocs = await SavedJob.find({ userId: req.user._id })
      .populate('jobId')
      .sort({ createdAt: -1 })
      .lean();

    // Check latest resume for matches
    const latestResume = await Resume.findOne({
      userId: req.user._id,
      analysisStatus: 'COMPLETED'
    }).sort({ createdAt: -1 });

    let matchMap = new Map();
    if (latestResume) {
      const matches = await JobMatch.find({ resumeId: latestResume._id }).lean();
      matches.forEach((m) => matchMap.set(m.jobId.toString(), m));
    }

    const savedJobs = savedDocs
      .filter((s) => s.jobId)
      .map((s) => {
        const m = matchMap.get(s.jobId._id.toString());
        return {
          id: s.jobId._id,
          _id: s.jobId._id,
          savedAt: s.createdAt,
          isSaved: true,
          title: s.jobId.title,
          company: s.jobId.company,
          location: s.jobId.location,
          type: s.jobId.type,
          salary: s.jobId.salary,
          experience: s.jobId.experience,
          description: s.jobId.description,
          applicationUrl: s.jobId.applicationUrl,
          requiredSkills: s.jobId.requiredSkills || [],
          matchPercentage: m ? m.matchPercentage : null,
          matchedSkills: m ? m.matchedSkills : [],
          missingSkills: m ? m.missingSkills : []
        };
      });

    return res.status(200).json({
      success: true,
      count: savedJobs.length,
      savedJobs
    });
  } catch (err) {
    console.error('[Job Controller Error - getSavedJobs]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve saved jobs.'
    });
  }
};

module.exports = {
  getJobs,
  getJobById,
  getRecommendedJobs,
  saveJob,
  unsaveJob,
  getSavedJobs
};
