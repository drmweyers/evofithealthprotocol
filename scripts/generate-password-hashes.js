import bcrypt from 'bcrypt';

const passwords = {
  'admin@fitmeal.pro': 'AdminPass123',
  'trainer.test@evofitmeals.com': 'TestTrainer123!',
  'customer.test@evofitmeals.com': 'TestCustomer123!'
};

async function generateHashes() {
  console.log('Generating bcrypt hashes for standard passwords...\n');
  
  for (const [email, password] of Object.entries(passwords)) {
    const hash = await bcrypt.hash(password, 10);
    console.log(`-- ${email}`);
    console.log(`UPDATE users SET password = '${hash}' WHERE email = '${email}';`);
    console.log('');
  }
}

generateHashes();