import mongoose from 'mongoose';
import Product from '../models/Product.model.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixProductImagesV2() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    const products = await Product.find({});
    console.log(`Found ${products.length} products to update`);

    for (const product of products) {
      let needsUpdate = false;

      // Clean main images
      const originalMainImages = [...product.images];
      product.images = product.images.filter(img => {
        const isValid = img && 
                       !img.includes('blob:') && 
                       !img.includes('via.placeholder.com') &&
                       img.includes('cloudinary.com');
        return isValid;
      });

      if (originalMainImages.length !== product.images.length) {
        needsUpdate = true;
        console.log(`Product "${product.name}": Main images ${originalMainImages.length} -> ${product.images.length}`);
      }

      // Clean variant images
      for (const variant of product.variants) {
        const originalVariantImages = [...variant.images];
        variant.images = variant.images.filter(img => {
          const isValid = img && 
                         !img.includes('blob:') && 
                         !img.includes('via.placeholder.com') &&
                         img.includes('cloudinary.com');
          return isValid;
        });

        if (originalVariantImages.length !== variant.images.length) {
          needsUpdate = true;
          console.log(`  Variant "${variant.sku}": images ${originalVariantImages.length} -> ${variant.images.length}`);
        }
      }

      if (needsUpdate) {
        await product.save();
        console.log(`✅ Updated: ${product.name}`);
      }
    }

    console.log('\n✅ Cleanup completed');
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixProductImagesV2();
