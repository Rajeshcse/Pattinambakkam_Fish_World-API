import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    sparse: true,
    default: null
  },
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    sparse: true,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit phone number'],
    validate: {
      validator: function (v) {
        if (!v) return true; // Optional for Clerk users
        return /^[6-9]\d{9}$/.test(v);
      },
      message: 'Phone number must be a valid 10-digit Phone number starting with 6, 7, 8, or 9'
    }
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: ''
  },
  address: {
    street: {
      type: String,
      trim: true,
      minlength: [10, 'Street address must be at least 10 characters'],
      maxlength: [300, 'Street address cannot exceed 300 characters']
    },
    city: {
      type: String,
      trim: true,
      default: 'Chennai',
      minlength: [2, 'City name must be at least 2 characters'],
      maxlength: [50, 'City name cannot exceed 50 characters']
    },
    state: {
      type: String,
      trim: true,
      default: 'Tamil Nadu',
      maxlength: [50, 'State name cannot exceed 50 characters']
    },
    pincode: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return !v || /^\d{6}$/.test(v);
        },
        message: 'Pincode must be a valid 6-digit number'
      }
    },
    landmark: {
      type: String,
      trim: true,
      maxlength: [100, 'Landmark cannot exceed 100 characters']
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  authProvider: {
    type: String,
    enum: ['clerk', 'local'],
    default: 'local'
  },
  refreshTokens: [
    {
      token: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now,
        expires: 2592000
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function (next) {
  // Only hash password if it's modified and user is using local auth
  if (!this.isModified('password') || !this.password) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
