/**
 * k6 Distributed Load Testing Script
 * Execute with: k6 run load-tests/load-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up to 20 virtual users
    { duration: '1m', target: 50 },   // Sustained load with 50 users
    { duration: '30s', target: 100 }, // Peak traffic spike
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<400'], // 95% of requests must complete below 400ms
    http_req_failed: ['rate<0.01'],    // Error rate must be below 1%
  },
};

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:5001/api/v1';

export default function () {
  // 1. Test public jobs catalog endpoint (cached/indexed query)
  const jobsRes = http.get(`${BASE_URL}/jobs?limit=20`);
  check(jobsRes, {
    'jobs query status is 200': (r) => r.status === 200,
    'jobs returned array': (r) => JSON.parse(r.body).jobs.length > 0,
  });

  // 2. Test user login endpoint (password hashing & rate limiting)
  const loginPayload = JSON.stringify({
    email: 'testuser@example.com',
    password: 'Password123!',
  });

  const loginRes = http.post(`${BASE_URL}/auth/login`, loginPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'login returned JWT token': (r) => JSON.parse(r.body).token !== undefined,
  });

  sleep(1);
}
