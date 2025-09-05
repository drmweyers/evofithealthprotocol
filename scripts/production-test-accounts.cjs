const { Client } = require('pg');
require('dotenv').config();

// PRODUCTION-READY TEST ACCOUNT SETUP SCRIPT
// For DigitalOcean App Platform and other production environments

const PRODUCTION_TEST_ACCOUNTS = [
  {
    email: 'admin@fitmeal.pro',
    password: 'AdminPass123',
    role: 'admin',
    name: 'Admin User',
    description: 'System administrator for testing and management'
  },
  {
    email: 'trainer.test@evofitmeals.com',
    password: 'TestTrainer123!',
    role: 'trainer',
    name: 'Test Trainer',
    description: 'Demo trainer account for client demonstrations'
  },
  {
    email: 'customer.test@evofitmeals.com',
    password: 'TestCustomer123!',
    role: 'customer',
    name: 'Test Customer',
    description: 'Demo customer account for feature showcases'
  }
];

async function setupProductionTestAccounts() {
  // Production database URL should be set in environment
  const prodDbUrl = process.env.DATABASE_URL || process.env.PRODUCTION_DATABASE_URL;
  
  if (!prodDbUrl) {
    console.error('❌ ERROR: No production database URL found!');
    console.log('💡 Set DATABASE_URL or PRODUCTION_DATABASE_URL environment variable');
    console.log('   For DigitalOcean: this is typically auto-configured');
    process.exit(1);
  }

  const client = new Client({ 
    connectionString: prodDbUrl,
    ssl: prodDbUrl.includes('localhost') ? false : { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('🔒 Connected to PRODUCTION database');
    console.log('📍 Database:', prodDbUrl.includes('localhost') ? 'LOCAL' : 'PRODUCTION');
    console.log('━'.repeat(80));
    
    // Import bcrypt inside the function to ensure it's available
    const bcrypt = require('bcrypt');
    
    for (const account of PRODUCTION_TEST_ACCOUNTS) {
      console.log(`🔄 Processing: ${account.email}`);
      
      // Check if account exists
      const checkResult = await client.query(
        'SELECT id, email, role FROM users WHERE email = $1',
        [account.email]
      );
      
      const hashedPassword = await bcrypt.hash(account.password, 12); // Higher cost for production
      
      if (checkResult.rows.length > 0) {
        const existingUser = checkResult.rows[0];
        
        // Update existing account
        await client.query(
          `UPDATE users 
           SET password = $1, name = $2, role = $3, updated_at = NOW() 
           WHERE email = $4`,
          [hashedPassword, account.name, account.role, account.email]
        );
        
        console.log(`   ✅ Updated existing account (was role: ${existingUser.role})`);
        
      } else {
        // Create new account
        const result = await client.query(
          `INSERT INTO users (id, email, password, name, role, created_at, updated_at) 
           VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())
           RETURNING id`,
          [account.email, hashedPassword, account.name, account.role]
        );
        
        console.log(`   ✅ Created new account (ID: ${result.rows[0].id})`);
      }
    }
    
    // Verify all accounts
    console.log('\n🔍 Verifying production test accounts...');
    console.log('━'.repeat(80));
    
    for (const account of PRODUCTION_TEST_ACCOUNTS) {
      const verifyResult = await client.query(
        'SELECT email, role, name, created_at FROM users WHERE email = $1',
        [account.email]
      );
      
      if (verifyResult.rows.length > 0) {
        const user = verifyResult.rows[0];
        console.log(`✅ ${user.email} | ${user.role} | ${user.name}`);
      } else {
        console.log(`❌ ${account.email} | NOT FOUND`);
      }
    }
    
    console.log('\n' + '━'.repeat(80));
    console.log('🎉 PRODUCTION TEST ACCOUNTS READY!');
    console.log('━'.repeat(80));
    console.log('ROLE     | EMAIL                                | PASSWORD');
    console.log('━'.repeat(80));
    PRODUCTION_TEST_ACCOUNTS.forEach(account => {
      console.log(
        `${account.role.toUpperCase().padEnd(8)} | ${account.email.padEnd(36)} | ${account.password}`
      );
    });
    console.log('━'.repeat(80));
    console.log('\n📋 IMPORTANT NOTES:');
    console.log('• These accounts are for testing and demonstration purposes only');
    console.log('• Passwords use production-grade hashing (cost factor 12)');
    console.log('• These credentials are standardized across all environments');
    console.log('• Document these credentials in your deployment notes');
    console.log('\n✅ Production setup complete!');
    
  } catch (error) {
    console.error('❌ Production setup failed:', error);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Check DATABASE_URL is correct for production');
    console.error('2. Ensure database is accessible from this environment');
    console.error('3. Verify SSL configuration for cloud databases');
    console.error('4. Check that users table exists in production database');
    throw error;
  } finally {
    await client.end();
    console.log('🔓 Database connection closed');
  }
}

// Main execution
if (require.main === module) {
  setupProductionTestAccounts()
    .then(() => {
      console.log('\n🎊 SUCCESS: Production test accounts are ready!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 FAILED: Production setup error');
      console.error(error.message);
      process.exit(1);
    });
}

module.exports = { setupProductionTestAccounts, PRODUCTION_TEST_ACCOUNTS };