/**
 * Enhanced Comprehensive API Endpoint Testing
 * 
 * Improvements:
 * - Proper query parameter handling
 * - Correct authentication token selection based on endpoint permissions
 * - Smart handling of 404 responses for empty data
 * - Enhanced skip logic for endpoints requiring complex data
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:5000';
const ADMIN_EMAIL = 'admin@vardhmanmills.com';
const ADMIN_PASSWORD = 'Admin@123';
const USER_EMAIL = 'john@example.com';
const USER_PASSWORD = 'User@123';

// Tokens
let adminToken = '';
let userToken = '';

// Results tracking
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  failedEndpoints: []
};

// Color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m'
};

/**
 * Make HTTP request
 */
async function makeRequest(method, path, data = null, token = null, queryParams = null) {
  try {
    let url = `${BASE_URL}${path}`;
    
    // Add query parameters if provided
    if (queryParams) {
      const params = new URLSearchParams(queryParams);
      url += `?${params.toString()}`;
    }
    
    const config = {
      method,
      url,
      headers: {}
    };
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (data) {
      config.data = data;
      config.headers['Content-Type'] = 'application/json';
    }
    
    const response = await axios(config);
    return {
      status: response.status,
      data: response.data
    };
  } catch (error) {
    return {
      status: error.response?.status || 500,
      error: error.response?.data?.message || error.message
    };
  }
}

/**
 * Get all route files
 */
function getAllRouteFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllRouteFiles(fullPath));
    } else if (item.endsWith('.ts') && !item.includes('index')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Parse route file to extract endpoints
 */
function parseRouteFile(filePath, routeMappings) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath); // e.g., "address.routes.ts"
  const routeKey = fileName.replace('.ts', ''); // e.g., "address.routes"
  const endpoints = [];
  
  // Get the correct base prefix from route mappings
  const prefix = routeMappings[routeKey] || '/api/v1/' + fileName.replace('.routes.ts', '');
  
  // Extract route definitions: router.method('path', ...)
  const routeRegex = /router\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g;
  let match;
  
  while ((match = routeRegex.exec(content)) !== null) {
    const [, method, routePath] = match;
    
    // Skip middleware-only routes
    if (routePath.includes('*')) continue;
    
    // Construct full path
    const fullPath = routePath === '/' ? prefix : `${prefix}${routePath}`;
    
    // Detect authentication and authorization requirements
    const lineContent = content.slice(Math.max(0, match.index - 200), match.index + 200);
    const requiresAuth = lineContent.includes('protect') || content.includes('protect');
    const requiresAdmin = lineContent.includes("restrictTo('admin')") || 
                         lineContent.includes('restrictTo("admin")') ||
                         fullPath.includes('/admin/');
    
    endpoints.push({
      method: method.toUpperCase(),
      path: routePath,
      fullPath: fullPath,
      file: fileName,
      requiresAuth,
      requiresAdmin
    });
  }
  
  return endpoints;
}

/**
 * Determine if endpoint should be skipped
 */
function shouldSkipEndpoint(endpoint) {
  const { method, fullPath, path } = endpoint;
  
  // Skip endpoints that modify data without proper setup
  if (method !== 'GET') {
    // Allow simple search endpoints
    if (path.includes('/search') || path.includes('/stats') || path.includes('/analytics')) {
      return false;
    }
    return true; // Skip other POST/PUT/DELETE/PATCH
  }
  
  // Skip endpoints with dynamic parameters that need real IDs
  if (path.includes(':') || path.includes('{')) {
    return true;
  }
  
  // Skip file upload endpoints
  if (path.includes('/upload')) {
    return true;
  }
  
  return false;
}

/**
 * Get query parameters for endpoint (if needed)
 */
function getQueryParams(endpoint) {
  const { fullPath } = endpoint;
  
  // Add query parameters for endpoints that require them
  if (fullPath.includes('/search')) {
    return { q: 'test', query: 'test' };
  }
  
  if (fullPath.includes('/by-location')) {
    return { city: 'Mumbai', state: 'Maharashtra' };
  }
  
  if (fullPath.includes('/suggestions')) {
    return { field: 'name', value: 'test' };
  }
  
  if (fullPath.includes('/nearby')) {
    return { latitude: '19.0760', longitude: '72.8777' };
  }
  
  if (fullPath.includes('/track')) {
    return { orderNumber: 'TEST123' };
  }
  
  if (fullPath.includes('/validate-email')) {
    return { email: 'test@example.com' };
  }
  
  if (fullPath.includes('/analytics') && fullPath.includes('/tickets')) {
    return { startDate: '2024-01-01', endDate: '2024-12-31' };
  }
  
  return null;
}

