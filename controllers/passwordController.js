import User from "../models/User.js";
import Token from "../models/Token.js";
import jwt from "jsonwebtoken";

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// 👉 Forgot Password – send reset code to phone (user provides email or phone)
export const forgotPassword = async (req, res) => {
  try {
    const { email, phone } = req.body;

    // 1️⃣ Validate that either email or phone is provided
    if (!email && !phone) {
      return res.status(400).json({
        message: "Please provide either email or phone number",
      });
    }

    // 2️⃣ Find user by email or phone
    const user = await User.findOne({
      $or: [{ email: email || null }, { phone: phone || null }],
    });

    // 3️⃣ Check if user exists
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 4️⃣ Delete any existing password reset tokens for this user
    await Token.deleteMany({
      userId: user._id,
      type: "password_reset",
    });

    // 5️⃣ Create new password reset token
    const tokenData = Token.createToken(user._id, "password_reset");
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
      message: "Reset code sent to your phone",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      message: "Internal server error",
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
        message: "Please provide either email or phone number",
      });
    }

    // 2️⃣ Validate reset code and new password
    if (!resetCode) {
      return res.status(400).json({
        message: "Reset code is required",
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        message: "New password is required",
      });
    }

    // 3️⃣ Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({
        message: "Password must contain at least one uppercase letter",
      });
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(newPassword)) {
      return res.status(400).json({
        message: "Password must contain at least one lowercase letter",
      });
    }

    // Check for number
    if (!/\d/.test(newPassword)) {
      return res.status(400).json({
        message: "Password must contain at least one number",
      });
    }

    // 4️⃣ Find user by email or phone
    const user = await User.findOne({
      $or: [{ email: email || null }, { phone: phone || null }],
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 5️⃣ Find and validate token
    const token = await Token.findOne({
      userId: user._id,
      type: "password_reset",
      otp: resetCode,
      expiresAt: { $gt: new Date() },
    });

    if (!token) {
      return res.status(400).json({
        message: "Invalid or expired reset code",
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
      message: "Password reset successfully",
      phone: user.phone,
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
