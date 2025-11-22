import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'http://localhost:5000';

interface TestResult {
  endpoint: string;
  method: string;
  status: number;
  success: boolean;
  data?: any;
  error?: string;
}

const makeRequest = (path: string, method: string = 'GET', postData?: string): Promise<TestResult> => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            endpoint: path,
            method,
            status: res.statusCode || 0,
            success: (res.statusCode || 0) < 400,
            data: jsonData
          });
        } catch (error) {
          resolve({
            endpoint: path,
            method,
            status: res.statusCode || 0,
            success: (res.statusCode || 0) < 400,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        endpoint: path,
        method,
        status: 0,
        success: false,
        error: error.message
      });
    });

    if (postData && method === 'POST') {
      req.write(postData);
    }
    
    req.end();
  });
};

const runTests = async () => {
  console.log('🧪 Testing API Endpoints...\n');
  
  const tests = [
    { path: '/api/health', method: 'GET' },
    { path: '/api/docs', method: 'GET' },
    { path: '/api/v1/categories', method: 'GET' },
    { path: '/api/v1/products', method: 'GET' },
    { path: '/api/v1/products/featured', method: 'GET' },
    { path: '/api/v1/products/premium-cotton-bed-sheet-set', method: 'GET' },
    { path: '/api/v1/products/search?q=bed', method: 'GET' },
    { 
      path: '/api/v1/auth/login', 
      method: 'POST', 
      data: JSON.stringify({
        email: 'admin@vardhmanmills.com',
        password: 'Admin@123'
      })
    },
    { 
      path: '/api/v1/auth/login', 
      method: 'POST', 
      data: JSON.stringify({
        email: 'john@example.com',
        password: 'User@123'
      })
    },
    {
      path: '/api/v1/auth/register',
      method: 'POST',
      data: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'Test@123',
        mobile: '+91 9876543214'
      })
    }
  ];

  const results: TestResult[] = [];

  for (const test of tests) {
    console.log(`Testing ${test.method} ${test.path}...`);
    const result = await makeRequest(test.path, test.method, test.data);
    results.push(result);
    
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Display Results
  console.log('\n📊 Test Results:\n');
  
  for (const test of results) {
    const statusIcon = test.success ? '✅' : '❌';
    const statusCode = test.status > 0 ? `${test.status}` : 'FAIL';
    
    console.log(`${statusIcon} ${test.method} ${test.endpoint} - ${statusCode}`);
    
    if (test.success && test.data) {
      if (test.endpoint === '/api/health') {
        console.log(`   Status: ${test.data.status}`);
        console.log(`   Message: ${test.data.message}`);
        if (test.data.uptime) console.log(`   Uptime: ${Math.round(test.data.uptime)}s`);
      } else if (test.endpoint === '/api/v1/categories' && test.data.data) {
        console.log(`   Categories found: ${test.data.data.length}`);
      } else if (test.endpoint === '/api/v1/products/featured' && test.data.data) {
        console.log(`   Featured products found: ${test.data.data.length}`);
      } else if (test.endpoint === '/api/v1/products/premium-cotton-bed-sheet-set') {
        if (test.data.status === 'success') {
          console.log(`   Product details retrieved successfully`);
          if (test.data.data?.name) console.log(`   Product: ${test.data.data.name}`);
        }
      } else if (test.endpoint.includes('/api/v1/products/search')) {
        if (test.data.data) {
          console.log(`   Search results: ${test.data.data.length} products`);
        }
      } else if (test.endpoint === '/api/v1/auth/register') {
        if (test.data.status === 'success') {
          console.log(`   Registration successful!`);
        } else {
          console.log(`   Message: ${test.data.message || 'Registration failed'}`);
        }
      } else if (test.endpoint === '/api/v1/auth/login') {
        if (test.data.status === 'success') {
          console.log(`   Login successful!`);
          if (test.data.data?.user?.email) console.log(`   User: ${test.data.data.user.email}`);
        } else {
          console.log(`   Message: ${test.data.message || 'Login failed'}`);
        }
      } else if (test.endpoint === '/api/docs') {
        console.log(`   API Documentation available`);
        if (test.data.version) console.log(`   Version: ${test.data.version}`);
      }
    } else if (test.error) {
      console.log(`   Error: ${test.error}`);
    } else if (test.data?.message) {
      console.log(`   Message: ${test.data.message}`);
    }
    
    console.log('');
  }

  // Summary
  const passed = results.filter(t => t.success).length;
  const total = results.length;
  
  console.log(`📈 Summary: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All API endpoints are working correctly!');
  } else {
    console.log('⚠️  Some endpoints need attention.');
  }
};

runTests().catch(console.error);
