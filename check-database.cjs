// Check database for customers
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

async function checkDatabase() {
  const sql = postgres('postgresql://postgres:postgres@localhost:5434/evofithealthprotocol_db');
  const db = drizzle(sql);
  
  try {
    // Check users table for customers
    console.log('Checking for customer users...');
    const customerUsers = await sql`
      SELECT id, email, role 
      FROM users 
      WHERE role = 'customer'
      LIMIT 10
    `;
    console.log('Customer users:', customerUsers);
    
    // Check for trainer
    console.log('\nChecking for trainer user...');
    const trainerUser = await sql`
      SELECT id, email, role 
      FROM users 
      WHERE email = 'trainer.test@evofitmeals.com'
    `;
    console.log('Trainer user:', trainerUser);
    
    // Check customer_trainer_links table
    console.log('\nChecking customer-trainer links...');
    const links = await sql`
      SELECT * FROM customer_trainer_links LIMIT 10
    `;
    console.log('Customer-trainer links:', links);
    
    // Check if table exists
    console.log('\nChecking if customer_trainer_links table exists...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'customer_trainer_links'
    `;
    console.log('Table exists:', tables.length > 0);
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await sql.end();
  }
}

checkDatabase();