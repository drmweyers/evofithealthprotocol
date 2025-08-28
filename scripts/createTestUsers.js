/**
 * Create Test Users Script
 * 
 * Creates properly hashed test users for development and testing
 */

const bcrypt = require('bcrypt');
const { db } = require('../server/db.ts');
const { users } = require('../shared/schema.ts');
const { eq } = require('drizzle-orm');

const BCRYPT_SALT_ROUNDS = 12;

async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

async function createTestUsers() {
  console.log('🔧 Creating test users with properly hashed passwords...');
  
  const testUsers = [
    {
      email: 'admin@test.com',
      password: 'Admin123!',
      role: 'admin',
      name: 'Test Admin'
    },
    {
      email: 'trainer@test.com', 
      password: 'Trainer123!',
      role: 'trainer',
      name: 'Test Trainer'
    },
    {
      email: 'customer@test.com',
      password: 'Customer123!',
      role: 'customer',
      name: 'Test Customer'
    },
    {
      email: 'demo@test.com',
      password: 'Demo123!',
      role: 'customer',
      name: 'Demo User'
    }
  ];
  
  try {
    for (const userData of testUsers) {
      console.log(`Creating user: ${userData.email}`);
      
      // Check if user already exists
      const existingUser = await db.select()
        .from(users)
        .where(eq(users.email, userData.email))
        .limit(1);
      
      if (existingUser.length > 0) {
        console.log(`User ${userData.email} already exists, updating password...`);
        
        // Update existing user with new hashed password
        const hashedPassword = await hashPassword(userData.password);
        await db.update(users)
          .set({ 
            password: hashedPassword,
            name: userData.name,
            updatedAt: new Date()
          })
          .where(eq(users.email, userData.email));
          
        console.log(`✅ Updated ${userData.email} with new password`);
      } else {
        // Create new user
        const hashedPassword = await hashPassword(userData.password);
        await db.insert(users).values({
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          name: userData.name,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log(`✅ Created new user ${userData.email}`);
      }
    }
    
    console.log('🎉 Test users created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin: admin@test.com / Admin123!');
    console.log('Trainer: trainer@test.com / Trainer123!');  
    console.log('Customer: customer@test.com / Customer123!');
    console.log('Demo: demo@test.com / Demo123!');
    console.log('\nAll passwords follow the pattern: [Role]123!');
    
  } catch (error) {
    console.error('❌ Error creating test users:', error);
  }
}

// Run the script
createTestUsers().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});