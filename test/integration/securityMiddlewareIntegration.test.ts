/**
 * Security Middleware Integration Tests
 * 
 * Tests the complete security middleware stack integration
 * including rate limiting, security headers, and input sanitization
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { 
  securityHeaders, 
  generalRateLimit, 
  authRateLimit,
  sanitizeInput,
  detectSuspiciousActivity,
  validateHealthProtocolInput
} from '../../server/middleware/security';

describe('Security Middleware Integration', () => {
  let app: express.Application;
  
  beforeAll(() => {
    // Set to development environment for testing
    process.env.NODE_ENV = 'development';
    
    // Create test app with full middleware stack
    app = express();
    
    // Apply security middleware in correct order
    app.use(securityHeaders);
    app.use(detectSuspiciousActivity);
    app.use(generalRateLimit);
    app.use(express.json({ limit: '500kb' }));
    app.use(sanitizeInput);
    
    // Test routes
    app.get('/api/health', (req, res) => {
      res.json({ status: 'healthy' });
    });
    
    app.post('/api/auth/login', authRateLimit, (req, res) => {
      const { username, password } = req.body;
      if (username === 'test' && password === 'test') {
        res.json({ token: 'test-token', user: { id: 1, username } });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    });
    
    app.post('/api/health-protocol', validateHealthProtocolInput, (req, res) => {
      res.json({ 
        success: true, 
        protocol: {
          content: req.body.protocolContent,
          ailments: req.body.ailments
        }
      });
    });
    
    app.post('/api/test-sanitize', (req, res) => {
      res.json({ sanitized: req.body });
    });
    
    // Error handler
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
      });
    });
  });
  
  describe('Complete Security Stack', () => {
    it('should include all security headers', async () => {
      const response = await request(app).get('/api/health');
      
      expect(response.status).toBe(200);
      
      // Verify all security headers are present
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('0');
      expect(response.headers['strict-transport-security']).toContain('max-age=31536000');
      expect(response.headers['content-security-policy']).toBeDefined();
      expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    });
    
    it('should handle authentication with rate limiting', async () => {
      // Make multiple auth requests
      const promises = Array(10).fill(null).map(() => 
        request(app)
          .post('/api/auth/login')
          .send({ username: 'test', password: 'test' })
      );
      
      const results = await Promise.all(promises);
      
      // All should succeed in development (100 request limit)
      expect(results.every(r => r.status === 200)).toBe(true);
      expect(results[0].body.token).toBeDefined();
    });
    
    it('should sanitize user input', async () => {
      const maliciousInput = {
        text: '<script>alert("XSS")</script>',
        safeText: 'Normal text',
        nested: {
          dangerous: 'javascript:alert(1)',
          safe: 'Safe content'
        }
      };
      
      const response = await request(app)
        .post('/api/test-sanitize')
        .send(maliciousInput);
      
      expect(response.status).toBe(200);
      
      // Script tags should be removed
      expect(response.body.sanitized.text).not.toContain('<script>');
      expect(response.body.sanitized.text).not.toContain('alert');
      
      // Safe text should remain
      expect(response.body.sanitized.safeText).toBe('Normal text');
      
      // Nested objects should also be sanitized
      expect(response.body.sanitized.nested.dangerous).not.toContain('javascript:');
      expect(response.body.sanitized.nested.safe).toBe('Safe content');
    });
    
    it('should validate health protocol input', async () => {
      // Valid protocol
      const validProtocol = {
        protocolContent: 'This is a valid health protocol',
        ailments: ['headache', 'fatigue', 'stress']
      };
      
      const validResponse = await request(app)
        .post('/api/health-protocol')
        .send(validProtocol);
      
      expect(validResponse.status).toBe(200);
      expect(validResponse.body.success).toBe(true);
      
      // Invalid protocol with script injection
      const invalidProtocol = {
        protocolContent: '<script>alert("hack")</script>',
        ailments: ['valid']
      };
      
      const invalidResponse = await request(app)
        .post('/api/health-protocol')
        .send(invalidProtocol);
      
      expect(invalidResponse.status).toBe(400);
      expect(invalidResponse.body.error).toBeDefined();
    });
    
    it('should handle large payloads correctly', async () => {
      // Create a large payload (over 500kb limit)
      const largePayload = {
        data: 'x'.repeat(600 * 1024) // 600KB
      };
      
      const response = await request(app)
        .post('/api/test-sanitize')
        .send(largePayload);
      
      // Should be rejected due to size limit
      expect(response.status).toBe(413);
    });
  });
  
  describe('Development vs Production Behavior', () => {
    it('should be more lenient in development mode', async () => {
      expect(process.env.NODE_ENV).toBe('development');
      
      // Make many requests quickly
      const promises = Array(50).fill(null).map(() => 
        request(app).get('/api/health')
      );
      
      const results = await Promise.all(promises);
      
      // All should succeed in development
      expect(results.every(r => r.status === 200)).toBe(true);
    });
  });
  
  describe('Suspicious Activity Detection', () => {
    it('should detect but not block SQL injection attempts', async () => {
      const sqlInjection = {
        username: "admin' OR '1'='1",
        password: "password"
      };
      
      const response = await request(app)
        .post('/api/auth/login')
        .send(sqlInjection);
      
      // Should still process the request (detection only, not blocking)
      expect([401, 200]).toContain(response.status);
    });
    
    it('should detect XSS attempts', async () => {
      const xssAttempt = {
        content: '<img src=x onerror=alert(1)>',
        description: 'Normal text'
      };
      
      const response = await request(app)
        .post('/api/test-sanitize')
        .send(xssAttempt);
      
      expect(response.status).toBe(200);
      // Content should be sanitized
      expect(response.body.sanitized.content).not.toContain('onerror');
    });
  });
  
  describe('CORS and Cross-Origin Requests', () => {
    it('should handle CORS headers correctly', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('Origin', 'http://localhost:3500');
      
      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });
  });
  
  describe('Health Protocol Specific Security', () => {
    it('should reject protocols with excessive ailments', async () => {
      const tooManyAilments = {
        protocolContent: 'Valid content',
        ailments: Array(100).fill('ailment') // 100 ailments (over 50 limit)
      };
      
      const response = await request(app)
        .post('/api/health-protocol')
        .send(tooManyAilments);
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Too many ailments');
    });
    
    it('should reject oversized protocol content', async () => {
      const oversizedProtocol = {
        protocolContent: 'x'.repeat(600000), // 600KB (over 500KB limit)
        ailments: ['valid']
      };
      
      const response = await request(app)
        .post('/api/health-protocol')
        .send(oversizedProtocol);
      
      expect([400, 413]).toContain(response.status);
    });
  });
});

describe('Performance and Load Testing', () => {
  let app: express.Application;
  
  beforeAll(() => {
    process.env.NODE_ENV = 'development';
    app = express();
    app.use(securityHeaders);
    app.use(generalRateLimit);
    app.use(express.json());
    
    app.get('/api/test', (req, res) => {
      res.json({ timestamp: Date.now() });
    });
  });
  
  it('should handle concurrent requests efficiently', async () => {
    const startTime = Date.now();
    const concurrentRequests = 100;
    
    const promises = Array(concurrentRequests).fill(null).map(() => 
      request(app).get('/api/test')
    );
    
    const results = await Promise.all(promises);
    const endTime = Date.now();
    
    // All requests should succeed
    expect(results.every(r => r.status === 200)).toBe(true);
    
    // Should complete within reasonable time (less than 5 seconds for 100 requests)
    const duration = endTime - startTime;
    expect(duration).toBeLessThan(5000);
    
    // Calculate average response time
    const avgResponseTime = duration / concurrentRequests;
    console.log(`Average response time: ${avgResponseTime.toFixed(2)}ms`);
  });
});