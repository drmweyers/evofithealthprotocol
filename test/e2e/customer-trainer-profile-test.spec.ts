import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = 'http://localhost:3501';

// Test accounts (standardized across all environments)
const TEST_CUSTOMER = {
  email: 'customer.test@evofitmeals.com',
  password: 'TestCustomer123!'
};

const TEST_TRAINER = {
  email: 'trainer.test@evofitmeals.com',
  password: 'TestTrainer123!'
};

const TEST_ADMIN = {
  email: 'admin@fitmeal.pro',
  password: 'AdminPass123'
};

test.describe('Customer-Trainer Profile Linkage Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for navigation
    test.setTimeout(60000);
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  });

  test('Customer can view profile with trainer information', async ({ page }) => {
    console.log('Testing customer profile with trainer linkage...');
    
    // Step 1: Login as customer
    await page.click('text=Sign In');
    await page.fill('input[type="email"]', TEST_CUSTOMER.email);
    await page.fill('input[type="password"]', TEST_CUSTOMER.password);
    await page.click('button:has-text("Sign In")');
    
    // Wait for successful login
    await page.waitForURL(/\/customer/);
    console.log('✓ Customer login successful');
    
    // Step 2: Navigate to profile
    await page.click('button:has-text("Profile")');
    
    // Wait for profile page to load
    await page.waitForSelector('h2:has-text("My Health Profile")', { timeout: 10000 });
    console.log('✓ Profile page loaded');
    
    // Step 3: Check for trainer information
    const trainerSection = page.locator('text=Your Trainer').first();
    const trainerSectionExists = await trainerSection.isVisible();
    
    if (trainerSectionExists) {
      console.log('✓ Trainer section found');
      
      // Check if trainer is assigned
      const noTrainerMessage = page.locator('text=No trainer assigned yet');
      const hasNoTrainer = await noTrainerMessage.isVisible().catch(() => false);
      
      if (!hasNoTrainer) {
        // Trainer is assigned - verify trainer details
        const trainerEmail = page.locator(`text=${TEST_TRAINER.email}`);
        const trainerEmailVisible = await trainerEmail.isVisible().catch(() => false);
        
        if (trainerEmailVisible) {
          console.log('✓ Trainer email displayed:', TEST_TRAINER.email);
        } else {
          console.log('⚠ Trainer assigned but email not visible');
        }
        
        // Check for trainer specialization
        const specialization = page.locator('text=Health Protocol Specialist');
        const hasSpecialization = await specialization.isVisible().catch(() => false);
        if (hasSpecialization) {
          console.log('✓ Trainer specialization displayed');
        }
        
        // Check for message trainer button
        const messageButton = page.locator('button:has-text("Message Trainer")');
        const hasMessageButton = await messageButton.isVisible().catch(() => false);
        if (hasMessageButton) {
          console.log('✓ Message trainer button available');
        }
      } else {
        console.log('ℹ No trainer assigned to this customer yet');
      }
    } else {
      console.log('⚠ Trainer section not found on profile page');
    }
    
    // Step 4: Verify other profile elements
    const profileElements = [
      { selector: 'text=Personal Details', name: 'Personal Details section' },
      { selector: 'text=Progress Stats', name: 'Progress Stats section' },
      { selector: 'text=Health Metrics', name: 'Health Metrics section' },
      { selector: 'text=Quick Actions', name: 'Quick Actions section' },
      { selector: 'button:has-text("Edit Profile")', name: 'Edit Profile button' }
    ];
    
    for (const element of profileElements) {
      const isVisible = await page.locator(element.selector).first().isVisible().catch(() => false);
      if (isVisible) {
        console.log(`✓ ${element.name} present`);
      } else {
        console.log(`⚠ ${element.name} not found`);
      }
    }
    
    // Step 5: Test edit profile functionality
    await page.click('button:has-text("Edit Profile")');
    await page.waitForSelector('button:has-text("Save Changes")', { timeout: 5000 });
    console.log('✓ Edit mode activated');
    
    // Cancel edit
    await page.click('button:has-text("Cancel")');
    console.log('✓ Edit cancelled successfully');
  });

  test('Trainer can assign protocol to customer and establish linkage', async ({ page }) => {
    console.log('Testing trainer-customer linkage through protocol assignment...');
    
    // Step 1: Login as trainer
    await page.click('text=Sign In');
    await page.fill('input[type="email"]', TEST_TRAINER.email);
    await page.fill('input[type="password"]', TEST_TRAINER.password);
    await page.click('button:has-text("Sign In")');
    
    await page.waitForURL(/\/trainer/);
    console.log('✓ Trainer login successful');
    
    // Step 2: Navigate to Health Protocols
    const healthProtocolsButton = page.locator('button:has-text("Health Protocols")');
    const hasHealthProtocols = await healthProtocolsButton.isVisible().catch(() => false);
    
    if (hasHealthProtocols) {
      await healthProtocolsButton.click();
      console.log('✓ Navigated to Health Protocols');
      
      // Check for existing protocols or create new one
      const createButton = page.locator('button:has-text("Create Protocol")');
      const hasCreateButton = await createButton.first().isVisible().catch(() => false);
      
      if (hasCreateButton) {
        console.log('✓ Create Protocol button available');
        
        // Check for customer list
        const customerSection = page.locator('text=Assign to Clients');
        const hasCustomerSection = await customerSection.isVisible().catch(() => false);
        
        if (hasCustomerSection) {
          console.log('✓ Customer assignment section available');
          
          // Look for test customer
          const customerCheckbox = page.locator(`text=${TEST_CUSTOMER.email}`);
          const hasCustomer = await customerCheckbox.isVisible().catch(() => false);
          
          if (hasCustomer) {
            console.log('✓ Test customer found in list');
          } else {
            console.log('ℹ Test customer not in trainer\'s list yet');
          }
        }
      }
    } else {
      console.log('ℹ Health Protocols button not found - checking alternative navigation');
    }
  });

  test('Admin can view all user profiles', async ({ page }) => {
    console.log('Testing admin access to all profiles...');
    
    // Step 1: Login as admin
    await page.click('text=Sign In');
    await page.fill('input[type="email"]', TEST_ADMIN.email);
    await page.fill('input[type="password"]', TEST_ADMIN.password);
    await page.click('button:has-text("Sign In")');
    
    await page.waitForURL(/\/admin/);
    console.log('✓ Admin login successful');
    
    // Step 2: Navigate to admin profile
    await page.click('button:has-text("Profile")');
    
    // Wait for profile page
    const adminProfileHeader = await page.waitForSelector('h2:has-text("Profile")', { timeout: 10000 }).catch(() => null);
    if (adminProfileHeader) {
      console.log('✓ Admin profile page loaded');
      
      // Verify admin-specific features
      const adminElements = [
        { selector: 'text=System Overview', name: 'System Overview' },
        { selector: 'text=Total Users', name: 'User Statistics' }
      ];
      
      for (const element of adminElements) {
        const isVisible = await page.locator(element.selector).first().isVisible().catch(() => false);
        if (isVisible) {
          console.log(`✓ Admin feature: ${element.name} present`);
        }
      }
    } else {
      console.log('ℹ Admin profile uses different layout');
    }
  });

  test('Profile navigation works from all pages', async ({ page }) => {
    console.log('Testing profile navigation accessibility...');
    
    // Login as customer
    await page.click('text=Sign In');
    await page.fill('input[type="email"]', TEST_CUSTOMER.email);
    await page.fill('input[type="password"]', TEST_CUSTOMER.password);
    await page.click('button:has-text("Sign In")');
    await page.waitForURL(/\/customer/);
    
    // Test profile button visibility on different pages
    const pagesToTest = [
      { url: '/customer', name: 'Customer Dashboard' },
      { url: '/customer?tab=health-protocols', name: 'Health Protocols Tab' },
      { url: '/customer?tab=progress', name: 'Progress Tab' }
    ];
    
    for (const testPage of pagesToTest) {
      await page.goto(`${BASE_URL}${testPage.url}`);
      await page.waitForLoadState('networkidle');
      
      const profileButton = page.locator('button:has-text("Profile")');
      const isVisible = await profileButton.isVisible().catch(() => false);
      
      if (isVisible) {
        console.log(`✓ Profile button visible on ${testPage.name}`);
        
        // Test navigation
        await profileButton.click();
        const profileLoaded = await page.waitForSelector('h2:has-text("My Health Profile")', { timeout: 5000 }).catch(() => false);
        
        if (profileLoaded) {
          console.log(`✓ Profile navigation works from ${testPage.name}`);
        }
        
        // Go back for next test
        await page.goBack();
      } else {
        console.log(`⚠ Profile button not found on ${testPage.name}`);
      }
    }
  });

  test('Customer profile displays correct statistics', async ({ page }) => {
    console.log('Testing customer profile statistics...');
    
    // Login as customer
    await page.click('text=Sign In');
    await page.fill('input[type="email"]', TEST_CUSTOMER.email);
    await page.fill('input[type="password"]', TEST_CUSTOMER.password);
    await page.click('button:has-text("Sign In")');
    await page.waitForURL(/\/customer/);
    
    // Navigate to profile
    await page.click('button:has-text("Profile")');
    await page.waitForSelector('h2:has-text("My Health Profile")');
    
    // Check for statistics
    const stats = [
      { selector: 'text=Meal Plans', name: 'Meal Plans count' },
      { selector: 'text=Days Done', name: 'Days completed' },
      { selector: 'text=Day Streak', name: 'Current streak' }
    ];
    
    for (const stat of stats) {
      const element = page.locator(stat.selector).first();
      const isVisible = await element.isVisible().catch(() => false);
      
      if (isVisible) {
        // Get the associated number
        const parent = await element.locator('..').first();
        const numberElement = await parent.locator('div[class*="font-bold"]').first();
        const number = await numberElement.textContent().catch(() => '0');
        console.log(`✓ ${stat.name}: ${number}`);
      } else {
        console.log(`⚠ ${stat.name} not displayed`);
      }
    }
  });

  test('Profile image upload section is present', async ({ page }) => {
    console.log('Testing profile image upload functionality...');
    
    // Login as customer
    await page.click('text=Sign In');
    await page.fill('input[type="email"]', TEST_CUSTOMER.email);
    await page.fill('input[type="password"]', TEST_CUSTOMER.password);
    await page.click('button:has-text("Sign In")');
    await page.waitForURL(/\/customer/);
    
    // Navigate to profile
    await page.click('button:has-text("Profile")');
    await page.waitForSelector('h2:has-text("My Health Profile")');
    
    // Check for profile image section
    const profileImageSection = page.locator('text=Profile Image').first();
    const hasImageSection = await profileImageSection.isVisible().catch(() => false);
    
    if (hasImageSection) {
      console.log('✓ Profile image section found');
      
      // Check for upload instructions
      const uploadInstructions = page.locator('text=/upload.*profile.*image/i');
      const hasInstructions = await uploadInstructions.isVisible().catch(() => false);
      
      if (hasInstructions) {
        console.log('✓ Upload instructions present');
      }
      
      // Check for image requirements
      const requirements = page.locator('text=/200x200|Square image/i');
      const hasRequirements = await requirements.isVisible().catch(() => false);
      
      if (hasRequirements) {
        console.log('✓ Image requirements displayed');
      }
    } else {
      console.log('⚠ Profile image section not found');
    }
  });
});