/**
 * Get appropriate token for endpoint
 */
function getToken(endpoint) {
  if (endpoint.requiresAdmin) {
    return adminToken;
  }
  if (endpoint.requiresAuth) {
    return userToken;
  }
  return null; // Public endpoint
}

/**
 * Check if response is acceptable
 */
function isAcceptableResponse(status, endpoint) {
  // Success responses
  if (status >= 200 && status < 300) return true;
  
  // 404 is acceptable for GET endpoints with empty data
  if (status === 404 && endpoint.method === 'GET') {
    // These are expected to return 404 when no data exists
    const acceptable404Paths = [
      '/stats',
      '/default',
      '/analytics',
      '/scheduled',
      '/track'
    ];
    
    return acceptable404Paths.some(p => endpoint.fullPath.includes(p));
  }
  
  return false;
}

/**
 * Test a single endpoint
 */
async function testEndpoint(endpoint) {
  const token = getToken(endpoint);
  const queryParams = getQueryParams(endpoint);
  
  const response = await makeRequest(
    endpoint.method,
    endpoint.fullPath,
    null,
    token,
    queryParams
  );
  
  const acceptable = isAcceptableResponse(response.status, endpoint);
  
  return {
    endpoint: `${endpoint.method} ${endpoint.fullPath}`,
    status: response.status,
    passed: acceptable,
    error: acceptable ? null : response.error,
    category: endpoint.file.replace('.routes.ts', '')
  };
}

/**
 * Main test execution
 */
