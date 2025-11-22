const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const HOST = 'localhost';
const PORT = 5000;
const ADMIN_EMAIL = 'admin@vardhmanmills.com';
const ADMIN_PASSWORD = 'Admin@123';
const USER_EMAIL = 'john@example.com';
const USER_PASSWORD = 'User@123';

// Test statistics
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let skippedTests = 0;
const failedEndpoints = [];
const testIds = {};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Tokens
let adminToken = null;
let userToken = null;

/**
 * Make HTTP request
 */
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: { raw: body } });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Test an endpoint
 */
async function testEndpoint(name, method, path, expectedStatuses, data = null, token = null, category = 'General') {
  totalTests++;
  try {
    const result = await makeRequest(method, path, data, token);
    
    // Accept multiple status codes
    const statusArray = Array.isArray(expectedStatuses) ? expectedStatuses : [expectedStatuses];
    
    if (statusArray.includes(result.status)) {
      passedTests++;
      process.stdout.write(`${colors.green}✓${colors.reset}`);
      return result.data;
    } else {
      failedTests++;
      const errorMsg = result.data?.message || result.data?.error || JSON.stringify(result.data).substring(0, 100);
      failedEndpoints.push({ 
        name, 
        expected: statusArray.join(' or '), 
        got: result.status, 
        path, 
        error: errorMsg,
        category 
      });
      process.stdout.write(`${colors.red}✗${colors.reset}`);
      return null;
    }
  } catch (error) {
    failedTests++;
    failedEndpoints.push({ name, error: error.message, path, category });
    process.stdout.write(`${colors.red}✗${colors.reset}`);
    return null;
  }
}

/**
 * Parse route files to extract endpoints
 */
function parseRouteFile(filePath, routeMappings) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath, '.ts');
  const endpoints = [];
  
  // Get the correct base prefix from route mappings
  const prefix = routeMappings[fileName] || '/api/v1/' + fileName.replace('.routes', '');
  
  // Extract simple route definitions: router.method('path', ...)
  const simpleRouteRegex = /router\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g;
  let match;
  
  while ((match = simpleRouteRegex.exec(content)) !== null) {
    const [, method, routePath] = match;
    
    // Skip middleware-only routes
    if (routePath.includes('*')) continue;
    
    // Construct full path
    const fullPath = routePath === '/' ? prefix : `${prefix}${routePath}`;
    
    endpoints.push({
      method: method.toUpperCase(),
      path: routePath,
      fullPath: fullPath,
      file: fileName,
      requiresAuth: content.includes('protect') || content.includes('restrictTo'),
      requiresAdmin: content.includes("restrictTo('admin')") || content.includes('restrictTo("admin")')
    });
  }
  
  return endpoints;
}

/**
 * Get all route files
 */
function getAllRouteFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory() && !file.startsWith('.')) {
      results = results.concat(getAllRouteFiles(filePath));
    } else if (file.endsWith('.routes.ts') && !file.includes('.test.')) {
      results.push(filePath);
    }
  });
  
  return results;
}

/**
 * Categorize endpoint for testing
 */
function categorizeEndpoint(endpoint) {
  const { path, method, file, fullPath } = endpoint;
  
  // Skip certain endpoints that require special handling
  const skipPatterns = [
    '/admin/create',
    '/admin/bulk',
    '/upload',
    '/media/upload',
    '/export',
    '/import',
    '/duplicate',
    '/restore',
    '/clone',
  ];
  
  for (const pattern of skipPatterns) {
    if (path.includes(pattern)) {
      return { skip: true, reason: 'Requires file upload or complex data' };
    }
  }
  
  // POST/PUT/PATCH endpoints need data
  if (['POST', 'PUT', 'PATCH'].includes(method) && !path.includes('/send')) {
    return { skip: true, reason: 'Requires request body data' };
  }
  
  // Endpoints with dynamic parameters
  if (path.includes(':id') || path.includes(':slug') || path.includes(':')) {
    return { skip: true, reason: 'Requires dynamic parameter' };
  }
  
  // Determine expected status and token
  let expectedStatus = [200, 201];
  let token = null;
  let category = file.replace('.routes', '');
  
  if (endpoint.requiresAdmin || path.includes('/admin') || file === 'admin.routes') {
    token = 'admin';
    category += ' (Admin)';
  } else if (endpoint.requiresAuth || path.includes('/my') || path.includes('/me')) {
    token = 'user';
    category += ' (Auth)';
  }
  
  // Public endpoints
  if (path === '/' || path.includes('/public') || path.includes('/active') || 
      path.includes('/featured') || path.includes('/popular') || path.includes('/trending')) {
    expectedStatus = [200, 201];
    token = null;
  }
  
  return {
    skip: false,
    expectedStatus,
    token,
    category,
    data: null
  };
}

/**
 * Main test execution
 */
