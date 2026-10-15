/**
 * User Profile Routes (/api/v1/users)
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/profile', (req, res, next) => userController.getProfile(req, res, next));
router.patch('/profile', (req, res, next) => userController.updateProfile(req, res, next));
router.get('/activity', (req, res, next) => userController.getActivity(req, res, next));

module.exports = router;
