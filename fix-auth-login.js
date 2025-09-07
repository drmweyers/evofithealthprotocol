// Quick login script for testing
// Run this in the browser console to log in as trainer

async function loginAsTrainer() {
  console.log('🔐 Logging in as trainer.test@evofitmeals.com...');
  
  try {
    const response = await fetch('http://localhost:3500/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'trainer.test@evofitmeals.com',
        password: 'TestTrainer123!'
      }),
      credentials: 'include'
    });

    const data = await response.json();
    
    if (response.ok && data.token) {
      console.log('✅ Login successful!');
      console.log('🔑 Token received:', data.token.substring(0, 20) + '...');
      
      // Store the token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      console.log('📝 User data:', data.user);
      console.log('🔄 Refreshing page in 2 seconds...');
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
      return data;
    } else {
      console.error('❌ Login failed:', data);
      return null;
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    return null;
  }
}

// Run the login
loginAsTrainer();