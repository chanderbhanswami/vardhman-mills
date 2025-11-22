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

const debugOrderCreation = async () => {
  console.log('🔍 DEBUGGING ORDER CREATION');
  console.log('='.repeat(50));

  // First login to get token
  try {
    const loginData = { email: 'john@example.com', password: 'User@123' };
    const loginResult = await makeRequest('/api/v1/auth/login', 'POST', loginData);
    
    if (loginResult.status !== 200 || !loginResult.data.token) {
      console.log('❌ Login failed');
      return;
    }
    
    const authToken = loginResult.data.token;
    console.log('✅ Login successful');

    // Get products
    const productsResult = await makeRequest('/api/v1/products');
    
    if (productsResult.status !== 200) {
      console.log('❌ Failed to get products');
      return;
    }
    
    const products = productsResult.data.data.products;
    console.log(`✅ Found ${products.length} products`);
    
    const product = products[0];
    const variant = product.variants[0];
    
    console.log(`Product: ${product.name}`);
    console.log(`Variant: ${variant.sku} - ₹${variant.price}`);

    // Try to create an order
    const orderData = {
      items: [{
        product: product._id,
        variant: variant._id,
        quantity: 1,
        price: variant.price
      }],
      shippingAddress: {
        firstName: 'Test',
        lastName: 'User',
        addressLine1: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra', 
        pincode: '400001',
        country: 'India',
        mobile: '+91 9876543210'
      },
      billingAddress: {
        firstName: 'Test',
        lastName: 'User',
        addressLine1: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001', 
        country: 'India',
        mobile: '+91 9876543210'
      },
      paymentMethod: 'razorpay'
    };

    console.log('\n🛒 Attempting to create order...');
    console.log('Order data:', JSON.stringify(orderData, null, 2));

    const orderResult = await makeRequest('/api/v1/orders', 'POST', orderData, { 
      Authorization: `Bearer ${authToken}` 
    });
    
    console.log(`\nOrder creation result:`);
    console.log(`Status: ${orderResult.status}`);
    console.log(`Response:`, JSON.stringify(orderResult.data, null, 2));
    
  } catch (error) {
    console.log('❌ Error during debugging:', error);
  }

  process.exit(0);
};

debugOrderCreation();
