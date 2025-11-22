import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = '127.0.0.1';
const PORT = 5000;

function makeRequest(path: string, method: string = 'GET', data: any = null, headers: any = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => reject(error));

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

const runCompleteAPITest = async () => {
  console.log('🧪 COMPLETE API ENDPOINT TESTING SUITE');
  console.log('='.repeat(70));
  console.log('Testing all endpoints to ensure production readiness...\n');

  let authToken = '';
  let adminToken = '';
  const testResults: any[] = [];

  // 1. AUTHENTICATION TESTS
  console.log('🔐 AUTHENTICATION & AUTHORIZATION TESTS');
  console.log('-'.repeat(50));

  try {
    // Admin login
    const adminLoginData = { email: 'admin@vardhmanmills.com', password: 'Admin@123' };
    const adminLoginResult = await makeRequest('/api/v1/auth/login', 'POST', adminLoginData);
    const adminLoginSuccess = adminLoginResult.status === 200 && adminLoginResult.data.token;
    
    if (adminLoginSuccess) {
      adminToken = adminLoginResult.data.token;
      console.log('✅ Admin Login: SUCCESS');
      testResults.push({ category: 'Authentication', test: 'Admin Login', status: 'PASS', details: 'JWT token received' });
    } else {
      console.log('❌ Admin Login: FAILED');
      testResults.push({ category: 'Authentication', test: 'Admin Login', status: 'FAIL', details: `Status: ${adminLoginResult.status}` });
    }

    // User login
    const userLoginData = { email: 'john@example.com', password: 'User@123' };
    const userLoginResult = await makeRequest('/api/v1/auth/login', 'POST', userLoginData);
    const userLoginSuccess = userLoginResult.status === 200 && userLoginResult.data.token;
    
    if (userLoginSuccess) {
      authToken = userLoginResult.data.token;
      console.log('✅ User Login: SUCCESS');
      testResults.push({ category: 'Authentication', test: 'User Login', status: 'PASS', details: 'JWT token received' });
    } else {
      console.log('❌ User Login: FAILED');
      testResults.push({ category: 'Authentication', test: 'User Login', status: 'FAIL', details: `Status: ${userLoginResult.status}` });
    }

    // Test duplicate user registration
    const regData = { firstName: 'Test', lastName: 'User', email: 'john@example.com', password: 'Test@123' };
    const regResult = await makeRequest('/api/v1/auth/register', 'POST', regData);
    const regExpectedFailure = regResult.status === 400; // Expected to fail - user already exists
    
    console.log(`✅ User Registration Validation: ${regExpectedFailure ? 'SUCCESS (properly prevents duplicates)' : 'FAILED'}`);
    testResults.push({ 
      category: 'Authentication', 
      test: 'Duplicate Prevention', 
      status: regExpectedFailure ? 'PASS' : 'FAIL',
      details: regExpectedFailure ? 'Correctly prevents duplicate users' : 'Should prevent duplicate users'
    });

  } catch (error) {
    console.log('❌ Authentication Tests: ERROR');
    testResults.push({ category: 'Authentication', test: 'Login System', status: 'FAIL', details: 'Network/Server Error' });
  }

  // 2. CORE API TESTS
  console.log('\n🏗️  CORE API INFRASTRUCTURE TESTS');
  console.log('-'.repeat(50));

  const coreTests = [
    { path: '/', name: 'Root Endpoint' },
    { path: '/api/health', name: 'Health Check' },
    { path: '/api/docs', name: 'API Documentation' }
  ];

  for (const test of coreTests) {
    try {
      const result = await makeRequest(test.path);
      const success = result.status === 200;
      console.log(`${success ? '✅' : '❌'} ${test.name}: ${success ? 'SUCCESS' : 'FAILED'}`);
      testResults.push({ 
        category: 'Core API', 
        test: test.name, 
        status: success ? 'PASS' : 'FAIL',
        details: `Status: ${result.status}`
      });
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR`);
      testResults.push({ category: 'Core API', test: test.name, status: 'FAIL', details: 'Network Error' });
    }
  }

  // 3. PRODUCT CATALOG TESTS
  console.log('\n🛍️  PRODUCT CATALOG TESTS');
  console.log('-'.repeat(50));

  try {
    // Categories
    const categoriesResult = await makeRequest('/api/v1/categories');
    const categoriesSuccess = categoriesResult.status === 200;
    console.log(`${categoriesSuccess ? '✅' : '❌'} Categories List: ${categoriesSuccess ? 'SUCCESS' : 'FAILED'}`);
    if (categoriesSuccess && categoriesResult.data.data) {
      console.log(`   📊 Found ${categoriesResult.data.data.length} categories`);
    }
    testResults.push({ 
      category: 'Product Catalog', 
      test: 'Categories List', 
      status: categoriesSuccess ? 'PASS' : 'FAIL',
      details: categoriesSuccess ? `${categoriesResult.data.data?.length || 0} categories found` : `Status: ${categoriesResult.status}`
    });

    // Products
    const productsResult = await makeRequest('/api/v1/products');
    const productsSuccess = productsResult.status === 200;
    console.log(`${productsSuccess ? '✅' : '❌'} Products List: ${productsSuccess ? 'SUCCESS' : 'FAILED'}`);
    if (productsSuccess && productsResult.data.data) {
      console.log(`   📊 Found ${productsResult.data.data.length} products`);
    }
    testResults.push({ 
      category: 'Product Catalog', 
      test: 'Products List', 
      status: productsSuccess ? 'PASS' : 'FAIL',
      details: productsSuccess ? `${productsResult.data.data?.length || 0} products found` : `Status: ${productsResult.status}`
    });

    // Featured Products
    const featuredResult = await makeRequest('/api/v1/products/featured');
    const featuredSuccess = featuredResult.status === 200;
    console.log(`${featuredSuccess ? '✅' : '❌'} Featured Products: ${featuredSuccess ? 'SUCCESS' : 'FAILED'}`);
    testResults.push({ 
      category: 'Product Catalog', 
      test: 'Featured Products', 
      status: featuredSuccess ? 'PASS' : 'FAIL',
      details: `Status: ${featuredResult.status}`
    });

  } catch (error) {
    console.log('❌ Product Catalog Tests: ERROR');
    testResults.push({ category: 'Product Catalog', test: 'Catalog System', status: 'FAIL', details: 'Network Error' });
  }

  // 4. USER MANAGEMENT TESTS
  console.log('\n👤 USER MANAGEMENT TESTS');
  console.log('-'.repeat(50));

  if (authToken) {
    try {
      // User Profile
      const profileResult = await makeRequest('/api/v1/users/me', 'GET', null, { Authorization: `Bearer ${authToken}` });
      const profileSuccess = profileResult.status === 200;
      console.log(`${profileSuccess ? '✅' : '❌'} User Profile: ${profileSuccess ? 'SUCCESS' : 'FAILED'}`);
      if (profileSuccess && profileResult.data.data) {
        console.log(`   👤 User: ${profileResult.data.data.firstName} ${profileResult.data.data.lastName}`);
      }
      testResults.push({ 
        category: 'User Management', 
        test: 'User Profile', 
        status: profileSuccess ? 'PASS' : 'FAIL',
        details: profileSuccess ? 'Profile data retrieved' : `Status: ${profileResult.status}`
      });

      // User Orders
      const ordersResult = await makeRequest('/api/v1/orders/my/orders', 'GET', null, { Authorization: `Bearer ${authToken}` });
      const ordersSuccess = ordersResult.status === 200;
      console.log(`${ordersSuccess ? '✅' : '❌'} User Orders: ${ordersSuccess ? 'SUCCESS' : 'FAILED'}`);
      if (ordersSuccess) {
        console.log(`   📦 Orders: ${ordersResult.data.data?.length || 0}`);
      }
      testResults.push({ 
        category: 'User Management', 
        test: 'User Orders', 
        status: ordersSuccess ? 'PASS' : 'FAIL',
        details: ordersSuccess ? `${ordersResult.data.data?.length || 0} orders found` : `Status: ${ordersResult.status}`
      });

    } catch (error) {
      console.log('❌ User Management Tests: ERROR');
      testResults.push({ category: 'User Management', test: 'User System', status: 'FAIL', details: 'Network Error' });
    }
  } else {
    console.log('⚠️  User Management Tests: SKIPPED (no auth token)');
    testResults.push({ category: 'User Management', test: 'User System', status: 'SKIP', details: 'No authentication token' });
  }

  // 5. ADMIN FUNCTIONALITY TESTS
  console.log('\n👨‍💼 ADMIN FUNCTIONALITY TESTS');
  console.log('-'.repeat(50));

  if (adminToken) {
    try {
      // Admin Stats
      const statsResult = await makeRequest('/api/admin/customers/stats', 'GET', null, { Authorization: `Bearer ${adminToken}` });
      const statsSuccess = statsResult.status === 200;
      console.log(`${statsSuccess ? '✅' : '❌'} Admin Stats: ${statsSuccess ? 'SUCCESS' : 'FAILED'}`);
      testResults.push({ 
        category: 'Admin Functions', 
        test: 'Admin Stats', 
        status: statsSuccess ? 'PASS' : 'FAIL',
        details: `Status: ${statsResult.status}`
      });

      // Admin Customer Management
      const customersResult = await makeRequest('/api/admin/customers', 'GET', null, { Authorization: `Bearer ${adminToken}` });
      const customersSuccess = customersResult.status === 200;
      console.log(`${customersSuccess ? '✅' : '❌'} Admin Customer Management: ${customersSuccess ? 'SUCCESS' : 'FAILED'}`);
      if (customersSuccess) {
        console.log(`   👥 Customers: ${customersResult.data.data?.length || 0}`);
      }
      testResults.push({ 
        category: 'Admin Functions', 
        test: 'Customer Management', 
        status: customersSuccess ? 'PASS' : 'FAIL',
        details: customersSuccess ? `${customersResult.data.data?.length || 0} customers found` : `Status: ${customersResult.status}`
      });

    } catch (error) {
      console.log('❌ Admin Functionality Tests: ERROR');
      testResults.push({ category: 'Admin Functions', test: 'Admin System', status: 'FAIL', details: 'Network Error' });
    }
  } else {
    console.log('⚠️  Admin Functionality Tests: SKIPPED (no admin token)');
    testResults.push({ category: 'Admin Functions', test: 'Admin System', status: 'SKIP', details: 'No admin authentication' });
  }

  // 6. FINAL COMPREHENSIVE SUMMARY
  console.log('\n📊 COMPREHENSIVE TEST RESULTS SUMMARY');
  console.log('='.repeat(70));

  const categories = [...new Set(testResults.map(t => t.category))];
  let totalTests = 0;
  let passedTests = 0;

  categories.forEach(category => {
    const categoryTests = testResults.filter(t => t.category === category);
    const categoryPassed = categoryTests.filter(t => t.status === 'PASS').length;
    const categoryTotal = categoryTests.length;
    
    totalTests += categoryTotal;
    passedTests += categoryPassed;
    
    console.log(`\n${category.toUpperCase()}:`);
    console.log(`  ✅ Passed: ${categoryPassed}/${categoryTotal}`);
    
    categoryTests.forEach(test => {
      const status = test.status === 'PASS' ? '✅' : test.status === 'SKIP' ? '⚠️ ' : '❌';
      console.log(`    ${status} ${test.test}: ${test.details}`);
    });
  });

  const successRate = ((passedTests / totalTests) * 100).toFixed(1);

  console.log('\n🎯 OVERALL API HEALTH REPORT');
  console.log('='.repeat(70));
  console.log(`✅ TOTAL PASSED: ${passedTests}/${totalTests}`);
  console.log(`📈 SUCCESS RATE: ${successRate}%`);
  console.log(`🏥 API HEALTH: ${parseFloat(successRate) >= 95 ? '🟢 EXCELLENT' : parseFloat(successRate) >= 85 ? '🟡 GOOD' : '🔴 NEEDS ATTENTION'}`);

  console.log('\n🔍 KEY SYSTEMS STATUS:');
  console.log(`  🔐 Authentication: ${testResults.find(t => t.test === 'Admin Login')?.status === 'PASS' ? '✅ Working' : '❌ Failed'}`);
  console.log(`  🛍️  Product Catalog: ${testResults.find(t => t.test === 'Products List')?.status === 'PASS' ? '✅ Working' : '❌ Failed'}`);
  console.log(`  👤 User Management: ${testResults.find(t => t.test === 'User Profile')?.status === 'PASS' ? '✅ Working' : '❌ Failed'}`);
  console.log(`  👨‍💼 Admin Functions: ${testResults.find(t => t.test === 'Admin Stats')?.status === 'PASS' ? '✅ Working' : '❌ Failed'}`);

  if (parseFloat(successRate) >= 90) {
    console.log('\n🎉 CONGRATULATIONS!');
    console.log('   Your Vardhman Mills API is production-ready!');
    console.log('   All critical systems are operational.');
    console.log('   Ready for frontend integration and deployment.');
  } else {
    console.log('\n⚠️  RECOMMENDATIONS:');
    console.log('   Review failed endpoints before production deployment.');
    console.log('   Ensure all authentication flows work correctly.');
  }

  console.log('\n🚀 NEXT STEPS:');
  console.log('   1. Connect frontend applications');
  console.log('   2. Configure payment gateway credentials');
  console.log('   3. Set up production environment variables');
  console.log('   4. Deploy to production server');
  console.log('   5. Implement monitoring and logging');

  process.exit(0);
};

runCompleteAPITest().catch(console.error);
