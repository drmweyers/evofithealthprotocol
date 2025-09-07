// Quick admin login for testing the wizard
// Copy and paste this into the browser console

fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@fitmeal.pro',
    password: 'AdminPass123'
  }),
  credentials: 'include'
}).then(r => r.json()).then(d => {
  if (d.token) {
    localStorage.setItem('token', d.token);
    localStorage.setItem('user', JSON.stringify(d.user));
    console.log('✅ Logged in as admin:', d.user.email);
    console.log('🔄 Refreshing page...');
    setTimeout(() => location.reload(), 1000);
  } else {
    console.error('❌ Login failed:', d);
  }
});