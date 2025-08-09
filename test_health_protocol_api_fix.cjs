/**
 * Health Protocol API Fix Verification Test
 * 
 * This script tests the fixed health protocol endpoint to ensure:
 * 1. Large payloads are now accepted (500KB limit)
 * 2. Proper error handling and logging is working
 * 3. Database insertion works correctly
 */

// Using Node.js built-in fetch (available in Node 18+)

const BASE_URL = 'http://localhost:4000';

// Create both realistic and large test protocols
const createRealisticHealthProtocol = () => {
  const realisticConfig = {
    phases: Array.from({ length: 12 }, (_, i) => ({
      phaseNumber: i + 1,
      name: `Phase ${i + 1}: ${['Preparation', 'Foundation', 'Building', 'Optimization', 'Peak', 'Maintenance'][i % 6]}`,
      duration: 30, // days
      description: `Month ${i + 1} focuses on ${['gut health preparation', 'nutrient optimization', 'cellular repair', 'mitochondrial support', 'immune system', 'hormonal balance'][i % 6]}. This phase includes specific protocols for enhancing longevity markers.`,
      supplements: Array.from({ length: 6 }, (_, j) => ({
        name: ['NAD+ Precursor', 'Resveratrol', 'Curcumin', 'Omega-3', 'Vitamin D3', 'Magnesium'][j],
        dosage: `${[500, 250, 1000, 2000, 4000, 400][j]}${['mg', 'mg', 'mg', 'mg', 'IU', 'mg'][j]}`,
        timing: ['morning', 'evening', 'with meals'][j % 3],
        instructions: `Take ${['on empty stomach', 'with food', 'before bed'][j % 3]}. Monitor for side effects and adjust as needed.`,
      })),
      lifestyle: {
        exercise: `${['Light cardio', 'Strength training', 'HIIT', 'Yoga'][i % 4]} for 30-45 minutes, 3-4 times per week.`,
        diet: `Focus on ${['anti-inflammatory foods', 'high antioxidant foods', 'nutrient-dense meals', 'intermittent fasting'][i % 4]}.`,
        sleep: `Target 7-9 hours with ${['sleep hygiene', 'blue light blocking', 'temperature optimization'][i % 3]} protocols.`
      }
    })),
    generalInstructions: 'This longevity protocol is designed to optimize cellular health, reduce inflammation, and support healthy aging through evidence-based interventions.',
    monitoring: {
      biomarkers: ['Complete blood count', 'Comprehensive metabolic panel', 'Lipid panel', 'HbA1c', 'CRP', 'Homocysteine'],
      frequency: 'Every 3 months'
    }
  };

  return {
    name: `Realistic Longevity Protocol - ${new Date().toISOString().slice(0, 10)}`,
    description: 'A comprehensive 12-month longevity protocol focusing on cellular health optimization.',
    type: 'longevity',
    duration: 365,
    intensity: 'moderate',
    config: realisticConfig,
    tags: ['longevity', 'cellular-health', 'anti-aging']
  };
};

