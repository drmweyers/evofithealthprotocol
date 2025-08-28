#!/usr/bin/env node

/**
 * Authentication Testing Script
 * 
 * Tests the authentication endpoints with the provided test credentials
 * to verify the login system is working correctly after database fixes.
 */

const API_BASE = 'http://localhost:3500/api';

// Test credentials to validate
const testCredentials = [
  {
    email: 'admin@fitmeal.pro',
    password: 'AdminPass123',
    expectedRole: 'admin',
    description: 'Admin Account'
  },
  {
    email: 'trainer.test@evofitmeals.com',
    password: 'TestTrainer123!',
    expectedRole: 'trainer',
    description: 'Trainer Account'
  },
  {
    email: 'customer.test@evofitmeals.com',
    password: 'TestCustomer123!',
    expectedRole: 'customer',
    description: 'Customer Account'
  }
];

async function testLogin(credentials) {
  console.log(`\n🧪 Testing: ${credentials.description}`);
  console.log(`   Email: ${credentials.email}`);
  console.log(`   Expected Role: ${credentials.expectedRole}`);
  
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password
      })
    });

    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.log(`   ❌ Invalid JSON response: ${responseText}`);
      return false;
    }

    if (response.ok) {
      console.log(`   ✅ Login successful!`);
      console.log(`   📋 User: ${data.user?.email || 'N/A'}`);
      console.log(`   🏷️  Role: ${data.user?.role || 'N/A'}`);
      console.log(`   🔑 Token: ${data.token ? 'Present' : 'Missing'}`);
      
      // Verify role matches expectation
      if (data.user?.role === credentials.expectedRole) {
        console.log(`   ✅ Role verification: PASSED`);
        return true;
      } else {
        console.log(`   ❌ Role verification: FAILED (expected ${credentials.expectedRole}, got ${data.user?.role})`);
        return false;
      }
    } else {
      console.log(`   ❌ Login failed: ${response.status} ${response.statusText}`);
      console.log(`   📝 Error: ${data.error || data.message || 'No error message'}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Network/Server error: ${error.message}`);
    return false;
  }
}

async function testServerHealth() {
  console.log('\n🏥 Testing server health...');
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (response.ok) {
      console.log('   ✅ Server is responsive');
      return true;
    } else {
      console.log(`   ❌ Server health check failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Cannot reach server: ${error.message}`);
    return false;
  }
}

async function runAuthenticationTests() {
  console.log('🚀 Authentication System Testing');
  console.log('=====================================');
  
  // Test server health first
  const serverHealthy = await testServerHealth();
  if (!serverHealthy) {
    console.log('\n❌ Server not accessible. Please check that the application is running on http://localhost:3500');
    return;
  }

  let successCount = 0;
  let totalTests = testCredentials.length;

  // Test each credential
  for (const credentials of testCredentials) {
    const success = await testLogin(credentials);
    if (success) successCount++;
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Summary
  console.log('\n📊 Test Summary');
  console.log('=====================================');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${totalTests - successCount}`);
  console.log(`Success Rate: ${Math.round((successCount / totalTests) * 100)}%`);

  if (successCount === totalTests) {
    console.log('\n🎉 All authentication tests PASSED!');
    console.log('✅ The authentication system is working correctly.');
  } else {
    console.log('\n⚠️  Some authentication tests FAILED.');
    console.log('🔧 Please check the failed accounts and verify credentials.');
  }

  return successCount === totalTests;
}

// Run the tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAuthenticationTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}

export { runAuthenticationTests, testCredentials };