import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  if (!admin.apps.length) {
    try {
      // Check for required Firebase credentials
      const requiredEnvVars = {
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
        FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
        FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
        FIREBASE_DATABASE_URL: process.env.FIREBASE_DATABASE_URL,
      };

      const missingVars = Object.entries(requiredEnvVars)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

      if (missingVars.length > 0) {
        console.log('⚠️  Missing Firebase environment variables:', missingVars.join(', '));
        console.log('⚠️  Running without Firebase features...');
        console.log('\n📋 To get FIREBASE_DATABASE_URL:');
        console.log('   1. Go to https://console.firebase.google.com/');
        console.log('   2. Select your project: vardhman-mills-5942b');
        console.log('   3. Navigate to: Build → Realtime Database');
        console.log('   4. Create database (if not exists) and copy the URL');
        console.log('   5. Add to .env: FIREBASE_DATABASE_URL=https://your-project.firebaseio.com\n');
        return null;
      }

      // Initialize Firebase with all required credentials
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });

      console.log('✅ Firebase Admin initialized successfully');
      console.log(`   - Project: ${process.env.FIREBASE_PROJECT_ID}`);
      console.log(`   - Database: ${process.env.FIREBASE_DATABASE_URL}`);
      
      return admin;
    } catch (error) {
      console.error('❌ Firebase Admin initialization error:', error);
      console.log('⚠️  Continuing without Firebase...');
      return null;
    }
  }
  return admin;
};

export const firebaseAdmin = initializeFirebase();

// Export Firebase services (will be null if initialization failed)
export const messaging = firebaseAdmin?.messaging();
export const auth = firebaseAdmin?.auth();
export const firestore = firebaseAdmin?.firestore();
export const database = firebaseAdmin?.database();

export default firebaseAdmin;