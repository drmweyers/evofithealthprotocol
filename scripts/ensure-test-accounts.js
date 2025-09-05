import bcrypt from 'bcrypt';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from '../shared/schema.js';
import { eq, and } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

// STANDARDIZED TEST ACCOUNTS - DO NOT CHANGE
const TEST_ACCOUNTS = [
  {
    email: 'admin@fitmeal.pro',
    password: 'AdminPass123',
    role: 'admin',
    name: 'Admin User',
    phone: '+1234567890',
    isActive: true
  },
  {
    email: 'trainer.test@evofitmeals.com',
    password: 'TestTrainer123!',
    role: 'trainer',
    name: 'Test Trainer',
    phone: '+1234567891',
    isActive: true
  },
  {
    email: 'customer.test@evofitmeals.com',
    password: 'TestCustomer123!',
    role: 'customer',
    name: 'Test Customer',
    phone: '+1234567892',
    isActive: true,
    linkToTrainer: 'trainer.test@evofitmeals.com'
  }
];

async function ensureTestAccounts(dbUrl) {
  const sql = postgres(dbUrl);
  const db = drizzle(sql);
  
  console.log(`\n🔧 Ensuring test accounts in: ${dbUrl.includes('localhost') ? 'DEVELOPMENT' : 'PRODUCTION'}`);
  console.log('━'.repeat(80));
  
  try {
    const accountIds = {};
    
    for (const account of TEST_ACCOUNTS) {
      // Check if account exists
      const existingUser = await db.select()
        .from(users)
        .where(eq(users.email, account.email))
        .limit(1);
      
      if (existingUser.length > 0) {
        console.log(`✓ Found existing: ${account.email}`);
        
        // Update password to ensure it matches
        const hashedPassword = await bcrypt.hash(account.password, 10);
        await db.update(users)
          .set({ 
            password: hashedPassword,
            isActive: true,
            name: account.name,
            phone: account.phone
          })
          .where(eq(users.email, account.email));
        
        console.log(`  ↻ Updated password and details for ${account.email}`);
        accountIds[account.email] = existingUser[0].id;
      } else {
        // Create new account
        const hashedPassword = await bcrypt.hash(account.password, 10);
        const newUser = await db.insert(users)
          .values({
            email: account.email,
            password: hashedPassword,
            role: account.role,
            name: account.name,
            phone: account.phone,
            isActive: account.isActive
          })
          .returning();
        
        console.log(`✓ Created: ${account.email} (${account.role})`);
        accountIds[account.email] = newUser[0].id;
      }
    }
    
    // Note: Trainer-customer relationships can be established through the UI
    // The test customer can be linked to the test trainer manually if needed
    
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
    
    return true;
  } catch (error) {
    console.error('❌ Error ensuring test accounts:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

async function main() {
  const isDevelopment = process.argv.includes('--dev');
  const isProduction = process.argv.includes('--prod');
  
  if (!isDevelopment && !isProduction) {
    console.log('Usage: node ensure-test-accounts.js --dev | --prod | --all');
    console.log('  --dev   Setup accounts in development database');
    console.log('  --prod  Setup accounts in production database');
    console.log('  --all   Setup accounts in both databases');
    process.exit(1);
  }
  
  try {
    if (isDevelopment || process.argv.includes('--all')) {
      const devUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5434/evofithealthprotocol_db';
      await ensureTestAccounts(devUrl);
    }
    
    if (isProduction || process.argv.includes('--all')) {
      const prodUrl = process.env.PRODUCTION_DATABASE_URL || process.env.DATABASE_URL;
      if (!prodUrl || prodUrl.includes('localhost')) {
        console.error('❌ Production database URL not configured in PRODUCTION_DATABASE_URL');
        process.exit(1);
      }
      await ensureTestAccounts(prodUrl);
    }
    
    console.log('\n✅ Test accounts setup complete!');
    console.log('⚠️  These are STANDARDIZED credentials - do not change them.');
    console.log('📚 Reference: TEST_CREDENTIALS.md');
    
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { ensureTestAccounts, TEST_ACCOUNTS };