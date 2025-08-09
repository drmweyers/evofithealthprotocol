/**
 * Test script to verify health protocol generation and database saving
 */

const testHealthProtocolGeneration = async () => {
  console.log('🧪 Testing Health Protocol Generation Workflow...\n');

  // Test data for ailments-based generation
  const ailmentsTestData = {
    planName: `Test Ailments Protocol - ${new Date().toLocaleDateString()}`,
    duration: 30,
    selectedAilments: ['diabetes', 'high_blood_pressure'],
    nutritionalFocus: {
      beneficialFoods: ['leafy_greens', 'whole_grains', 'lean_proteins'],
      avoidFoods: ['processed_sugar', 'refined_carbs'],
      keyNutrients: ['fiber', 'potassium', 'omega_3'],
      mealPlanFocus: ['blood_sugar_control', 'heart_health']
    },
    priorityLevel: 'high',
    dailyCalorieTarget: 1800,
    clientName: 'Test Client'
  };

  try {
    console.log('📡 Step 1: Testing ailments-based protocol generation...');
    
    // This would normally be called by the frontend
    // but we'll simulate it to test the backend
    const response = await fetch('http://localhost:4000/api/specialized/ailments-based/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // Would need actual auth
      },
      body: JSON.stringify(ailmentsTestData),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Protocol generation successful!');
      console.log('📊 Generated plan details:');
      console.log(`   - Plan name: ${result.mealPlan?.planName || 'N/A'}`);
      console.log(`   - Duration: ${result.mealPlan?.duration || 'N/A'} days`);
      console.log(`   - Meals count: ${result.mealPlan?.meals?.length || 0}`);
      console.log(`   - Ailments targeted: ${ailmentsTestData.selectedAilments.join(', ')}`);
      
      return result;
    } else {
      console.log('❌ Protocol generation failed');
      const error = await response.text();
      console.log('Error:', error);
      return null;
    }

  } catch (error) {
    console.log('❌ Network error during protocol generation:');
    console.log('Error:', error.message);
    return null;
  }
};

// Run the test if this file is executed directly
if (typeof window === 'undefined') {
  // Running in Node.js
  testHealthProtocolGeneration();
}

module.exports = testHealthProtocolGeneration;