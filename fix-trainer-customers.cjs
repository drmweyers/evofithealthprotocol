// Fix trainer-customer relationships
const postgres = require('postgres');

async function fixTrainerCustomers() {
  const sql = postgres('postgresql://postgres:postgres@localhost:5434/evofithealthprotocol_db');
  
  try {
    // Get trainer
    const [trainer] = await sql`
      SELECT id, email FROM users 
      WHERE email = 'trainer.test@evofitmeals.com'
    `;
    console.log('Trainer:', trainer);
    
    // Get test customer
    const [customer] = await sql`
      SELECT id, email FROM users 
      WHERE email = 'customer.test@evofitmeals.com'
    `;
    console.log('Customer:', customer);
    
    if (!trainer || !customer) {
      console.error('Trainer or customer not found!');
      return;
    }
    
    // Check trainer_customer_relationships table structure
    console.log('\nChecking trainer_customer_relationships structure...');
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'trainer_customer_relationships'
      ORDER BY ordinal_position
    `;
    console.log('Columns:', columns);
    
    // Insert relationship
    console.log('\nCreating trainer-customer relationship...');
    try {
      await sql`
        INSERT INTO trainer_customer_relationships (trainer_id, customer_id, created_at)
        VALUES (${trainer.id}, ${customer.id}, NOW())
        ON CONFLICT DO NOTHING
      `;
      console.log('✅ Relationship created');
    } catch (err) {
      // Try without created_at if it doesn't exist
      await sql`
        INSERT INTO trainer_customer_relationships (trainer_id, customer_id)
        VALUES (${trainer.id}, ${customer.id})
        ON CONFLICT DO NOTHING
      `;
      console.log('✅ Relationship created (without timestamp)');
    }
    
    // Add more test customers
    console.log('\nAdding more test customers...');
    const testEmails = [
      'demo@test.com',
      'testuser@demo.com', 
      'customer@demo.com'
    ];
    
    for (const email of testEmails) {
      const [testCustomer] = await sql`
        SELECT id, email FROM users 
        WHERE email = ${email} AND role = 'customer'
      `;
      
      if (testCustomer) {
        try {
          await sql`
            INSERT INTO trainer_customer_relationships (trainer_id, customer_id)
            VALUES (${trainer.id}, ${testCustomer.id})
            ON CONFLICT DO NOTHING
          `;
          console.log(`  ✅ Linked ${email} to trainer`);
        } catch (err) {
          console.log(`  ⚠️ Could not link ${email}: ${err.message}`);
        }
      }
    }
    
    // Verify relationships
    console.log('\nVerifying trainer customers...');
    const relationships = await sql`
      SELECT u.id, u.email
      FROM trainer_customer_relationships tcr
      JOIN users u ON u.id = tcr.customer_id
      WHERE tcr.trainer_id = ${trainer.id}
    `;
    
    console.log(`\nTrainer has ${relationships.length} customers:`);
    relationships.forEach(r => console.log(`  - ${r.email}`));
    
    // Also check if we need to use protocol_assignments instead
    console.log('\nChecking protocol_assignments...');
    const assignments = await sql`
      SELECT DISTINCT pa.customer_id, u.email
      FROM protocol_assignments pa
      JOIN users u ON u.id = pa.customer_id
      WHERE pa.trainer_id = ${trainer.id}
    `;
    console.log(`Protocol assignments: ${assignments.length} customers`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sql.end();
  }
}

fixTrainerCustomers();