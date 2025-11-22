import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '..', '.env') });

import mongoose from 'mongoose';
import Product from '../models/Product.model.js';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    console.log('Connecting to database...');
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

const checkBlobUrls = async () => {
  try {
    await connectDB();
    
    console.log('🔍 Checking for blob URLs in products...\n');
    
    // Find products with blob URLs in main images
    const productsWithBlobImages = await Product.find({
      images: { $regex: /^blob:/ }
    }).select('name images variants');
    
    // Find products with blob URLs in variant images
    const productsWithBlobVariants = await Product.find({
      'variants.images': { $regex: /^blob:/ }
    }).select('name images variants');
    
    console.log(`📊 Found ${productsWithBlobImages.length} products with blob URLs in main images`);
    console.log(`📊 Found ${productsWithBlobVariants.length} products with blob URLs in variant images\n`);
    
    // Show details for products with blob URLs
    if (productsWithBlobImages.length > 0) {
      console.log('🔍 Products with blob URLs in main images:');
      for (const product of productsWithBlobImages) {
        console.log(`- ${product.name} (${product._id})`);
        const blobImages = product.images.filter(img => img.startsWith('blob:'));
        const realImages = product.images.filter(img => !img.startsWith('blob:'));
        console.log(`  Blob images: ${blobImages.length}`);
        console.log(`  Real images: ${realImages.length}`);
        blobImages.forEach(img => console.log(`    ${img}`));
      }
      console.log();
    }
    
    if (productsWithBlobVariants.length > 0) {
      console.log('🔍 Products with blob URLs in variant images:');
      for (const product of productsWithBlobVariants) {
        console.log(`- ${product.name} (${product._id})`);
        product.variants.forEach((variant, index) => {
          const blobImages = variant.images.filter(img => img.startsWith('blob:'));
          const realImages = variant.images.filter(img => !img.startsWith('blob:'));
          if (blobImages.length > 0) {
            console.log(`  Variant ${index}: ${blobImages.length} blob URLs, ${realImages.length} real URLs`);
            blobImages.forEach(img => console.log(`    ${img}`));
          }
        });
      }
      console.log();
    }
    
    // Get all unique product IDs that have blob URLs
    const allAffectedProducts = [
      ...productsWithBlobImages.map(p => p._id),
      ...productsWithBlobVariants.map(p => p._id)
    ];
    const uniqueAffectedProducts = [...new Set(allAffectedProducts.map(id => id.toString()))];
    
    console.log(`📋 Total unique products affected: ${uniqueAffectedProducts.length}`);
    if (uniqueAffectedProducts.length > 0) {
      console.log('Affected product IDs:', uniqueAffectedProducts);
    }
    
  } catch (error) {
    console.error('❌ Error checking blob URLs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Database connection closed');
  }
};

checkBlobUrls();