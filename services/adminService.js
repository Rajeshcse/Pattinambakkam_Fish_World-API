/**
 * Admin Service
 * Business logic for admin operations
 */

import User from '../models/User.js';
import FishProduct from '../models/FishProduct.js';
import { isValidObjectId } from '../utils/helpers/validationHelper.js';
import { SUCCESS_MESSAGES } from '../constants/index.js';

/**
 * Get all users with pagination and filters
 */
export const getAllUsersService = async (queryParams) => {
  const { page = 1, limit = 10, role, isVerified, search } = queryParams;

  const skip = (page - 1) * limit;

  // Build filter object
  const filter = {};

  if (role && ['user', 'admin'].includes(role)) {
    filter.role = role;
  }

  if (isVerified !== undefined) {
    filter.isEmailVerified = isVerified === 'true';
  }

  if (search) {
    const searchRegex = new RegExp(search, 'i');
    filter.$or = [{ name: searchRegex }, { email: searchRegex }];
  }

  // Get users with pagination
  const users = await User.find(filter)
    .select('-password -refreshTokens')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // Get total count for pagination
  const totalUsers = await User.countDocuments(filter);
  const totalPages = Math.ceil(totalUsers / limit);

  // Get summary statistics
  const stats = await User.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        verifiedUsers: { $sum: { $cond: ['$isEmailVerified', 1, 0] } },
        adminUsers: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
        recentUsers: {
          $sum: {
            $cond: [
              { $gte: ['$createdAt', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  return {
    users,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalUsers,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    stats: stats[0] || {
      totalUsers: 0,
      verifiedUsers: 0,
      adminUsers: 0,
      recentUsers: 0,
    },
  };
};

/**
 * Get user by ID
 */
export const getUserByIdService = async (userId) => {
  if (!isValidObjectId(userId)) {
    throw new Error('Invalid user ID format');
  }

  const user = await User.findById(userId).select('-password -refreshTokens').lean();

  if (!user) {
    throw new Error('User not found');
  }

  return { user };
};

/**
 * Update user profile by admin
 */
export const updateUserService = async (userId, updateData, adminEmail) => {
  if (!isValidObjectId(userId)) {
    throw new Error('Invalid user ID format');
  }

  const { name, email, phone, avatar, isEmailVerified } = updateData;

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Check for email conflicts
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== userId) {
      throw new Error('Email already in use by another user');
    }
  }

  // Check for phone conflicts
  if (phone && phone !== user.phone) {
    const existingUser = await User.findOne({ phone });
    if (existingUser && existingUser._id.toString() !== userId) {
      throw new Error('Phone number already in use by another user');
    }
  }

  // Build update object
  const updateFields = {};
  if (name !== undefined) updateFields.name = name.trim();
  if (email !== undefined) updateFields.email = email.trim().toLowerCase();
  if (phone !== undefined) updateFields.phone = phone.trim();
  if (avatar !== undefined) updateFields.avatar = avatar;
  if (isEmailVerified !== undefined) updateFields.isEmailVerified = isEmailVerified;

  const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
    new: true,
    runValidators: true,
  })
    .select('-password -refreshTokens')
    .lean();

  // Log admin action
  console.log(`Admin ${adminEmail} updated user ${updatedUser.email}:`, updateFields);

  return {
    user: updatedUser,
    message: SUCCESS_MESSAGES.USER_UPDATED,
  };
};

/**
 * Delete user
 */
export const deleteUserService = async (userId, adminId, adminEmail) => {
  if (!isValidObjectId(userId)) {
    throw new Error('Invalid user ID format');
  }

  // Prevent admin from deleting themselves
  if (userId === adminId) {
    throw new Error('Cannot delete your own account');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  await User.findByIdAndDelete(userId);

  // Log admin action
  console.log(`Admin ${adminEmail} deleted user ${user.email} (ID: ${userId})`);

  return {
    message: SUCCESS_MESSAGES.USER_DELETED,
  };
};

/**
 * Change user role (promote/demote)
 */
export const changeUserRoleService = async (userId, newRole, adminId, adminEmail) => {
  if (!isValidObjectId(userId)) {
    throw new Error('Invalid user ID format');
  }

  // Prevent admin from changing their own role
  if (userId === adminId) {
    throw new Error('Cannot change your own role');
  }

  if (!['user', 'admin'].includes(newRole)) {
    throw new Error('Invalid role specified');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const previousRole = user.role;
  user.role = newRole;

  // Clear all refresh tokens when role changes for security
  user.refreshTokens = [];

  await user.save();

  // Log admin action
  console.log(
    `Admin ${adminEmail} changed user ${user.email} role from ${previousRole} to ${newRole}`
  );

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      previousRole,
    },
    message: `User role changed from ${previousRole} to ${newRole}`,
  };
};

/**
 * Toggle user verification status
 */
export const toggleUserVerificationService = async (userId, adminEmail) => {
  if (!isValidObjectId(userId)) {
    throw new Error('Invalid user ID format');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const previousStatus = user.isEmailVerified;
  user.isEmailVerified = !user.isEmailVerified;

  await user.save();

  // Log admin action
  console.log(
    `Admin ${adminEmail} ${user.isEmailVerified ? 'verified' : 'unverified'} user ${user.email}`
  );

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      previousStatus,
    },
    message: `User ${user.isEmailVerified ? 'verified' : 'unverified'} successfully`,
  };
};

