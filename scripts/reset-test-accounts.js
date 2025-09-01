import bcrypt from 'bcrypt';
import { db } from '../server/db.js';
import { users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

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
  try {
    console.log('🔧 Resetting test accounts to standard credentials...');
    console.log('📋 Using credentials from TEST_CREDENTIALS.md');
    
    // Process each test account
    const testAccounts = TEST_ACCOUNTS;
    
    for (const account of testAccounts) {
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
        // Create new account
        await db.insert(users).values({
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
    console.log('================================');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting accounts:', error);
    process.exit(1);
  }
}

resetTestAccounts();