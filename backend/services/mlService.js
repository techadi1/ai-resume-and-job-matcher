const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Health check on ML service
 */
const checkHealth = async () => {
  try {
    const res = await client.get('/health');
    return res.data;
  } catch (err) {
    throw new Error(`ML Service health check failed: ${err.message}`);
  }
};

/**
 * Analyzes resume file or text via Python FastAPI service
 */
const analyzeResume = async ({ filePath, rawText }) => {
  try {
    console.log(`[ML Service] Requesting analysis for file: ${filePath || 'rawText'}`);
    const res = await client.post('/analyze-resume', { filePath, rawText });
    return res.data;
  } catch (err) {
    const detail = err.response?.data?.detail || err.message;
    console.error(`[ML Service Error] Failed to analyze resume: ${detail}`);
    throw new Error(`ML Service analysis error: ${detail}`);
  }
};

/**
 * Matches a resume against a list of jobs using TF-IDF and Cosine Similarity
 */
const matchJobs = async (resumeData, jobs, weights = null) => {
  try {
    console.log(`[ML Service] Requesting batch job matching for ${jobs.length} jobs`);
    const res = await client.post('/match-jobs', {
      resumeData,
      jobs,
      weights
    });
    return res.data;
  } catch (err) {
    const detail = err.response?.data?.detail || err.message;
    console.error(`[ML Service Error] Batch job matching error: ${detail}`);
    throw new Error(`ML Service matching error: ${detail}`);
  }
};

/**
 * Matches a single job
 */
const matchSingleJob = async (resumeData, job, weights = null) => {
  try {
    const res = await client.post('/match-job', {
      resumeData,
      job,
      weights
    });
    return res.data;
  } catch (err) {
    const detail = err.response?.data?.detail || err.message;
    console.error(`[ML Service Error] Single job match error: ${detail}`);
    throw new Error(`ML Service matching error: ${detail}`);
  }
};

module.exports = {
  checkHealth,
  analyzeResume,
  matchJobs,
  matchSingleJob
};
