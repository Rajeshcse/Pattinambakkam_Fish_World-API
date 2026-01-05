import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Optional authentication middleware
 * Authenticates the user if a valid token is provided
 * Allows requests without authentication (guest users)
 * Sets req.user if authenticated, otherwise leaves it undefined
 * Uses secure session IDs for guest identification
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      // No token provided - allow as guest
      req.user = null;
      req.isGuest = true;
      req.guestId = req.sessionID; // Use secure session ID from express-session
      return next();
    }

    // Token provided - verify it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      // Invalid token - allow as guest
      req.user = null;
      req.isGuest = true;
      req.guestId = req.sessionID; // Use secure session ID from express-session
      return next();
    }

    // Valid token and user found
    req.user = user;
    req.isGuest = false;
    next();
  } catch (error) {
    // Token verification failed - allow as guest
    req.user = null;
    req.isGuest = true;
    req.guestId = req.sessionID; // Use secure session ID from express-session
    next();
  }
};

/**
 * Strict authentication middleware
 * Requires valid authentication
 * Returns 401 if not authenticated
 */
export const authenticateToken = async (req, res, next) => {
  try {
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

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    next();
  };
};
