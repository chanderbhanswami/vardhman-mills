import mongoose from 'mongoose';
import Product from '../models/Product.model.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkProductImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    const products = await Product.find({}).limit(5);
    
    console.log('\n=== Product Image Analysis ===');
    console.log(`Found ${products.length} products to analyze\n`);

    products.forEach((product, index) => {
      console.log(`--- Product ${index + 1}: ${product.name} ---`);
      console.log(`ID: ${product._id}`);
      console.log(`Main Images (${product.images.length}):`);
      
      if (product.images.length > 0) {
        product.images.forEach((img, i) => {
          console.log(`  [${i + 1}] ${img}`);
        });
      } else {
        console.log('  No main images');
      }

      console.log(`Variants (${product.variants.length}):`);
      if (product.variants.length > 0) {
        product.variants.forEach((variant, i) => {
          console.log(`  Variant ${i + 1} - ${variant.sku}:`);
          console.log(`    Images (${variant.images.length}):`);
          if (variant.images.length > 0) {
            variant.images.forEach((img, j) => {
              console.log(`      [${j + 1}] ${img}`);
            });
          } else {
            console.log('      No variant images');
          }
        });
      } else {
        console.log('  No variants');
      }
      console.log('');
    });

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkProductImages();
