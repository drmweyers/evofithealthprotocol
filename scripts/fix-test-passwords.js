import bcrypt from 'bcrypt';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// PERMANENT TEST CREDENTIALS
const TEST_ACCOUNTS = {
  'admin@fitmeal.pro': 'AdminPass123',
  'trainer.test@evofitmeals.com': 'TestTrainer123!',
  'customer.test@evofitmeals.com': 'TestCustomer123!'
};

async function fixPasswords() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://healthprotocol_user:healthprotocol_secure_pass_2024@localhost:5434/evofithealthprotocol_db'
  });

  try {
    console.log('🔧 Fixing test account passwords...\n');
    
    for (const [email, password] of Object.entries(TEST_ACCOUNTS)) {
      // Generate bcrypt hash with salt rounds = 10
      const hash = await bcrypt.hash(password, 10);
      
      // Update in database
      const result = await pool.query(
        'UPDATE users SET password = $1 WHERE email = $2 RETURNING email, role',
        [hash, email]
      );
      
      if (result.rowCount > 0) {
        console.log(`✅ Updated ${email}`);
        console.log(`   Password: ${password}`);
        console.log(`   Hash: ${hash}`);
        console.log(`   Role: ${result.rows[0].role}\n`);
      } else {
        console.log(`❌ Account not found: ${email}`);
        // Create the account if it doesn't exist
        const role = email.includes('admin') ? 'admin' : 
                    email.includes('trainer') ? 'trainer' : 'customer';
        const name = email.includes('admin') ? 'Admin User' : 
                    email.includes('trainer') ? 'Test Trainer' : 'Test Customer';
        
        await pool.query(
          'INSERT INTO users (id, email, password, role, name) VALUES (gen_random_uuid(), $1, $2, $3, $4)',
          [email, hash, role, name]
        );
        console.log(`✅ Created ${email} with role ${role}\n`);
      }
    }
    
    // Verify the passwords work
    console.log('\n🔍 Verifying passwords...');
    for (const [email, password] of Object.entries(TEST_ACCOUNTS)) {
      const result = await pool.query('SELECT password FROM users WHERE email = $1', [email]);
      if (result.rows.length > 0) {
        const storedHash = result.rows[0].password;
        const isValid = await bcrypt.compare(password, storedHash);
        console.log(`${email}: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
      }
    }
    
    console.log('\n📋 Test Credentials Ready:');
    console.log('================================');
    console.log('Admin: admin@fitmeal.pro / AdminPass123');
    console.log('Trainer: trainer.test@evofitmeals.com / TestTrainer123!');
    console.log('Customer: customer.test@evofitmeals.com / TestCustomer123!');
    console.log('================================\n');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
    process.exit(1);
  }
}

fixPasswords();