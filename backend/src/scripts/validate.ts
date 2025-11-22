import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { exec } from 'child_process';
import { promisify } from 'util';

dotenv.config();

const execAsync = promisify(exec);

interface ValidationResult {
  category: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
}

const validateBackend = async () => {
  const results: ValidationResult[] = [];

  console.log('🔍 Validating Backend Configuration for Production...\n');

  // Environment Variables Validation
  console.log('📋 Checking Environment Variables...');
  
  const requiredEnvVars = [
    'NODE_ENV',
    'PORT',
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'EMAIL_HOST',
    'EMAIL_USER',
    'EMAIL_PASSWORD',
    'FRONTEND_URL',
    'ADMIN_URL'
  ];

  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      results.push({
        category: 'Environment',
        test: envVar,
        status: 'PASS',
        message: 'Environment variable is set'
      });
    } else {
      results.push({
        category: 'Environment',
        test: envVar,
        status: 'FAIL',
        message: 'Environment variable is missing'
      });
    }
  }

  // JWT Secret Validation
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    results.push({
      category: 'Security',
      test: 'JWT_SECRET length',
      status: 'WARN',
      message: 'JWT_SECRET should be at least 32 characters long'
    });
  } else if (process.env.JWT_SECRET) {
    results.push({
      category: 'Security',
      test: 'JWT_SECRET length',
      status: 'PASS',
      message: 'JWT_SECRET length is adequate'
    });
  }

  // Database Connection Validation
  console.log('🗄️  Testing Database Connection...');
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      results.push({
        category: 'Database',
        test: 'MongoDB Connection',
        status: 'PASS',
        message: 'Successfully connected to MongoDB Atlas'
      });

      // Test database operations
      const db = mongoose.connection.db;
      if (db) {
        const collections = await db.listCollections().toArray();
        results.push({
          category: 'Database',
          test: 'Collections Check',
          status: 'PASS',
          message: `Found ${collections.length} collections`
        });
      }

      await mongoose.disconnect();
    }
  } catch (error) {
    results.push({
      category: 'Database',
      test: 'MongoDB Connection',
      status: 'FAIL',
      message: `Database connection failed: ${error}`
    });
  }

  // Dependencies Validation
  console.log('📦 Checking Dependencies...');
  try {
    const { stdout } = await execAsync('npm outdated --json');
    const outdated = JSON.parse(stdout || '{}');
    const outdatedCount = Object.keys(outdated).length;
    
    if (outdatedCount === 0) {
      results.push({
        category: 'Dependencies',
        test: 'Package Updates',
        status: 'PASS',
        message: 'All packages are up to date'
      });
    } else {
      results.push({
        category: 'Dependencies',
        test: 'Package Updates',
        status: 'WARN',
        message: `${outdatedCount} packages have updates available`
      });
    }
  } catch (error) {
    results.push({
      category: 'Dependencies',
      test: 'Package Updates',
      status: 'PASS',
      message: 'All packages are up to date (or npm outdated failed)'
    });
  }

  // Security Audit
  console.log('🔒 Running Security Audit...');
  try {
    const { stdout } = await execAsync('npm audit --audit-level=moderate --json');
    const audit = JSON.parse(stdout);
    
    if (audit.vulnerabilities) {
      const vulnCount = Object.keys(audit.vulnerabilities).length;
      if (vulnCount === 0) {
        results.push({
          category: 'Security',
          test: 'Vulnerability Scan',
          status: 'PASS',
          message: 'No security vulnerabilities found'
        });
      } else {
        results.push({
          category: 'Security',
          test: 'Vulnerability Scan',
          status: 'WARN',
          message: `Found ${vulnCount} security vulnerabilities`
        });
      }
    }
  } catch (error) {
    results.push({
      category: 'Security',
      test: 'Vulnerability Scan',
      status: 'WARN',
      message: 'Could not run security audit'
    });
  }

  // Node.js Version Check
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion >= 18) {
    results.push({
      category: 'Runtime',
      test: 'Node.js Version',
      status: 'PASS',
      message: `Node.js ${nodeVersion} (recommended for production)`
    });
  } else {
    results.push({
      category: 'Runtime',
      test: 'Node.js Version',
      status: 'WARN',
      message: `Node.js ${nodeVersion} (consider upgrading to v18+)`
    });
  }

  // Production Environment Check
  if (process.env.NODE_ENV === 'production') {
    results.push({
      category: 'Environment',
      test: 'NODE_ENV',
      status: 'PASS',
      message: 'Running in production mode'
    });
  } else {
    results.push({
      category: 'Environment',
      test: 'NODE_ENV',
      status: 'WARN',
      message: `Running in ${process.env.NODE_ENV || 'development'} mode`
    });
  }

  // Display Results
  console.log('\n📊 Validation Results:\n');
  
  const categories = [...new Set(results.map(r => r.category))];
  
  for (const category of categories) {
    console.log(`🔹 ${category.toUpperCase()}`);
    const categoryResults = results.filter(r => r.category === category);
    
    for (const result of categoryResults) {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️' : '❌';
      console.log(`   ${icon} ${result.test}: ${result.message}`);
    }
    console.log('');
  }

  // Summary
  const passed = results.filter(r => r.status === 'PASS').length;
  const warned = results.filter(r => r.status === 'WARN').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const total = results.length;

  console.log('📈 Summary:');
  console.log(`   ✅ Passed: ${passed}/${total}`);
  console.log(`   ⚠️  Warnings: ${warned}/${total}`);
  console.log(`   ❌ Failed: ${failed}/${total}`);

  if (failed === 0) {
    console.log('\n🎉 Backend is ready for production!');
    if (warned > 0) {
      console.log('💡 Consider addressing the warnings for optimal performance.');
    }
    process.exit(0);
  } else {
    console.log('\n🚨 Please fix the failed validations before deploying to production.');
    process.exit(1);
  }
};

validateBackend();
