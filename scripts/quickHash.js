// Quick bcrypt hash generator
const bcrypt = require('bcrypt');

async function generateHash() {
  const password = 'Test123@';
  const hash = await bcrypt.hash(password, 12);
  console.log(`Password: ${password}`);
  console.log(`Hash: ${hash}`);
  
  // Verify it works
  const valid = await bcrypt.compare(password, hash);
  console.log(`Verification: ${valid}`);
}

generateHash().catch(console.error);