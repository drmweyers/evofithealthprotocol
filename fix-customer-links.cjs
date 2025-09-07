// Fix customer links for trainer
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');

async function fixCustomerLinks() {
  const sql = postgres('postgresql://postgres:postgres@localhost:5434/evofithealthprotocol_db');
  const db = drizzle(sql);
  
  try {
    // Get trainer ID
    const [trainer] = await sql`
      SELECT id, email 
      FROM users 
      WHERE email = 'trainer.test@evofitmeals.com'
    `;
    console.log('Trainer:', trainer);
    
    // Get the standard test customer
    let [customer] = await sql`
      SELECT id, email 
      FROM users 
      WHERE email = 'customer.test@evofitmeals.com'
    `;
    
    if (!customer) {
      console.log('Test customer not found, using first available customer...');
      [customer] = await sql`
        SELECT id, email 
        FROM users 
        WHERE role = 'customer'
        LIMIT 1
      `;
    }
    
    console.log('Customer:', customer);
    
    if (!trainer || !customer) {
      console.error('Missing trainer or customer!');
      return;
    }
    
    // Create a protocol assignment to link them
    console.log('\nCreating protocol assignment to link customer to trainer...');
    
    // First, check if any protocols exist
    const [protocol] = await sql`
      SELECT id, name 
      FROM protocols 
      WHERE trainer_id = ${trainer.id}
      LIMIT 1
    `;
    
    if (protocol) {
      console.log('Found existing protocol:', protocol.name);
      
      // Check if assignment already exists
      const [existingAssignment] = await sql`
        SELECT id 
        FROM protocol_assignments 
        WHERE customer_id = ${customer.id} 
        AND trainer_id = ${trainer.id}
        AND protocol_id = ${protocol.id}
      `;
      
      if (!existingAssignment) {
        // Create assignment
        const [assignment] = await sql`
          INSERT INTO protocol_assignments (
            customer_id, 
            trainer_id, 
            protocol_id, 
            assigned_at,
            progress_data,
            updated_at
          )
          VALUES (
            ${customer.id},
            ${trainer.id},
            ${protocol.id},
            NOW(),
            '{}',
            NOW()
          )
          RETURNING id
        `;
        console.log('Created protocol assignment:', assignment.id);
      } else {
        console.log('Assignment already exists');
      }
    } else {
      // Create a simple protocol first
      console.log('No protocols found, creating a test protocol...');
      const [newProtocol] = await sql`
        INSERT INTO protocols (
          trainer_id,
          name,
          description,
          category,
          difficulty,
          goals,
          created_at
        )
        VALUES (
          ${trainer.id},
          'Test Protocol for Wizard',
          'This is a test protocol to enable customer selection in wizard',
          'general',
          'beginner',
          '["General Health"]',
          NOW()
        )
        RETURNING id, name
      `;
      console.log('Created protocol:', newProtocol.name);
      
      // Now create assignment
      const [assignment] = await sql`
        INSERT INTO protocol_assignments (
          customer_id, 
          trainer_id, 
          protocol_id, 
          assigned_at,
          progress_data,
          updated_at
        )
        VALUES (
          ${customer.id},
          ${trainer.id},
          ${newProtocol.id},
          NOW(),
          '{}',
          NOW()
        )
        ON CONFLICT (customer_id, protocol_id) DO NOTHING
        RETURNING id
      `;
      
      if (assignment) {
        console.log('Created protocol assignment:', assignment.id);
      }
    }
    
    // Add a few more test customers with assignments
    console.log('\nAdding more test customers...');
    const testCustomers = [
      { email: 'test.customer1@example.com', name: 'Test Customer 1' },
      { email: 'test.customer2@example.com', name: 'Test Customer 2' },
      { email: 'test.customer3@example.com', name: 'Test Customer 3' }
    ];
    
    for (const testCustomer of testCustomers) {
      // Check if customer exists
      let [existingCustomer] = await sql`
        SELECT id FROM users WHERE email = ${testCustomer.email}
      `;
      
      if (!existingCustomer) {
        // Create customer
        [existingCustomer] = await sql`
          INSERT INTO users (email, password, role)
          VALUES (${testCustomer.email}, 'hashedpassword', 'customer')
          ON CONFLICT (email) DO NOTHING
          RETURNING id
        `;
        console.log(`Created customer: ${testCustomer.email}`);
      }
      
      if (existingCustomer) {
        // Create customer profile
        await sql`
          INSERT INTO customer_profiles (user_id, name)
          VALUES (${existingCustomer.id}, ${testCustomer.name})
          ON CONFLICT (user_id) DO NOTHING
        `;
        
        // Create assignment with a protocol
        const [protocol] = await sql`
          SELECT id FROM protocols WHERE trainer_id = ${trainer.id} LIMIT 1
        `;
        
        if (protocol) {
          await sql`
            INSERT INTO protocol_assignments (
              customer_id, trainer_id, protocol_id, assigned_at, progress_data, updated_at
            )
            VALUES (
              ${existingCustomer.id}, ${trainer.id}, ${protocol.id}, NOW(), '{}', NOW()
            )
            ON CONFLICT (customer_id, protocol_id) DO NOTHING
          `;
          console.log(`Linked ${testCustomer.email} to trainer`);
        }
      }
    }
    
    // Now verify the trainer can see customers
    console.log('\nVerifying trainer can see customers...');
    const linkedCustomers = await sql`
      SELECT DISTINCT
        u.id,
        u.email,
        cp.name
      FROM protocol_assignments pa
      JOIN users u ON u.id = pa.customer_id
      LEFT JOIN customer_profiles cp ON cp.user_id = u.id
      WHERE pa.trainer_id = ${trainer.id}
    `;
    
    console.log(`\nTrainer now has ${linkedCustomers.length} linked customers:`);
    linkedCustomers.forEach(c => {
      console.log(`  - ${c.email} (${c.name || 'No name'})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sql.end();
  }
}

fixCustomerLinks();