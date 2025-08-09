/**
 * Ailments-Based Protocol Generation Test
 * 
 * Tests the specific requirement for generating protocols based only on client ailments
 * without requiring longevity or parasite cleanse protocols to be enabled.
 */

const http = require('http');

class AilmentsGenerationTester {
  constructor() {
    this.baseUrl = 'http://localhost:4000';
    this.cookie = null;
  }

  async makeRequest(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
        }
      };

      // Add cookie if we have one
      if (this.cookie) {
        options.headers['Cookie'] = this.cookie;
      }

      if (body) {
        const bodyString = JSON.stringify(body);
        options.headers['Content-Length'] = Buffer.byteLength(bodyString);
      }

      const req = http.request(options, (res) => {
        let data = '';
        
        // Store cookie from login
        if (res.headers['set-cookie'] && !this.cookie) {
          this.cookie = res.headers['set-cookie'].join('; ');
        }

        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const parsedData = data ? JSON.parse(data) : null;
            resolve({
              status: res.statusCode,
              data: parsedData,
              headers: res.headers
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              data: data,
              headers: res.headers
            });
          }
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  }

  async login() {
    console.log('🔐 Logging in as trainer...');
    const loginData = {
      email: 'test@qa.com',
      password: 'test123'
    };

    const response = await this.makeRequest('/api/auth/login', 'POST', loginData);
    
    if (response.status === 200) {
      console.log('✅ Login successful');
      return true;
    } else {
      console.log('❌ Login failed:', response.data);
      return false;
    }
  }

  async testAilmentsOnlyGeneration() {
    console.log('🧪 Testing ailments-only generation...');
    
    // Test data for ailments-based generation
    const ailmentsTestData = {
      planName: 'Ailments-Only Test Protocol',
      duration: 30,
      selectedAilments: ['diabetes', 'hypertension', 'inflammation'],
      nutritionalFocus: {
        mealPlanFocus: ['anti_inflammatory', 'blood_sugar_control', 'heart_healthy'],
        keyNutrients: ['fiber', 'omega3', 'antioxidants'],
        avoidanceList: ['refined_sugar', 'high_sodium', 'processed_foods']
      },
      priorityLevel: 'high',
      dailyCalorieTarget: 1800,
      clientName: 'Test Client with Health Issues'
    };

    try {
      console.log('  Sending ailments-based generation request...');
      const response = await this.makeRequest(
        '/api/specialized/ailments-based/generate',
        'POST',
        ailmentsTestData
      );

      console.log(`  Response status: ${response.status}`);
      
      if (response.status === 200) {
        console.log('✅ Ailments-based generation SUCCESSFUL');
        console.log('  Generated plan summary:');
        
        const data = response.data;
        if (data.mealPlan) {
          console.log(`    - Meal Plan Duration: ${data.mealPlan.duration || 'N/A'} days`);
          console.log(`    - Number of Meals: ${data.mealPlan.meals?.length || 'N/A'}`);
          console.log(`    - Targeted Ailments: ${ailmentsTestData.selectedAilments.join(', ')}`);
          
          if (data.nutritionalStrategy) {
            console.log(`    - Nutritional Strategy: Available`);
          }
          
          if (data.safetyDisclaimer) {
            console.log(`    - Safety Disclaimer: ${data.safetyDisclaimer.title}`);
          }
          
          // Try to save to database
          return await this.testDatabaseSave('ailments-based', data, ailmentsTestData);
        } else {
          console.log('⚠️ Generation successful but no meal plan in response');
          return { success: true, saved: false, issue: 'No meal plan in response' };
        }
      } else {
        console.log('❌ Ailments-based generation FAILED');
        console.log('  Error:', JSON.stringify(response.data, null, 2));
        return { success: false, error: response.data };
      }
    } catch (error) {
      console.log('❌ Ailments-based generation ERROR:', error.message);
      return { success: false, error: error.message };
    }
  }

  async testDatabaseSave(type, generatedData, requestData) {
    console.log('💾 Testing database save...');
    
    const protocolData = {
      name: requestData.planName || `${type} Protocol - ${new Date().toLocaleDateString()}`,
      description: `Generated ${type} protocol for ${requestData.selectedAilments?.join(', ') || 'health optimization'}`,
      type: type === 'ailments-based' ? 'longevity' : type,
      duration: generatedData.mealPlan?.duration || requestData.duration || 30,
      intensity: 'moderate',
      config: {
        originalRequest: requestData,
        generatedPlan: generatedData,
        mealPlan: generatedData.mealPlan,
        ...generatedData
      },
      tags: requestData.selectedAilments || [type]
    };

    try {
      const response = await this.makeRequest('/api/trainer/health-protocols', 'POST', protocolData);
      
      if (response.status === 201 || response.status === 200) {
        console.log('✅ Database save SUCCESSFUL');
        console.log(`  Protocol ID: ${response.data.id || 'N/A'}`);
        return { success: true, saved: true, protocolId: response.data.id };
      } else {
        console.log('❌ Database save FAILED');
        console.log('  Error:', JSON.stringify(response.data, null, 2));
        return { success: true, saved: false, error: response.data };
      }
    } catch (error) {
      console.log('❌ Database save ERROR:', error.message);
      return { success: true, saved: false, error: error.message };
    }
  }

  async verifyProtocolInDatabase() {
    console.log('🔍 Verifying protocols in database...');
    
    try {
      const response = await this.makeRequest('/api/trainer/health-protocols', 'GET');
      
      if (response.status === 200 && response.data) {
        const protocols = response.data.protocols || [];
        console.log(`✅ Found ${protocols.length} protocols in database`);
        
        // Look for ailments-based protocols
        const ailmentsProtocols = protocols.filter(p => 
          p.tags && p.tags.includes('diabetes') || 
          p.name.toLowerCase().includes('ailments') ||
          p.description.toLowerCase().includes('ailments')
        );
        
        console.log(`  Ailments-based protocols: ${ailmentsProtocols.length}`);
        
        ailmentsProtocols.forEach((protocol, index) => {
          console.log(`    ${index + 1}. ${protocol.name} (${protocol.type})`);
          console.log(`       Created: ${new Date(protocol.createdAt).toLocaleString()}`);
          console.log(`       Tags: ${protocol.tags?.join(', ') || 'None'}`);
        });
        
        return { success: true, total: protocols.length, ailments: ailmentsProtocols.length };
      } else {
        console.log('❌ Failed to retrieve protocols from database');
        return { success: false, error: response.data };
      }
    } catch (error) {
      console.log('❌ Database verification ERROR:', error.message);
      return { success: false, error: error.message };
    }
  }

  async runFullTest() {
    console.log('🧪 Starting Ailments-Only Generation Test...\n');
    
    const results = {
      login: false,
      generation: null,
      database: null,
      verification: null
    };

    // Step 1: Login
    results.login = await this.login();
    if (!results.login) {
      return { error: 'Login failed', results };
    }

    // Step 2: Test ailments-only generation
    results.generation = await this.testAilmentsOnlyGeneration();

    // Step 3: Verify protocols in database
    results.verification = await this.verifyProtocolInDatabase();

    return { results };
  }

  generateReport(testResults) {
    console.log('\n📊 AILMENTS-ONLY GENERATION TEST REPORT:');
    console.log('==========================================\n');

    const results = testResults.results;

    console.log(`🔐 Login: ${results.login ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`🧬 Generation: ${results.generation?.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`💾 Database Save: ${results.generation?.saved ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`🔍 Verification: ${results.verification?.success ? '✅ SUCCESS' : '❌ FAILED'}`);

    if (results.verification?.success) {
      console.log(`📊 Total Protocols: ${results.verification.total}`);
      console.log(`🎯 Ailments Protocols: ${results.verification.ailments}`);
    }

    console.log('\n📋 DETAILED FINDINGS:');
    console.log('======================');

    if (results.generation?.success) {
      console.log('✅ Ailments-based generation is working correctly');
      console.log('✅ API endpoint /api/specialized/ailments-based/generate is functional');
      console.log('✅ Protocol can be generated from health issues alone (no longevity/cleanse required)');
    } else {
      console.log('❌ Ailments-based generation is not working');
      if (results.generation?.error) {
        console.log(`   Error: ${JSON.stringify(results.generation.error)}`);
      }
    }

    if (results.generation?.saved) {
      console.log('✅ Database integration is working');
      console.log('✅ Generated protocols are saved successfully');
    } else {
      console.log('❌ Database integration has issues');
      if (results.generation?.error) {
        console.log(`   Error: ${JSON.stringify(results.generation.error)}`);
      }
    }

    console.log('\n🎯 AILMENTS-ONLY REQUIREMENT STATUS:');
    console.log('====================================');
    
    if (results.generation?.success && results.generation?.saved) {
      console.log('✅ REQUIREMENT SATISFIED: Ailments-only generation works correctly');
      console.log('✅ Users can generate health protocols based solely on selected ailments');
      console.log('✅ No need to enable longevity or parasite cleanse modes');
      console.log('✅ Generated protocols are saved to database for later use');
    } else {
      console.log('❌ REQUIREMENT NOT SATISFIED: Ailments-only generation needs fixes');
    }

    console.log('\n🔧 RECOMMENDATIONS:');
    console.log('===================');

    if (!results.generation?.success) {
      console.log('1. Fix ailments-based generation API endpoint');
      console.log('2. Debug generation logic for health issues targeting');
    }
    
    if (results.generation?.success && !results.generation?.saved) {
      console.log('1. Fix database save functionality for generated protocols');
      console.log('2. Check trainer_health_protocols table schema');
    }

    if (results.generation?.success && results.generation?.saved) {
      console.log('1. ✅ Core functionality is working - focus on UI accessibility');
      console.log('2. ✅ Backend is solid - ensure frontend can access these features');
    }

    return {
      status: results.generation?.success && results.generation?.saved ? 'WORKING' : 'NEEDS_FIXES',
      summary: results
    };
  }
}

// Run the test
async function main() {
  const tester = new AilmentsGenerationTester();
  
  try {
    const testResults = await tester.runFullTest();
    
    if (testResults.error) {
      console.error('Test failed:', testResults.error);
      return;
    }

    const report = tester.generateReport(testResults);
    console.log(`\n🏁 Final Status: ${report.status}`);
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = AilmentsGenerationTester;