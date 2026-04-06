const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// @route   POST /api/auth/send-otp
router.post('/send-otp', authController.sendSignupOTP);

// @route   POST /api/auth/register
router.post('/register', authController.register);

// @route   POST /api/auth/login
router.post('/login', authController.login);

// @route   POST /api/auth/forgot-password
router.post('/forgot-password', authController.forgotPassword);

// @route   POST /api/auth/reset-password
router.post('/reset-password', authController.resetPassword);

// @route   POST /api/auth/social-sync
router.post('/social-sync', authController.socialSync);

// @route   GET /api/auth/test-email
router.get('/test-email', authController.testEmail);

// @route   PUT /api/auth/update
router.put('/update', authController.updateProfile);

// @route   POST /api/auth/send-report
router.post('/send-report', authController.sendReport);

module.exports = router;
