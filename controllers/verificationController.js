import { validationResult } from 'express-validator';
import User from '../models/User.js';
import Token from '../models/Token.js';
import { sendVerificationEmail, sendWelcomeEmail } from '../utils/emailService.js';

// @desc    Send email verification OTP
// @route   POST /api/auth/send-verification-email
// @access  Private
export const sendEmailVerificationOTP = async (req, res) => {
  try {
    console.log('Send verification email request received for user:', req.user?.id);

    const user = await User.findById(req.user.id);

    if (!user) {
      console.log('User not found:', req.user.id);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('User found:', user.email, 'isVerified:', user.isVerified);

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Delete any existing verification tokens for this user
    await Token.deleteMany({
      userId: user._id,
      type: 'email_verification'
    });

    // Create new verification token
    const tokenData = Token.createToken(user._id, 'email_verification');
    console.log('Token created with OTP:', tokenData.otp);
    await Token.create(tokenData);

    // Send verification email
    console.log('Calling sendVerificationEmail with:', {
      email: user.email,
      otp: tokenData.otp,
      name: user.name
    });

    const emailResult = await sendVerificationEmail(user.email, tokenData.otp, user.name);
    console.log('Email result:', emailResult);

    if (!emailResult.success) {
      console.log('Email sending failed, error:', emailResult.error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.'
      });
    }

    console.log('Email sent successfully, messageId:', emailResult.messageId);

    // 🟢 DEVELOPMENT MODE: Display OTP in console
    console.log('\n' + '='.repeat(50));
    console.log('📧 EMAIL VERIFICATION OTP SENT');
    console.log('='.repeat(50));
    console.log(`👤 User: ${user.email}`);
    console.log(`🔐 OTP: ${tokenData.otp}`);
    console.log(`⏱️  Expires in: 10 minutes`);
    console.log('='.repeat(50) + '\n');

    const response = {
      success: true,
      message: 'Verification OTP sent to your email',
      expiresIn: '10 minutes'
    };

    // 🟢 DEVELOPMENT MODE: Include OTP in response
    if (process.env.NODE_ENV === 'development') {
      response.otp = tokenData.otp;
      response.note = '⚠️  OTP shown only in DEVELOPMENT mode';
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Send verification OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending verification OTP'
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
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { otp } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Find valid token
    const token = await Token.findOne({
      userId: user._id,
      type: 'email_verification',
      otp: otp,
      expiresAt: { $gt: new Date() }
    });

    if (!token) {
      // 🔴 DEVELOPMENT MODE: Log failed OTP attempt
      console.log(`\n❌ INVALID OTP ATTEMPT - User: ${user.email}, OTP: ${otp}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Update user verification status
    user.isVerified = true;
    await user.save();

    // Delete the used token
    await Token.deleteOne({ _id: token._id });

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);

    // 🟢 DEVELOPMENT MODE: Success log
    console.log('\n' + '='.repeat(50));
    console.log('✅ EMAIL VERIFICATION SUCCESS');
    console.log('='.repeat(50));
    console.log(`👤 User: ${user.email}`);
    console.log(`🔐 OTP: ${otp}`);
    console.log('='.repeat(50) + '\n');

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during email verification'
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
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Check if there's a recent token (to prevent spam)
    const recentToken = await Token.findOne({
      userId: user._id,
      type: 'email_verification',
      createdAt: { $gt: new Date(Date.now() - 60 * 1000) } // Within last 1 minute
    });

    if (recentToken) {
      return res.status(429).json({
        success: false,
        message: 'Please wait at least 1 minute before requesting a new OTP'
      });
    }

    // Delete any existing verification tokens
    await Token.deleteMany({
      userId: user._id,
      type: 'email_verification'
    });

    // Create new token
    const tokenData = Token.createToken(user._id, 'email_verification');
    await Token.create(tokenData);

    // Send verification email
    const emailResult = await sendVerificationEmail(user.email, tokenData.otp, user.name);

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.'
      });
    }

    // 🟢 DEVELOPMENT MODE: Display new OTP in console
    console.log('\n' + '='.repeat(50));
    console.log('📧 NEW EMAIL VERIFICATION OTP SENT (RESEND)');
    console.log('='.repeat(50));
    console.log(`👤 User: ${user.email}`);
    console.log(`🔐 OTP: ${tokenData.otp}`);
    console.log(`⏱️  Expires in: 10 minutes`);
    console.log('='.repeat(50) + '\n');

    const response = {
      success: true,
      message: 'New verification OTP sent to your email',
      expiresIn: '10 minutes'
    };

    // 🟢 DEVELOPMENT MODE: Include OTP in response
    if (process.env.NODE_ENV === 'development') {
      response.otp = tokenData.otp;
      response.note = '⚠️  OTP shown only in DEVELOPMENT mode';
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Resend verification OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resending verification OTP'
    });
  }
};
