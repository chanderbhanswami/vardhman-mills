/**
 * Comprehensive API Endpoint Testing Script
 * Tests all 48 backend routes with seeded data
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:5000';
const ADMIN_EMAIL = 'admin@vardhmanmills.com';
const ADMIN_PASSWORD = 'Admin@123';
const USER_EMAIL = 'john@example.com';
const USER_PASSWORD = 'User@123';

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failedEndpoints = [];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

// Storage for tokens and IDs
let adminToken = '';
let userToken = '';
let testIds = {
  productId: '',
  categoryId: '',
  orderId: '',
  userId: '',
  cartId: '',
  wishlistId: '',
  reviewId: '',
  brandId: '',
  collectionId: '',
  couponId: '',
  blogPostId: '',
  ticketId: ''
};

/**
 * Make HTTP request
 */
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
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
 * Test endpoint and log result
 */
async function testEndpoint(name, method, path, expectedStatus, data = null, token = null, category = 'General') {
  totalTests++;
  try {
    const result = await makeRequest(method, path, data, token);
    
    if (result.status === expectedStatus) {
      passedTests++;
      console.log(`${colors.green}✓${colors.reset} [${category}] ${name}`);
      return result.data;
    } else {
      failedTests++;
      const errorMsg = result.data?.message || result.data?.error || JSON.stringify(result.data).substring(0, 100);
      failedEndpoints.push({ name, expected: expectedStatus, got: result.status, path, error: errorMsg });
      console.log(`${colors.red}✗${colors.reset} [${category}] ${name} - Expected ${expectedStatus}, got ${result.status}`);
      if (errorMsg) {
        console.log(`  ${colors.yellow}Error: ${errorMsg}${colors.reset}`);
      }
      return null;
    }
  } catch (error) {
    failedTests++;
    failedEndpoints.push({ name, error: error.message, path });
    console.log(`${colors.red}✗${colors.reset} [${category}] ${name} - Error: ${error.message}`);
    return null;
  }
}

/**
 * Extract IDs from seeded data
 */
async function fetchTestIds() {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}  Fetching Test Data IDs${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  // Get product ID and slug
  const products = await testEndpoint('Get Products', 'GET', '/api/v1/products', 200, null, null, 'Setup');
  if (products?.data?.products?.[0]) {
    testIds.productId = products.data.products[0]._id;
    testIds.productSlug = products.data.products[0].slug;
    console.log(`  Product ID: ${testIds.productId}, Slug: ${testIds.productSlug}`);
  }

  // Get category ID and slug
  const categories = await testEndpoint('Get Categories', 'GET', '/api/v1/categories', 200, null, null, 'Setup');
  if (categories?.data?.categories?.[0]) {
    testIds.categoryId = categories.data.categories[0]._id;
    testIds.categorySlug = categories.data.categories[0].slug;
    console.log(`  Category ID: ${testIds.categoryId}, Slug: ${testIds.categorySlug}`);
  }

  // Get brand ID
  const brands = await testEndpoint('Get Brands', 'GET', '/api/v1/brands', 200, null, null, 'Setup');
  if (brands?.data?.brands?.[0]?._id) {
    testIds.brandId = brands.data.brands[0]._id;
    console.log(`  Brand ID: ${testIds.brandId}`);
  }

  // Get collection ID - needs admin token
  const collections = await testEndpoint('Get Collections', 'GET', '/api/v1/collections', 200, null, adminToken, 'Setup');
  if (collections?.data?.collections?.[0]) {
    testIds.collectionId = collections.data.collections[0]._id;
    testIds.collectionSlug = collections.data.collections[0].slug;
    console.log(`  Collection ID: ${testIds.collectionId}, Slug: ${testIds.collectionSlug}`);
  }

  // Get blog post ID and slug
  const blogPosts = await testEndpoint('Get Blog Posts', 'GET', '/api/v1/blog/posts', 200, null, null, 'Setup');
  if (blogPosts?.data?.posts?.[0]) {
    testIds.blogPostId = blogPosts.data.posts[0]._id;
    testIds.blogPostSlug = blogPosts.data.posts[0].slug;
    console.log(`  Blog Post ID: ${testIds.blogPostId}, Slug: ${testIds.blogPostSlug}`);
  }

  // Get coupon ID (admin endpoint)
  const coupons = await testEndpoint('Get Coupons', 'GET', '/api/v1/coupons', 200, null, adminToken, 'Setup');
  if (coupons?.data?.coupons?.[0]?._id || coupons?.coupons?.[0]?._id) {
    testIds.couponId = coupons.data?.coupons?.[0]?._id || coupons?.coupons?.[0]?._id;
    console.log(`  Coupon ID: ${testIds.couponId}`);
  }

  console.log('');
}

