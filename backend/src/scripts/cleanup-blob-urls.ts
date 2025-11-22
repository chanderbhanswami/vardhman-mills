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

const cleanupBlobUrls = async () => {
  try {
    await connectDB();
    
    console.log('🧹 Starting cleanup of blob URLs...\n');
    
    // Find all products with blob URLs
    const allProducts = await Product.find({});
    let totalUpdated = 0;
    let totalBlobsRemoved = 0;
    
    for (const product of allProducts) {
      let needsUpdate = false;
      let productBlobsRemoved = 0;
      
      // Clean main images
      const originalMainImages = [...product.images];
      product.images = product.images.filter(img => !img.startsWith('blob:'));
      if (originalMainImages.length !== product.images.length) {
        needsUpdate = true;
        productBlobsRemoved += originalMainImages.length - product.images.length;
        console.log(`📸 Cleaned ${originalMainImages.length - product.images.length} blob URLs from main images of "${product.name}"`);
      }
      
      // Clean variant images
      for (let i = 0; i < product.variants.length; i++) {
        const originalVariantImages = [...product.variants[i].images];
        product.variants[i].images = product.variants[i].images.filter(img => !img.startsWith('blob:'));
        if (originalVariantImages.length !== product.variants[i].images.length) {
          needsUpdate = true;
          productBlobsRemoved += originalVariantImages.length - product.variants[i].images.length;
          console.log(`🎨 Cleaned ${originalVariantImages.length - product.variants[i].images.length} blob URLs from variant ${i} of "${product.name}"`);
        }
      }
      
      // Save if changes were made
      if (needsUpdate) {
        await product.save();
        totalUpdated++;
        totalBlobsRemoved += productBlobsRemoved;
        console.log(`✅ Updated "${product.name}" (${product._id}) - removed ${productBlobsRemoved} blob URLs\n`);
      }
    }
    
    console.log('🎉 Cleanup completed!');
    console.log(`📊 Products updated: ${totalUpdated}`);
    console.log(`🗑️ Total blob URLs removed: ${totalBlobsRemoved}`);
    
    // Verify cleanup
    console.log('\n🔍 Verifying cleanup...');
    const remainingBlobMain = await Product.countDocuments({
      images: { $regex: /^blob:/ }
    });
    const remainingBlobVariants = await Product.countDocuments({
      'variants.images': { $regex: /^blob:/ }
    });
    
    console.log(`📊 Remaining blob URLs in main images: ${remainingBlobMain}`);
    console.log(`📊 Remaining blob URLs in variant images: ${remainingBlobVariants}`);
    
    if (remainingBlobMain === 0 && remainingBlobVariants === 0) {
      console.log('✅ All blob URLs successfully removed!');
    } else {
      console.log('⚠️ Some blob URLs still remain');
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Database connection closed');
  }
};

cleanupBlobUrls();