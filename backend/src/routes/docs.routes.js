/**
 * Swagger / OpenAPI Documentation Route (/api/docs)
 */

const express = require('express');
const router = express.Router();
const swaggerUi = require('swagger-ui-express');

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'AI Resume Analyzer & Job Matcher API',
    version: '1.0.0',
    description: 'Enterprise REST API for AI-powered resume parsing, ATS scoring, skill extraction, and candidate job matching.',
    contact: {
      name: 'Aditya Gupta',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API Version 1',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'VALIDATION_ERROR' },
              message: { type: 'string', example: 'Invalid request' },
              details: { type: 'array', items: { type: 'object' } },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string', example: 'Aditya Gupta' },
          email: { type: 'string', example: 'aditya@example.com' },
          role: { type: 'string', enum: ['USER', 'ADMIN'], example: 'USER' },
        },
      },
      ResumeUploadResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Resume uploaded and queued for analysis' },
          data: {
            type: 'object',
            properties: {
              resumeId: { type: 'string' },
              status: { type: 'string', example: 'QUEUED' },
            },
          },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        summary: 'Register a new user account',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'John Doe' },
                  email: { type: 'string', example: 'john@example.com' },
                  password: { type: 'string', minLength: 6, example: 'password123' },
                  confirmPassword: { type: 'string', example: 'password123' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User account created successfully' },
          400: { description: 'Validation error' },
          409: { description: 'Email already registered' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Log in and obtain JWT access & refresh tokens',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'testuser@example.com' },
                  password: { type: 'string', example: 'password123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Authenticated successfully' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/resumes/upload': {
      post: {
        summary: 'Upload a resume (PDF or DOCX) for asynchronous AI analysis',
        tags: ['Resumes'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  resume: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          202: { description: 'Accepted and queued for BullMQ background processing' },
          400: { description: 'Invalid file format or missing file' },
          413: { description: 'File size exceeds 10MB limit' },
        },
      },
    },
    '/jobs': {
      get: {
        summary: 'Search and paginate active tech job listings',
        tags: ['Jobs'],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'location', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'List of jobs with pagination metadata' },
        },
      },
    },
    '/jobs/recommended': {
      get: {
        summary: 'Get AI-ranked job recommendations for authenticated user resume',
        tags: ['Jobs'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'resumeId', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        ],
        responses: {
          200: { description: 'Ranked jobs with match scores and skill gap' },
        },
      },
    },
  },
};

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerDocument));

module.exports = router;
