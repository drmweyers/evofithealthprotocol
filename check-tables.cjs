// Check what tables exist
const postgres = require('postgres');

async function checkTables() {
  const sql = postgres('postgresql://postgres:postgres@localhost:5434/evofithealthprotocol_db');
  
  try {
    // Get all tables
    console.log('Tables in database:');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    tables.forEach(t => console.log(`  - ${t.table_name}`));
    
    // Check for protocol-related tables
    console.log('\nProtocol-related tables:');
    const protocolTables = tables.filter(t => 
      t.table_name.includes('protocol') || 
      t.table_name.includes('health')
    );
    
    if (protocolTables.length === 0) {
      console.log('  No protocol-related tables found!');
    } else {
      protocolTables.forEach(t => console.log(`  - ${t.table_name}`));
    }
    
    // Check schema of health_protocols if it exists
    const healthProtocolsExists = tables.some(t => t.table_name === 'health_protocols');
    if (healthProtocolsExists) {
      console.log('\nhealth_protocols table schema:');
      const columns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'health_protocols'
        ORDER BY ordinal_position
      `;
      columns.forEach(c => 
        console.log(`  - ${c.column_name}: ${c.data_type} ${c.is_nullable === 'NO' ? 'NOT NULL' : ''}`)
      );
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sql.end();
  }
}

checkTables();