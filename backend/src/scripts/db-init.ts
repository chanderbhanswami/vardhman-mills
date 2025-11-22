import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const initializeDatabase = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas successfully!');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }
    
    const dbName = db.databaseName;
    
    console.log(`📊 Database: ${dbName}`);
    
    // Check existing collections
    const collections = await db.listCollections().toArray();
    console.log(`📁 Existing collections: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log('   Collections found:');
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
    }

    // Create collections if they don't exist
    const requiredCollections = ['users', 'categories', 'products', 'orders', 'reviews'];
    
    for (const collectionName of requiredCollections) {
      const exists = collections.some(col => col.name === collectionName);
      if (!exists) {
        await db.createCollection(collectionName);
        console.log(`✅ Created collection: ${collectionName}`);
      } else {
        console.log(`ℹ️  Collection already exists: ${collectionName}`);
      }
    }

    // Test database operations
    console.log('\n🧪 Testing database operations...');
    
    // Test write operation
    const testDoc = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Test Document',
      createdAt: new Date(),
      isTest: true
    };
    
    await db.collection('test_collection').insertOne(testDoc);
    console.log('✅ Write operation: SUCCESS');
    
    // Test read operation
    const foundDoc = await db.collection('test_collection').findOne({ _id: testDoc._id });
    console.log('✅ Read operation: SUCCESS');
    
    // Test update operation
    await db.collection('test_collection').updateOne(
      { _id: testDoc._id },
      { $set: { updated: true, updatedAt: new Date() } }
    );
    console.log('✅ Update operation: SUCCESS');
    
    // Test delete operation
    await db.collection('test_collection').deleteOne({ _id: testDoc._id });
    console.log('✅ Delete operation: SUCCESS');
    
    // Clean up test collection
    await db.collection('test_collection').drop().catch(() => {});
    
    console.log('\n🎉 Database initialization completed successfully!');
    console.log('💡 You can now run: npm run seed:dev to populate with sample data');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

initializeDatabase();
