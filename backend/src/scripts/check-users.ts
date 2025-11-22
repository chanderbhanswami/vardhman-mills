import mongoose from 'mongoose';
import User from '../models/User.model.js';
import dotenv from 'dotenv';

dotenv.config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    const users = await User.find({});
    console.log(`\n📊 Found ${users.length} users in database:`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}, Role: ${user.role}, Active: ${user.isActive}`);
    });

    // Check specific users
    const admin = await User.findOne({ email: 'admin@vardhmanmills.com' });
    console.log(`\n🔍 Admin user exists: ${!!admin}`);
    
    const john = await User.findOne({ email: 'john@example.com' });
    console.log(`🔍 John user exists: ${!!john}`);

    if (admin) {
      console.log(`   Admin ID: ${admin._id}`);
      console.log(`   Admin active: ${admin.isActive}`);
    }

    if (john) {
      console.log(`   John ID: ${john._id}`);
      console.log(`   John active: ${john.isActive}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkUsers();
