/**
 * Check if demo accounts exist in database
 */

async function checkDemoAccounts() {
  try {
    console.log('🔍 Checking for demo accounts...');
    
    // Import database connection
    const { storage } = await import('../server/storage.js');
    
    const demoEmails = [
      'customer@demo.com',
      'trainer@demo.com', 
      'newuser@demo.com'
    ];
    
    for (const email of demoEmails) {
      try {
        const user = await storage.getUserByEmail(email);
        if (user) {
          console.log(`✅ Found: ${email} (role: ${user.role})`);
        } else {
          console.log(`❌ Not found: ${email}`);
        }
      } catch (error) {
        console.log(`❌ Error checking ${email}:`, error.message);
      }
    }
    
    // Also check existing test accounts
    const testEmails = [
      'admin@fitmeal.pro',
      'testtrainer@example.com',
      'testcustomer@example.com'
    ];
    
    console.log('\n🧪 Checking existing test accounts...');
    for (const email of testEmails) {
      try {
        const user = await storage.getUserByEmail(email);
        if (user) {
          console.log(`✅ Found: ${email} (role: ${user.role})`);
        } else {
          console.log(`❌ Not found: ${email}`);
        }
      } catch (error) {
        console.log(`❌ Error checking ${email}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('Error checking accounts:', error);
  }
}

checkDemoAccounts();