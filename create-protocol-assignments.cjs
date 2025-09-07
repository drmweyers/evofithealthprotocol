// Create protocol assignments to link customers to trainer
const postgres = require('postgres');

async function createProtocolAssignments() {
  const sql = postgres('postgresql://postgres:postgres@localhost:5434/evofithealthprotocol_db');
  
  try {
    console.log('='.repeat(80));
    console.log('🔧 CREATING PROTOCOL ASSIGNMENTS TO FIX WIZARD');
    console.log('='.repeat(80));
    
    // Get trainer
    const [trainer] = await sql`
      SELECT id, email FROM users 
      WHERE email = 'trainer.test@evofitmeals.com'
    `;
    console.log('\n✅ Found trainer:', trainer.email, '(ID:', trainer.id + ')');
    
    // Get all test customers
    const customers = await sql`
      SELECT id, email FROM users 
      WHERE role = 'customer' 
      AND email IN (
        'customer.test@evofitmeals.com',
        'demo@test.com',
        'testuser@demo.com',
        'customer@demo.com'
      )
    `;
    
    console.log(`\n✅ Found ${customers.length} customers to link`);
    
    // First create a dummy protocol ID since protocol_id is required
    const crypto = require('crypto');
    const protocolId = crypto.randomUUID();
    console.log(`\n✅ Using protocol ID: ${protocolId}`);
    
    // Check protocol_assignments table structure
    console.log('\n🔍 Checking protocol_assignments table structure...');
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'protocol_assignments'
      ORDER BY ordinal_position
    `;
    
    console.log('Columns found:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
    });
    
    // Create protocol assignments for each customer
    console.log('\n📋 Creating protocol assignments...');
    for (const customer of customers) {
      try {
        // Check if assignment already exists
        const existing = await sql`
          SELECT id FROM protocol_assignments
          WHERE trainer_id = ${trainer.id} 
          AND customer_id = ${customer.id}
          LIMIT 1
        `;
        
        if (existing.length > 0) {
          console.log(`  ⚠️ Assignment already exists for ${customer.email}`);
          continue;
        }
        
        // Create new assignment
        await sql`
          INSERT INTO protocol_assignments (
            id,
            trainer_id, 
            customer_id, 
            protocol_id,
            status,
            assigned_at
          )
          VALUES (
            ${crypto.randomUUID()},
            ${trainer.id}, 
            ${customer.id}, 
            ${protocolId},
            'active',
            NOW()
          )
        `;
        console.log(`  ✅ Created assignment for ${customer.email}`);
      } catch (err) {
        console.log(`  ❌ Failed to create assignment for ${customer.email}: ${err.message}`);
      }
    }
    
    // Verify assignments
    console.log('\n🔍 Verifying protocol assignments...');
    const assignments = await sql`
      SELECT 
        pa.*,
        u.email as customer_email
      FROM protocol_assignments pa
      JOIN users u ON u.id = pa.customer_id
      WHERE pa.trainer_id = ${trainer.id}
    `;
    
    console.log(`\n✅✅✅ SUCCESS: Trainer now has ${assignments.length} customer assignments!`);
    console.log('\nAssigned customers:');
    assignments.forEach(a => {
      console.log(`  - ${a.customer_email} (Assignment ID: ${a.id})`);
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('🎉 PROTOCOL ASSIGNMENTS CREATED SUCCESSFULLY!');
    console.log('Customers should now appear in the Protocol Wizard!');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await sql.end();
  }
}

createProtocolAssignments();