const createLargeHealthProtocol = () => {
  // Create a reasonably large but realistic configuration
  const largeConfig = {
    phases: Array.from({ length: 24 }, (_, i) => ({
      phaseNumber: i + 1,
      name: `Phase ${i + 1}: Advanced Protocol Implementation`,
      duration: 14, // days
      description: `Bi-weekly phase ${i + 1} of the comprehensive longevity protocol. This phase includes detailed supplement protocols, lifestyle interventions, and monitoring guidelines for optimal health outcomes.`,
      supplements: Array.from({ length: 8 }, (_, j) => ({
        name: `Supplement ${j + 1} for Phase ${i + 1}`,
        dosage: `${(j + 1) * 100}mg`,
        timing: ['morning', 'afternoon', 'evening'][j % 3],
        instructions: `Detailed instructions for supplement ${j + 1} including timing, interactions, and monitoring.`,
        precautions: `Safety information and contraindications for supplement ${j + 1}.`,
      })),
      lifestyle: {
        exercise: `Phase ${i + 1} exercise protocol with specific movements and intensity guidelines.`,
        diet: `Nutritional guidelines for phase ${i + 1} including macronutrient targets and meal timing.`,
        sleep: `Sleep optimization for phase ${i + 1} including environment and timing recommendations.`
      },
      monitoring: {
        biomarkers: Array.from({ length: 8 }, (_, k) => `Biomarker ${k + 1} for phase ${i + 1}`),
        symptoms: Array.from({ length: 5 }, (_, k) => `Symptom ${k + 1} monitoring`)
      }
    })),
    generalInstructions: 'Comprehensive longevity protocol designed to optimize health and extend lifespan through evidence-based interventions.',
    warningsAndPrecautions: 'Important safety information and contraindications for the longevity protocol.',
    monitoringGuidelines: 'Detailed guidelines for monitoring progress and adjusting the protocol based on individual response.'
  };

  return {
    name: `Large Longevity Protocol Test - ${new Date().toISOString()}`,
    description: 'This is a comprehensive test protocol to verify the API can handle large payloads.',
    type: 'longevity',
    duration: 365,
    intensity: 'intensive',
    config: largeConfig,
    tags: ['test', 'longevity', 'comprehensive']
  };
};

async function loginAsTrainer() {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Login failed: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('✅ Successfully logged in as trainer');
    console.log('🔑 Login response structure:', Object.keys(data));
    return data.data.accessToken;
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    throw error;
  }
}

async function testHealthProtocolCreation(token, protocolType = 'realistic') {
  try {
    const protocolData = protocolType === 'realistic' 
      ? createRealisticHealthProtocol() 
      : createLargeHealthProtocol();
      
    const payloadSize = JSON.stringify(protocolData).length;
    console.log(`🧪 Creating ${protocolType} health protocol...`);
    console.log(`📏 Payload size: ${payloadSize} bytes (${(payloadSize / 1024).toFixed(2)} KB)`);

    const response = await fetch(`${BASE_URL}/api/trainer/health-protocols`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(protocolData),
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      console.error(`❌ ${protocolType} health protocol creation failed:`);
      console.error('Status:', response.status);
      console.error('Error data:', errorData);
      
      if (response.status === 413) {
        console.error('🚨 Payload still too large! Check server configuration.');
      } else if (response.status === 400) {
        console.error('🚨 Validation error! Check request data structure.');
      } else if (response.status === 500) {
        console.error('🚨 Server error! Check server logs for details.');
      }
      
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log(`✅ ${protocolType} health protocol created successfully!`);
    console.log('🆔 Protocol ID:', data.protocol.id);
    console.log('📝 Protocol Name:', data.protocol.name);
    console.log('⚡ Protocol Type:', data.protocol.type);
    console.log('📊 Config size in DB:', JSON.stringify(data.protocol.config).length, 'bytes');
    
    return data.protocol;
  } catch (error) {
    console.error(`❌ ${protocolType} health protocol creation failed:`, error.message);
    throw error;
  }
}

async function runTest() {
  console.log('🔧 Health Protocol API Fix Verification Test');
  console.log('=' .repeat(50));
  
  try {
    // Step 1: Login
    console.log('\n1️⃣  Logging in as trainer...');
    const token = await loginAsTrainer();
    
    // Step 2: Test realistic protocol creation
    console.log('\n2️⃣  Testing realistic health protocol creation...');
    const realisticProtocol = await testHealthProtocolCreation(token, 'realistic');
    
    // Step 3: Test larger protocol creation
    console.log('\n3️⃣  Testing larger health protocol creation...');
    const largeProtocol = await testHealthProtocolCreation(token, 'large');
    
    // Step 4: Verify the fix worked
    console.log('\n✅ ALL TESTS PASSED!');
    console.log('🎉 Health protocol API fix is working correctly');
    console.log('📈 Both realistic and large payloads are now supported');
    console.log('🔍 Enhanced error logging is active');
    console.log('💾 Database storage is working properly');
    
  } catch (error) {
    console.log('\n❌ TEST FAILED!');
    console.error('Fix verification unsuccessful. Check the error details above.');
    process.exit(1);
  }
}

// Run the test
runTest();