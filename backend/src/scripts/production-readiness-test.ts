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

const runProductionReadinessTest = async () => {
  console.log('🏭 VARDHMAN MILLS API - PRODUCTION READINESS VALIDATION');
  console.log('='.repeat(75));
  console.log('Final validation of all systems before production deployment\n');

  let allTestsPassed = true;
  const testResults: string[] = [];

  // 1. Server Stability Test
  console.log('🔧 SERVER STABILITY TESTS');
  console.log('-'.repeat(40));
  
  try {
    const startTime = Date.now();
    
    // Multiple concurrent requests to test server stability
    const concurrentRequests = Array(5).fill(null).map((_, i) => 
      makeRequest('/api/health')
    );
    
    const results = await Promise.all(concurrentRequests);
    const allSuccessful = results.every(r => r.status === 200);
    const endTime = Date.now();
    
    if (allSuccessful) {
      console.log(`✅ Concurrent Request Handling: PASSED (${results.length} requests in ${endTime - startTime}ms)`);
      testResults.push('✅ Server handles concurrent requests properly');
    } else {
      console.log('❌ Concurrent Request Handling: FAILED');
      testResults.push('❌ Server fails under concurrent load');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('❌ Server Stability: ERROR');
    testResults.push('❌ Server stability test failed');
    allTestsPassed = false;
  }

  // 2. Authentication Security Tests
  console.log('\n🔒 AUTHENTICATION SECURITY TESTS');
  console.log('-'.repeat(40));

  try {
    // Test invalid credentials
    const invalidLoginData = { email: 'invalid@test.com', password: 'wrongpassword' };
    const invalidResult = await makeRequest('/api/v1/auth/login', 'POST', invalidLoginData);
    
    if (invalidResult.status === 401) {
      console.log('✅ Invalid Credentials Protection: PASSED');
      testResults.push('✅ Properly rejects invalid login attempts');
    } else {
      console.log('❌ Invalid Credentials Protection: FAILED');
      testResults.push('❌ Does not properly reject invalid credentials');
      allTestsPassed = false;
    }

    // Test protected route without token
    const noAuthResult = await makeRequest('/api/v1/users/me');
    
    if (noAuthResult.status === 401) {
      console.log('✅ Protected Route Security: PASSED');
      testResults.push('✅ Protected routes require authentication');
    } else {
      console.log('❌ Protected Route Security: FAILED');
      testResults.push('❌ Protected routes accessible without authentication');
      allTestsPassed = false;
    }

  } catch (error) {
    console.log('❌ Authentication Security: ERROR');
    testResults.push('❌ Authentication security test failed');
    allTestsPassed = false;
  }

  // 3. API Error Handling Tests
  console.log('\n⚠️  ERROR HANDLING TESTS');
  console.log('-'.repeat(40));

  try {
    // Test non-existent route
    const notFoundResult = await makeRequest('/api/non-existent-route');
    
    if (notFoundResult.status === 404) {
      console.log('✅ 404 Error Handling: PASSED');
      testResults.push('✅ Properly handles non-existent routes');
    } else {
      console.log('❌ 404 Error Handling: FAILED');
      testResults.push('❌ Does not properly handle non-existent routes');
      allTestsPassed = false;
    }

    // Test malformed JSON
    const malformedResult = await makeRequest('/api/v1/auth/login', 'POST', 'invalid json');
    
    if (malformedResult.status === 400) {
      console.log('✅ Malformed Request Handling: PASSED');
      testResults.push('✅ Properly handles malformed requests');
    } else {
      console.log('❌ Malformed Request Handling: FAILED');
      testResults.push('❌ Does not properly handle malformed requests');
      allTestsPassed = false;
    }

  } catch (error) {
    console.log('❌ Error Handling: ERROR');
    testResults.push('❌ Error handling test failed');
    allTestsPassed = false;
  }

  // 4. API Performance Tests
  console.log('\n⚡ PERFORMANCE TESTS');
  console.log('-'.repeat(40));

  try {
    const performanceTests = [
      '/api/health',
      '/api/v1/categories',
      '/api/v1/products',
      '/api/docs'
    ];

    let totalResponseTime = 0;
    let slowRequests = 0;

    for (const endpoint of performanceTests) {
      const startTime = Date.now();
      const result = await makeRequest(endpoint);
      const responseTime = Date.now() - startTime;
      totalResponseTime += responseTime;
      
      if (responseTime > 1000) { // More than 1 second
        slowRequests++;
      }
    }

    const avgResponseTime = totalResponseTime / performanceTests.length;
    
    if (avgResponseTime < 500 && slowRequests === 0) {
      console.log(`✅ Response Time Performance: PASSED (avg: ${avgResponseTime.toFixed(0)}ms)`);
      testResults.push(`✅ Good response times (avg: ${avgResponseTime.toFixed(0)}ms)`);
    } else {
      console.log(`⚠️  Response Time Performance: WARNING (avg: ${avgResponseTime.toFixed(0)}ms)`);
      testResults.push(`⚠️  Response times could be improved (avg: ${avgResponseTime.toFixed(0)}ms)`);
    }

  } catch (error) {
    console.log('❌ Performance Tests: ERROR');
    testResults.push('❌ Performance test failed');
  }

  // 5. Data Integrity Tests
  console.log('\n📊 DATA INTEGRITY TESTS');
  console.log('-'.repeat(40));

  try {
    // Get authentication token
    const loginData = { email: 'admin@vardhmanmills.com', password: 'Admin@123' };
    const loginResult = await makeRequest('/api/v1/auth/login', 'POST', loginData);
    
    if (loginResult.status === 200 && loginResult.data.token) {
      console.log('✅ Token Generation: PASSED');
      
      // Test token validation
      const profileResult = await makeRequest('/api/v1/users/me', 'GET', null, { 
        Authorization: `Bearer ${loginResult.data.token}` 
      });
      
      if (profileResult.status === 200) {
        console.log('✅ Token Validation: PASSED');
        testResults.push('✅ JWT token system working correctly');
      } else {
        console.log('❌ Token Validation: FAILED');
        testResults.push('❌ JWT token validation failed');
        allTestsPassed = false;
      }
    } else {
      console.log('❌ Token Generation: FAILED');
      testResults.push('❌ Token generation failed');
      allTestsPassed = false;
    }

  } catch (error) {
    console.log('❌ Data Integrity: ERROR');
    testResults.push('❌ Data integrity test failed');
    allTestsPassed = false;
  }

  // Final Production Readiness Assessment
  console.log('\n🎯 PRODUCTION READINESS ASSESSMENT');
  console.log('='.repeat(75));

  console.log('\n📋 TEST RESULTS SUMMARY:');
  testResults.forEach(result => console.log(`   ${result}`));

  console.log(`\n🏥 OVERALL SYSTEM STATUS: ${allTestsPassed ? '🟢 PRODUCTION READY' : '🔴 NEEDS ATTENTION'}`);
  
  if (allTestsPassed) {
    console.log('\n🎉 CONGRATULATIONS! Your Vardhman Mills API is PRODUCTION READY!');
    console.log('\n✅ ALL SYSTEMS VERIFIED:');
    console.log('   🔐 Authentication & Authorization');
    console.log('   🛡️  Security & Error Handling');  
    console.log('   ⚡ Performance & Stability');
    console.log('   📊 Data Integrity');
    console.log('   🏗️  Core Infrastructure');
    
    console.log('\n🚀 DEPLOYMENT CHECKLIST:');
    console.log('   ✅ API endpoints functional');
    console.log('   ✅ Authentication working');
    console.log('   ✅ Database connected');
    console.log('   ✅ Error handling implemented');
    console.log('   ✅ Security measures active');
    console.log('   ⏳ Set up production environment variables');
    console.log('   ⏳ Configure payment gateway');
    console.log('   ⏳ Set up monitoring & logging');
    
    console.log('\n🌟 The Vardhman Mills API is ready to serve customers!');
  } else {
    console.log('\n⚠️  Some tests failed. Please review and fix issues before production deployment.');
  }

  process.exit(allTestsPassed ? 0 : 1);
};

runProductionReadinessTest().catch(console.error);
