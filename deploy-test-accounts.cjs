#!/usr/bin/env node
/**
 * COMPREHENSIVE TEST ACCOUNT DEPLOYMENT SCRIPT
 * 
 * This script ensures standardized test accounts work in both development and production
 * environments. Use this script when deploying to DigitalOcean or any production platform.
 */

const fs = require('fs');
const path = require('path');

// Import our setup scripts
const { setupProductionTestAccounts } = require('./scripts/production-test-accounts.cjs');

// Standardized test credentials (DO NOT CHANGE)
const TEST_CREDENTIALS = {
  admin: {
    email: 'admin@fitmeal.pro',
    password: 'AdminPass123',
    role: 'admin'
  },
  trainer: {
    email: 'trainer.test@evofitmeals.com',
    password: 'TestTrainer123!',
    role: 'trainer'
  },
  customer: {
    email: 'customer.test@evofitmeals.com',
    password: 'TestCustomer123!',
    role: 'customer'
  }
};

async function testAccountLogin(baseUrl, credentials) {
  console.log(`🔐 Testing login: ${credentials.email}`);
  
  try {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.status === 'success') {
      console.log(`   ✅ Login successful - Role: ${data.data.user.role}`);
      return true;
    } else {
      console.log(`   ❌ Login failed - ${data.message || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Connection failed - ${error.message}`);
    return false;
  }
}

async function deployTestAccounts() {
  const args = process.argv.slice(2);
  const isProduction = args.includes('--production') || args.includes('--prod');
  const isDevelopment = args.includes('--development') || args.includes('--dev');
  const testOnly = args.includes('--test-only');
  const baseUrl = args.find(arg => arg.startsWith('--url='))?.split('=')[1];
  
  console.log('🚀 EVOFITHEALTHPROTOCOL TEST ACCOUNT DEPLOYMENT');
  console.log('═'.repeat(80));
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.log(`🎯 Mode: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  console.log('═'.repeat(80));
  
  if (!testOnly) {
    console.log('\n1️⃣ SETTING UP DATABASE ACCOUNTS...');
    
    try {
      if (isDevelopment) {
        console.log('🔧 Development setup...');
        // Use the CommonJS script for development
        const { execSync } = require('child_process');
        execSync('node scripts/setup-test-accounts.cjs --dev', { stdio: 'inherit' });
      } else {
        console.log('🔐 Production setup...');
        await setupProductionTestAccounts();
      }
    } catch (error) {
      console.error('❌ Database setup failed:', error.message);
      process.exit(1);
    }
  }
  
  console.log('\n2️⃣ TESTING ACCOUNT LOGINS...');
  
  let testUrl;
  if (baseUrl) {
    testUrl = baseUrl;
  } else if (isProduction) {
    testUrl = process.env.PRODUCTION_URL || 'https://evofithealthprotocol.com';
  } else {
    testUrl = 'http://localhost:3501';
  }
  
  console.log(`📍 Testing against: ${testUrl}`);
  console.log('━'.repeat(40));
  
  const results = {};
  for (const [role, creds] of Object.entries(TEST_CREDENTIALS)) {
    results[role] = await testAccountLogin(testUrl, creds);
  }
  
  console.log('\n3️⃣ DEPLOYMENT SUMMARY');
  console.log('═'.repeat(80));
  
  const allSuccessful = Object.values(results).every(Boolean);
  
  if (allSuccessful) {
    console.log('✅ ALL TEST ACCOUNTS DEPLOYED AND VERIFIED!');
    console.log('');
    console.log('📋 Standardized Test Credentials:');
    console.log('━'.repeat(80));
    console.log('Role     | Email                                | Password');
    console.log('━'.repeat(80));
    Object.values(TEST_CREDENTIALS).forEach(creds => {
      console.log(
        `${creds.role.toUpperCase().padEnd(8)} | ${creds.email.padEnd(36)} | ${creds.password}`
      );
    });
    console.log('━'.repeat(80));
    console.log('');
    console.log('🎊 DEPLOYMENT SUCCESSFUL!');
    console.log('📚 These credentials are documented in TEST_CREDENTIALS.md');
    console.log('');
    
    // Write deployment report
    const report = {
      timestamp: new Date().toISOString(),
      environment: isProduction ? 'production' : 'development',
      url: testUrl,
      accounts: Object.keys(TEST_CREDENTIALS).map(role => ({
        role: TEST_CREDENTIALS[role].role,
        email: TEST_CREDENTIALS[role].email,
        status: results[role] ? 'working' : 'failed'
      })),
      success: allSuccessful
    };
    
    fs.writeFileSync('deployment-test-accounts-report.json', JSON.stringify(report, null, 2));
    console.log('📄 Deployment report saved to: deployment-test-accounts-report.json');
    
  } else {
    console.log('⚠️  SOME ACCOUNTS FAILED!');
    console.log('❌ Failed accounts:');
    Object.entries(results).forEach(([role, success]) => {
      if (!success) {
        console.log(`   • ${role}: ${TEST_CREDENTIALS[role].email}`);
      }
    });
    console.log('');
    console.log('🔧 Troubleshooting suggestions:');
    console.log('1. Check that the application server is running');
    console.log('2. Verify database connectivity');
    console.log('3. Ensure environment variables are properly set');
    console.log('4. Check application logs for authentication errors');
    
    process.exit(1);
  }
}

// Usage information
function showUsage() {
  console.log('Usage: node deploy-test-accounts.js [options]');
  console.log('');
  console.log('Options:');
  console.log('  --dev, --development    Deploy to development environment');
  console.log('  --prod, --production    Deploy to production environment');
  console.log('  --test-only            Only test logins, skip database setup');
  console.log('  --url=<url>            Custom URL to test against');
  console.log('');
  console.log('Examples:');
  console.log('  node deploy-test-accounts.js --dev');
  console.log('  node deploy-test-accounts.js --prod');
  console.log('  node deploy-test-accounts.js --test-only --url=http://localhost:3501');
  console.log('  node deploy-test-accounts.js --prod --url=https://evofithealthprotocol.com');
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showUsage();
    process.exit(0);
  }
  
  if (!args.includes('--dev') && !args.includes('--development') && !args.includes('--prod') && !args.includes('--production') && !args.includes('--test-only')) {
    console.error('❌ Please specify --dev or --prod (or --test-only)');
    showUsage();
    process.exit(1);
  }
  
  deployTestAccounts()
    .then(() => {
      console.log('\n🎉 Deployment process completed successfully!');
    })
    .catch((error) => {
      console.error('\n💥 Deployment process failed:', error);
      process.exit(1);
    });
}