/**
 * Main test suite
 */
async function runTests() {
  console.log(`\n${colors.magenta}╔════════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.magenta}║                                                                ║${colors.reset}`);
  console.log(`${colors.magenta}║          VARDHMAN MILLS API ENDPOINT TEST SUITE                ║${colors.reset}`);
  console.log(`${colors.magenta}║                                                                ║${colors.reset}`);
  console.log(`${colors.magenta}╚════════════════════════════════════════════════════════════════╝${colors.reset}\n`);

  // ============================================================================
  // AUTHENTICATION & SETUP
  // ============================================================================
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}  1. Authentication & Authorization${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  // Health check
  await testEndpoint('Health Check', 'GET', '/api/health', 200, null, null, 'Auth');

  // Admin login
  const adminLogin = await testEndpoint('Admin Login', 'POST', '/api/v1/auth/login', 200, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD
  }, null, 'Auth');
  if (adminLogin?.token) {
    adminToken = adminLogin.token;
  }

  // User login
  const userLogin = await testEndpoint('User Login', 'POST', '/api/v1/auth/login', 200, {
    email: USER_EMAIL,
    password: USER_PASSWORD
  }, null, 'Auth');
  if (userLogin?.token) {
    userToken = userLogin.token;
  }

  // Get current user
  await testEndpoint('Get Current User', 'GET', '/api/v1/users/me', 200, null, userToken, 'Auth');

  // Fetch test IDs
  await fetchTestIds();

  // ============================================================================
  // PUBLIC ENDPOINTS
  // ============================================================================
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}  2. Products & Catalog${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  await testEndpoint('Get All Products', 'GET', '/api/v1/products', 200, null, null, 'Products');
  await testEndpoint('Get Featured Products', 'GET', '/api/v1/products/featured', 200, null, null, 'Products');
  await testEndpoint('Search Products', 'POST', '/api/v1/search', 200, { query: 'fabric' }, null, 'Products');
  
  if (testIds.productSlug) {
    await testEndpoint('Get Product by Slug', 'GET', `/api/v1/products/${testIds.productSlug}`, 200, null, null, 'Products');
  }

  // ============================================================================
  // CATEGORIES & BRANDS
  // ============================================================================
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}  3. Categories & Brands${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  await testEndpoint('Get All Categories', 'GET', '/api/v1/categories', 200, null, null, 'Categories');
  
  if (testIds.categorySlug) {
    await testEndpoint('Get Category by Slug', 'GET', `/api/v1/categories/${testIds.categorySlug}`, 200, null, null, 'Categories');
  }

  await testEndpoint('Get All Brands', 'GET', '/api/v1/brands', 200, null, null, 'Brands');
  
  if (testIds.brandId) {
    await testEndpoint('Get Brand by ID', 'GET', `/api/v1/brands/${testIds.brandId}`, 200, null, null, 'Brands');
  }

  // ============================================================================
  // COLLECTIONS & DEALS
  // ============================================================================
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}  4. Collections & Deals${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  await testEndpoint('Get All Collections', 'GET', '/api/v1/collections', 200, null, adminToken, 'Collections');
  await testEndpoint('Get Active Deals', 'GET', '/api/v1/deals', 200, null, null, 'Deals');

  // ============================================================================
  // CART & WISHLIST
  // ============================================================================
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}  5. Cart & Wishlist${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  await testEndpoint('Get User Cart', 'GET', '/api/v1/cart', 200, null, userToken, 'Cart');
  await testEndpoint('Get User Wishlist', 'GET', '/api/v1/wishlist', 200, null, userToken, 'Wishlist');

  // ============================================================================
  // ORDERS
  // ============================================================================
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}  6. Orders & Shipping${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  await testEndpoint('Get User Orders', 'GET', '/api/v1/orders/my/orders', 200, null, userToken, 'Orders');
  await testEndpoint('Get Shipping Zones', 'GET', '/api/v1/shipping/zones', 200, null, adminToken, 'Shipping');

  // ============================================================================
  // REVIEWS & RATINGS
  // ============================================================================
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}  7. Reviews & Ratings${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  if (testIds.productId) {
    await testEndpoint('Get Product Reviews', 'GET', `/api/v1/reviews/products/${testIds.productId}`, 200, null, null, 'Reviews');
  }

  // ============================================================================
  // BLOG & CONTENT
  // ============================================================================
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}  8. Blog & Content${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  await testEndpoint('Get Blog Posts', 'GET', '/api/v1/blog/posts', 200, null, null, 'Blog');
  await testEndpoint('Get Blog Categories', 'GET', '/api/v1/blog/categories', 200, null, null, 'Blog');
  
  if (testIds.blogPostSlug) {
    await testEndpoint('Get Blog Post by Slug', 'GET', `/api/v1/blog/posts/${testIds.blogPostSlug}`, 200, null, null, 'Blog');
  }

  // ============================================================================
  // COMPANY INFO & CMS
  // ============================================================================
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}  9. Company Info & CMS${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  await testEndpoint('Get Company Info', 'GET', '/api/v1/about/company', 200, null, null, 'About');
  await testEndpoint('Get Locations', 'GET', '/api/v1/about/locations', 200, null, null, 'About');
  await testEndpoint('Get FAQs', 'GET', '/api/v1/faqs', 200, null, null, 'FAQ');
  await testEndpoint('Get Announcements', 'GET', '/api/v1/announcements/active', 200, null, null, 'CMS');
  await testEndpoint('Get Hero Banners', 'GET', '/api/v1/hero-banners/banners/page/home', 200, null, null, 'CMS');
  await testEndpoint('Get Bestsellers', 'GET', '/api/v1/bestsellers', 200, null, null, 'CMS');
  await testEndpoint('Get New Arrivals', 'GET', '/api/v1/new-arrivals', 200, null, null, 'CMS');
  await testEndpoint('Get Featured Content', 'GET', '/api/v1/featured-content/placement/home', 200, null, null, 'CMS');
  await testEndpoint('Get Logo', 'GET', '/api/v1/logos/public/primary', 200, null, null, 'CMS');
  await testEndpoint('Get Social Links', 'GET', '/api/v1/social-links', 200, null, null, 'CMS');
  await testEndpoint('Get Site Config', 'GET', '/api/v1/site-config/public', 200, null, null, 'CMS');
  await testEndpoint('Get SEO Settings', 'GET', '/api/v1/seo/settings', 200, null, null, 'SEO');

  // ============================================================================
  // NEWSLETTER & NOTIFICATIONS
  // ============================================================================
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}  10. Newsletter & Notifications${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  await testEndpoint('Get User Notifications', 'GET', '/api/notifications', 200, null, userToken, 'Notifications');
  await testEndpoint('Get Notification Preferences', 'GET', '/api/notifications/preferences/me', 200, null, userToken, 'Notifications');

  // ============================================================================
  // ADMIN ENDPOINTS
  // ============================================================================
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}  11. Admin Endpoints${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  await testEndpoint('Get All Users (Admin)', 'GET', '/api/admin/users', 200, null, adminToken, 'Admin');
  await testEndpoint('Get All Orders (Admin)', 'GET', '/api/admin/orders', 200, null, adminToken, 'Admin');
  await testEndpoint('Get Dashboard Stats', 'GET', '/api/admin/dashboard/stats', 200, null, adminToken, 'Admin');
  await testEndpoint('Get Inventory Items', 'GET', '/api/v1/inventory/items', 200, null, null, 'Admin');
  await testEndpoint('Get All Coupons', 'GET', '/api/v1/coupons', 200, null, adminToken, 'Admin');
  await testEndpoint('Get Gift Cards', 'GET', '/api/v1/giftcards', 200, null, adminToken, 'Admin');
  await testEndpoint('Get Support Tickets', 'GET', '/api/v1/support/tickets/my-tickets', 200, null, userToken, 'Admin');
  await testEndpoint('Get Newsletter Subscribers', 'GET', '/api/v1/newsletter/subscribers', 200, null, adminToken, 'Admin');

  // ============================================================================
  // SEARCH & ANALYTICS
  // ============================================================================
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}  12. Search & Analytics${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  await testEndpoint('Global Search', 'POST', '/api/v1/search', 200, { query: 'fabric' }, null, 'Search');
  await testEndpoint('Get Popular Searches', 'GET', '/api/v1/search/popular', 200, null, null, 'Search');

  // ============================================================================
  // SETTINGS & CONFIGURATION
  // ============================================================================
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}  13. Settings & Configuration${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  await testEndpoint('Get General Settings', 'GET', '/api/v1/settings/category/general', 200, null, userToken, 'Settings');
  await testEndpoint('Get Email Settings', 'GET', '/api/v1/settings/category/email', 200, null, adminToken, 'Settings');
  await testEndpoint('Get Payment Settings', 'GET', '/api/v1/settings/category/payment', 200, null, adminToken, 'Settings');

  // ============================================================================
  // CMS ENDPOINTS
  // ============================================================================
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}  14. CMS Pages & Widgets${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  await testEndpoint('Get CMS Settings', 'GET', '/api/v1/cms/settings', 200, null, null, 'CMS');
  await testEndpoint('Get CMS Menus', 'GET', '/api/v1/cms/menus/location/header', 200, null, null, 'CMS');
  await testEndpoint('Get CMS Pages', 'GET', '/api/v1/cms/pages/slug/home', 200, null, null, 'CMS');
  await testEndpoint('Get CMS Widgets', 'GET', '/api/v1/cms/widgets/page/home', 200, null, null, 'CMS');

  // ============================================================================
  // MEDIA & UPLOADS
  // ============================================================================
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}  15. Media & Uploads${colors.reset}`);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  await testEndpoint('Get Media Assets', 'GET', '/api/v1/media', 200, null, adminToken, 'Media');
  await testEndpoint('Get Uploads', 'GET', '/api/v1/uploads', 200, null, adminToken, 'Media');

  // ============================================================================
  // RESULTS SUMMARY
  // ============================================================================
  console.log(`\n${colors.magenta}╔════════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.magenta}║                                                                ║${colors.reset}`);
  console.log(`${colors.magenta}║                      TEST RESULTS SUMMARY                      ║${colors.reset}`);
  console.log(`${colors.magenta}║                                                                ║${colors.reset}`);
  console.log(`${colors.magenta}╚════════════════════════════════════════════════════════════════╝${colors.reset}\n`);

  const passRate = ((passedTests / totalTests) * 100).toFixed(2);
  
  console.log(`  ${colors.cyan}Total Tests:${colors.reset}    ${totalTests}`);
  console.log(`  ${colors.green}Passed:${colors.reset}         ${passedTests}`);
  console.log(`  ${colors.red}Failed:${colors.reset}         ${failedTests}`);
  console.log(`  ${colors.yellow}Pass Rate:${colors.reset}      ${passRate}%\n`);

  if (failedEndpoints.length > 0) {
    console.log(`${colors.red}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.red}  Failed Endpoints:${colors.reset}\n`);
    failedEndpoints.forEach((endpoint, index) => {
      console.log(`  ${index + 1}. ${endpoint.name}`);
      console.log(`     Path: ${endpoint.path}`);
      if (endpoint.expected) {
        console.log(`     Expected: ${endpoint.expected}, Got: ${endpoint.got}`);
      }
      if (endpoint.error) {
        console.log(`     Error: ${endpoint.error}`);
      }
      console.log('');
    });
  }

  // Test IDs collected
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}  Test Data IDs Collected:${colors.reset}\n`);
  Object.entries(testIds).forEach(([key, value]) => {
    if (value) {
      console.log(`  ${key}: ${value}`);
    }
  });
  console.log('');

  console.log(`${colors.magenta}════════════════════════════════════════════════════════════════${colors.reset}\n`);
}

// Run the test suite
runTests().catch(error => {
  console.error(`${colors.red}Fatal error running tests:${colors.reset}`, error);
  process.exit(1);
});
