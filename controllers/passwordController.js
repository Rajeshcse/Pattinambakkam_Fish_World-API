import User from '../models/User.js';
import Token from '../models/Token.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// 👉 Forgot Password – send reset code to phone (user provides email or phone)
export const forgotPassword = async (req, res) => {
  try {
    const { email, phone } = req.body;

    // 1️⃣ Validate that either email or phone is provided
    if (!email && !phone) {
      return res.status(400).json({
        message: 'Please provide either email or phone number',
      });
    }

    // 2️⃣ Find user by email or phone
    const user = await User.findOne({
      $or: [{ email: email || null }, { phone: phone || null }],
    });

    // 3️⃣ Check if user exists
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    // 4️⃣ Delete any existing password reset tokens for this user
    await Token.deleteMany({
      userId: user._id,
      type: 'password_reset',
    });

    // 5️⃣ Create new password reset token
    const tokenData = Token.createToken(user._id, 'password_reset');
    await Token.create(tokenData);

    // 6️⃣ Display reset code in terminal for development (send to phone)
    const resetCodeOutput = `
========================================
🔐 PASSWORD RESET CODE (SENT TO PHONE)
========================================
User Email: ${user.email}
User Name: ${user.name}
Phone Number: ${user.phone}
Reset Code: ${tokenData.otp}
Expires in: 10 minutes
========================================
`;
    console.log(resetCodeOutput);
    console.error(resetCodeOutput); // Also log to stderr to ensure visibility

    return res.status(200).json({
      message: 'Reset code sent to your phone',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

// 👉 Reset Password – verify code and update password
export const resetPassword = async (req, res) => {
  try {
    const { email, phone, resetCode, newPassword } = req.body;

    // 1️⃣ Validate that either email or phone is provided
    if (!email && !phone) {
      return res.status(400).json({
        message: 'Please provide either email or phone number',
      });
    }

    // 2️⃣ Validate reset code and new password
    if (!resetCode) {
      return res.status(400).json({
        message: 'Reset code is required',
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        message: 'New password is required',
      });
    }

    // 3️⃣ Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters',
      });
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({
        message: 'Password must contain at least one uppercase letter',
      });
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(newPassword)) {
      return res.status(400).json({
        message: 'Password must contain at least one lowercase letter',
      });
    }

    // Check for number
    if (!/\d/.test(newPassword)) {
      return res.status(400).json({
        message: 'Password must contain at least one number',
      });
    }

    // 4️⃣ Find user by email or phone
    const user = await User.findOne({
      $or: [{ email: email || null }, { phone: phone || null }],
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    // 5️⃣ Find and validate token
    const token = await Token.findOne({
      userId: user._id,
      type: 'password_reset',
      otp: resetCode,
      expiresAt: { $gt: new Date() },
    });

    if (!token) {
      return res.status(400).json({
        message: 'Invalid or expired reset code',
      });
    }

    // 6️⃣ Update password
    user.password = newPassword;
    await user.save();

    // 7️⃣ Delete the used token
    await Token.deleteOne({ _id: token._id });

    // 8️⃣ Log password reset for security
    console.log(`
========================================
✅ PASSWORD RESET SUCCESSFUL
========================================
User Email: ${user.email}
User Name: ${user.name}
Phone Number: ${user.phone}
Reset Time: ${new Date().toLocaleString()}
========================================
`);

    return res.status(200).json({
      message: 'Password reset successfully',
      phone: user.phone,
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

// 👉 Change Password – User is logged in, knows old password
// @desc    Change password (logged in user)
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    // 1️⃣ Validate all fields are provided
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide old password, new password, and confirm password',
      });
    }

    // 2️⃣ Check if new password matches confirm password
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match',
      });
    }

    // 3️⃣ Check if old and new passwords are the same
    if (oldPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from old password',
      });
    }

    // 4️⃣ Validate new password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one uppercase letter',
      });
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one lowercase letter',
      });
    }

    // Check for number
    if (!/\d/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one number',
      });
    }

    // 5️⃣ Find user
    const user = await User.findById(userId).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // 6️⃣ Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Old password is incorrect',
      });
    }

    // 7️⃣ Update to new password
    user.password = newPassword;
    await user.save();

    // 8️⃣ Log password change for security
    console.log(`
========================================
✅ PASSWORD CHANGED SUCCESSFULLY
========================================
User Email: ${user.email}
User Name: ${user.name}
Phone Number: ${user.phone}
Change Time: ${new Date().toLocaleString()}
========================================
`);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
