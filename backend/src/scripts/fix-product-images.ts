import mongoose from 'mongoose';
import Product from '../models/Product.model.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixProductImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    const products = await Product.find({});
    console.log(`Found ${products.length} products to update`);

    const updates = [];

    for (const product of products) {
      let needsUpdate = false;
      const updateData: any = {};

      // Check main images
      const cleanMainImages = product.images.filter(img => {
        // Remove blob URLs and placeholder URLs
        return !img.includes('blob:') && !img.includes('via.placeholder.com');
      });

      if (cleanMainImages.length !== product.images.length) {
        updateData.images = cleanMainImages;
        needsUpdate = true;
        console.log(`Product "${product.name}": Cleaned main images (${product.images.length} -> ${cleanMainImages.length})`);
      }

      // Check variant images
      const updatedVariants = product.variants.map(variant => {
        const cleanVariantImages = variant.images.filter(img => {
          // Remove blob URLs and placeholder URLs
          return !img.includes('blob:') && !img.includes('via.placeholder.com');
        });

        if (cleanVariantImages.length !== variant.images.length) {
          needsUpdate = true;
          console.log(`Product "${product.name}", Variant "${variant.sku}": Cleaned variant images (${variant.images.length} -> ${cleanVariantImages.length})`);
        }

        return {
          ...variant,
          images: cleanVariantImages
        };
      });

      if (needsUpdate) {
        updateData.variants = updatedVariants;
        updates.push({
          productId: product._id,
          productName: product.name,
          updateData
        });
      }
    }

    console.log(`\nFound ${updates.length} products that need updates`);

    if (updates.length > 0) {
      console.log('\nApplying updates...');
      
      for (const update of updates) {
        await Product.findByIdAndUpdate(update.productId, update.updateData);
        console.log(`✅ Updated: ${update.productName}`);
      }

      console.log(`\n✅ Successfully updated ${updates.length} products`);
    } else {
      console.log('\n✅ No updates needed - all products are clean');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixProductImages();
