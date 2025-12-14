import { validationResult } from 'express-validator';
import User from '../models/User.js'
import Token from '../models/Token.js';
import { sendPasswordResetEmail } from '../utils/emailService.js';

// @desc    Request password reset (send OTP)
// @route   POST /api/auth/forgot-password
// @access  Publicp
export const forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });

    // For security, always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a password reset OTP has been sent',
      });
    }

    // Delete any existing password reset tokens for this user
    await Token.deleteMany({
      userId: user._id,
      type: 'password_reset',
    });

    // Create new password reset token
    const tokenData = Token.createToken(user._id, 'password_reset');
    await Token.create(tokenData);

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(user.email, tokenData.otp, user.name);

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
      // Don't expose email sending failure to prevent information disclosure
    }

    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a password reset OTP has been sent',
      expiresIn: '10 minutes',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing password reset request',
    });
  }
};

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    // Find valid token
    const token = await Token.findOne({
      userId: user._id,
      type: 'password_reset',
      otp: otp,
      expiresAt: { $gt: new Date() },
    });

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save(); // This will trigger the pre-save hook to hash the password

    // Delete the used token
    await Token.deleteOne({ _id: token._id });

    // Clear all refresh tokens for security
    user.refreshTokens = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful. Please login with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset',
    });
  }
};

// @desc    Change password (for logged-in users)
// @route   POST /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password field
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Check if new password is same as current password
    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save(); // This will trigger the pre-save hook to hash the password

    // Clear all refresh tokens except the current session
    // This logs out all other sessions for security
    user.refreshTokens = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. Other sessions have been logged out.',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing password',
    });
  }
};
