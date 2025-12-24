/**
 * Seed Script: Update Product Sales Count
 * 
 * This script updates all products with random salesCount values
 * to populate the bestsellers section.
 * 
 * Run: node dist/scripts/seedSalesCount.js
 */

import mongoose from 'mongoose';
import Product from '../models/Product.model.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vardhman-mills';

async function seedSalesCount() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get all products
        const products = await Product.find({ isActive: true });
        console.log(`📦 Found ${products.length} active products`);

        if (products.length === 0) {
            console.log('⚠️  No products found. Please seed products first.');
            process.exit(0);
        }

        // Update each product with random sales count
        const updatePromises = products.map(async (product) => {
            // Generate random sales count between 10 and 500
            const salesCount = Math.floor(Math.random() * (500 - 10 + 1)) + 10;

            product.salesCount = salesCount;
            await product.save();

            return { name: product.name, salesCount };
        });

        const updatedProducts = await Promise.all(updatePromises);

        console.log('✅ Updated products with sales counts:');

        // Show top 10 bestsellers
        const sortedProducts = updatedProducts
            .sort((a, b) => b.salesCount - a.salesCount)
            .slice(0, 10);

        console.log('\n📊 Top 10 Bestsellers:');
        sortedProducts.forEach((p, index) => {
            console.log(`${index + 1}. ${p.name}: ${p.salesCount} sales`);
        });

        console.log(`\n✅ Successfully updated ${products.length} products!`);
        console.log('🔄 Restart your backend server to see changes.');

    } catch (error) {
        console.error('❌ Error seeding sales count:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB');
        process.exit(0);
    }
}

// Run the seed script
seedSalesCount();
