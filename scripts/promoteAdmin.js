import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import connectDB from '../config/database.js';

// Load environment variables
dotenv.config();

// Connect to database
await connectDB();

const promoteUserToAdmin = async () => {
  try {
    // Get email from command line argument
    const email = process.argv[2];
    
    if (!email) {
      console.log('❌ Please provide an email address');
      console.log('Usage: npm run promote-admin <email>');
      process.exit(1);
    }

    console.log(`Looking for user with email: ${email}`);

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ User not found with email:', email);
      process.exit(1);
    }

    if (user.role === 'admin') {
      console.log('ℹ️ User is already an admin:', email);
      process.exit(0);
    }

    // Update user role to admin
    user.role = 'admin';
    user.isVerified = true; // Verify admin users
    await user.save();

    console.log('✅ User promoted to admin successfully!');
    console.log('User:', user.name);
    console.log('Email:', user.email);
    console.log('Role:', user.role);

  } catch (error) {
    console.error('❌ Error promoting user to admin:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
promoteUserToAdmin();