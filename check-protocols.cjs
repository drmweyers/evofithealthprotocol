// Check what protocol tables exist and create a valid protocol
const postgres = require('postgres');
const crypto = require('crypto');

async function checkProtocols() {
  const sql = postgres('postgresql://postgres:postgres@localhost:5434/evofithealthprotocol_db');
  
  try {
    // Find tables with 'protocol' in the name
    console.log('🔍 Finding protocol-related tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%protocol%'
      ORDER BY table_name
    `;
    
    console.log('\nProtocol tables found:');
    tables.forEach(t => console.log(`  - ${t.table_name}`));
    
    // Check foreign key constraint
    console.log('\n🔍 Checking protocol_assignments foreign key constraints...');
    const constraints = await sql`
      SELECT 
        conname AS constraint_name,
        conrelid::regclass AS table_name,
        a.attname AS column_name,
        confrelid::regclass AS foreign_table,
        af.attname AS foreign_column
      FROM pg_constraint c
      JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
      JOIN pg_attribute af ON af.attnum = ANY(c.confkey) AND af.attrelid = c.confrelid
      WHERE c.contype = 'f'
      AND c.conrelid::regclass::text = 'protocol_assignments'
      AND a.attname = 'protocol_id'
    `;
    
    if (constraints.length > 0) {
      const fk = constraints[0];
      console.log(`\n✅ Found foreign key: protocol_id references ${fk.foreign_table}(${fk.foreign_column})`);
      
      const foreignTable = fk.foreign_table.replace(/^public\./, '').replace(/"/g, '');
      
      // Check columns of the foreign table
      console.log(`\n🔍 Checking ${foreignTable} table structure...`);
      const columns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = ${foreignTable}
        ORDER BY ordinal_position
      `;
      
      console.log('Columns:');
      columns.forEach(c => console.log(`  - ${c.column_name}: ${c.data_type}`));
      
      // Get trainer
      const [trainer] = await sql`
        SELECT id FROM users 
        WHERE email = 'trainer.test@evofitmeals.com'
      `;
      
      // Try to create a protocol in the correct table
      console.log(`\n📋 Creating protocol in ${foreignTable}...`);
      
      const protocolId = crypto.randomUUID();
      
      // Try different insert strategies based on table name
      if (foreignTable === 'protocols') {
        try {
          await sql`
            INSERT INTO protocols (id, name, description, trainer_id, created_at)
            VALUES (${protocolId}, 'Test Protocol for Wizard', 'Protocol for testing wizard functionality', ${trainer.id}, NOW())
          `;
          console.log(`✅ Created protocol with ID: ${protocolId}`);
        } catch (err) {
          // Try minimal insert
          try {
            await sql`
              INSERT INTO protocols (id, name)
              VALUES (${protocolId}, 'Test Protocol for Wizard')
            `;
            console.log(`✅ Created minimal protocol with ID: ${protocolId}`);
          } catch (err2) {
            console.log(`❌ Failed to create protocol: ${err2.message}`);
          }
        }
      } else if (foreignTable === 'health_protocols') {
        try {
          await sql`
            INSERT INTO health_protocols (id, name, description, trainer_id, created_at)
            VALUES (${protocolId}, 'Test Protocol for Wizard', 'Protocol for testing wizard functionality', ${trainer.id}, NOW())
          `;
          console.log(`✅ Created health protocol with ID: ${protocolId}`);
        } catch (err) {
          // Try minimal insert
          try {
            await sql`
              INSERT INTO health_protocols (id, name, trainer_id)
              VALUES (${protocolId}, 'Test Protocol for Wizard', ${trainer.id})
            `;
            console.log(`✅ Created minimal health protocol with ID: ${protocolId}`);
          } catch (err2) {
            console.log(`❌ Failed to create health protocol: ${err2.message}`);
          }
        }
      }
      
      console.log(`\n🎉 Protocol ID to use: ${protocolId}`);
      console.log('\nNow run: node create-protocol-assignments-fixed.cjs ' + protocolId);
      
    } else {
      console.log('\n❌ No foreign key constraint found for protocol_id');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sql.end();
  }
}

checkProtocols();