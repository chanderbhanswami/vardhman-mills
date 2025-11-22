import mongoose from 'mongoose';
import User from '../models/User.model.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const testPasswordHashing = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Test direct bcrypt hashing and comparison
    console.log('\n🔧 Testing direct bcrypt functionality:');
    const plainPassword = 'testpass123';
    const hashedPassword = await bcrypt.hash(plainPassword, 12);
    console.log(`Plain: ${plainPassword}`);
    console.log(`Hashed: ${hashedPassword}`);
    
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    console.log(`Direct comparison result: ${isMatch ? '✅ VALID' : '❌ Invalid'}`);

    // Create a test user manually
    console.log('\n👤 Creating test user manually:');
    
    // Delete existing test user
    await User.deleteOne({ email: 'test@manual.com' });
    
    const testUser = new User({
      firstName: 'Test',
      lastName: 'User', 
      email: 'test@manual.com',
      password: 'testpass123',
      role: 'user',
      isEmailVerified: true,
      isActive: true
    });
    
    await testUser.save();
    console.log('✓ Test user created');

    // Now fetch and test the password
    const savedUser = await User.findOne({ email: 'test@manual.com' }).select('+password');
    if (savedUser) {
      console.log(`Saved user password hash: ${savedUser.password}`);
      
      const testResult = await savedUser.comparePassword('testpass123');
      console.log(`User.comparePassword result: ${testResult ? '✅ VALID' : '❌ Invalid'}`);
      
      const directResult = await bcrypt.compare('testpass123', savedUser.password);
      console.log(`Direct bcrypt.compare result: ${directResult ? '✅ VALID' : '❌ Invalid'}`);
    }

    // Clean up
    await User.deleteOne({ email: 'test@manual.com' });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testPasswordHashing();
