/**
 * Application Constants
 */

const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
};

const RESUME_STATUS = {
  UPLOADED: 'UPLOADED',
  QUEUED: 'QUEUED',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
};

const STORAGE_PROVIDERS = {
  LOCAL: 'LOCAL',
  AZURE_BLOB: 'AZURE_BLOB',
};

const AUDIT_ACTIONS = {
  USER_REGISTERED: 'USER_REGISTERED',
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  RESUME_UPLOADED: 'RESUME_UPLOADED',
  RESUME_ANALYSIS_STARTED: 'RESUME_ANALYSIS_STARTED',
  RESUME_ANALYSIS_COMPLETED: 'RESUME_ANALYSIS_COMPLETED',
  RESUME_ANALYSIS_FAILED: 'RESUME_ANALYSIS_FAILED',
  JOB_CREATED: 'JOB_CREATED',
  JOB_UPDATED: 'JOB_UPDATED',
  JOB_DEACTIVATED: 'JOB_DEACTIVATED',
  JOB_SAVED: 'JOB_SAVED',
};

const QUEUES = {
  RESUME_ANALYSIS: 'resume-analysis',
};

const CACHE_KEYS = {
  RESUME_ANALYSIS: (resumeId) => `resume:${resumeId}:analysis`,
  RESUME_RECOMMENDATIONS: (resumeId) => `resume:${resumeId}:recommendations`,
  RESUME_SKILL_GAP: (resumeId) => `resume:${resumeId}:skill-gap`,
  JOB_DETAIL: (jobId) => `job:${jobId}`,
  JOBS_LIST: (hash) => `jobs:list:${hash}`,
  DASHBOARD_SUMMARY: (userId) => `dashboard:${userId}:summary`,
};

const CACHE_TTL = {
  SHORT: 300,        // 5 minutes
  MEDIUM: 1800,      // 30 minutes
  LONG: 86400,       // 24 hours
};

const ALGORITHM_WEIGHTS = {
  TEXT_SIMILARITY: 0.40,
  SKILL_MATCH: 0.40,
  EXPERIENCE_RELEVANCE: 0.20,
};

module.exports = {
  ROLES,
  RESUME_STATUS,
  STORAGE_PROVIDERS,
  AUDIT_ACTIONS,
  QUEUES,
  CACHE_KEYS,
  CACHE_TTL,
  ALGORITHM_WEIGHTS,
};
