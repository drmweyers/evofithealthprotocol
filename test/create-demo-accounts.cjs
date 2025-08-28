/**
 * Create demo accounts for testing
 */

const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function createDemoAccounts() {
  const client = new Client({
    host: 'localhost',
    port: 5434,
    database: 'evofithealthprotocol_db',
    user: 'postgres',
    password: 'postgres'
  });

  try {
    await client.connect();
    console.log('🔍 Connected to database');

    const demoAccounts = [
      {
        email: 'customer@demo.com',
        password: 'Password123@',
        role: 'customer'
      },
      {
        email: 'trainer@demo.com',
        password: 'Password123@',
        role: 'trainer'
      },
      {
        email: 'newuser@demo.com',
        password: 'SecurePass123@',
        role: 'customer'
      }
    ];

    for (const account of demoAccounts) {
      try {
        // Check if account already exists
        const existingUser = await client.query(
          'SELECT id, email, role FROM users WHERE email = $1',
          [account.email]
        );

        if (existingUser.rows.length > 0) {
          console.log(`✅ Account already exists: ${account.email} (role: ${existingUser.rows[0].role})`);
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(account.password, 10);

        // Create account
        const result = await client.query(
          'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role',
          [account.email, hashedPassword, account.role]
        );

        console.log(`✅ Created account: ${account.email} (role: ${account.role})`);

      } catch (error) {
        console.error(`❌ Error creating ${account.email}:`, error.message);
      }
    }

    // List all users for verification
    console.log('\n📋 All users in database:');
    const allUsers = await client.query('SELECT id, email, role, created_at FROM users ORDER BY created_at DESC');
    allUsers.rows.forEach(user => {
      console.log(`   ${user.email} (${user.role}) - ID: ${user.id}`);
    });

  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await client.end();
  }
}

createDemoAccounts();