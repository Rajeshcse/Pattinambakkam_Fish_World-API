import mongoose from 'mongoose';
import crypto from 'crypto';

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  token: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['email_verification', 'phone_verification', 'password_reset'],
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Document will be automatically deleted 10 minutes after createdAt
  }
});

// Create index for automatic cleanup
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Generate OTP
tokenSchema.methods.generateOTP = function() {
  this.otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  return this.otp;
};

// Generate token hash
tokenSchema.statics.createToken = function(userId, type) {
  const token = crypto.randomBytes(32).toString('hex');
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

  return {
    token,
    otp,
    userId,
    type,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  };
};

export default mongoose.model('Token', tokenSchema);
