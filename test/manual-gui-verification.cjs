// Manual GUI Verification Script

async function verifyApplication() {
  console.log('🔍 Starting GUI Verification Tests...\n');
  
  // Test 1: Check if application responds
  console.log('📋 Test 1: Application Response Check');
  try {
    const response = await fetch('http://localhost:3500');
    const html = await response.text();
    
    if (response.ok) {
      console.log('✅ Application responds with status:', response.status);
      
      // Check for key elements in HTML
      const checks = [
        { name: 'HTML structure', test: html.includes('<html') },
        { name: 'React root', test: html.includes('id="root"') },
        { name: 'Title', test: html.includes('EvoFitHealthProtocol') },
        { name: 'Vite dev script', test: html.includes('/@vite/client') },
        { name: 'Main script', test: html.includes('/src/main.tsx') }
      ];
      
      checks.forEach(check => {
        console.log(check.test ? '✅' : '❌', check.name);
      });
    } else {
      console.log('❌ Application returned status:', response.status);
    }
  } catch (error) {
    console.log('❌ Application connection failed:', error.message);
  }
  
  // Test 2: Check API endpoints
  console.log('\n📋 Test 2: API Endpoint Checks');
  const apiEndpoints = [
    '/api/health',
    '/api/auth/status',
    '/api/customers'
  ];
  
  for (const endpoint of apiEndpoints) {
    try {
      const response = await fetch(`http://localhost:3500${endpoint}`);
      console.log(response.ok ? '✅' : '⚠️', `${endpoint}: ${response.status}`);
    } catch (error) {
      console.log('❌', `${endpoint}: Connection failed`);
    }
  }
  
  // Test 3: Database connectivity test via API
  console.log('\n📋 Test 3: Database Connection Test');
  try {
    const response = await fetch('http://localhost:3500/api/health');
    if (response.ok) {
      console.log('✅ Health endpoint accessible');
    } else {
      console.log('⚠️ Health endpoint returned:', response.status);
    }
  } catch (error) {
    console.log('❌ Health endpoint failed:', error.message);
  }
  
  console.log('\n📊 GUI Verification Complete');
}

// Run the verification
verifyApplication().catch(console.error);