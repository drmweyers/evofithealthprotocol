/**
 * Debug Authentication Flow
 * Test the exact login flow and token storage
 */

async function debugAuthFlow() {
  try {
    console.log('🔍 Testing authentication flow...');
    
    // Test 1: Direct API login call
    console.log('\n1. Testing direct API login...');
    const loginResponse = await fetch('http://localhost:3501/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: 'admin@fitmeal.pro',
        password: 'AdminPass123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login API Response:', JSON.stringify(loginData, null, 2));
    
    if (loginData.status === 'success' && loginData.data?.accessToken) {
      const token = loginData.data.accessToken;
      console.log('✅ Token received:', token.substring(0, 50) + '...');
      
      // Test 2: Test /auth/me with the token
      console.log('\n2. Testing /auth/me with token...');
      const meResponse = await fetch('http://localhost:3501/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      const meData = await meResponse.json();
      console.log('Me API Response:', JSON.stringify(meData, null, 2));
      
      if (meResponse.ok) {
        console.log('✅ /auth/me works with token');
      } else {
        console.log('❌ /auth/me failed with token');
      }
      
      // Test 3: Test protected route access
      console.log('\n3. Testing protected route access...');
      const protocolsResponse = await fetch('http://localhost:3501/api/protocol-plans', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      const protocolsData = await protocolsResponse.json();
      console.log('Protocol Plans API Response:', JSON.stringify(protocolsData, null, 2));
      
      if (protocolsResponse.ok) {
        console.log('✅ Protected route works with token');
      } else {
        console.log('❌ Protected route failed with token');
      }
      
    } else {
      console.log('❌ Login failed or no token received');
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  }
}

debugAuthFlow();