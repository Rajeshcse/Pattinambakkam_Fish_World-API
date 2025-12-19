import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { requireAuth } from '@clerk/express';

/**
 * Authenticate JWT token (for local auth)
 */
export const authenticateToken = async (req, res, next) => {
  try {
    console.log('Auth middleware hit for:', req.method, req.path);
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader ? 'Present' : 'Missing');

    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      console.log('No token found in header');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided'
      });
    }

    console.log('Token extracted, verifying...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded, user ID:', decoded.id);

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      console.log('User not found for ID:', decoded.id);
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    console.log('User authenticated:', user.email);
    req.user = user;
    next();
  } catch (error) {
    console.log('Auth error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

/**
 * Authenticate Clerk session and sync user to database
 */
export const authenticateClerkToken = async (req, res, next) => {
  try {
    // Clerk middleware has already verified the session
    const auth = await req.auth();
    if (!auth || !auth.userId) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No valid session.'
      });
    }

    const clerkId = auth.userId;
    console.log('Clerk user authenticated:', clerkId);

    // Find or create user in database
    let user = await User.findOne({ clerkId });

    if (!user) {
      // Get user data from Clerk session
      const clerkUser = auth.user;

      console.log('Clerk user object:', JSON.stringify(clerkUser, null, 2));

      const fullName =
        clerkUser?.firstName && clerkUser?.lastName
          ? `${clerkUser.firstName} ${clerkUser.lastName}`
          : clerkUser?.firstName || clerkUser?.lastName || 'User';

      // Try multiple email extraction paths
      let email = '';
      if (clerkUser?.emailAddresses && Array.isArray(clerkUser.emailAddresses)) {
        const primaryEmail = clerkUser.emailAddresses.find((e) => e.primary);
        email = primaryEmail?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress || '';
      } else if (clerkUser?.primaryEmailAddress?.emailAddress) {
        email = clerkUser.primaryEmailAddress.emailAddress;
      }

      const avatar = clerkUser?.profileImageUrl || '';

      console.log(`Creating new user in DB for Clerk ID: ${clerkId}`, {
        name: fullName,
        email: email,
        avatar: avatar
      });

      if (!email) {
        console.error('Email not found in Clerk user data:', clerkUser);
        return res.status(400).json({
          success: false,
          message: 'Email not found in Clerk account. Please verify your email in Clerk dashboard.'
        });
      }

      // Create user record from Clerk data
      user = await User.create({
        clerkId,
        name: fullName,
        email: email,
        avatar: avatar,
        authProvider: 'clerk',
        isVerified: true
      });

      console.log(`User created successfully in DB: ${user._id}`);
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Clerk auth error:', error.message);
    console.error('Clerk auth error details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication',
      error: error.message
    });
  }
};

/**
 * Combined authentication - supports both JWT and Clerk
 */
export const authenticateTokenOrClerk = async (req, res, next) => {
  try {
    // First check if it's a Clerk session
    const auth = await req.auth();
    if (auth?.userId) {
      return authenticateClerkToken(req, res, next);
    }

    // Otherwise try JWT
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    next();
  };
};
