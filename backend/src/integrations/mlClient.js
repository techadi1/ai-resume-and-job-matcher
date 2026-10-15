/**
 * Python FastAPI ML Service Client with Circuit Breaker & Retries
 */

const axios = require('axios');
const env = require('../config/env');
const logger = require('../utils/logger');
const { MLServiceError } = require('../errors/AppError');

const CIRCUIT_STATES = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  HALF_OPEN: 'HALF_OPEN',
};

class MLClient {
  constructor() {
    this.baseUrl = env.ML_SERVICE_URL;
    this.timeout = env.ML_TIMEOUT;
    
    // Circuit Breaker State
    this.state = CIRCUIT_STATES.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.failureThreshold = 5;
    this.cooldownPeriodMs = 30000; // 30 seconds
    this.lastFailureTime = 0;

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  _checkCircuit() {
    const now = Date.now();
    if (this.state === CIRCUIT_STATES.OPEN) {
      if (now - this.lastFailureTime > this.cooldownPeriodMs) {
        logger.info('Circuit Breaker entering HALF_OPEN state');
        this.state = CIRCUIT_STATES.HALF_OPEN;
      } else {
        throw new MLServiceError('ML Service circuit breaker is OPEN. Temporarily unavailable.');
      }
    }
  }

  _recordSuccess() {
    if (this.state === CIRCUIT_STATES.HALF_OPEN) {
      this.successCount += 1;
      if (this.successCount >= 3) {
        logger.info('Circuit Breaker returned to CLOSED state');
        this.state = CIRCUIT_STATES.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
      }
    } else {
      this.failureCount = 0;
    }
  }

  _recordFailure(err) {
    this.lastFailureTime = Date.now();
    this.failureCount += 1;
    logger.warn({ failures: this.failureCount, err: err.message }, 'ML Service call failed');

    if (this.failureCount >= this.failureThreshold || this.state === CIRCUIT_STATES.HALF_OPEN) {
      this.state = CIRCUIT_STATES.OPEN;
      logger.error('Circuit Breaker tripped to OPEN state');
    }
  }

  async _requestWithRetry(fn, maxRetries = 2) {
    this._checkCircuit();

    let attempt = 0;
    while (attempt <= maxRetries) {
      try {
        const response = await fn();
        this._recordSuccess();
        return response.data;
      } catch (err) {
        attempt += 1;
        // Do not retry 4xx client errors
        if (err.response && err.response.status >= 400 && err.response.status < 500) {
          throw new MLServiceError(`ML Service client error: ${err.response.data?.detail || err.message}`);
        }

        if (attempt > maxRetries) {
          this._recordFailure(err);
          throw new MLServiceError(`ML Service failed after ${maxRetries} retries: ${err.message}`);
        }

        const backoffMs = Math.pow(2, attempt) * 500;
        logger.warn({ attempt, backoffMs }, 'Retrying ML request with backoff');
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
  }

  async analyzeResume({ filePath, rawText }) {
    return this._requestWithRetry(() =>
      this.client.post('/analyze-resume', { filePath, rawText })
    );
  }

  async matchJob({ resumeData, job, weights }) {
    return this._requestWithRetry(() =>
      this.client.post('/match-job', { resumeData, job, weights })
    );
  }

  async matchJobs({ resumeData, jobs, weights }) {
    return this._requestWithRetry(() =>
      this.client.post('/match-jobs', { resumeData, jobs, weights })
    );
  }

  async checkHealth() {
    try {
      const res = await this.client.get('/health', { timeout: 3000 });
      return res.data;
    } catch {
      return { status: 'down' };
    }
  }
}

module.exports = new MLClient();
