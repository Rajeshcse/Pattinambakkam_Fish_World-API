import { validationResult } from 'express-validator';
import User from '../models/User.js';
import Token from '../models/Token.js';
import { sendVerificationSMS, sendWelcomeSMS } from '../utils/smsService.js';

export const sendPhoneVerificationOTP = async (req, res) => {
  try {
    console.log('Send phone verification OTP request received for user:', req.user?.id);

    const user = await User.findById(req.user.id);

    if (!user) {
      console.log('User not found:', req.user.id);
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    console.log('User found:', user.phone, 'isVerified:', user.isVerified);

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is already verified',
      });
    }

    await Token.deleteMany({
      userId: user._id,
      type: 'phone_verification',
    });

    const tokenData = Token.createToken(user._id, 'phone_verification');
    console.log('Token created with OTP:', tokenData.otp);
    await Token.create(tokenData);

    console.log('Calling sendVerificationSMS with:', {
      phone: user.phone,
      otp: tokenData.otp,
      name: user.name,
    });

    const smsResult = await sendVerificationSMS(user.phone, tokenData.otp, user.name);
    console.log('SMS result:', smsResult);

    if (!smsResult.success) {
      console.log('SMS sending failed, error:', smsResult.error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification SMS. Please try again.',
      });
    }

    console.log('SMS sent successfully, messageId:', smsResult.messageId);

    console.log('\n' + '='.repeat(50));
    console.log('📱 PHONE VERIFICATION OTP SENT');
    console.log('='.repeat(50));
    console.log(`👤 User: ${user.phone}`);
    console.log(`🔐 OTP: ${tokenData.otp}`);
    console.log(`⏱️  Expires in: 10 minutes`);
    console.log('='.repeat(50) + '\n');

    const response = {
      success: true,
      message: 'Verification OTP sent to your phone number',
      expiresIn: '10 minutes',
    };

    if (process.env.NODE_ENV === 'development') {
      response.otp = tokenData.otp;
      response.note = '⚠️  OTP shown only in DEVELOPMENT mode';
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Send phone verification OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending verification OTP',
    });
  }
};

export const verifyPhone = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { otp } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is already verified',
      });
    }

    const token = await Token.findOne({
      userId: user._id,
      type: 'phone_verification',
      otp: otp,
      expiresAt: { $gt: new Date() },
    });

    if (!token) {
      console.log(`\n❌ INVALID OTP ATTEMPT - User: ${user.phone}, OTP: ${otp}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    user.isVerified = true;
    await user.save();

    await Token.deleteOne({ _id: token._id });

    await sendWelcomeSMS(user.phone, user.name);

    console.log('\n' + '='.repeat(50));
    console.log('✅ PHONE VERIFICATION SUCCESS');
    console.log('='.repeat(50));
    console.log(`👤 User: ${user.phone}`);
    console.log(`🔐 OTP: ${otp}`);
    console.log('='.repeat(50) + '\n');

    res.status(200).json({
      success: true,
      message: 'Phone number verified successfully',
    });
  } catch (error) {
    console.error('Verify phone error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during phone verification',
    });
  }
};

export const resendPhoneVerificationOTP = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is already verified',
      });
    }

    const recentToken = await Token.findOne({
      userId: user._id,
      type: 'phone_verification',
      createdAt: { $gt: new Date(Date.now() - 60 * 1000) },
    });

    if (recentToken) {
      return res.status(429).json({
        success: false,
        message: 'Please wait at least 1 minute before requesting a new OTP',
      });
    }

    await Token.deleteMany({
      userId: user._id,
      type: 'phone_verification',
    });

    const tokenData = Token.createToken(user._id, 'phone_verification');
    await Token.create(tokenData);

    const smsResult = await sendVerificationSMS(user.phone, tokenData.otp, user.name);

    if (!smsResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification SMS. Please try again.',
      });
    }

    console.log('\n' + '='.repeat(50));
    console.log('📱 NEW PHONE VERIFICATION OTP SENT (RESEND)');
    console.log('='.repeat(50));
    console.log(`👤 User: ${user.phone}`);
    console.log(`🔐 OTP: ${tokenData.otp}`);
    console.log(`⏱️  Expires in: 10 minutes`);
    console.log('='.repeat(50) + '\n');

    const response = {
      success: true,
      message: 'New verification OTP sent to your phone number',
      expiresIn: '10 minutes',
    };

    if (process.env.NODE_ENV === 'development') {
      response.otp = tokenData.otp;
      response.note = '⚠️  OTP shown only in DEVELOPMENT mode';
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Resend phone verification OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resending verification OTP',
    });
  }
};