/**
 * Get comprehensive dashboard statistics
 */
export const getDashboardStatsService = async () => {
  // User statistics
  const userStats = await User.aggregate([
    {
      $facet: {
        overview: [
          {
            $group: {
              _id: null,
              totalUsers: { $sum: 1 },
              verifiedUsers: { $sum: { $cond: ['$isEmailVerified', 1, 0] } },
              unverifiedUsers: { $sum: { $cond: [{ $not: '$isEmailVerified' }, 1, 0] } },
              totalAdmins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
            },
          },
        ],
        recentUsers: [
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          {
            $project: {
              id: { $toString: '$_id' },
              name: 1,
              email: 1,
              phone: 1,
              role: 1,
              isVerified: '$isEmailVerified',
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ],
      },
    },
  ]);

  const result = userStats[0];
  const overview = result.overview[0] || {
    totalUsers: 0,
    verifiedUsers: 0,
    unverifiedUsers: 0,
    totalAdmins: 0,
  };

  return {
    totalUsers: overview.totalUsers,
    verifiedUsers: overview.verifiedUsers,
    unverifiedUsers: overview.unverifiedUsers,
    totalAdmins: overview.totalAdmins,
    recentUsers: result.recentUsers || [],
  };
};

/**
 * Bulk operations on users
 */
export const bulkUserActionService = async (action, userIds, adminId, adminEmail) => {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new Error('User IDs array is required');
  }

  // Validate all user IDs
  const invalidIds = userIds.filter((id) => !isValidObjectId(id));
  if (invalidIds.length > 0) {
    throw new Error(`Invalid user IDs found: ${invalidIds.join(', ')}`);
  }

  // Prevent admin from performing bulk actions on themselves
  if (userIds.includes(adminId)) {
    throw new Error('Cannot perform bulk actions on your own account');
  }

  let result;

  switch (action) {
    case 'delete':
      result = await User.deleteMany({ _id: { $in: userIds } });
      console.log(`Admin ${adminEmail} bulk deleted ${result.deletedCount} users`);
      return {
        affected: result.deletedCount,
        message: `Bulk delete operation completed. ${result.deletedCount} users deleted.`,
      };

    case 'verify':
      result = await User.updateMany(
        { _id: { $in: userIds } },
        { $set: { isEmailVerified: true } }
      );
      console.log(`Admin ${adminEmail} bulk verified ${result.modifiedCount} users`);
      return {
        affected: result.modifiedCount,
        message: `Bulk verify operation completed. ${result.modifiedCount} users verified.`,
      };

    case 'unverify':
      result = await User.updateMany(
        { _id: { $in: userIds } },
        { $set: { isEmailVerified: false } }
      );
      console.log(`Admin ${adminEmail} bulk unverified ${result.modifiedCount} users`);
      return {
        affected: result.modifiedCount,
        message: `Bulk unverify operation completed. ${result.modifiedCount} users unverified.`,
      };

    default:
      throw new Error('Invalid action. Allowed actions: delete, verify, unverify');
  }
};
