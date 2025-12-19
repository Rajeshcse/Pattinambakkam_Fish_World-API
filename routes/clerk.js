import express from 'express';
import User from '../models/User.js';
import { authenticateClerkToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Get current Clerk user profile
 * GET /api/auth/clerk/profile
 * Requires valid Clerk session
 */
router.get('/clerk/profile', authenticateClerkToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
        authProvider: user.authProvider,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
});

/**
 * Update Clerk user profile (additional fields)
 * PUT /api/auth/clerk/profile
 * Requires valid Clerk session
 */
router.put('/clerk/profile', authenticateClerkToken, async (req, res) => {
  try {
    const { phone } = req.body;

    const updateData = {};

    if (phone) {
      // Validate phone number
      if (!/^[6-9]\d{9}$/.test(phone)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone number format'
        });
      }
      updateData.phone = phone;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true
    }).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
        authProvider: user.authProvider,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

/**
 * Logout (on frontend, use Clerk's signOut)
 * POST /api/auth/clerk/logout
 * This is mainly for consistency - Clerk handles session management
 */
router.post('/clerk/logout', authenticateClerkToken, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully. Please use Clerk client library to clear session.'
    });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout'
    });
  }
});

/**
 * TEST ENDPOINT - Get a test token (Development only)
 * GET /api/auth/clerk/test-token
 * Returns a test token for testing Clerk endpoints
 */
router.get('/clerk/test-token', async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        success: false,
        message: 'Test endpoint only available in development'
      });
    }

    // For testing: Return instructions on how to get token
    res.status(200).json({
      success: true,
      message: 'To get a test token:',
      instructions: {
        step1: 'Go to your frontend app and login with Clerk',
        step2: 'Open browser DevTools (F12)',
        step3: 'Go to Application → Cookies',
        step4: 'Find "__session" cookie',
        step5: 'Copy the value and paste in Postman Authorization → Bearer Token',
        OR: 'Use frontend getToken() method and copy the token'
      },
      clerkDashboard:
        'Or go to https://dashboard.clerk.com → Users → Select user → Copy session token'
    });
  } catch (error) {
    console.error('Test token error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating test token'
    });
  }
});

export default router;
