/**
 * QA Health Protocol System Verification Script
 * 
 * This script performs end-to-end verification of the health protocol generation system
 * after all fixes have been applied.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class QAHealthProtocolVerifier {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseUrl = 'http://localhost:4000';
    this.testResults = {
      jsErrors: [],
      protocolGeneration: { success: false, error: null },
      adminTabAccess: { success: false, error: null },
      databaseEntries: { success: false, error: null },
      ailmentsGeneration: { success: false, error: null },
      configurationPanels: { success: false, error: null }
    };
  }

  async init() {
    console.log('🚀 Initializing QA Health Protocol Verifier...');
    this.browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // Capture JavaScript errors
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.testResults.jsErrors.push(msg.text());
        console.log('❌ JS Error:', msg.text());
      }
    });

    // Capture page errors
    this.page.on('pageerror', error => {
      this.testResults.jsErrors.push(error.message);
      console.log('❌ Page Error:', error.message);
    });
  }

  async loginAsTrainer() {
    console.log('🔐 Logging in as trainer...');
    await this.page.goto(`${this.baseUrl}/login`);
    await this.page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    // Use trainer credentials
    await this.page.type('input[type="email"]', 'trainer@test.com');
    await this.page.type('input[type="password"]', 'password123');
    await this.page.click('button[type="submit"]');
    
    // Wait for redirect to trainer dashboard
    await this.page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log('✅ Logged in successfully');
  }

  async testAdminHealthProtocolsTabAccess() {
    console.log('🧪 Testing Admin Health Protocols tab access...');
    try {
      await this.page.goto(`${this.baseUrl}/admin`);
      await this.page.waitForSelector('[role="tablist"]', { timeout: 10000 });
      
      // Check for Health Protocols main tab
      const healthProtocolsMainTab = await this.page.$('button[value="specialized"]');
      if (!healthProtocolsMainTab) {
        throw new Error('Main Health Protocols tab not found');
      }
      
      // Click on Health Protocols main tab
      await this.page.click('button[value="specialized"]');
      await this.page.waitForSelector('h2:has-text("Specialized Health Protocols")', { timeout: 5000 });
      
      // Check for Browse Recipes -> Health Protocols sub-tab
      await this.page.click('button[value="recipes"]');
      await this.page.waitForSelector('button:has-text("Health Protocols")', { timeout: 5000 });
      await this.page.click('button:has-text("Health Protocols")');
      
      this.testResults.adminTabAccess.success = true;
      console.log('✅ Admin Health Protocols tabs accessible');
    } catch (error) {
      this.testResults.adminTabAccess.error = error.message;
      console.log('❌ Admin Health Protocols tab access failed:', error.message);
    }
  }

  async testProtocolGenerationWorkflow() {
    console.log('🧪 Testing protocol generation workflow...');
    try {
      // Navigate to Health Protocols tab
      await this.page.goto(`${this.baseUrl}/admin`);
      await this.page.waitForSelector('button[value="specialized"]', { timeout: 10000 });
      await this.page.click('button[value="specialized"]');
      
      // Wait for the SpecializedProtocolsPanel to load
      await this.page.waitForSelector('h2:has-text("Specialized Health Protocols")', { timeout: 10000 });
      
      // Expand the panel if collapsed
      const chevronDown = await this.page.$('svg[data-lucide="chevron-down"]');
      if (chevronDown) {
        await chevronDown.click();
        await this.page.waitForTimeout(1000);
      }
      
      // Navigate to Protocols tab within the panel
      await this.page.waitForSelector('[role="tablist"]', { timeout: 5000 });
      const protocolsTab = await this.page.$('button[value="protocols"]');
      if (protocolsTab) {
        await protocolsTab.click();
        await this.page.waitForTimeout(1000);
      }
      
      // Try to enable Longevity Mode
      const longevityToggle = await this.page.$('input[type="checkbox"]');
      if (longevityToggle) {
        const isChecked = await this.page.evaluate(el => el.checked, longevityToggle);
        if (!isChecked) {
          await longevityToggle.click();
          await this.page.waitForTimeout(1000);
        }
      }
      
      // Look for generation button
      const generateButton = await this.page.$('button:has-text("Generate")');
      if (generateButton) {
        await generateButton.click();
        
        // Wait for generation to complete (up to 30 seconds)
        await this.page.waitForFunction(
          () => !document.querySelector('button:has-text("Generating")'),
          { timeout: 30000 }
        );
        
        this.testResults.protocolGeneration.success = true;
        console.log('✅ Protocol generation workflow completed');
      } else {
        throw new Error('Generation button not found');
      }
    } catch (error) {
      this.testResults.protocolGeneration.error = error.message;
      console.log('❌ Protocol generation workflow failed:', error.message);
    }
  }

  async testAilmentsOnlyGeneration() {
    console.log('🧪 Testing ailments-only generation...');
    try {
      // Navigate to Health Protocols tab
      await this.page.goto(`${this.baseUrl}/admin`);
      await this.page.waitForSelector('button[value="specialized"]', { timeout: 10000 });
      await this.page.click('button[value="specialized"]');
      
      // Wait for panel to load
      await this.page.waitForSelector('h2:has-text("Specialized Health Protocols")', { timeout: 10000 });
      
      // Expand panel if needed
      const chevronDown = await this.page.$('svg[data-lucide="chevron-down"]');
      if (chevronDown) {
        await chevronDown.click();
        await this.page.waitForTimeout(1000);
      }
      
      // Navigate to Ailments tab
      const ailmentsTab = await this.page.$('button[value="ailments"]');
      if (ailmentsTab) {
        await ailmentsTab.click();
        await this.page.waitForTimeout(1000);
        
        // Try to select some ailments
        const ailmentCheckboxes = await this.page.$$('input[type="checkbox"]');
        if (ailmentCheckboxes.length > 0) {
          // Select first few ailments
          for (let i = 0; i < Math.min(3, ailmentCheckboxes.length); i++) {
            await ailmentCheckboxes[i].click();
            await this.page.waitForTimeout(500);
          }
          
          // Look for ailments generation button
          const generateAilmentsButton = await this.page.$('button:has-text("Generate Health-Targeted Meal Plan")');
          if (generateAilmentsButton) {
            await generateAilmentsButton.click();
            
            // Wait for generation to complete
            await this.page.waitForFunction(
              () => !document.querySelector('button:has-text("Generating")'),
              { timeout: 30000 }
            );
            
            this.testResults.ailmentsGeneration.success = true;
            console.log('✅ Ailments-only generation completed');
          } else {
            throw new Error('Ailments generation button not found or not enabled');
          }
        } else {
          throw new Error('No ailment checkboxes found');
        }
      } else {
        throw new Error('Ailments tab not found');
      }
    } catch (error) {
      this.testResults.ailmentsGeneration.error = error.message;
      console.log('❌ Ailments-only generation failed:', error.message);
    }
  }

  async testConfigurationPanelsAccess() {
    console.log('🧪 Testing configuration panels accessibility...');
    try {
      // Navigate to Health Protocols tab
      await this.page.goto(`${this.baseUrl}/admin`);
      await this.page.waitForSelector('button[value="specialized"]', { timeout: 10000 });
      await this.page.click('button[value="specialized"]');
      
      // Wait for panel to load
      await this.page.waitForSelector('h2:has-text("Specialized Health Protocols")', { timeout: 10000 });
      
      // Check if panel is expandable
      const chevronDown = await this.page.$('svg[data-lucide="chevron-down"]');
      if (chevronDown) {
        await chevronDown.click();
        await this.page.waitForTimeout(2000);
        
        // Check for various configuration tabs
        const configTabs = ['protocols', 'ailments', 'ingredients', 'dashboard', 'info'];
        let accessibleTabs = [];
        
        for (const tab of configTabs) {
          const tabButton = await this.page.$(`button[value="${tab}"]`);
          if (tabButton) {
            await tabButton.click();
            await this.page.waitForTimeout(1000);
            accessibleTabs.push(tab);
          }
        }
        
        if (accessibleTabs.length >= 3) {
          this.testResults.configurationPanels.success = true;
          console.log(`✅ Configuration panels accessible: ${accessibleTabs.join(', ')}`);
        } else {
          throw new Error(`Only ${accessibleTabs.length} configuration tabs accessible`);
        }
      } else {
        throw new Error('Panel expansion control not found');
      }
    } catch (error) {
      this.testResults.configurationPanels.error = error.message;
      console.log('❌ Configuration panels access failed:', error.message);
    }
  }

  async testDatabaseEntries() {
    console.log('🧪 Testing database entries...');
    try {
      // Make API call to check for health protocols
      const response = await this.page.evaluate(async () => {
        const res = await fetch('/api/trainer/health-protocols', {
          credentials: 'include'
        });
        return res.json();
      });
      
      if (response && (response.protocols || response.total !== undefined)) {
        this.testResults.databaseEntries.success = true;
        console.log(`✅ Database entries verified - Total: ${response.total || response.protocols?.length || 0}`);
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      this.testResults.databaseEntries.error = error.message;
      console.log('❌ Database entries verification failed:', error.message);
    }
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      testSummary: {
        jsErrors: this.testResults.jsErrors.length,
        protocolGenerationWorking: this.testResults.protocolGeneration.success,
        adminTabsAccessible: this.testResults.adminTabAccess.success,
        databaseIntegrationWorking: this.testResults.databaseEntries.success,
        ailmentsGenerationWorking: this.testResults.ailmentsGeneration.success,
        configurationPanelsAccessible: this.testResults.configurationPanels.success
      },
      detailedResults: this.testResults,
      recommendations: []
    };

    // Generate recommendations based on results
    if (this.testResults.jsErrors.length > 0) {
      report.recommendations.push('Fix JavaScript console errors to improve stability');
    }
    if (!this.testResults.protocolGeneration.success) {
      report.recommendations.push('Fix protocol generation workflow - core functionality not working');
    }
    if (!this.testResults.adminTabAccess.success) {
      report.recommendations.push('Fix Admin panel Health Protocols tab navigation');
    }
    if (!this.testResults.databaseEntries.success) {
      report.recommendations.push('Fix database integration for storing health protocols');
    }
    if (!this.testResults.ailmentsGeneration.success) {
      report.recommendations.push('Fix ailments-only generation feature');
    }
    if (!this.testResults.configurationPanels.success) {
      report.recommendations.push('Fix specialized configuration panels accessibility issue');
    }

    // Save report to file
    const reportPath = path.join(__dirname, 'QA_HEALTH_PROTOCOL_VERIFICATION_REPORT.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 QA VERIFICATION REPORT SUMMARY:');
    console.log('=====================================');
    console.log(`JavaScript Errors: ${report.testSummary.jsErrors}`);
    console.log(`Protocol Generation: ${report.testSummary.protocolGenerationWorking ? '✅ WORKING' : '❌ FAILED'}`);
    console.log(`Admin Tabs Access: ${report.testSummary.adminTabsAccessible ? '✅ WORKING' : '❌ FAILED'}`);
    console.log(`Database Integration: ${report.testSummary.databaseIntegrationWorking ? '✅ WORKING' : '❌ FAILED'}`);
    console.log(`Ailments Generation: ${report.testSummary.ailmentsGenerationWorking ? '✅ WORKING' : '❌ FAILED'}`);
    console.log(`Configuration Panels: ${report.testSummary.configurationPanelsAccessible ? '✅ WORKING' : '❌ FAILED'}`);
    
    if (report.recommendations.length > 0) {
      console.log('\n🔧 RECOMMENDATIONS:');
      report.recommendations.forEach((rec, i) => {
        console.log(`${i + 1}. ${rec}`);
      });
    }
    
    console.log(`\n📄 Full report saved to: ${reportPath}`);
    return report;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async runFullVerification() {
    try {
      await this.init();
      await this.loginAsTrainer();
      
      // Run all tests
      await this.testAdminHealthProtocolsTabAccess();
      await this.testConfigurationPanelsAccess();
      await this.testProtocolGenerationWorkflow();
      await this.testAilmentsOnlyGeneration();
      await this.testDatabaseEntries();
      
      return await this.generateReport();
    } catch (error) {
      console.error('❌ QA Verification failed:', error);
      return { error: error.message };
    } finally {
      await this.cleanup();
    }
  }
}

// Run the verification
async function main() {
  console.log('🧪 Starting QA Health Protocol System Verification...\n');
  
  const verifier = new QAHealthProtocolVerifier();
  const report = await verifier.runFullVerification();
  
  if (report.error) {
    console.error('Verification failed with error:', report.error);
    process.exit(1);
  } else {
    process.exit(0);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = QAHealthProtocolVerifier;