async function runTests() {
  console.log(`\n${colors.magenta}╔════════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.magenta}║                                                                ║${colors.reset}`);
  console.log(`${colors.magenta}║       COMPREHENSIVE API ENDPOINT TEST SUITE (942 Tests)       ║${colors.reset}`);
  console.log(`${colors.magenta}║                                                                ║${colors.reset}`);
  console.log(`${colors.magenta}╚════════════════════════════════════════════════════════════════╝${colors.reset}\n`);

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}  Authentication${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  // Admin login
  const adminLogin = await makeRequest('POST', '/api/v1/auth/login', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD
  });
  
  if (adminLogin.data?.token) {
    adminToken = adminLogin.data.token;
    console.log(`${colors.green}✓${colors.reset} Admin authenticated`);
  } else {
    console.log(`${colors.red}✗${colors.reset} Admin authentication failed`);
    process.exit(1);
  }

  // User login
  const userLogin = await makeRequest('POST', '/api/v1/auth/login', {
    email: USER_EMAIL,
    password: USER_PASSWORD
  });
  
  if (userLogin.data?.token) {
    userToken = userLogin.data.token;
    console.log(`${colors.green}✓${colors.reset} User authenticated\n`);
  } else {
    console.log(`${colors.red}✗${colors.reset} User authentication failed\n`);
    process.exit(1);
  }

  // ============================================================================
  // LOAD ALL ENDPOINTS
  // ============================================================================
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}  Loading Endpoints from Route Files${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  // Load route mappings from ROUTE_MAPPINGS.json
  const mappingsPath = './ROUTE_MAPPINGS.json';
  let routeMappings = {};
  
  try {
    const mappingsContent = fs.readFileSync(mappingsPath, 'utf-8');
    routeMappings = JSON.parse(mappingsContent);
    console.log(`${colors.green}✓${colors.reset} Loaded route mappings for ${Object.keys(routeMappings).length} route files\n`);
  } catch (error) {
    console.log(`${colors.yellow}⚠${colors.reset} Could not load ROUTE_MAPPINGS.json, using fallback logic\n`);
  }

  const routesDir = './src/routes';
  const routeFiles = getAllRouteFiles(routesDir);
  let allEndpoints = [];

  console.log(`Found ${routeFiles.length} route files\n`);

  routeFiles.forEach(file => {
    const endpoints = parseRouteFile(file, routeMappings);
    allEndpoints = allEndpoints.concat(endpoints);
  });

  console.log(`${colors.bright}Total endpoints detected: ${allEndpoints.length}${colors.reset}\n`);

  // ============================================================================
  // TEST ALL ENDPOINTS
  // ============================================================================
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}  Testing All Endpoints (this may take a while...)${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  let currentCategory = '';
  
  for (const endpoint of allEndpoints) {
    const testConfig = categorizeEndpoint(endpoint);
    
    if (testConfig.skip) {
      skippedTests++;
      process.stdout.write(`${colors.yellow}○${colors.reset}`);
      continue;
    }
    
    // Show category header
    if (currentCategory !== testConfig.category) {
      currentCategory = testConfig.category;
      process.stdout.write(`\n${colors.blue}${currentCategory}:${colors.reset} `);
    }
    
    // Determine token
    const token = testConfig.token === 'admin' ? adminToken : 
                  testConfig.token === 'user' ? userToken : null;
    
    // Test the endpoint
    await testEndpoint(
      `${endpoint.method} ${endpoint.fullPath}`,
      endpoint.method,
      endpoint.fullPath,
      testConfig.expectedStatus,
      testConfig.data,
      token,
      testConfig.category
    );
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  // ============================================================================
  // RESULTS SUMMARY
  // ============================================================================
  console.log(`\n\n${colors.magenta}╔════════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.magenta}║                                                                ║${colors.reset}`);
  console.log(`${colors.magenta}║                      TEST RESULTS SUMMARY                      ║${colors.reset}`);
  console.log(`${colors.magenta}║                                                                ║${colors.reset}`);
  console.log(`${colors.magenta}╚════════════════════════════════════════════════════════════════╝${colors.reset}\n`);

  const passRate = ((passedTests / totalTests) * 100).toFixed(2);

  console.log(`  ${colors.bright}Total Tests:${colors.reset}    ${totalTests}`);
  console.log(`  ${colors.green}Passed:${colors.reset}         ${passedTests}`);
  console.log(`  ${colors.red}Failed:${colors.reset}         ${failedTests}`);
  console.log(`  ${colors.yellow}Skipped:${colors.reset}        ${skippedTests}`);
  console.log(`  ${colors.cyan}Pass Rate:${colors.reset}      ${passRate}%\n`);

  // Show failed endpoints (first 50)
  if (failedEndpoints.length > 0) {
    console.log(`${colors.red}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.red}  Failed Endpoints (showing first 50):${colors.reset}\n`);
    
    failedEndpoints.slice(0, 50).forEach((endpoint, index) => {
      console.log(`  ${index + 1}. ${endpoint.name}`);
      console.log(`     Path: ${endpoint.path}`);
      console.log(`     Expected: ${endpoint.expected}, Got: ${endpoint.got}`);
      if (endpoint.error) {
        console.log(`     Error: ${endpoint.error.substring(0, 100)}`);
      }
      console.log('');
    });

    if (failedEndpoints.length > 50) {
      console.log(`  ${colors.yellow}... and ${failedEndpoints.length - 50} more failures${colors.reset}\n`);
    }
  }

  // Save detailed results to file
  const detailedResults = {
    timestamp: new Date().toISOString(),
    summary: {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      skipped: skippedTests,
      passRate: passRate + '%'
    },
    failedEndpoints: failedEndpoints
  };

  fs.writeFileSync(
    './COMPREHENSIVE_TEST_RESULTS.json',
    JSON.stringify(detailedResults, null, 2)
  );

  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}  Detailed results saved to: COMPREHENSIVE_TEST_RESULTS.json${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
}

// Run tests
runTests().catch(console.error);
