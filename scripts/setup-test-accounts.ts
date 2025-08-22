import bcrypt from 'bcrypt';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5434/evofithealthprotocol_db';
const containerDbUrl = 'postgresql://postgres:postgres@localhost:5434/evofithealthprotocol_db';
const sql = postgres(connectionString);
const db = drizzle(sql);

const testAccounts = [
  {
    email: 'admin@fitmeal.pro',
    password: 'AdminPass123',
    role: 'admin' as const,
    name: 'Admin User'
  },
  {
    email: 'trainer.test@evofitmeals.com',
    password: 'TestTrainer123!',
    role: 'trainer' as const,
    name: 'Test Trainer'
  },
  {
    email: 'customer.test@evofitmeals.com',
    password: 'TestCustomer123!',
    role: 'customer' as const,
    name: 'Test Customer'
  }
];

async function setupTestAccounts() {
  console.log('🔧 Setting up test accounts for EvoFitHealthProtocol...');

  try {
    // First, clear any existing test accounts to ensure clean setup
    console.log('🧹 Clearing existing test accounts...');
    for (const account of testAccounts) {
      await db.delete(users).where(eq(users.email, account.email));
    }

    for (const account of testAccounts) {
      console.log(`📧 Creating ${account.email} (${account.role})...`);

      // Hash password
      const hashedPassword = await bcrypt.hash(account.password, 10);

      // Create user
      await db.insert(users).values({
        email: account.email,
        password: hashedPassword,
        role: account.role,
        name: account.name
      });

      console.log(`   ✅ Created ${account.email} with role ${account.role}`);
    }

    console.log('\n🎉 Test accounts setup complete!');
    console.log('\n📋 Test Account Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    testAccounts.forEach(account => {
      console.log(`${account.role.toUpperCase().padEnd(8)} | ${account.email.padEnd(35)} | ${account.password}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error setting up test accounts:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

// Run the setup
setupTestAccounts().catch((error) => {
  console.error('Setup failed:', error);
  process.exit(1);
});