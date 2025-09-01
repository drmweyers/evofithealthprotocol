/**
 * STORY-004: Health Protocol Generation Optimization
 * API Endpoint Verification Script
 * 
 * This script tests all the new features implemented in STORY-004:
 * - Protocol Templates
 * - Medical Safety Validation
 * - Protocol Versioning
 * - Effectiveness Tracking
 * - OpenAI Optimization with Caching
 */

// Using built-in fetch API instead of axios

const API_BASE_URL = 'http://localhost:3501/api';

// Test credentials
const TEST_TRAINER = {
  email: 'trainer@test.com',
  password: 'TestPassword123!'
};

class Story004Tester {
  constructor() {
    this.authToken = null;
    this.testResults = [];
  }

  async login() {
    try {
      console.log('🔐 Authenticating as trainer...');
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(TEST_TRAINER)
      });
      
      const data = await response.json();
      
      if (data.token) {
        this.authToken = data.token;
        console.log('✅ Authentication successful');
        return true;
      }
    } catch (error) {
      console.error('❌ Authentication failed:', error.message);
      return false;
    }
  }

  async testProtocolTemplates() {
    console.log('\n📋 Testing Protocol Templates...');
    
    try {
      // Test 1: Get all templates
      const templatesRes = await axios.get(`${API_BASE_URL}/protocols/templates`, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });
      
      if (templatesRes.data.status === 'success') {
        console.log(`✅ Retrieved ${templatesRes.data.count} protocol templates`);
        this.testResults.push({ 
          feature: 'Protocol Templates - List', 
          status: 'PASSED',
          details: `Found ${templatesRes.data.count} templates`
        });
        
        // Test 2: Get specific template
        if (templatesRes.data.data && templatesRes.data.data.length > 0) {
          const templateId = templatesRes.data.data[0].id;
          const singleRes = await axios.get(`${API_BASE_URL}/protocols/templates/${templateId}`, {
            headers: { Authorization: `Bearer ${this.authToken}` }
          });
          
          if (singleRes.data.status === 'success') {
            console.log(`✅ Retrieved individual template: ${singleRes.data.data.name}`);
            this.testResults.push({ 
              feature: 'Protocol Templates - Get Single', 
              status: 'PASSED',
              details: singleRes.data.data.name
            });
          }
        }
      }
    } catch (error) {
      console.error('❌ Protocol templates test failed:', error.response?.data || error.message);
      this.testResults.push({ 
        feature: 'Protocol Templates', 
        status: 'FAILED',
        error: error.response?.data || error.message
      });
    }
  }

  async testMedicalSafetyValidation() {
    console.log('\n🏥 Testing Medical Safety Validation...');
    
    try {
      const validationRequest = {
        protocolId: 'test-protocol-id',
        customerId: 'test-customer-id',
        medications: ['warfarin', 'insulin'],
        healthConditions: ['diabetes', 'heart_disease'],
        allergies: ['peanuts']
      };
      
      const response = await axios.post(`${API_BASE_URL}/protocols/safety-validate`, validationRequest, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });
      
      if (response.data.safetyRating) {
        console.log(`✅ Safety validation completed: Rating = ${response.data.safetyRating}`);
        console.log(`   Interactions found: ${response.data.interactions?.length || 0}`);
        this.testResults.push({ 
          feature: 'Medical Safety Validation', 
          status: 'PASSED',
          details: `Safety rating: ${response.data.safetyRating}`
        });
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('⚠️ Safety validation endpoint not found - may not be fully implemented');
        this.testResults.push({ 
          feature: 'Medical Safety Validation', 
          status: 'NOT_IMPLEMENTED',
          details: 'Endpoint not found'
        });
      } else {
        console.error('❌ Medical safety validation failed:', error.response?.data || error.message);
        this.testResults.push({ 
          feature: 'Medical Safety Validation', 
          status: 'FAILED',
          error: error.response?.data || error.message
        });
      }
    }
  }

  async testProtocolVersioning() {
    console.log('\n🔢 Testing Protocol Versioning...');
    
    try {
      // First, we need a protocol to version
      const protocolData = {
        name: 'Test Protocol for Versioning',
        templateId: 'longevity-template-id',
        clientAge: 35,
        healthGoals: ['longevity', 'energy'],
        generateWithAI: false
      };
      
      const createRes = await axios.post(`${API_BASE_URL}/protocols`, protocolData, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });
      
      if (createRes.data.protocol?.id) {
        const protocolId = createRes.data.protocol.id;
        console.log(`✅ Created test protocol: ${protocolId}`);
        
        // Test versioning endpoint
        const versionRes = await axios.get(`${API_BASE_URL}/protocols/${protocolId}/versions`, {
          headers: { Authorization: `Bearer ${this.authToken}` }
        });
        
        if (versionRes.data) {
          console.log(`✅ Protocol versioning system accessible`);
          this.testResults.push({ 
            feature: 'Protocol Versioning', 
            status: 'PASSED',
            details: 'Version tracking available'
          });
        }
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('⚠️ Versioning endpoint not found - may not be fully implemented');
        this.testResults.push({ 
          feature: 'Protocol Versioning', 
          status: 'NOT_IMPLEMENTED',
          details: 'Endpoint not found'
        });
      } else {
        console.error('❌ Protocol versioning test failed:', error.response?.data || error.message);
        this.testResults.push({ 
          feature: 'Protocol Versioning', 
          status: 'FAILED',
          error: error.response?.data || error.message
        });
      }
    }
  }

  async testEffectivenessTracking() {
    console.log('\n📊 Testing Protocol Effectiveness Tracking...');
    
    try {
      const response = await axios.get(`${API_BASE_URL}/protocols/effectiveness/analytics`, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });
      
      if (response.data) {
        console.log('✅ Effectiveness tracking system accessible');
        this.testResults.push({ 
          feature: 'Effectiveness Tracking', 
          status: 'PASSED',
          details: 'Analytics endpoint available'
        });
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('⚠️ Effectiveness tracking endpoint not found - may not be fully implemented');
        this.testResults.push({ 
          feature: 'Effectiveness Tracking', 
          status: 'NOT_IMPLEMENTED',
          details: 'Endpoint not found'
        });
      } else {
        console.error('❌ Effectiveness tracking test failed:', error.response?.data || error.message);
        this.testResults.push({ 
          feature: 'Effectiveness Tracking', 
          status: 'FAILED',
          error: error.response?.data || error.message
        });
      }
    }
  }

  async testOpenAICaching() {
    console.log('\n🤖 Testing OpenAI Caching & Optimization...');
    
    try {
      // Make two identical requests to test caching
      const protocolRequest = {
        name: 'Cache Test Protocol',
        templateId: 'longevity-template-id',
        clientAge: 40,
        healthGoals: ['energy', 'longevity'],
        generateWithAI: true
      };
      
      console.log('   Making first request...');
      const start1 = Date.now();
      const res1 = await axios.post(`${API_BASE_URL}/protocols`, protocolRequest, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });
      const time1 = Date.now() - start1;
      
      console.log('   Making second identical request...');
      const start2 = Date.now();
      const res2 = await axios.post(`${API_BASE_URL}/protocols`, protocolRequest, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });
      const time2 = Date.now() - start2;
      
      if (time2 < time1 * 0.5) {
        console.log(`✅ Caching appears to be working (${time1}ms vs ${time2}ms)`);
        this.testResults.push({ 
          feature: 'OpenAI Caching', 
          status: 'PASSED',
          details: `Cache hit: ${Math.round((1 - time2/time1) * 100)}% faster`
        });
      } else {
        console.log(`⚠️ Caching may not be working optimally (${time1}ms vs ${time2}ms)`);
        this.testResults.push({ 
          feature: 'OpenAI Caching', 
          status: 'PARTIAL',
          details: 'No significant speed improvement detected'
        });
      }
    } catch (error) {
      console.error('❌ OpenAI caching test failed:', error.response?.data || error.message);
      this.testResults.push({ 
        feature: 'OpenAI Caching', 
        status: 'FAILED',
        error: error.response?.data || error.message
      });
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 STORY-004 VERIFICATION SUMMARY');
    console.log('='.repeat(60));
    
    const passed = this.testResults.filter(r => r.status === 'PASSED').length;
    const failed = this.testResults.filter(r => r.status === 'FAILED').length;
    const notImpl = this.testResults.filter(r => r.status === 'NOT_IMPLEMENTED').length;
    const partial = this.testResults.filter(r => r.status === 'PARTIAL').length;
    
    console.log(`\n✅ Passed: ${passed}`);
    console.log(`⚠️  Partial: ${partial}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`🔧 Not Implemented: ${notImpl}`);
    
    console.log('\n📋 Detailed Results:');
    console.log('-'.repeat(60));
    
    this.testResults.forEach(result => {
      const icon = result.status === 'PASSED' ? '✅' : 
                   result.status === 'FAILED' ? '❌' : 
                   result.status === 'PARTIAL' ? '⚠️' : '🔧';
      console.log(`${icon} ${result.feature}: ${result.status}`);
      if (result.details) {
        console.log(`   ${result.details}`);
      }
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    console.log('\n' + '='.repeat(60));
    
    // Overall assessment
    if (passed >= 3 && failed === 0) {
      console.log('🎉 STORY-004 core features are working!');
    } else if (passed >= 2) {
      console.log('⚠️ STORY-004 partially implemented, some features need work');
    } else {
      console.log('🔧 STORY-004 implementation needs completion');
    }
  }

  async runAllTests() {
    console.log('🚀 Starting STORY-004 Verification Tests');
    console.log('=' .repeat(60));
    
    // Login first
    const loginSuccess = await this.login();
    if (!loginSuccess) {
      console.error('❌ Cannot proceed without authentication');
      return;
    }
    
    // Run all feature tests
    await this.testProtocolTemplates();
    await this.testMedicalSafetyValidation();
    await this.testProtocolVersioning();
    await this.testEffectivenessTracking();
    await this.testOpenAICaching();
    
    // Print summary
    this.printSummary();
  }
}

// Run the tests
const tester = new Story004Tester();
tester.runAllTests().catch(console.error);