async function runTests() {
  console.log(`\n${colors.magenta}╔════════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.magenta}║                                                                ║${colors.reset}`);
  console.log(`${colors.magenta}║     ENHANCED COMPREHENSIVE API ENDPOINT TEST SUITE (942)      ║${colors.reset}`);
  console.log(`${colors.magenta}║                                                                ║${colors.reset}`);
  console.log(`${colors.magenta}╚════════════════════════════════════════════════════════════════╝${colors.reset}\n`);

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}  Authentication${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  const adminLogin = await makeRequest('POST', '/api/v1/auth/login', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD
  });
  
  if (adminLogin.data?.token) {
    adminToken = adminLogin.data.token;
    console.log(`${colors.green}✓${colors.reset} Admin authenticated`);
  } else {
    console.log(`${colors.yellow}⚠${colors.reset} Admin authentication failed (${adminLogin.status}: ${adminLogin.error})`);
    console.log(`${colors.yellow}  Will use user token for admin endpoints${colors.reset}`);
  }

  const userLogin = await makeRequest('POST', '/api/v1/auth/login', {
    email: USER_EMAIL,
    password: USER_PASSWORD
  });
  
  if (userLogin.data?.token) {
    userToken = userLogin.data.token;
    console.log(`${colors.green}✓${colors.reset} User authenticated`);
    
    // If admin login failed, use user token as fallback
    if (!adminToken) {
      adminToken = userToken;
      console.log(`${colors.yellow}  Using user token for all tests${colors.reset}\n`);
    } else {
      console.log('');
    }
  } else {
    console.log(`${colors.red}✗${colors.reset} User authentication failed`);
    console.log('Response:', userLogin);
    process.exit(1);
  }

  // ============================================================================
  // LOAD ROUTE MAPPINGS AND ENDPOINTS
  // ============================================================================
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}  Loading Endpoints${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  // Load route mappings
  const mappingsPath = './ROUTE_MAPPINGS.json';
  let routeMappings = {};
  
  try {
    const mappingsContent = fs.readFileSync(mappingsPath, 'utf-8');
    routeMappings = JSON.parse(mappingsContent);
    console.log(`${colors.green}✓${colors.reset} Loaded ${Object.keys(routeMappings).length} route mappings\n`);
  } catch (error) {
    console.log(`${colors.yellow}⚠${colors.reset} Could not load ROUTE_MAPPINGS.json\n`);
  }

  // Parse all route files
  const routesDir = './src/routes';
  const routeFiles = getAllRouteFiles(routesDir);
  let allEndpoints = [];

  routeFiles.forEach(file => {
    const endpoints = parseRouteFile(file, routeMappings);
    allEndpoints = allEndpoints.concat(endpoints);
  });

  console.log(`${colors.cyan}Total endpoints found: ${allEndpoints.length}${colors.reset}\n`);

  // Categorize endpoints
  const testableEndpoints = [];
  const skippedEndpoints = [];

  allEndpoints.forEach(endpoint => {
    if (shouldSkipEndpoint(endpoint)) {
      skippedEndpoints.push(endpoint);
      results.skipped++;
    } else {
      testableEndpoints.push(endpoint);
    }
  });

  console.log(`${colors.green}Testable: ${testableEndpoints.length}${colors.reset}`);
  console.log(`${colors.gray}Skipped: ${skippedEndpoints.length}${colors.reset}\n`);

  // ============================================================================
  // RUN TESTS
  // ============================================================================
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}  Testing Endpoints${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  // Group by category for organized output
  const byCategory = {};
  testableEndpoints.forEach(ep => {
    const cat = ep.file.replace('.routes.ts', '');
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(ep);
  });

  for (const [category, endpoints] of Object.entries(byCategory)) {
    process.stdout.write(`${category}: `);
    
    for (const endpoint of endpoints) {
      const result = await testEndpoint(endpoint);
      results.total++;
      
      if (result.passed) {
        results.passed++;
        process.stdout.write(`${colors.green}✓${colors.reset}`);
      } else {
        results.failed++;
        results.failedEndpoints.push({
          name: result.endpoint,
          expected: '200-299 or acceptable 404',
          got: result.status,
          path: endpoint.fullPath,
          error: result.error,
          category
        });
        process.stdout.write(`${colors.red}✗${colors.reset}`);
      }
    }
    
    process.stdout.write('\n');
  }

  // ============================================================================
  // RESULTS SUMMARY
  // ============================================================================
  console.log(`\n${colors.magenta}╔════════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.magenta}║                                                                ║${colors.reset}`);
  console.log(`${colors.magenta}║                      TEST RESULTS SUMMARY                      ║${colors.reset}`);
  console.log(`${colors.magenta}║                                                                ║${colors.reset}`);
  console.log(`${colors.magenta}╚════════════════════════════════════════════════════════════════╝${colors.reset}\n`);

  const passRate = ((results.passed / results.total) * 100).toFixed(2);
  
  console.log(`  Total Tests:    ${results.total}`);
  console.log(`  ${colors.green}Passed:         ${results.passed}${colors.reset}`);
  console.log(`  ${colors.red}Failed:         ${results.failed}${colors.reset}`);
  console.log(`  ${colors.gray}Skipped:        ${results.skipped}${colors.reset}`);
  console.log(`  ${colors.cyan}Pass Rate:      ${passRate}%${colors.reset}\n`);

  // Show failed endpoints
  if (results.failed > 0) {
    console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.cyan}  Failed Endpoints (showing first 30):${colors.reset}\n`);
    
    results.failedEndpoints.slice(0, 30).forEach((failure, index) => {
      console.log(`  ${index + 1}. ${failure.name}`);
      console.log(`     ${colors.gray}Path: ${failure.path}${colors.reset}`);
      console.log(`     ${colors.gray}Expected: ${failure.expected}, Got: ${failure.got}${colors.reset}`);
      console.log(`     ${colors.gray}Error: ${failure.error}${colors.reset}\n`);
    });
    
    if (results.failed > 30) {
      console.log(`  ... and ${results.failed - 30} more failures\n`);
    }
  }

  // Save detailed results
  const outputFile = 'ENHANCED_TEST_RESULTS.json';
  fs.writeFileSync(outputFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      total: results.total,
      passed: results.passed,
      failed: results.failed,
      skipped: results.skipped,
      passRate: `${passRate}%`
    },
    failedEndpoints: results.failedEndpoints
  }, null, 2));

  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}  Detailed results saved to: ${outputFile}${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
