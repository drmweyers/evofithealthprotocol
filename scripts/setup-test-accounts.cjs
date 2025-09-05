const bcrypt = require('bcrypt');
const { Client } = require('pg');
require('dotenv').config();

// STANDARDIZED TEST ACCOUNTS - DO NOT CHANGE
const TEST_ACCOUNTS = [
  {
    email: 'admin@fitmeal.pro',
    password: 'AdminPass123',
    role: 'admin',
    name: 'Admin User'
  },
  {
    email: 'trainer.test@evofitmeals.com',
    password: 'TestTrainer123!',
    role: 'trainer',
    name: 'Test Trainer'
  },
  {
    email: 'customer.test@evofitmeals.com',
    password: 'TestCustomer123!',
    role: 'customer',
    name: 'Test Customer'
  }
];

async function setupTestAccounts(connectionString) {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log(`\n🔧 Setting up test accounts in: ${connectionString.includes('localhost') ? 'DEVELOPMENT' : 'PRODUCTION'}`);
    console.log('━'.repeat(80));
    
    for (const account of TEST_ACCOUNTS) {
      // Check if account exists
      const checkResult = await client.query(
        'SELECT id, email FROM users WHERE email = $1',
        [account.email]
      );
      
      const hashedPassword = await bcrypt.hash(account.password, 10);
      
      if (checkResult.rows.length > 0) {
        // Update existing account
        await client.query(
          `UPDATE users 
           SET password = $1, name = $2, updated_at = NOW() 
           WHERE email = $3`,
          [hashedPassword, account.name, account.email]
        );
        console.log(`✓ Updated: ${account.email}`);
      } else {
        // Create new account
        await client.query(
          `INSERT INTO users (id, email, password, name, role, created_at, updated_at) 
           VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())`,
          [account.email, hashedPassword, account.name, account.role]
        );
        console.log(`✓ Created: ${account.email} (${account.role})`);
      }
    }
    
    console.log('\n' + '━'.repeat(80));
    console.log('📋 TEST ACCOUNT CREDENTIALS (Standardized):');
    console.log('━'.repeat(80));
    console.log('Role     | Email                                | Password');
    console.log('━'.repeat(80));
    TEST_ACCOUNTS.forEach(account => {
      console.log(
        `${account.role.toUpperCase().padEnd(8)} | ${account.email.padEnd(36)} | ${account.password}`
      );
    });
    console.log('━'.repeat(80));
    console.log('\n⚠️  These are STANDARDIZED credentials - do not change them.');
    console.log('📚 Reference: TEST_CREDENTIALS.md\n');
    
  } catch (error) {
    console.error('❌ Error setting up test accounts:', error);
    throw error;
  } finally {
    await client.end();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const isDev = args.includes('--dev');
  const isProd = args.includes('--prod');
  const isAll = args.includes('--all');
  
  if (!isDev && !isProd && !isAll) {
    console.log('Usage: node setup-test-accounts.cjs [--dev] [--prod] [--all]');
    console.log('  --dev   Setup accounts in development database');
    console.log('  --prod  Setup accounts in production database');  
    console.log('  --all   Setup accounts in both databases');
    process.exit(1);
  }
  
  try {
    if (isDev || isAll) {
      const devUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5434/evofithealthprotocol_db';
      await setupTestAccounts(devUrl);
    }
    
    if (isProd || isAll) {
      const prodUrl = process.env.PRODUCTION_DATABASE_URL;
      if (!prodUrl) {
        console.error('❌ PRODUCTION_DATABASE_URL not set in environment');
        console.log('💡 For DigitalOcean deployment, set this to your production database URL');
        process.exit(1);
      }
      await setupTestAccounts(prodUrl);
    }
    
    console.log('✅ Test accounts setup complete!');
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

main();