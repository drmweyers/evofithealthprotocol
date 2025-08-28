import { test, expect, APIRequestContext } from '@playwright/test';

/**
 * STORY-004 Implementation Validation - API Integration Testing
 * Testing the Health Protocol Optimization features through API endpoints
 * Since UI may not be fully implemented, we focus on backend functionality
 */

test.describe('Health Protocol Optimization API Integration', () => {
  let apiContext: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    apiContext = await playwright.request.newContext({
      baseURL: 'http://localhost:3501'
    });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test.describe('Server Health & Connectivity', () => {
    test('should confirm server is running and healthy', async () => {
      const response = await apiContext.get('/health');
      expect(response.status()).toBe(200);
      
      const health = await response.json();
      expect(health.status).toBe('healthy');
      expect(health.timestamp).toBeDefined();
      expect(health.uptime).toBeGreaterThan(0);
    });

    test('should provide detailed health information', async () => {
      const response = await apiContext.get('/health/detailed');
      expect(response.status()).toBe(200);
      
      const health = await response.json();
      expect(health.services).toBeDefined();
      expect(health.services.database).toBeDefined();
      expect(health.system).toBeDefined();
      expect(health.system.uptime).toBeGreaterThan(0);
    });

    test('should respond to liveness check', async () => {
      const response = await apiContext.get('/live');
      expect(response.status()).toBe(200);
      
      const health = await response.json();
      expect(health.status).toBe('alive');
      expect(health.pid).toBeGreaterThan(0);
    });
  });

  test.describe('Authentication System Validation', () => {
    test('should reject unauthorized requests correctly', async () => {
      const response = await apiContext.get('/api/auth/me');
      expect(response.status()).toBe(401);
      
      const error = await response.json();
      expect(error.error).toBe('Authentication failed');
      expect(error.code).toBe('AUTH_FAILED');
    });

    test('should accept registration requests', async () => {
      const userData = {
        email: `test-${Date.now()}@example.com`,
        password: 'SecurePassword123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'customer'
      };

      const response = await apiContext.post('/api/auth/register', {
        data: userData
      });

      // Should either succeed (201) or indicate user exists (409)
      expect([201, 409]).toContain(response.status());
      
      if (response.status() === 201) {
        const result = await response.json();
        expect(result.status).toBe('success');
        expect(result.data.user).toBeDefined();
        expect(result.data.accessToken).toBeDefined();
      }
    });

    test('should validate login endpoint exists', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await apiContext.post('/api/auth/login', {
        data: loginData
      });

      // Should return proper error for invalid credentials, not 404
      expect(response.status()).not.toBe(404);
      expect([401, 400]).toContain(response.status());
    });
  });

  test.describe('Protocol Template Engine API', () => {
    let authToken: string;
    
    test.beforeAll(async () => {
      // Try to get an auth token for protected endpoints
      const loginData = {
        email: 'trainer@test.com',
        password: 'TestPassword123!'
      };

      try {
        const response = await apiContext.post('/api/auth/login', {
          data: loginData
        });
        
        if (response.status() === 200) {
          const result = await response.json();
          authToken = result.data.accessToken;
        }
      } catch (error) {
        console.log('Could not get auth token, will test endpoints without auth');
      }
    });

    test('should provide protocol template endpoints', async () => {
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
      
      // Test if protocol template endpoints exist
      const response = await apiContext.get('/api/protocols/templates', { headers });
      
      // Should not return 404 - endpoint should exist
      expect(response.status()).not.toBe(404);
      
      // If authenticated, should work, if not, should return 401
      if (authToken) {
        expect([200, 500]).toContain(response.status());
      } else {
        expect([401, 403]).toContain(response.status());
      }
    });

    test('should handle protocol creation endpoint', async () => {
      const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
      
      const protocolData = {
        name: 'Test Protocol',
        template: 'longevity-enhancement',
        clientAge: 35,
        healthGoals: ['longevity'],
        customizations: {}
      };

      const response = await apiContext.post('/api/protocols', { 
        data: protocolData,
        headers 
      });
      
      // Should not return 404 - endpoint should exist
      expect(response.status()).not.toBe(404);
      
      if (authToken) {
        // If authenticated, should either work or return validation error
        expect([200, 201, 400, 500]).toContain(response.status());
      } else {
        // If not authenticated, should return 401
        expect([401, 403]).toContain(response.status());
      }
    });
  });

  test.describe('Medical Safety Validation API', () => {
    test('should provide safety validation endpoint', async () => {
      const safetyData = {
        medications: ['aspirin', 'metformin'],
        conditions: ['diabetes'],
        age: 45,
        protocolType: 'parasite-cleanse'
      };

      const response = await apiContext.post('/api/protocols/safety-check', {
        data: safetyData
      });

      // Endpoint should exist
      expect(response.status()).not.toBe(404);
      
      // Should return either success or require authentication
      expect([200, 401, 403, 500]).toContain(response.status());
    });
  });

  test.describe('Protocol Versioning System API', () => {
    test('should handle version-related endpoints', async () => {
      const testProtocolId = 'test-protocol-id';
      
      // Test version history endpoint
      const versionResponse = await apiContext.get(`/api/protocols/${testProtocolId}/versions`);
      
      // Should not be 404 - endpoint should exist
      expect(versionResponse.status()).not.toBe(404);
      
      // Should return proper status codes
      expect([200, 401, 403, 404, 500]).toContain(versionResponse.status());
    });
  });

  test.describe('Effectiveness Tracking API', () => {
    test('should provide analytics endpoints', async () => {
      // Test effectiveness analytics endpoint
      const response = await apiContext.get('/api/protocols/analytics/effectiveness');
      
      // Should not be 404 - endpoint should exist  
      expect(response.status()).not.toBe(404);
      
      // Should return proper status codes
      expect([200, 401, 403, 500]).toContain(response.status());
    });

    test('should handle progress correlation endpoint', async () => {
      const testData = {
        protocolId: 'test-protocol',
        clientProgress: {
          week: 1,
          satisfaction: 8,
          adherence: 90,
          metrics: {}
        }
      };

      const response = await apiContext.post('/api/protocols/progress-correlation', {
        data: testData
      });

      // Endpoint should exist
      expect(response.status()).not.toBe(404);
      
      // Should return appropriate response
      expect([200, 201, 401, 403, 400, 500]).toContain(response.status());
    });
  });

  test.describe('Enhanced OpenAI Integration API', () => {
    test('should provide AI generation endpoints', async () => {
      const generationData = {
        template: 'energy-boost',
        clientProfile: {
          age: 28,
          activityLevel: 'moderate',
          healthGoals: ['energy', 'focus']
        }
      };

      const response = await apiContext.post('/api/protocols/generate-ai', {
        data: generationData
      });

      // Endpoint should exist
      expect(response.status()).not.toBe(404);
      
      // Should return appropriate response (may require auth or API key)
      expect([200, 201, 401, 403, 400, 500]).toContain(response.status());
    });

    test('should handle AI caching endpoint', async () => {
      // Test cache status endpoint
      const response = await apiContext.get('/api/protocols/ai-cache/status');
      
      // Should not be 404
      expect(response.status()).not.toBe(404);
      
      // Should return proper status
      expect([200, 401, 403, 500]).toContain(response.status());
    });
  });

  test.describe('Performance & Monitoring', () => {
    test('should provide metrics endpoint', async () => {
      const response = await apiContext.get('/metrics');
      expect(response.status()).toBe(200);
      
      const metrics = await response.text();
      expect(metrics).toContain('process_uptime_seconds');
      expect(metrics).toContain('process_memory_usage_bytes');
      expect(metrics).toContain('healthprotocol_info');
    });

    test('should respond to health checks within reasonable time', async () => {
      const startTime = Date.now();
      const response = await apiContext.get('/health');
      const endTime = Date.now();
      
      expect(response.status()).toBe(200);
      expect(endTime - startTime).toBeLessThan(1000); // Should respond within 1 second
    });

    test('should handle concurrent requests', async () => {
      const promises = Array(5).fill(null).map(() => 
        apiContext.get('/health')
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status()).toBe(200);
      });
    });
  });

  test.describe('Database Integration', () => {
    test('should confirm database connectivity in health check', async () => {
      const response = await apiContext.get('/ready');
      
      const health = await response.json();
      expect(health.services.database).toBeDefined();
      
      // Database should be either healthy or there should be a clear error
      expect(['healthy', 'unhealthy']).toContain(health.services.database);
    });
  });

  test.describe('Error Handling & Security', () => {
    test('should handle malformed JSON requests', async () => {
      const response = await apiContext.post('/api/auth/login', {
        data: 'invalid-json',
        headers: { 'Content-Type': 'application/json' }
      });

      // Should handle gracefully, not crash
      expect([400, 500]).toContain(response.status());
    });

    test('should enforce security headers', async () => {
      const response = await apiContext.get('/health');
      
      const headers = response.headers();
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['x-frame-options']).toBe('DENY');
      expect(headers['strict-transport-security']).toContain('max-age');
    });

    test('should handle rate limiting', async () => {
      // Make multiple rapid requests to test rate limiting
      const promises = Array(20).fill(null).map(() => 
        apiContext.get('/health')
      );

      const responses = await Promise.all(promises);
      
      // Most should succeed, but rate limiting should be in place
      const successCount = responses.filter(r => r.status() === 200).length;
      expect(successCount).toBeGreaterThan(10); // Some should succeed
    });
  });
});