import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import connectDB from '../config/database.js';

dotenv.config();

await connectDB();

const showAdminCredentials = async () => {
  try {
    console.log('🔍 Looking for admin users...\n');

    const admins = await User.find({ role: 'admin' }).select(
      'name email phone role isVerified createdAt'
    );

    if (admins.length === 0) {
      console.log('❌ No admin users found in database.');
      console.log('💡 Run "node scripts/createAdmin.js" to create one.');
      return;
    }

    console.log('🔐 EXISTING ADMIN USERS:');
    console.log('='.repeat(50));

    admins.forEach((admin, index) => {
      console.log(`\n👤 Admin ${index + 1}:`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Phone: ${admin.phone}`);
      console.log(`   Verified: ${admin.isVerified ? '✅' : '❌'}`);
      console.log(`   Created: ${admin.createdAt.toLocaleDateString()}`);
    });

    console.log('\n' + '='.repeat(50));
    console.log('⚠️  SUGGESTED CREDENTIALS TO TRY:');
    console.log('   Email: admin@example.com');
    console.log('   Password: Admin@123');
    console.log('   OR');
    console.log('   Email: admin@pfw.com');
    console.log('   Password: Admin123#');
    console.log('='.repeat(50));
  } catch (error) {
    console.error('❌ Error finding admin users:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

showAdminCredentials();
