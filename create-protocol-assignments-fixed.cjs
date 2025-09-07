// Create protocol assignments with a valid protocol ID
const postgres = require('postgres');
const crypto = require('crypto');

async function createProtocolAssignments() {
  const sql = postgres('postgresql://postgres:postgres@localhost:5434/evofithealthprotocol_db');
  
  try {
    console.log('='.repeat(80));
    console.log('🔧 CREATING PROTOCOL ASSIGNMENTS WITH VALID PROTOCOL');
    console.log('='.repeat(80));
    
    // Get trainer
    const [trainer] = await sql`
      SELECT id, email FROM users 
      WHERE email = 'trainer.test@evofitmeals.com'
    `;
    console.log('\n✅ Found trainer:', trainer.email, '(ID:', trainer.id + ')');
    
    // Get or create a valid protocol in trainer_health_protocols
    let protocolId;
    const existingProtocol = await sql`
      SELECT id FROM trainer_health_protocols
      WHERE trainer_id = ${trainer.id}
      LIMIT 1
    `;
    
    if (existingProtocol.length > 0) {
      protocolId = existingProtocol[0].id;
      console.log(`✅ Using existing protocol ID: ${protocolId}`);
    } else {
      // Create a new protocol
      protocolId = crypto.randomUUID();
      await sql`
        INSERT INTO trainer_health_protocols (
          id, 
          trainer_id, 
          name, 
          description, 
          type,
          created_at
        )
        VALUES (
          ${protocolId},
          ${trainer.id},
          'Test Protocol for Wizard',
          'Protocol for testing wizard functionality',
          'health',
          NOW()
        )
      `;
      console.log(`✅ Created new protocol ID: ${protocolId}`);
    }
    
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
    
    // Create protocol assignments for each customer
    console.log('\n📋 Creating protocol assignments...');
    let successCount = 0;
    
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
          successCount++;
          continue;
        }
        
        // Create new assignment with all required fields
        const assignmentId = crypto.randomUUID();
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
            ${assignmentId},
            ${trainer.id}, 
            ${customer.id}, 
            ${protocolId},
            'active',
            NOW()
          )
        `;
        console.log(`  ✅ Created assignment for ${customer.email} (ID: ${assignmentId})`);
        successCount++;
      } catch (err) {
        console.log(`  ❌ Failed to create assignment for ${customer.email}: ${err.message}`);
      }
    }
    
    // Verify all assignments
    console.log('\n🔍 Verifying protocol assignments...');
    const assignments = await sql`
      SELECT 
        pa.id,
        pa.status,
        u.email as customer_email,
        thp.name as protocol_name
      FROM protocol_assignments pa
      JOIN users u ON u.id = pa.customer_id
      JOIN trainer_health_protocols thp ON thp.id = pa.protocol_id
      WHERE pa.trainer_id = ${trainer.id}
    `;
    
    console.log('\n' + '='.repeat(80));
    if (assignments.length > 0) {
      console.log(`✅✅✅ SUCCESS: Trainer now has ${assignments.length} customer assignments!`);
      console.log('\nAssigned customers:');
      assignments.forEach(a => {
        console.log(`  - ${a.customer_email} → ${a.protocol_name} (Status: ${a.status})`);
      });
      console.log('\n🎉 CUSTOMERS SHOULD NOW APPEAR IN THE PROTOCOL WIZARD!');
    } else {
      console.log('❌ No assignments found - something went wrong');
    }
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await sql.end();
  }
}

createProtocolAssignments();