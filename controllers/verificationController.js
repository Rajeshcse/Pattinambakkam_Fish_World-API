import { validationResult } from "express-validator";
import User from "../models/User.js";
import Token from "../models/Token.js";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../utils/emailService.js";

// @desc    Send email verification OTP
// @route   POST /api/auth/send-verification-email
// @access  Private
export const sendEmailVerificationOTP = async (req, res) => {
  try {
    console.log(
      "Send verification email request received for user:",
      req.user?.id
    );

    const user = await User.findById(req.user.id);

    if (!user) {
      console.log("User not found:", req.user.id);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("User found:", user.email, "isVerified:", user.isVerified);

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Delete any existing verification tokens for this user
    await Token.deleteMany({
      userId: user._id,
      type: "email_verification",
    });

    // Create new verification token
    const tokenData = Token.createToken(user._id, "email_verification");
    console.log("Token created with OTP:", tokenData.otp);
    await Token.create(tokenData);

    // Send verification email
    console.log("Calling sendVerificationEmail with:", {
      email: user.email,
      otp: tokenData.otp,
      name: user.name,
    });

    const emailResult = await sendVerificationEmail(
      user.email,
      tokenData.otp,
      user.name
    );
    console.log("Email result:", emailResult);

    if (!emailResult.success) {
      console.log("Email sending failed, error:", emailResult.error);
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again.",
      });
    }

    console.log("Email sent successfully, messageId:", emailResult.messageId);

    res.status(200).json({
      success: true,
      message: "Verification OTP sent to your email",
      expiresIn: "10 minutes",
    });
  } catch (error) {
    console.error("Send verification OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while sending verification OTP",
    });
  }
};

// @desc    Verify email with OTP
// @route   POST /api/auth/verify-email
// @access  Private
export const verifyEmail = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { otp } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Find valid token
    const token = await Token.findOne({
      userId: user._id,
      type: "email_verification",
      otp: otp,
      expiresAt: { $gt: new Date() },
    });

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Update user verification status
    user.isVerified = true;
    await user.save();

    // Delete the used token
    await Token.deleteOne({ _id: token._id });

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during email verification",
    });
  }
};

// @desc    Resend email verification OTP
// @route   POST /api/auth/resend-verification-email
// @access  Private
export const resendEmailVerificationOTP = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Check if there's a recent token (to prevent spam)
    const recentToken = await Token.findOne({
      userId: user._id,
      type: "email_verification",
      createdAt: { $gt: new Date(Date.now() - 60 * 1000) }, // Within last 1 minute
    });

    if (recentToken) {
      return res.status(429).json({
        success: false,
        message: "Please wait at least 1 minute before requesting a new OTP",
      });
    }

    // Delete any existing verification tokens
    await Token.deleteMany({
      userId: user._id,
      type: "email_verification",
    });

    // Create new token
    const tokenData = Token.createToken(user._id, "email_verification");
    await Token.create(tokenData);

    // Send verification email
    const emailResult = await sendVerificationEmail(
      user.email,
      tokenData.otp,
      user.name
    );

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again.",
      });
    }

    res.status(200).json({
      success: true,
      message: "New verification OTP sent to your email",
      expiresIn: "10 minutes",
    });
  } catch (error) {
    console.error("Resend verification OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while resending verification OTP",
    });
  }
};

// @desc    Send phone verification OTP
// @route   POST /api/auth/send-phone-otp
// @access  Public
export const sendOtpToPhone = async (req, res) => {
  try {
    const { phone } = req.body;

    // Validate phone
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Check if user with this phone exists
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this phone number",
      });
    }

    // Delete any existing phone verification tokens
    await Token.deleteMany({
      userId: user._id,
      type: "phone_verification",
    });

    // Create new verification token
    const tokenData = Token.createToken(user._id, "phone_verification");
    await Token.create(tokenData);

    // Display OTP in terminal for development
    console.log("\n========================================");
    console.log("📱 PHONE VERIFICATION OTP (TERMINAL DISPLAY)");
    console.log("========================================");
    console.log("User Phone:", user.phone);
    console.log("User Name:", user.name);
    console.log("OTP Code:", tokenData.otp);
    console.log("Expires in: 10 minutes");
    console.log("========================================\n");

    return res.status(200).json({
      success: true,
      message: "Verification OTP sent to your phone",
      expiresIn: "10 minutes",
    });
  } catch (error) {
    console.error("Send OTP to phone error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send verification OTP. Please try again.",
    });
  }
};

// @desc    Verify phone OTP
// @route   POST /api/auth/verify-phone-otp
// @access  Public
export const verifyPhoneOtp = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { phone, otp } = req.body;

    // Find user by phone
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Find valid token
    const token = await Token.findOne({
      userId: user._id,
      type: "phone_verification",
      otp: otp,
      expiresAt: { $gt: new Date() },
    });

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Delete the used token
    await Token.deleteOne({ _id: token._id });

    return res.status(200).json({
      success: true,
      message: "Phone number verified successfully",
    });
  } catch (error) {
    console.error("Verify phone OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during phone verification",
    });
  }
};

// @desc    Resend phone verification OTP
// @route   POST /api/auth/resend-phone-otp
// @access  Public
export const resendPhoneOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    // Validate phone
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Check if user with this phone exists
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this phone number",
      });
    }

    // Check if there's a recent token (to prevent spam)
    const recentToken = await Token.findOne({
      userId: user._id,
      type: "phone_verification",
      createdAt: { $gt: new Date(Date.now() - 60 * 1000) }, // Within last 1 minute
    });

    if (recentToken) {
      return res.status(429).json({
        success: false,
        message: "Please wait at least 1 minute before requesting a new OTP",
      });
    }

    // Delete any existing phone verification tokens
    await Token.deleteMany({
      userId: user._id,
      type: "phone_verification",
    });

    // Create new verification token
    const tokenData = Token.createToken(user._id, "phone_verification");
    await Token.create(tokenData);

    // Display OTP in terminal for development
    console.log("\n========================================");
    console.log("📱 PHONE VERIFICATION OTP (TERMINAL DISPLAY)");
    console.log("========================================");
    console.log("User Phone:", user.phone);
    console.log("User Name:", user.name);
    console.log("OTP Code:", tokenData.otp);
    console.log("Expires in: 10 minutes");
    console.log("========================================\n");

    return res.status(200).json({
      success: true,
      message: "New verification OTP sent to your phone",
      expiresIn: "10 minutes",
    });
  } catch (error) {
    console.error("Resend phone OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send verification OTP. Please try again.",
    });
  }
};
