import express from 'express';

import {
  register,
  login,
  getProfile,
  updateProfile,
  refreshAccessToken,
  logout,
  logoutAll
} from '../controllers/authController.js';

import {
  sendEmailVerificationOTP,
  verifyEmail,
  resendEmailVerificationOTP
} from '../controllers/verificationController.js';

import {
  sendPhoneVerificationOTP,
  verifyPhone,
  resendPhoneVerificationOTP
} from '../controllers/phoneVerificationController.js';

import {
  forgotPassword,
  resetPassword,
  changePassword
} from '../controllers/passwordController.js';

import { authenticateToken } from '../middleware/auth.js';

import {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validateVerifyEmail,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateRefreshToken,
  validateLogout
} from '../middleware/validation.js';

import {
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
  otpLimiter,
  profileUpdateLimiter
} from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', registerLimiter, validateRegister, register);
router.post('/login', loginLimiter, validateLogin, login);
router.post('/refresh-token', validateRefreshToken, refreshAccessToken);
router.post('/logout', authenticateToken, validateLogout, logout);
router.post('/logout-all', authenticateToken, logoutAll);
router.post('/send-verification-email', authenticateToken, otpLimiter, sendEmailVerificationOTP);
router.post('/verify-email', authenticateToken, otpLimiter, validateVerifyEmail, verifyEmail);
router.post('/resend-verification-email', authenticateToken, otpLimiter, resendEmailVerificationOTP);

router.post('/send-verification-sms', authenticateToken, otpLimiter, sendPhoneVerificationOTP);
router.post('/verify-phone', authenticateToken, otpLimiter, validateVerifyEmail, verifyPhone);
router.post('/resend-verification-sms', authenticateToken, otpLimiter, resendPhoneVerificationOTP);

router.post('/forgot-password', passwordResetLimiter, validateForgotPassword, forgotPassword);
router.post('/reset-password', passwordResetLimiter, validateResetPassword, resetPassword);
router.post('/change-password', authenticateToken, passwordResetLimiter, validateChangePassword, changePassword);

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, profileUpdateLimiter, validateProfileUpdate, updateProfile);

export default router;
