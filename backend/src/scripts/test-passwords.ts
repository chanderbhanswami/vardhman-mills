import mongoose from 'mongoose';
import User from '../models/User.model.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const testPasswords = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Test admin password - need to select password field explicitly
    const admin = await User.findOne({ email: 'admin@vardhmanmills.com' }).select('+password');
    if (admin) {
      console.log('\n🔐 Testing admin password:');
      console.log(`Admin password hash exists: ${!!admin.password}`);
      
      // Test with actual seeded passwords from seed.ts
      const testPasswords = ['Admin@123', 'admin123', 'password', '123456'];
      
      for (const testPass of testPasswords) {
        const isValid = await bcrypt.compare(testPass, admin.password);
        console.log(`   "${testPass}": ${isValid ? '✅ VALID' : '❌ Invalid'}`);
      }
    }

    // Test john password - need to select password field explicitly
    const john = await User.findOne({ email: 'john@example.com' }).select('+password');
    if (john) {
      console.log('\n🔐 Testing john password:');
      console.log(`John password hash exists: ${!!john.password}`);
      
      // Test with actual seeded passwords from seed.ts  
      const testPasswords = ['User@123', 'password123', 'password', '123456'];
      
      for (const testPass of testPasswords) {
        const isValid = await bcrypt.compare(testPass, john.password);
        console.log(`   "${testPass}": ${isValid ? '✅ VALID' : '❌ Invalid'}`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testPasswords();
