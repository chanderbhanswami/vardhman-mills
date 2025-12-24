import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Collection from '../models/collection.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function seedCollections() {
    try {
        // Connect to MongoDB
        const MONGO_URI = process.env.DB_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/vardhman_mills';
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB successfully');

        // Check if collections already exist
        const existingCount = await Collection.countDocuments();
        console.log(`Existing collections count: ${existingCount}`);

        if (existingCount > 0) {
            console.log('Collections already exist. Skipping seed.');
            process.exit(0);
        }

        // Sample collections to seed
        const collections = [
            {
                name: 'Summer Collection',
                slug: 'summer-collection',
                description: 'Light and breezy fabrics perfect for summer',
                type: 'manual',
                status: 'active',
                isActive: true,
                isFeatured: true,
                image: {
                    url: '/images/collections/summer.jpg',
                    alt: 'Summer Collection'
                },
                manualProducts: [],
            },
            {
                name: 'Premium Linens',
                slug: 'premium-linens',
                description: 'Luxurious linen fabrics for every occasion',
                type: 'manual',
                status: 'active',
                isActive: true,
                isFeatured: true,
                image: {
                    url: '/images/collections/linens.jpg',
                    alt: 'Premium Linens'
                },
                manualProducts: [],
            },
            {
                name: 'Cotton Classics',
                slug: 'cotton-classics',
                description: 'Timeless cotton fabrics in various weaves',
                type: 'manual',
                status: 'active',
                isActive: true,
                isFeatured: false,
                image: {
                    url: '/images/collections/cotton.jpg',
                    alt: 'Cotton Classics'
                },
                manualProducts: [],
            },
            {
                name: 'Designer Prints',
                slug: 'designer-prints',
                description: 'Exclusive printed fabrics from top designers',
                type: 'manual',
                status: 'active',
                isActive: true,
                isFeatured: true,
                image: {
                    url: '/images/collections/prints.jpg',
                    alt: 'Designer Prints'
                },
                manualProducts: [],
            },
            {
                name: 'Eco-Friendly',
                slug: 'eco-friendly',
                description: 'Sustainable and environmentally conscious textiles',
                type: 'manual',
                status: 'active',
                isActive: true,
                isFeatured: false,
                image: {
                    url: '/images/collections/eco.jpg',
                    alt: 'Eco-Friendly Collection'
                },
                manualProducts: [],
            },
            {
                name: 'Winter Warmth',
                slug: 'winter-warmth',
                description: 'Cozy and warm fabrics for the cold season',
                type: 'manual',
                status: 'active',
                isActive: true,
                isFeatured: true,
                image: {
                    url: '/images/collections/winter.jpg',
                    alt: 'Winter Collection'
                },
                manualProducts: [],
            },
        ];

        // Insert collections
        console.log('Creating collections...');
        const createdCollections = await Collection.insertMany(collections);
        console.log(`✅ Successfully created ${createdCollections.length} collections`);

        // Log created collection names
        createdCollections.forEach((collection: any) => {
            console.log(`  - ${collection.name} (${collection.slug})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding collections:', error);
        process.exit(1);
    }
}

// Run the seed function
seedCollections();
