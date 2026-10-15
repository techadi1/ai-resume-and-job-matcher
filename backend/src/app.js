/**
 * Express Application Configuration
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

const env = require('./config/env');
const requestIdMiddleware = require('./middleware/requestId');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

// Routes
const authRoutes = require('./routes/auth.routes');
const resumeRoutes = require('./routes/resume.routes');
const jobRoutes = require('./routes/job.routes');
const userRoutes = require('./routes/user.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const healthRoutes = require('./routes/health.routes');
const docsRoutes = require('./routes/docs.routes');

const app = express();

// Ensure local uploads directory exists
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 1. Trust Proxy Configuration for Azure Front Door / Load Balancers
app.set('trust proxy', 1);

// 2. Security Headers (Helmet)
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false, // Allows Swagger UI to execute inline styles
  })
);

// 3. CORS Configuration
app.use(
  cors({
    origin: env.CLIENT_URL === '*' ? true : [env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  })
);

// 4. Body Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Request Correlation ID & Structured Logging
app.use(requestIdMiddleware);

// 6. Static File Serving (for local development resume inspection)
app.use('/uploads', express.static(uploadsDir));

// 7. Health & Telemetry Probes
app.use('/', healthRoutes);
app.use('/api', healthRoutes);

// 8. Swagger / OpenAPI Documentation
app.use('/api/docs', docsRoutes);

// 9. Versioned REST API Routes (/api/v1/)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/resumes', resumeRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// 10. Backward Compatibility Routes (/api/*)
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 11. 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `API endpoint '${req.originalUrl}' does not exist.`,
    },
  });
});

// 12. Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
