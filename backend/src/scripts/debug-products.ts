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

const debugProducts = async () => {
  console.log('🔍 DEBUGGING PRODUCTS API RESPONSE');
  console.log('='.repeat(50));

  try {
    const result = await makeRequest('/api/v1/products');
    
    console.log(`Status: ${result.status}`);
    console.log(`Response structure:`, JSON.stringify(result.data, null, 2));
    
    if (result.data && result.data.data) {
      console.log(`\n📊 Products found: ${result.data.data.length}`);
      
      if (result.data.data.length > 0) {
        const firstProduct = result.data.data[0];
        console.log(`\nFirst product details:`);
        console.log(`  ID: ${firstProduct._id}`);
        console.log(`  Name: ${firstProduct.name}`);
        console.log(`  Variants: ${firstProduct.variants ? firstProduct.variants.length : 0}`);
        
        if (firstProduct.variants && firstProduct.variants.length > 0) {
          const firstVariant = firstProduct.variants[0];
          console.log(`  First variant:`);
          console.log(`    ID: ${firstVariant._id}`);
          console.log(`    Price: ${firstVariant.price}`);
          console.log(`    SKU: ${firstVariant.sku}`);
          console.log(`    Stock: ${firstVariant.stock}`);
        }
      }
    } else {
      console.log('❌ No products data found in response');
    }
    
  } catch (error) {
    console.log('❌ Error fetching products:', error);
  }

  process.exit(0);
};

debugProducts();
