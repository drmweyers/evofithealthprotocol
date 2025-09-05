import axios from 'axios';

async function testCustomerProfile() {
  try {
    // Login as customer
    const loginResponse = await axios.post('http://localhost:3501/api/auth/login', {
      email: 'customer.test@evofitmeals.com',
      password: 'TestCustomer123!'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Fetch customer profile
    const profileResponse = await axios.get('http://localhost:3501/api/customer/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Customer profile fetched successfully');
    console.log('Profile data:', JSON.stringify(profileResponse.data, null, 2));
    
    if (profileResponse.data.trainer) {
      console.log('✅ Trainer data is present:', profileResponse.data.trainer);
    } else {
      console.log('⚠️ No trainer data found in profile');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testCustomerProfile();