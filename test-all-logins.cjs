// Using native fetch in Node.js 18+

// Test credentials - standardized
const TEST_ACCOUNTS = [
  {
    email: 'admin@fitmeal.pro',
    password: 'AdminPass123',
    expectedRole: 'admin'
  },
  {
    email: 'trainer.test@evofitmeals.com',
    password: 'TestTrainer123!',
    expectedRole: 'trainer'
  },
  {
    email: 'customer.test@evofitmeals.com',
    password: 'TestCustomer123!',
    expectedRole: 'customer'
  }
];

async function testLogin(account, baseUrl) {
  try {
    console.log(`\nTesting login for ${account.email}...`);
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: account.email,
        password: account.password
      })
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.log(`   Response not JSON: ${text.substring(0, 100)}`);
      return false;
    }
    
    if (response.ok && data.status === 'success' && data.data) {
      const user = data.data.user;
      const token = data.data.accessToken;
      console.log(`✅ Login successful!`);
      console.log(`   Role: ${user.role} (Expected: ${account.expectedRole})`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Token: ${token ? '✓ Received' : '✗ Missing'}`);
      
      if (user.role !== account.expectedRole) {
        console.log(`   ⚠️  WARNING: Role mismatch!`);
      }
      return true;
    } else {
      console.log(`❌ Login failed for ${account.email}`);
      console.log(`   Error: ${data?.message || data?.error || 'Unknown error'}`);
      console.log(`   Status: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Login failed for ${account.email}`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function main() {
  const isDev = !process.argv.includes('--prod');
  const baseUrl = isDev ? 'http://localhost:3501' : process.env.PRODUCTION_URL || 'https://evofithealthprotocol.com';
  
  console.log('=' .repeat(80));
  console.log('🔐 TESTING ALL TEST ACCOUNT LOGINS');
  console.log(`📍 Environment: ${isDev ? 'DEVELOPMENT' : 'PRODUCTION'} (${baseUrl})`);
  console.log('=' .repeat(80));
  
  let allSuccess = true;
  
  for (const account of TEST_ACCOUNTS) {
    const success = await testLogin(account, baseUrl);
    if (!success) {
      allSuccess = false;
    }
  }
  
  console.log('\n' + '=' .repeat(80));
  if (allSuccess) {
    console.log('✅ ALL TEST ACCOUNTS ARE WORKING!');
  } else {
    console.log('⚠️  SOME TEST ACCOUNTS FAILED - Please check the errors above');
  }
  console.log('=' .repeat(80));
}

main().catch(console.error);