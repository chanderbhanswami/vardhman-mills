/**
 * Reactivate Admin Account
 * This script reactivates the admin account by setting isActive to true
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.DATABASE_URL);
    console.log('✓ Connected to MongoDB');
  } catch (error) {
    console.error('✗ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Reactivate admin account
const reactivateAdmin = async () => {
  try {
    await connectDB();

    // Find and update the User model
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

    // Reactivate admin account
    const adminResult = await User.updateOne(
      { email: 'admin@vardhmanmills.com' },
      { 
        $set: { 
          isActive: true,
          accountStatus: 'active',
          status: 'active'
        } 
      }
    );

    if (adminResult.modifiedCount > 0) {
      console.log('✓ Admin account reactivated successfully');
    } else if (adminResult.matchedCount > 0) {
      console.log('⚠ Admin account was already active');
    } else {
      console.log('✗ Admin account not found');
    }

    // Also check and reactivate john@example.com if needed
    const userResult = await User.updateOne(
      { email: 'john@example.com' },
      { 
        $set: { 
          isActive: true,
          accountStatus: 'active',
          status: 'active'
        } 
      }
    );

    if (userResult.modifiedCount > 0) {
      console.log('✓ User account (john@example.com) reactivated successfully');
    } else if (userResult.matchedCount > 0) {
      console.log('⚠ User account was already active');
    } else {
      console.log('✗ User account not found');
    }

    // Show current status
    console.log('\n📊 Current Account Status:');
    const admin = await User.findOne({ email: 'admin@vardhmanmills.com' })
      .select('email role isActive accountStatus status');
    const user = await User.findOne({ email: 'john@example.com' })
      .select('email role isActive accountStatus status');

    if (admin) {
      console.log('Admin:', {
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
        accountStatus: admin.accountStatus,
        status: admin.status
      });
    }

    if (user) {
      console.log('User:', {
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        accountStatus: user.accountStatus,
        status: user.status
      });
    }

    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
};

// Run the script
reactivateAdmin();
