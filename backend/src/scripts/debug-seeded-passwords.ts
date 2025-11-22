import mongoose from 'mongoose';
import User from '../models/User.model.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const debugSeededUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Get seeded users with passwords
    const admin = await User.findOne({ email: 'admin@vardhmanmills.com' }).select('+password');
    const john = await User.findOne({ email: 'john@example.com' }).select('+password');

    console.log('\n📊 Seeded Users Analysis:');
    if (admin) {
      console.log(`\nAdmin user:`);
      console.log(`  Email: ${admin.email}`);
      console.log(`  Password hash: ${admin.password}`);
      console.log(`  Hash length: ${admin.password?.length || 0}`);
      console.log(`  Starts with $2b$: ${admin.password?.startsWith('$2b$') || false}`);
    }

    if (john) {
      console.log(`\nJohn user:`);
      console.log(`  Email: ${john.email}`);
      console.log(`  Password hash: ${john.password}`);
      console.log(`  Hash length: ${john.password?.length || 0}`);
      console.log(`  Starts with $2b$: ${john.password?.startsWith('$2b$') || false}`);
    }

    // Now let's manually hash the expected passwords and compare
    console.log('\n🔧 Manual password hash comparison:');
    const adminExpectedHash = await bcrypt.hash('Admin@123', 12);
    const johnExpectedHash = await bcrypt.hash('User@123', 12);
    
    console.log(`Expected admin hash: ${adminExpectedHash}`);
    console.log(`Actual admin hash:   ${admin?.password}`);
    console.log(`Admin hash format looks correct: ${admin?.password?.startsWith('$2b$12$') || false}`);
    
    console.log(`\nExpected john hash: ${johnExpectedHash}`);
    console.log(`Actual john hash:   ${john?.password}`);
    console.log(`John hash format looks correct: ${john?.password?.startsWith('$2b$12$') || false}`);

    // Test if the issue is with our comparison function
    if (admin?.password) {
      console.log('\n🧪 Testing admin password with various methods:');
      console.log(`bcrypt.compare('Admin@123', hash): ${await bcrypt.compare('Admin@123', admin.password)}`);
      console.log(`admin.comparePassword('Admin@123'): ${await admin.comparePassword('Admin@123')}`);
    }

    if (john?.password) {
      console.log('\n🧪 Testing john password with various methods:');
      console.log(`bcrypt.compare('User@123', hash): ${await bcrypt.compare('User@123', john.password)}`);
      console.log(`john.comparePassword('User@123'): ${await john.comparePassword('User@123')}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

debugSeededUsers();
