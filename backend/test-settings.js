// Quick test script to verify settings API - using built-in fetch (Node 18+)

const API_BASE = 'http://localhost:5000/api/v1';

async function loginAndTestSettings() {
  try {
    console.log('🔐 Logging in as admin...');
    
    // Login to get admin token
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@vardhmanmills.com',
        password: 'Admin@123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    console.log('🔍 Login response:', loginData);
    const token = loginData.token;
    console.log('🔍 Token:', token);
    
    console.log('✅ Login successful');
    
    // Test getting general settings
    console.log('📋 Testing general settings retrieval...');
    
    const settingsResponse = await fetch(`${API_BASE}/settings/category/general`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!settingsResponse.ok) {
      throw new Error(`Settings API failed: ${settingsResponse.status}`);
    }

    const settingsData = await settingsResponse.json();
    console.log('✅ Settings retrieved successfully');
    console.log('📊 General settings count:', Object.keys(settingsData.data.settings).length);
    console.log('🏢 Site name:', settingsData.data.settings.siteName);
    console.log('📧 Contact email:', settingsData.data.settings.contactEmail);
    
    // Test updating a setting
    console.log('🔄 Testing settings update...');
    
    const updateResponse = await fetch(`${API_BASE}/settings/category/general`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        settings: {
          siteName: {
            value: 'Vardhman Mills - Updated',
            type: 'string'
          },
          maintenanceMode: {
            value: false,
            type: 'boolean'
          }
        }
      })
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      console.log('🔍 Update error response:', errorData);
      throw new Error(`Settings update failed: ${updateResponse.status}`);
    }

    const updateData = await updateResponse.json();
    console.log('✅ Settings updated successfully');
    console.log('📊 Updated settings count:', updateData.data.length);
    
    console.log('\n🎉 All settings tests passed! Your backend integration is working perfectly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('🔍 Full error:', error);
    process.exit(1);
  }
}

loginAndTestSettings();
