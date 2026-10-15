const Resume = require('../models/Resume');
const JobMatch = require('../models/JobMatch');
const Job = require('../models/Job');
const { get, set } = require('../services/redisService');

/**
 * Aggregates dashboard analytics for authenticated user
 * GET /api/dashboard/summary
 */
const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const cacheKey = `dashboard:summary:${userId}`;

    // Check Redis cache (short TTL of 60s for real-time reactivity)
    const cached = await get(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, source: 'cache', ...cached });
    }

    // 1. Fetch latest completed resume
    const latestResume = await Resume.findOne({
      userId,
      analysisStatus: 'COMPLETED'
    }).sort({ createdAt: -1 });

    const totalResumes = await Resume.countDocuments({ userId });

    let resumeScore = 0;
    let detectedSkills = [];
    let jobsMatchedCount = 0;
    let topJobs = [];
    let missingSkills = [];
    let recommendedSkills = [];
    let scoreBreakdown = {
      skills: { score: 0, max: 30 },
      projects: { score: 0, max: 20 },
      experience: { score: 0, max: 20 },
      education: { score: 0, max: 10 },
      certifications: { score: 0, max: 10 },
      completeness: { score: 0, max: 10 }
    };
    let suggestions = [];
    let strengths = [];
    let weaknesses = [];
    let matchDistribution = [
      { range: '90-100%', count: 0 },
      { range: '80-89%', count: 0 },
      { range: '70-79%', count: 0 },
      { range: '<70%', count: 0 }
    ];

    if (latestResume) {
      resumeScore = latestResume.resumeScore || 0;
      detectedSkills = latestResume.skills || [];

      // Fetch matches for latest resume
      const matches = await JobMatch.find({ resumeId: latestResume._id })
        .populate('jobId')
        .sort({ matchPercentage: -1 });

      jobsMatchedCount = matches.length;

      // Match Distribution
      matches.forEach((m) => {
        if (m.matchPercentage >= 90) matchDistribution[0].count++;
        else if (m.matchPercentage >= 80) matchDistribution[1].count++;
        else if (m.matchPercentage >= 70) matchDistribution[2].count++;
        else matchDistribution[3].count++;
      });

      // Top 5 matched jobs
      topJobs = matches.slice(0, 5).map((m) => ({
        id: m.jobId ? m.jobId._id : m._id,
        title: m.jobId ? m.jobId.title : 'Software Role',
        company: m.jobId ? m.jobId.company : 'Tech Company',
        location: m.jobId ? m.jobId.location : 'Remote',
        salary: m.jobId ? m.jobId.salary : '',
        type: m.jobId ? m.jobId.type : 'Full-time',
        matchPercentage: m.matchPercentage,
        similarityScore: m.similarityScore,
        skillScore: m.skillScore,
        experienceScore: m.experienceScore,
        matchedSkills: m.matchedSkills || [],
        missingSkills: m.missingSkills || []
      }));

      // Analysis breakdown & suggestions
      if (latestResume.analysisResult) {
        if (latestResume.analysisResult.scoreBreakdown) {
          scoreBreakdown = latestResume.analysisResult.scoreBreakdown;
        }
        suggestions = latestResume.analysisResult.recommendations || [];
        strengths = latestResume.analysisResult.strengths || [];
        weaknesses = latestResume.analysisResult.weaknesses || [];

        if (latestResume.analysisResult.skillGap) {
          missingSkills = latestResume.analysisResult.skillGap.topMissingSkills || [];
          recommendedSkills = latestResume.analysisResult.skillGap.recommendedSkills || [];
        }
      }
    }

    // Category distribution for detected skills
    const skillCategories = {
      Languages: 0,
      Web: 0,
      Cloud: 0,
      Data: 0,
      Other: 0
    };

    detectedSkills.forEach((s) => {
      const lower = s.toLowerCase();
      if (['python', 'java', 'javascript', 'typescript', 'c', 'c++', 'c#', 'go', 'rust', 'sql'].includes(lower)) {
        skillCategories.Languages++;
      } else if (['react', 'node.js', 'express', 'vue', 'angular', 'next.js', 'html', 'css'].includes(lower)) {
        skillCategories.Web++;
      } else if (['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'linux', 'ci/cd'].includes(lower)) {
        skillCategories.Cloud++;
      } else if (['pandas', 'numpy', 'scikit-learn', 'pytorch', 'tensorflow', 'machine learning', 'nlp'].includes(lower)) {
        skillCategories.Data++;
      } else {
        skillCategories.Other++;
      }
    });

    const skillDistribution = Object.entries(skillCategories)
      .filter(([_, count]) => count > 0)
      .map(([name, value]) => ({ name, value }));

    const data = {
      userName: req.user.name,
      totalResumes,
      latestResume: latestResume
        ? {
            id: latestResume._id,
            fileName: latestResume.fileName,
            resumeScore: latestResume.resumeScore,
            createdAt: latestResume.createdAt
          }
        : null,
      resumeScore,
      skillsDetectedCount: detectedSkills.length,
      skillsDetected: detectedSkills,
      jobsMatchedCount,
      missingSkillsCount: missingSkills.length,
      missingSkills,
      topJobs,
      recommendedSkills,
      scoreBreakdown,
      suggestions,
      strengths,
      weaknesses,
      matchDistribution,
      skillDistribution
    };

    // Cache in Redis for 60 seconds
    await set(cacheKey, data, 60);

    return res.status(200).json({
      success: true,
      source: 'database',
      ...data
    });
  } catch (err) {
    console.error('[Dashboard Controller Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate dashboard summary.'
    });
  }
};

module.exports = {
  getDashboardSummary
};
