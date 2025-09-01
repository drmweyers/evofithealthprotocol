import bcrypt from 'bcrypt';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { eq } from 'drizzle-orm';
import { pgTable, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import dotenv from 'dotenv';

dotenv.config();

// Define the user role enum
const userRoleEnum = pgEnum("user_role", [
  "admin",
  "trainer", 
  "customer"
]);

// Define the users table schema (matching actual database)
const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  username: text("username"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: userRoleEnum("role").notNull().default("customer"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// PERMANENT TEST CREDENTIALS - DO NOT CHANGE
// Reference: TEST_CREDENTIALS.md
const TEST_ACCOUNTS = [
  { 
    email: 'admin@fitmeal.pro', 
    password: 'AdminPass123',
    name: 'Admin User', 
    role: 'admin' 
  },
  { 
    email: 'trainer.test@evofitmeals.com', 
    password: 'TestTrainer123!',
    name: 'Test Trainer', 
    role: 'trainer' 
  },
  { 
    email: 'customer.test@evofitmeals.com', 
    password: 'TestCustomer123!',
    name: 'Test Customer', 
    role: 'customer' 
  }
];

async function resetTestAccounts() {
  const { Pool } = pg;
  
  try {
    console.log('🔧 Resetting test accounts to standard credentials...');
    console.log('📋 Using credentials from TEST_CREDENTIALS.md');
    
    // Create database connection
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://healthprotocol_user:healthprotocol_secure_pass_2024@localhost:5434/evofithealthprotocol_db'
    });
    
    const db = drizzle(pool);
    
    // Process each test account
    for (const account of TEST_ACCOUNTS) {
      // Hash the account-specific password
      const hashedPassword = await bcrypt.hash(account.password, 10);
      
      // Update existing account or create new one
      const existing = await db.select().from(users).where(eq(users.email, account.email)).limit(1);
      
      if (existing.length > 0) {
        // Update password
        await db.update(users)
          .set({ password: hashedPassword })
          .where(eq(users.email, account.email));
        console.log(`✅ Updated password for ${account.email}`);
      } else {
        // Create new account with UUID
        const id = crypto.randomUUID();
        await db.insert(users).values({
          id,
          email: account.email,
          password: hashedPassword,
          name: account.name,
          role: account.role
        });
        console.log(`✅ Created new account: ${account.email}`);
      }
    }
    
    console.log('\n📋 Test Accounts Ready (PERMANENT CREDENTIALS):');
    console.log('================================================');
    console.log('Admin Account:');
    console.log('  Email: admin@fitmeal.pro');
    console.log('  Password: AdminPass123');
    console.log('');
    console.log('Trainer Account:');
    console.log('  Email: trainer.test@evofitmeals.com');
    console.log('  Password: TestTrainer123!');
    console.log('');
    console.log('Customer Account:');
    console.log('  Email: customer.test@evofitmeals.com');
    console.log('  Password: TestCustomer123!');
    console.log('\n📖 Reference: TEST_CREDENTIALS.md');
    console.log('================================================');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting test accounts:', error);
    process.exit(1);
  }
}

resetTestAccounts();