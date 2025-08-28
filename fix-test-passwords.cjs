#!/usr/bin/env node

/**
 * Fix Test Account Passwords
 * 
 * Updates the test account passwords in the database to match
 * the expected credentials for authentication testing.
 */

const bcrypt = require('bcrypt');

const BCRYPT_SALT_ROUNDS = 12;

// Expected test credentials
const TEST_CREDENTIALS = [
  {
    email: 'admin@fitmeal.pro',
    password: 'AdminPass123!',
    role: 'admin'
  },
  {
    email: 'trainer.test@evofitmeals.com', 
    password: 'TestTrainer123!',
    role: 'trainer'
  },
  {
    email: 'customer.test@evofitmeals.com',
    password: 'TestCustomer123!',
    role: 'customer'
  }
];

async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

async function updateTestPasswords() {
  console.log('🔐 Fixing test account passwords...');
  console.log('=====================================');

  try {
    // Use Docker to connect to PostgreSQL and update passwords
    for (const account of TEST_CREDENTIALS) {
      console.log(`\n🛠️  Updating password for ${account.email}...`);
      
      // Hash the password
      const hashedPassword = await hashPassword(account.password);
      console.log(`   📝 Generated hash: ${hashedPassword.substring(0, 20)}...`);
      
      // Create SQL update command
      const updateSQL = `UPDATE users SET password = '${hashedPassword}', updated_at = NOW() WHERE email = '${account.email}';`;
      
      // Execute the update using docker exec
      const { execSync } = require('child_process');
      
      try {
        const result = execSync(
          `docker exec evofithealthprotocol-postgres psql -U healthprotocol_user -d evofithealthprotocol_db -c "${updateSQL}"`,
          { encoding: 'utf-8' }
        );
        
        if (result.includes('UPDATE 1')) {
          console.log(`   ✅ Password updated successfully`);
        } else {
          console.log(`   ⚠️  Update result: ${result.trim()}`);
        }
      } catch (error) {
        console.log(`   ❌ Failed to update password: ${error.message}`);
      }
    }

    console.log('\n📊 Password update completed!');
    console.log('\n🔑 Updated test credentials:');
    TEST_CREDENTIALS.forEach(account => {
      console.log(`   ${account.role.toUpperCase()}: ${account.email} / ${account.password}`);
    });
    
    return true;

  } catch (error) {
    console.error('❌ Error updating passwords:', error);
    return false;
  }
}

async function verifyPasswordUpdates() {
  console.log('\n🔍 Verifying password updates...');
  console.log('=====================================');

  for (const account of TEST_CREDENTIALS) {
    console.log(`\n🧪 Testing ${account.email}...`);
    
    try {
      // Get the current hash from database
      const { execSync } = require('child_process');
      const getHashSQL = `SELECT password FROM users WHERE email = '${account.email}';`;
      
      const result = execSync(
        `docker exec evofithealthprotocol-postgres psql -U healthprotocol_user -d evofithealthprotocol_db -t -c "${getHashSQL}"`,
        { encoding: 'utf-8' }
      );
      
      const currentHash = result.trim();
      
      if (currentHash) {
        // Verify the password matches
        const isValid = await bcrypt.compare(account.password, currentHash);
        
        if (isValid) {
          console.log(`   ✅ Password verification: PASSED`);
        } else {
          console.log(`   ❌ Password verification: FAILED`);
        }
      } else {
        console.log(`   ⚠️  No password hash found for ${account.email}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Verification error: ${error.message}`);
    }
  }
}

async function main() {
  console.log('🔧 Test Account Password Fix Utility');
  console.log('====================================');
  
  const success = await updateTestPasswords();
  
  if (success) {
    await verifyPasswordUpdates();
    
    console.log('\n🎉 Password fix completed!');
    console.log('✅ You can now test authentication with these credentials:');
    console.log('   - admin@fitmeal.pro / AdminPass123');
    console.log('   - trainer.test@evofitmeals.com / TestTrainer123!');
    console.log('   - customer.test@evofitmeals.com / TestCustomer123!');
  } else {
    console.log('\n❌ Password fix failed. Check the error messages above.');
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Script execution failed:', error);
    process.exit(1);
  });
}

module.exports = { updateTestPasswords, verifyPasswordUpdates };