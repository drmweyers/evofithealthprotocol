#!/usr/bin/env node
/**
 * SIMPLE PRODUCTION ACCOUNT SETUP
 * 
 * This script can be run directly on DigitalOcean App Platform or any production environment
 * to ensure the standardized test accounts are available.
 */

const { Client } = require('pg');
const bcrypt = require('bcrypt');

// STANDARDIZED TEST ACCOUNTS - DO NOT CHANGE
const ACCOUNTS = [
  { email: 'admin@fitmeal.pro', password: 'AdminPass123', role: 'admin', name: 'Admin User' },
  { email: 'trainer.test@evofitmeals.com', password: 'TestTrainer123!', role: 'trainer', name: 'Test Trainer' },
  { email: 'customer.test@evofitmeals.com', password: 'TestCustomer123!', role: 'customer', name: 'Test Customer' }
];

async function setupAccounts() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL not found in environment');
    process.exit(1);
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: dbUrl.includes('localhost') ? false : { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🔒 Connected to production database');

    for (const account of ACCOUNTS) {
      const hashedPassword = await bcrypt.hash(account.password, 12);
      
      // Upsert account
      await client.query(`
        INSERT INTO users (id, email, password, name, role, created_at, updated_at) 
        VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())
        ON CONFLICT (email) DO UPDATE SET
        password = EXCLUDED.password,
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        updated_at = NOW()
      `, [account.email, hashedPassword, account.name, account.role]);
      
      console.log(`✅ ${account.role}: ${account.email}`);
    }

    console.log('\n🎉 Production test accounts ready!');
    console.log('\nCredentials:');
    ACCOUNTS.forEach(a => console.log(`${a.role.toUpperCase()}: ${a.email} | ${a.password}`));

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupAccounts();