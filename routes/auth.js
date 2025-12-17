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

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/refresh-token', validateRefreshToken, refreshAccessToken);
router.post('/logout', authenticateToken, validateLogout, logout);
router.post('/logout-all', authenticateToken, logoutAll);
router.post('/send-verification-email', authenticateToken, sendEmailVerificationOTP);
router.post('/verify-email', authenticateToken, validateVerifyEmail, verifyEmail);
router.post('/resend-verification-email', authenticateToken, resendEmailVerificationOTP);

router.post('/send-verification-sms', authenticateToken, sendPhoneVerificationOTP);
router.post('/verify-phone', authenticateToken, validateVerifyEmail, verifyPhone);
router.post('/resend-verification-sms', authenticateToken, resendPhoneVerificationOTP);

router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);
router.post('/change-password', authenticateToken, validateChangePassword, changePassword);

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, validateProfileUpdate, updateProfile);

export default router;
