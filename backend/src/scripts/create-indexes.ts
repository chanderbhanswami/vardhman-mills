import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';
import Product from '../models/Product.model.js';
import Category from '../models/Category.model.js';
import Order from '../models/Order.model.js';

dotenv.config();

const createIndexes = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas successfully!');

    console.log('\n📊 Creating database indexes...');

    // User indexes
    console.log('Creating User indexes...');
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    await User.collection.createIndex({ isActive: 1 });
    await User.collection.createIndex({ createdAt: 1 });
    console.log('✅ User indexes created');

    // Product indexes
    console.log('Creating Product indexes...');
    await Product.collection.createIndex({ slug: 1 }, { unique: true });
    await Product.collection.createIndex({ category: 1 });
    await Product.collection.createIndex({ isActive: 1 });
    await Product.collection.createIndex({ isFeatured: 1 });
    await Product.collection.createIndex({ averageRating: 1 });
    await Product.collection.createIndex({ 'variants.sku': 1 }, { unique: true });
    await Product.collection.createIndex({ 'variants.price': 1 });
    await Product.collection.createIndex({ tags: 1 });
    await Product.collection.createIndex({ brand: 1 });
    await Product.collection.createIndex({ name: 'text', description: 'text', tags: 'text' });
    console.log('✅ Product indexes created');

    // Category indexes
    console.log('Creating Category indexes...');
    await Category.collection.createIndex({ slug: 1 }, { unique: true });
    await Category.collection.createIndex({ isActive: 1 });
    await Category.collection.createIndex({ parentCategory: 1 });
    await Category.collection.createIndex({ sortOrder: 1 });
    console.log('✅ Category indexes created');

    // Order indexes
    console.log('Creating Order indexes...');
    await Order.collection.createIndex({ orderNumber: 1 }, { unique: true });
    await Order.collection.createIndex({ user: 1 });
    await Order.collection.createIndex({ status: 1 });
    await Order.collection.createIndex({ createdAt: -1 });
    await Order.collection.createIndex({ guestEmail: 1 });
    await Order.collection.createIndex({ 'paymentInfo.status': 1 });
    console.log('✅ Order indexes created');

    // Compound indexes for better query performance
    console.log('Creating compound indexes...');
    await Product.collection.createIndex({ category: 1, isActive: 1 });
    await Product.collection.createIndex({ isActive: 1, isFeatured: 1 });
    await Product.collection.createIndex({ category: 1, 'variants.price': 1 });
    await Order.collection.createIndex({ user: 1, createdAt: -1 });
    await Order.collection.createIndex({ status: 1, createdAt: -1 });
    console.log('✅ Compound indexes created');

    console.log('\n🎉 All database indexes created successfully!');
    
    // List all indexes
    console.log('\n📋 Index Summary:');
    const collections = ['users', 'products', 'categories', 'orders'];
    
    for (const collectionName of collections) {
      const indexes = await mongoose.connection.db?.collection(collectionName).listIndexes().toArray();
      if (indexes) {
        console.log(`\n${collectionName.toUpperCase()} (${indexes.length} indexes):`);
        indexes.forEach(index => {
          const keys = Object.keys(index.key).map(key => 
            `${key}:${index.key[key]}`
          ).join(', ');
          console.log(`   - ${index.name}: {${keys}}${index.unique ? ' [UNIQUE]' : ''}`);
        });
      }
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createIndexes();
