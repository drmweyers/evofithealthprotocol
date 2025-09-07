import { test, expect } from '@playwright/test';

test.describe('🔍 WIZARD API DEBUG', () => {
  const baseURL = 'http://localhost:3501';
  
  test('Check API endpoints for wizard data', async ({ page, request }) => {
    console.log('\n' + '='.repeat(80));
    console.log('🔍 DEBUGGING WIZARD API ENDPOINTS');
    console.log('='.repeat(80) + '\n');
    
    // Login first to get session
    console.log('📋 Logging in...');
    await page.goto(`${baseURL}/login`);
    await page.fill('input[name="email"]', 'trainer.test@evofitmeals.com');
    await page.fill('input[name="password"]', 'TestTrainer123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/trainer/, { timeout: 10000 });
    
    // Get cookies for API requests
    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');
    console.log('✅ Got session cookies\n');
    
    // Test 1: Check protocol-templates endpoint
    console.log('📋 Testing /api/protocol-templates endpoint...');
    const templatesResponse = await request.get(`${baseURL}/api/protocol-templates`, {
      headers: {
        'Cookie': cookieHeader,
        'Accept': 'application/json'
      }
    });
    
    console.log(`  Status: ${templatesResponse.status()}`);
    if (templatesResponse.ok()) {
      const templatesData = await templatesResponse.json();
      console.log(`  ✅ Success! Found ${templatesData.data?.length || 0} templates`);
      
      if (templatesData.data && templatesData.data.length > 0) {
        console.log('\n  Template examples:');
        templatesData.data.slice(0, 3).forEach((t: any, i: number) => {
          console.log(`    ${i + 1}. ${t.name} (${t.category})`);
        });
      } else {
        console.log('  ⚠️ No templates in database!');
      }
    } else {
      console.log(`  ❌ Failed: ${templatesResponse.statusText()}`);
      const errorText = await templatesResponse.text();
      console.log(`  Error: ${errorText.substring(0, 200)}`);
    }
    
    // Test 2: Check trainer/customers endpoint
    console.log('\n📋 Testing /api/trainer/customers endpoint...');
    const customersResponse = await request.get(`${baseURL}/api/trainer/customers`, {
      headers: {
        'Cookie': cookieHeader,
        'Accept': 'application/json'
      }
    });
    
    console.log(`  Status: ${customersResponse.status()}`);
    if (customersResponse.ok()) {
      const customersData = await customersResponse.json();
      console.log(`  ✅ Success! Found ${customersData.length || 0} customers`);
      
      if (customersData.length > 0) {
        console.log('\n  Customer examples:');
        customersData.slice(0, 3).forEach((c: any, i: number) => {
          console.log(`    ${i + 1}. ${c.email} (${c.name || 'No name'})`);
        });
      }
    } else {
      console.log(`  ❌ Failed: ${customersResponse.statusText()}`);
    }
    
    // Test 3: Create test protocol templates if none exist
    console.log('\n📋 Checking if we need to create test templates...');
    
    // Open wizard to check current state
    await page.goto(`${baseURL}/protocols`);
    await page.locator('button:has-text("Open Protocol Wizard")').first().click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    // Select customer and go to templates
    const customerCards = page.locator('[role="dialog"] .cursor-pointer.p-4.border');
    await customerCards.first().click();
    await page.locator('[role="dialog"] button:has-text("Next")').click();
    await page.waitForTimeout(2000);
    
    // Check for templates in the UI
    const templateDivs = await page.locator('[role="dialog"] div.cursor-pointer').count();
    console.log(`  Found ${templateDivs} template elements in UI`);
    
    // If no templates, we need to create some
    if (templateDivs === 0) {
      console.log('\n⚠️ NO TEMPLATES FOUND - Need to create default templates!');
      console.log('  This is why the wizard gets stuck on Step 2');
      
      // Try to create templates via API
      console.log('\n📋 Attempting to create default templates...');
      
      const defaultTemplates = [
        {
          name: 'Weight Loss Protocol',
          description: 'Comprehensive weight loss and metabolic optimization',
          category: 'Weight Management',
          tags: ['weight-loss', 'metabolism', 'nutrition'],
          isPublic: true
        },
        {
          name: 'Muscle Building Protocol',
          description: 'Muscle growth and strength training protocol',
          category: 'Fitness',
          tags: ['muscle', 'strength', 'performance'],
          isPublic: true
        },
        {
          name: 'Energy & Vitality Protocol',
          description: 'Boost energy levels and overall vitality',
          category: 'Wellness',
          tags: ['energy', 'vitality', 'wellness'],
          isPublic: true
        }
      ];
      
      for (const template of defaultTemplates) {
        const createResponse = await request.post(`${baseURL}/api/protocol-templates`, {
          headers: {
            'Cookie': cookieHeader,
            'Content-Type': 'application/json'
          },
          data: template
        });
        
        if (createResponse.ok()) {
          console.log(`  ✅ Created template: ${template.name}`);
        } else {
          console.log(`  ❌ Failed to create ${template.name}: ${createResponse.status()}`);
        }
      }
    }
    
    // Final diagnosis
    console.log('\n' + '='.repeat(80));
    console.log('🔍 DIAGNOSIS');
    console.log('='.repeat(80));
    
    if (templatesResponse.ok() && customersResponse.ok()) {
      const templatesData = await templatesResponse.json();
      const customersData = await customersResponse.json();
      
      if (templatesData.data?.length === 0) {
        console.log('❌ PROBLEM: No protocol templates in database');
        console.log('   Solution: Need to seed database with default templates');
      } else if (customersData.length === 0) {
        console.log('❌ PROBLEM: No customers linked to trainer');
        console.log('   Solution: Already fixed with protocol assignments');
      } else {
        console.log('✅ APIs are working correctly');
        console.log(`   Templates: ${templatesData.data?.length || 0}`);
        console.log(`   Customers: ${customersData.length}`);
      }
    } else {
      console.log('❌ API endpoints are failing');
      console.log('   Check server logs for errors');
    }
  });
});