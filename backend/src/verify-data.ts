import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.model.js';

dotenv.config();

const verifyData = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable is not set');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const count = await Product.countDocuments();
        console.log(`📊 Product Count: ${count}`);

        if (count > 0) {
            const product = await Product.findOne();
            console.log('📝 Sample Product:', JSON.stringify(product, null, 2));
        } else {
            console.log('❌ No products found in database');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error verifying data:', error);
        process.exit(1);
    }
};

verifyData();
