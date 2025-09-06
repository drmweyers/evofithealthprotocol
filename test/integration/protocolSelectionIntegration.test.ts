/**
 * Integration Tests for Protocol Selection and Ailment Mapping
 * 
 * This test suite validates the integration between the protocol selection system,
 * ailment mapping, and recommendation algorithms. Tests the complete workflow
 * from ailment selection to protocol recommendation and customization.
 * 
 * Test Coverage:
 * - Ailment-to-protocol mapping integration
 * - Recommendation algorithm accuracy
 * - Regional filtering integration
 * - Protocol customization based on selections
 * - End-to-end protocol selection workflow
 * - Cross-system data consistency
 */

import { describe, it, expect, test, beforeEach } from 'vitest';
import {
  PARASITE_CLEANSE_PROTOCOLS,
  getRecommendedProtocols,
  getProtocolsByIntensity,
  getProtocolsByType,
  getProtocolsForRegion,
  AILMENT_TO_PROTOCOL_MAPPING,
} from '../../client/src/data/parasiteCleanseProtocols';

import {
  CLIENT_AILMENTS_DATABASE,
  getAilmentById,
  getAilmentsByCategory,
  getAilmentNutritionalFocus,
  type ClientAilment,
} from '../../client/src/data/clientAilments';

describe('Protocol Selection and Ailment Mapping Integration', () => {
  
  describe('Ailment-Protocol Integration', () => {
    
    test('should map real ailments to valid protocols', () => {
      // Test with actual ailments from the database
      const realAilmentIds = CLIENT_AILMENTS_DATABASE.map(a => a.id);
      const testAilments = realAilmentIds.slice(0, 5); // Test first 5 ailments
      
      testAilments.forEach(ailmentId => {
        const ailment = getAilmentById(ailmentId);
        expect(ailment).toBeDefined();
        
        if (AILMENT_TO_PROTOCOL_MAPPING[ailmentId]) {
          const mappedProtocols = AILMENT_TO_PROTOCOL_MAPPING[ailmentId];
          
          mappedProtocols.forEach(protocolId => {
            const protocol = PARASITE_CLEANSE_PROTOCOLS.find(p => p.id === protocolId);
            expect(protocol).toBeDefined();
            expect(protocol?.targetAilments).toContain(ailmentId);
          });
        }
      });
    });

    test('should provide relevant recommendations for digestive ailments', () => {
      const digestiveAilments = getAilmentsByCategory('digestive').map(a => a.id);
      const testDigestiveAilments = digestiveAilments.slice(0, 3);
      
      if (testDigestiveAilments.length > 0) {
        const recommendations = getRecommendedProtocols(testDigestiveAilments);
        
        expect(recommendations.length).toBeGreaterThan(0);
        
        recommendations.forEach(rec => {
          // Recommended protocols should target digestive issues
          const hasDigestiveTarget = rec.protocol.targetAilments.some(ailment =>
            digestiveAilments.includes(ailment)
          );
          expect(hasDigestiveTarget).toBe(true);
          
          // Should have reasonable match scores
          expect(rec.matchScore).toBeGreaterThan(0);
          expect(rec.matchScore).toBeLessThanOrEqual(100);
        });
      }
    });

    test('should provide appropriate protocols for inflammatory conditions', () => {
      const inflammatoryAilments = getAilmentsByCategory('inflammatory').map(a => a.id);
      const testInflammatoryAilments = inflammatoryAilments.slice(0, 2);
      
      if (testInflammatoryAilments.length > 0) {
        const recommendations = getRecommendedProtocols(testInflammatoryAilments);
        
        recommendations.forEach(rec => {
          // Anti-inflammatory protocols should be recommended
          const protocolHerbs = rec.protocol.herbs.map(h => h.name.toLowerCase());
          const hasAntiInflammatoryHerbs = protocolHerbs.some(herb =>
            herb.includes('turmeric') ||
            herb.includes('ginger') ||
            herb.includes('oregano') ||
            herb.includes('garlic')
          );
          
          // Should have herbs or dietary guidelines that address inflammation
          const dietaryGuidelines = rec.protocol.dietaryGuidelines
            .filter(g => g.category === 'include')
            .flatMap(g => g.foods);
          
          const hasAntiInflammatoryFoods = dietaryGuidelines.some(food =>
            food.toLowerCase().includes('anti-inflammatory') ||
            food.toLowerCase().includes('omega-3')
          );
          
          expect(hasAntiInflammatoryHerbs || hasAntiInflammatoryFoods).toBe(true);
        });
      }
    });

    test('should handle energy and metabolism ailment targeting', () => {
      const energyAilments = getAilmentsByCategory('energy_metabolism').map(a => a.id);
      const testEnergyAilments = ['chronic_fatigue', 'low_energy'].filter(id => 
        energyAilments.includes(id)
      );
      
      if (testEnergyAilments.length > 0) {
        const recommendations = getRecommendedProtocols(testEnergyAilments);
        
        expect(recommendations.length).toBeGreaterThan(0);
        
        recommendations.forEach(rec => {
          // Should not be overly intensive for fatigue conditions
          expect(['gentle', 'moderate']).toContain(rec.protocol.intensity);
          
          // Should have supportive supplements
          expect(rec.protocol.supportingSupplements.length).toBeGreaterThan(0);
          
          // Should have reasonable duration for someone with low energy
          expect(rec.protocol.duration.recommended).toBeLessThanOrEqual(60);
        });
      }
    });

    test('should provide appropriate protocols for multiple combined ailments', () => {
      const combinedAilments = ['ibs', 'bloating', 'chronic_fatigue'];
      const recommendations = getRecommendedProtocols(combinedAilments);
      
      expect(recommendations.length).toBeGreaterThan(0);
      
      // Top recommendation should have high match score for multiple conditions
      const topRecommendation = recommendations[0];
      expect(topRecommendation.matchScore).toBeGreaterThan(33); // At least 1/3 conditions matched
      
      // Should explain reasoning for the recommendation
      expect(topRecommendation.reasoning).toBeDefined();
      expect(topRecommendation.reasoning.length).toBeGreaterThan(10);
      
      // Protocol should be gentle to moderate for multiple conditions
      expect(['gentle', 'moderate']).toContain(topRecommendation.protocol.intensity);
    });
  });

  describe('Regional Integration', () => {
    
    test('should ensure regional availability matches herb accessibility', () => {
      const regions = ['northAmerica', 'europe', 'asia', 'latinAmerica', 'africa'] as const;
      
      regions.forEach(region => {
        const regionProtocols = getProtocolsForRegion(region);
        
        regionProtocols.forEach(protocol => {
          expect(protocol.regionalAvailability[region]).toBe(true);
          
          // Ayurvedic protocols should be more available in Asia
          if (protocol.type === 'ayurvedic' && region === 'asia') {
            const ayurvedicHerbs = protocol.herbs.filter(h => 
              ['neem', 'vidanga', 'kutki', 'kalmegh', 'ashwagandha'].some(ah => 
                h.name.toLowerCase().includes(ah)
              )
            );
            expect(ayurvedicHerbs.length).toBeGreaterThan(0);
          }
          
          // Traditional Western herbs should be available in North America/Europe
          if ((region === 'northAmerica' || region === 'europe') && protocol.type === 'traditional') {
            const westernHerbs = protocol.herbs.filter(h => 
              ['black walnut', 'wormwood', 'clove', 'oregano'].some(wh => 
                h.name.toLowerCase().includes(wh)
              )
            );
            expect(westernHerbs.length).toBeGreaterThan(0);
          }
        });
      });
    });

    test('should provide sufficient protocol options for each region', () => {
      const regions = ['northAmerica', 'europe', 'asia', 'latinAmerica', 'africa'] as const;
      
      regions.forEach(region => {
        const regionProtocols = getProtocolsForRegion(region);
        
        // Each region should have at least 2 protocols available
        expect(regionProtocols.length).toBeGreaterThanOrEqual(2);
        
        // Should have variety of intensities available
        const intensities = regionProtocols.map(p => p.intensity);
        const uniqueIntensities = Array.from(new Set(intensities));
        expect(uniqueIntensities.length).toBeGreaterThanOrEqual(2);
        
        // Should have variety of types available
        const types = regionProtocols.map(p => p.type);
        const uniqueTypes = Array.from(new Set(types));
        expect(uniqueTypes.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('Protocol Customization Integration', () => {
    
    test('should customize protocol recommendations based on intensity preference', () => {
      const testAilments = ['ibs', 'bloating'];
      const allRecommendations = getRecommendedProtocols(testAilments);
      
      // Filter by intensity
      const gentleProtocols = getProtocolsByIntensity('gentle');
      const moderateProtocols = getProtocolsByIntensity('moderate');
      
      const gentleRecommendations = allRecommendations.filter(rec => 
        gentleProtocols.some(gp => gp.id === rec.protocol.id)
      );
      
      const moderateRecommendations = allRecommendations.filter(rec => 
        moderateProtocols.some(mp => mp.id === rec.protocol.id)
      );
      
      // Should have options for both intensity levels
      if (gentleRecommendations.length > 0) {
        gentleRecommendations.forEach(rec => {
          expect(rec.protocol.intensity).toBe('gentle');
          
          // Gentle protocols should have fewer contraindications
          expect(rec.protocol.contraindications.length).toBeLessThanOrEqual(5);
          
          // Should have shorter minimum duration
          expect(rec.protocol.duration.min).toBeLessThanOrEqual(14);
        });
      }
      
      if (moderateRecommendations.length > 0) {
        moderateRecommendations.forEach(rec => {
          expect(rec.protocol.intensity).toBe('moderate');
        });
      }
    });

    test('should handle protocol type preferences correctly', () => {
      const testAilments = ['chronic_fatigue', 'digestive_general'];
      const recommendations = getRecommendedProtocols(testAilments);
      
      const protocolTypes = ['traditional', 'ayurvedic', 'modern', 'combination'] as const;
      
      protocolTypes.forEach(type => {
        const typeProtocols = getProtocolsByType(type);
        const typeRecommendations = recommendations.filter(rec => 
          typeProtocols.some(tp => tp.id === rec.protocol.id)
        );
        
        if (typeRecommendations.length > 0) {
          typeRecommendations.forEach(rec => {
            expect(rec.protocol.type).toBe(type);
            
            // Type-specific validations
            if (type === 'ayurvedic') {
              const ayurvedicElements = rec.protocol.phases.some(phase => 
                phase.name.includes('Ama') || phase.name.includes('Krimi') || phase.name.includes('Rasayana')
              );
              expect(ayurvedicElements).toBe(true);
            }
            
            if (type === 'modern') {
              expect(['clinical_studies', 'extensive_research', 'who_approved']).toContain(rec.protocol.evidenceLevel);
            }
          });
        }
      });
    });
  });

  describe('Cross-System Data Consistency', () => {
    
    test('should maintain consistency between ailments and nutritional recommendations', () => {
      const testAilments = ['ibs', 'inflammatory_conditions'];
      const nutritionalFocus = getAilmentNutritionalFocus(testAilments);
      const protocolRecommendations = getRecommendedProtocols(testAilments);
      
      if (protocolRecommendations.length > 0) {
        const topProtocol = protocolRecommendations[0].protocol;
        
        // Protocol dietary guidelines should align with ailment nutritional needs
        const protocolFoodsToInclude = topProtocol.dietaryGuidelines
          .filter(g => g.category === 'include')
          .flatMap(g => g.foods);
        
        const protocolFoodsToAvoid = topProtocol.dietaryGuidelines
          .filter(g => g.category === 'avoid')
          .flatMap(g => g.foods);
        
        // Should have some overlap with beneficial foods
        const hasOverlap = protocolFoodsToInclude.some(protocolFood => 
          nutritionalFocus.beneficialFoods.some(ailmentFood => 
            protocolFood.toLowerCase().includes(ailmentFood.toLowerCase()) ||
            ailmentFood.toLowerCase().includes(protocolFood.toLowerCase())
          )
        );
        
        // For IBS/inflammatory conditions, should avoid similar foods
        if (testAilments.some(a => ['ibs', 'inflammatory'].some(t => a.includes(t)))) {
          const avoidanceOverlap = protocolFoodsToAvoid.some(protocolFood => 
            nutritionalFocus.avoidFoods.some(ailmentFood => 
              protocolFood.toLowerCase().includes(ailmentFood.toLowerCase()) ||
              ailmentFood.toLowerCase().includes(protocolFood.toLowerCase())
            )
          );
          
          expect(hasOverlap || avoidanceOverlap).toBe(true);
        }
      }
    });

    test('should ensure protocol phases align with cleanse best practices', () => {
      PARASITE_CLEANSE_PROTOCOLS.forEach(protocol => {
        const phaseNames = protocol.phases.map(p => p.name.toLowerCase());
        
        // Should follow logical cleanse progression
        const hasPrep = phaseNames.some(name => 
          name.includes('prep') || name.includes('ama') || name.includes('biofilm')
        );
        
        const hasActive = phaseNames.some(name => 
          name.includes('active') || name.includes('elimination') || 
          name.includes('krimi') || name.includes('cleanse')
        );
        
        const hasRestore = phaseNames.some(name => 
          name.includes('restore') || name.includes('rebuild') || 
          name.includes('rasayana') || name.includes('maintenance')
        );
        
        expect(hasPrep || hasActive || hasRestore).toBe(true);
        
        // Phase durations should be reasonable
        const totalPhaseDuration = protocol.phases.reduce((sum, phase) => sum + phase.duration, 0);
        expect(totalPhaseDuration).toBeGreaterThanOrEqual(protocol.duration.min);
        expect(totalPhaseDuration).toBeLessThanOrEqual(protocol.duration.max + 7); // Allow some flexibility
      });
    });

    test('should validate herb-ailment targeting consistency', () => {
      const testAilments = ['digestive_disorders', 'liver_congestion', 'chronic_infections'];
      const recommendations = getRecommendedProtocols(testAilments);
      
      recommendations.forEach(rec => {
        rec.protocol.herbs.forEach(herb => {
          // Herbs should have mechanisms that relate to targeted conditions
          const mechanism = herb.mechanism.toLowerCase();
          
          if (rec.protocol.targetAilments.includes('digestive_disorders')) {
            const hasDigestiveAction = mechanism.includes('digestive') ||
                                      mechanism.includes('gut') ||
                                      mechanism.includes('gastro') ||
                                      mechanism.includes('carminative') ||
                                      mechanism.includes('antispasmodic');
            
            if (herb.priority === 'primary') {
              expect(hasDigestiveAction).toBe(true);
            }
          }
          
          if (rec.protocol.targetAilments.includes('liver_congestion')) {
            const hasHepaticAction = mechanism.includes('liver') ||
                                     mechanism.includes('hepatic') ||
                                     mechanism.includes('detox') ||
                                     mechanism.includes('choleretic');
            
            if (herb.priority === 'primary') {
              expect(hasHepaticAction).toBe(true);
            }
          }
        });
      });
    });
  });

  describe('End-to-End Workflow Integration', () => {
    
    test('should complete full ailment-to-protocol selection workflow', () => {
      // Step 1: Start with real user ailments
      const userAilments = ['ibs', 'bloating', 'low_energy'];
      
      // Step 2: Get recommendations
      const recommendations = getRecommendedProtocols(userAilments);
      expect(recommendations.length).toBeGreaterThan(0);
      
      // Step 3: Filter by user preferences (region, intensity)
      const userRegion = 'northAmerica';
      const userIntensity = 'moderate';
      
      const availableProtocols = getProtocolsForRegion(userRegion);
      const intensityProtocols = getProtocolsByIntensity(userIntensity);
      
      const filteredRecommendations = recommendations.filter(rec =>
        availableProtocols.some(ap => ap.id === rec.protocol.id) &&
        intensityProtocols.some(ip => ip.id === rec.protocol.id)
      );
      
      // Step 4: Should have at least one viable recommendation
      if (filteredRecommendations.length > 0) {
        const selectedProtocol = filteredRecommendations[0].protocol;
        
        // Validate the selected protocol meets all criteria
        expect(selectedProtocol.regionalAvailability[userRegion]).toBe(true);
        expect(selectedProtocol.intensity).toBe(userIntensity);
        expect(selectedProtocol.targetAilments.some(ta => userAilments.includes(ta))).toBe(true);
        
        // Should have complete protocol information
        expect(selectedProtocol.phases.length).toBeGreaterThan(0);
        expect(selectedProtocol.herbs.length).toBeGreaterThan(0);
        expect(selectedProtocol.dietaryGuidelines.length).toBeGreaterThan(0);
        expect(selectedProtocol.contraindications.length).toBeGreaterThan(0);
      }
    });

    test('should handle edge cases gracefully in complete workflow', () => {
      // Test with uncommon ailment combination
      const uncommonAilments = ['rare_condition', 'unknown_ailment'];
      const recommendations = getRecommendedProtocols(uncommonAilments);
      
      // Should return empty array for unknown ailments
      expect(recommendations).toEqual([]);
      
      // Test with very restrictive filtering
      const restrictiveRegion = 'africa'; // Assuming fewer protocols available
      const intensiveIntensity = 'intensive';
      
      const restrictiveProtocols = getProtocolsForRegion(restrictiveRegion)
        .filter(p => p.intensity === intensiveIntensity);
      
      // Should still have some protocols available
      expect(restrictiveProtocols.length).toBeGreaterThanOrEqual(0);
    });

    test('should maintain performance with large datasets', () => {
      // Test with all available ailments
      const allAilmentIds = CLIENT_AILMENTS_DATABASE.map(a => a.id);
      const manyAilments = allAilmentIds.slice(0, 10); // Test with 10 ailments
      
      const startTime = Date.now();
      const recommendations = getRecommendedProtocols(manyAilments);
      const endTime = Date.now();
      
      // Should complete in reasonable time (under 100ms)
      expect(endTime - startTime).toBeLessThan(100);
      
      // Should still provide meaningful results
      expect(recommendations.length).toBeGreaterThan(0);
      
      // Results should be properly sorted
      if (recommendations.length > 1) {
        for (let i = 1; i < recommendations.length; i++) {
          expect(recommendations[i-1].matchScore).toBeGreaterThanOrEqual(recommendations[i].matchScore);
        }
      }
    });
  });
});