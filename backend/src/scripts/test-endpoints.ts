// Simple Node.js script to test API endpoints
import http from 'http';

const BASE_URL = 'localhost';
const PORT = 5000;

function makeRequest(path: string, method: string = 'GET', data: any = null): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            data: jsonBody,
            path: path,
            method: method
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body,
            path: path,
            method: method
          });
        }
      });
    });

    req.on('error', (err) => {
      reject({
        error: err.message,
        path: path,
        method: method
      });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testEndpoints() {
  console.log('🧪 Testing Vardhman Mills Backend API Endpoints...\n');

  const endpoints = [
    { path: '/', name: 'Root endpoint' },
    { path: '/api/health', name: 'Health check' },
    { path: '/api/docs', name: 'API documentation' },
    { path: '/api/v1/categories', name: 'Categories list' },
    { path: '/api/v1/products', name: 'Products list' },
    { path: '/api/v1/products/featured', name: 'Featured products' },
  ];

  const results = [];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.name} (${endpoint.path})...`);
      const result: any = await makeRequest(endpoint.path);
      
      if (result.status >= 200 && result.status < 300) {
        console.log(`✅ ${endpoint.name}: SUCCESS (${result.status})`);
        if (result.data.message) {
          console.log(`   Message: ${result.data.message}`);
        }
        if (endpoint.path === '/api/v1/categories' && result.data.data) {
          console.log(`   Categories found: ${result.data.data.length}`);
        }
        if (endpoint.path === '/api/v1/products' && result.data.data) {
          console.log(`   Products found: ${result.data.data.length}`);
        }
        results.push({ ...endpoint, status: 'PASS', code: result.status });
      } else {
        console.log(`❌ ${endpoint.name}: FAILED (${result.status})`);
        results.push({ ...endpoint, status: 'FAIL', code: result.status });
      }
    } catch (error: any) {
      console.log(`❌ ${endpoint.name}: ERROR - ${error.error || error.message}`);
      results.push({ ...endpoint, status: 'ERROR', error: error.error || error.message });
    }
    
    console.log('');
    
    // Add small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const errors = results.filter(r => r.status === 'ERROR').length;
  const total = results.length;
  
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${failed}/${total}`);
  console.log(`🚨 Errors: ${errors}/${total}`);
  console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  
  if (passed === total) {
    console.log('\n🎉 All endpoints are working perfectly!');
    console.log('🌐 Your backend is ready for production!');
    console.log(`\n🔗 Access your API at: http://localhost:${PORT}`);
    console.log(`📝 API Documentation: http://localhost:${PORT}/api/docs`);
    console.log(`💖 Health Check: http://localhost:${PORT}/api/health`);
  } else {
    console.log('\n⚠️  Some endpoints need attention.');
  }
}

testEndpoints().catch(console.error);
