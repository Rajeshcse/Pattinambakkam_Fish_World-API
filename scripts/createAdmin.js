import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import connectDB from '../config/database.js';

// Load environment variables
dotenv.config();

// Connect to database
await connectDB();

const createAdmin = async () => {
  try {
    console.log('Creating admin user...');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Admin user details - CHANGE THESE VALUES
    const adminData = {
      name: 'Admin User',
      email: 'admin@pfw.com',
      phone: '9994072395',
      password: 'Admin123#',
      role: 'admin',
      isVerified: true
    };

    // Create admin user
    const admin = new User(adminData);
    await admin.save();

    console.log('✅ Admin user created successfully!');
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);
    console.log('⚠️ Please change the default password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
createAdmin();