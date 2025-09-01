/**
 * Protocol Templates Seeder Script (JavaScript/CommonJS version)
 * 
 * Seeds the database with sample protocol templates for different health categories
 * and creates test customer data for the trainer.test@evofitmeals.com trainer.
 * 
 * Usage: node scripts/seed-protocol-templates.js
 */

// Load environment variables
require('dotenv').config({ path: '.env.development' });

// Override DATABASE_URL to use the correct database name
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5434/evofithealthprotocol_db';
process.env.NODE_ENV = 'development';

async function main() {
  console.log('🚀 Starting protocol templates seeder (JavaScript version)...');
  console.log('='.repeat(50));
  
  try {
    // Use tsx to run the TypeScript version
    const { spawn } = require('child_process');
    
    console.log('📦 Running TypeScript seeder with tsx...');
    
    const process_tsx = spawn('npx', ['tsx', 'scripts/seed-protocol-templates.ts'], {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: true
    });
    
    await new Promise((resolve, reject) => {
      process_tsx.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Process exited with code ${code}`));
        }
      });
      
      process_tsx.on('error', reject);
    });
    
  } catch (error) {
    console.error('💥 Fatal error during seeding:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⚠️ Process interrupted. Exiting gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️ Process terminated. Exiting gracefully...');
  process.exit(0);
});

// Run the seeder
main().then(() => {
  console.log('✨ Seeder process completed successfully!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Seeder process failed:', error);
  process.exit(1);
});