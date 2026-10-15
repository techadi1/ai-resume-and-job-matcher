/**
 * Dashboard & Analytics Routes (/api/v1/dashboard)
 */

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/summary', (req, res, next) => dashboardController.getSummary(req, res, next));
router.get('/stats', (req, res, next) => dashboardController.getSummary(req, res, next));
router.get('/skill-gap', (req, res, next) => dashboardController.getSkillGap(req, res, next));

module.exports = router;
