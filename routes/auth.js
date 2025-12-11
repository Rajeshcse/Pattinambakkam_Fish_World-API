import express from "express";

import {
  register,
  login,
  getProfile,
  updateProfile,
  refreshAccessToken,
  logout,
  logoutAll,
} from "../controllers/authController.js";

import {
  sendEmailVerificationOTP,
  verifyEmail,
  resendEmailVerificationOTP,
  sendOtpToPhone,
  verifyPhoneOtp,
  resendPhoneOtp,
} from "../controllers/verificationController.js";

import {
  forgotPassword,
  resetPassword,
} from "../controllers/passwordController.js";

import { authenticateToken } from "../middleware/auth.js";

import {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validateVerifyEmail,
  validateChangePassword,
  validateRefreshToken,
  validateLogout,
  validateSendPhoneOtp,
  validateVerifyPhoneOtp,
  validateForgotPasswordEmail,
  validateResetPasswordCode,
} from "../middleware/validation.js";

const router = express.Router();
// revision
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/refresh-token", validateRefreshToken, refreshAccessToken);
router.post("/logout", authenticateToken, validateLogout, logout);
router.post("/logout-all", authenticateToken, logoutAll);
router.post(
  "/send-verification-email",
  authenticateToken,
  sendEmailVerificationOTP
);
router.post(
  "/verify-email",
  authenticateToken,
  validateVerifyEmail,
  verifyEmail
);
router.post(
  "/resend-verification-email",
  authenticateToken,
  resendEmailVerificationOTP
);
router.post("/change-password", authenticateToken, validateChangePassword);

// OpenAPI spec routes
router.post("/forgot-password", validateForgotPasswordEmail, forgotPassword);
router.post("/reset-password", validateResetPasswordCode, resetPassword);

router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, validateProfileUpdate, updateProfile);

router.post("/send-phone-otp", validateSendPhoneOtp, sendOtpToPhone);
router.post("/verify-phone-otp", validateVerifyPhoneOtp, verifyPhoneOtp);
router.post("/resend-phone-otp", validateSendPhoneOtp, resendPhoneOtp);

export default router;