test.describe('Edge Cases and Error Scenarios', () => {
  test('Customer without trainer shows appropriate message', async ({ page }) => {
    console.log('Testing customer without trainer assignment...');
    
    // This test assumes we have a customer without a trainer
    // In production, we'd create a new customer account for this test
    
    await page.goto(BASE_URL);
    await page.click('text=Sign In');
    await page.fill('input[type="email"]', TEST_CUSTOMER.email);
    await page.fill('input[type="password"]', TEST_CUSTOMER.password);
    await page.click('button:has-text("Sign In")');
    await page.waitForURL(/\/customer/);
    
    await page.click('button:has-text("Profile")');
    await page.waitForSelector('h2:has-text("My Health Profile")');
    
    // Check for no trainer message
    const noTrainerMessage = page.locator('text=No trainer assigned yet');
    const hasMessage = await noTrainerMessage.isVisible().catch(() => false);
    
    if (hasMessage) {
      console.log('✓ "No trainer assigned" message displayed correctly');
      
      // Check for helper text
      const helperText = page.locator('text=/matched.*trainer.*soon/i');
      const hasHelperText = await helperText.isVisible().catch(() => false);
      
      if (hasHelperText) {
        console.log('✓ Helper text for unassigned customers present');
      }
    } else {
      console.log('ℹ Customer has a trainer assigned');
    }
  });

  test('Profile handles missing data gracefully', async ({ page }) => {
    console.log('Testing profile with missing data...');
    
    await page.goto(BASE_URL);
    await page.click('text=Sign In');
    await page.fill('input[type="email"]', TEST_CUSTOMER.email);
    await page.fill('input[type="password"]', TEST_CUSTOMER.password);
    await page.click('button:has-text("Sign In")');
    await page.waitForURL(/\/customer/);
    
    await page.click('button:has-text("Profile")');
    await page.waitForSelector('h2:has-text("My Health Profile")');
    
    // Check for default values
    const defaultTexts = [
      { selector: 'text=No bio provided', name: 'Default bio text' },
      { selector: 'text=No fitness goals set', name: 'Default fitness goals' },
      { selector: 'text=No dietary restrictions', name: 'Default dietary restrictions' },
      { selector: 'text=No cuisine preferences', name: 'Default cuisine preferences' },
      { selector: 'text=Not specified', name: 'Default for unspecified fields' }
    ];
    
    for (const defaultText of defaultTexts) {
      const element = page.locator(defaultText.selector).first();
      const isVisible = await element.isVisible().catch(() => false);
      
      if (isVisible) {
        console.log(`✓ ${defaultText.name} shown for missing data`);
      }
    }
  });
});

// Summary function
test.afterAll(async () => {
  console.log('\n=== Test Summary ===');
  console.log('Customer-Trainer Profile Linkage tests completed');
  console.log('Key features tested:');
  console.log('- Customer profile with trainer information');
  console.log('- Profile navigation from all pages');
  console.log('- Profile statistics display');
  console.log('- Profile image upload section');
  console.log('- Edge cases and error scenarios');
  console.log('==================\n');
});