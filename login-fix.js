// Quick fix for authentication issues
// Paste this in the browser console to login

// Clear old invalid tokens first
localStorage.clear();
sessionStorage.clear();

// Login as admin
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@fitmeal.pro',
    password: 'AdminPass123'
  }),
  credentials: 'include'
}).then(r => r.json()).then(data => {
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    console.log('✅ Logged in successfully as:', data.user.email);
    console.log('🔄 Refreshing page...');
    setTimeout(() => location.reload(), 1000);
  } else {
    console.error('❌ Login failed:', data);
  }
}).catch(err => {
  console.error('❌ Network error:', err);
});