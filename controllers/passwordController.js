import { validationResult } from 'express-validator';
import User from '../models/User.js';
import Token from '../models/Token.js';
import { sendPasswordResetEmail } from '../utils/emailService.js';
import { sendVerificationSMS } from '../utils/smsService.js';

const isEmail = (identifier) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(identifier);
};

const isPhone = (identifier) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(identifier);
};

export const forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email or phone number'
      });
    }

    let user;

    if (isEmail(identifier)) {
      user = await User.findOne({ email: identifier });
    } else if (isPhone(identifier)) {
      user = await User.findOne({ phone: identifier });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email or phone number'
      });
    }

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists, a password reset OTP has been sent to your registered phone number',
        method: 'phone'
      });
    }

    await Token.deleteMany({
      userId: user._id,
      type: 'password_reset'
    });

    const tokenData = Token.createToken(user._id, 'password_reset');
    await Token.create(tokenData);

    if (process.env.NODE_ENV === 'development') {
      console.log('\n' + '='.repeat(50));
      console.log('🔐 PASSWORD RESET OTP REQUESTED');
      console.log('='.repeat(50));
      console.log(`👤 User: ${user.name}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`📱 Phone: ${user.phone}`);
      console.log(`🔐 OTP: ${tokenData.otp}`);
      console.log(`📤 Sending via: PHONE (SMS)`);
      console.log(`⏱️  Expires in: 10 minutes`);
      console.log('='.repeat(50) + '\n');
    }

    // Always send OTP to phone for password reset
    const sendResult = await sendVerificationSMS(user.phone, tokenData.otp, user.name);
    if (!sendResult.success) {
      console.error('Failed to send password reset SMS:', sendResult.error);
    }

    const response = {
      success: true,
      message: 'If an account exists, a password reset OTP has been sent to your registered phone number via SMS',
      expiresIn: '10 minutes',
      method: 'phone'
    };

    if (process.env.NODE_ENV === 'development') {
      response.otp = tokenData.otp;
      response.note = '⚠️  OTP shown only in DEVELOPMENT mode';
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing password reset request'
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { identifier, otp, newPassword } = req.body;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email or phone number'
      });
    }

    let user;

    if (isEmail(identifier)) {
      user = await User.findOne({ email: identifier });
    } else if (isPhone(identifier)) {
      user = await User.findOne({ phone: identifier });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email or phone number'
      });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    const token = await Token.findOne({
      userId: user._id,
      type: 'password_reset',
      otp: otp,
      expiresAt: { $gt: new Date() }
    });

    if (!token) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`\n❌ INVALID PASSWORD RESET OTP ATTEMPT - User: ${user.email}, OTP: ${otp}`);
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    user.password = newPassword;
    await user.save();

    await Token.deleteOne({ _id: token._id });

    user.refreshTokens = [];
    await user.save();

    if (process.env.NODE_ENV === 'development') {
      console.log('\n' + '='.repeat(50));
      console.log('✅ PASSWORD RESET SUCCESS');
      console.log('='.repeat(50));
      console.log(`👤 User: ${user.name}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`📱 Phone: ${user.phone}`);
      console.log(`🔐 OTP: ${otp}`);
      console.log('='.repeat(50) + '\n');
    }

    res.status(200).json({
      success: true,
      message: 'Password reset successful. Please login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    user.password = newPassword;
    await user.save();

    user.refreshTokens = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. Other sessions have been logged out.'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing password'
    });
  }
};
