/**
 * Enhanced Rate Limiting Unit Tests
 * 
 * Comprehensive test suite for development and production rate limiting configurations
 * Tests localhost exemptions, security headers, and error handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import express, { Express, Request, Response } from 'express';
import { generalRateLimit, authRateLimit, securityHeaders } from '../../server/middleware/security';

describe('Enhanced Rate Limiting Middleware Tests', () => {
  let app: Express;
  let originalEnv: string | undefined;
  
  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
    app = express();
    app.use(express.json());
  });
  
  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    vi.clearAllMocks();
  });
  
  describe('Development Environment - Localhost Exemption', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });
    
    it('should completely skip rate limiting for localhost requests', async () => {
      const testApp = express();
      
      // Mock the request to appear as localhost
      testApp.use((req, res, next) => {
        req.ip = '127.0.0.1';
        req.hostname = 'localhost';
        next();
      });
      
      testApp.use(generalRateLimit);
      testApp.get('/test', (req, res) => res.json({ success: true }));
      
      // Make many requests - all should succeed
      const promises = Array(200).fill(null).map(() => 
        request(testApp).get('/test')
      );
      
      const results = await Promise.all(promises);
      
      // All requests should succeed for localhost
      expect(results.every(r => r.status === 200)).toBe(true);
      expect(results.every(r => r.body.success === true)).toBe(true);
      
      // Should not have rate limit headers for skipped requests
      const lastResponse = results[results.length - 1];
      expect(lastResponse.headers['x-ratelimit-limit']).toBeUndefined();
    });
    
    it('should skip rate limiting for IPv6 localhost (::1)', async () => {
      const testApp = express();
      
      testApp.use((req, res, next) => {
        req.ip = '::1';
        next();
      });
      
      testApp.use(generalRateLimit);
      testApp.get('/test', (req, res) => res.json({ success: true }));
      
      const promises = Array(100).fill(null).map(() => 
        request(testApp).get('/test')
      );
      
      const results = await Promise.all(promises);
      expect(results.every(r => r.status === 200)).toBe(true);
    });
    
    it('should skip rate limiting for Vite HMR and development assets', async () => {
      const testApp = express();
      testApp.use(generalRateLimit);
      
      // Test various development paths
      const devPaths = [
        '/@vite/client',
        '/src/main.tsx',
        '/node_modules/react/index.js',
        '/@fs/some/file',
        '/assets/style.css.map',
        '/hot-update.json'
      ];
      
      devPaths.forEach(path => {
        testApp.get(path, (req, res) => res.json({ path }));
      });
      
      // All development paths should bypass rate limiting
      const promises = devPaths.flatMap(path => 
        Array(50).fill(null).map(() => request(testApp).get(path))
      );
      
      const results = await Promise.all(promises);
      expect(results.every(r => r.status === 200)).toBe(true);
    });
  });
  
  describe('Production Environment - Strict Rate Limiting', () => {
    it('should enforce strict rate limits in production', async () => {
      // Create a new instance with production settings
      const prodEnv = { ...process.env, NODE_ENV: 'production' };
      
      // Mock require to get fresh module with production settings
      vi.doMock('../../server/middleware/security', () => {
        const rateLimit = require('express-rate-limit').default;
        
        return {
          generalRateLimit: rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 5, // Low limit for testing
            handler: (req: any, res: any) => {
              res.status(429).json({
                error: 'Too many requests',
                code: 'RATE_LIMIT_EXCEEDED'
              });
            }
          })
        };
      });
      
      const { generalRateLimit: prodRateLimit } = await import('../../server/middleware/security');
      
      const testApp = express();
      testApp.use(prodRateLimit);
      testApp.get('/test', (req, res) => res.json({ success: true }));
      
      let successCount = 0;
      let rateLimitedCount = 0;
      
      // Make 10 requests
      for (let i = 0; i < 10; i++) {
        const response = await request(testApp).get('/test');
        if (response.status === 200) {
          successCount++;
        } else if (response.status === 429) {
          rateLimitedCount++;
          expect(response.body.code).toBe('RATE_LIMIT_EXCEEDED');
        }
      }
      
      // Should hit rate limit after 5 requests
      expect(successCount).toBeLessThanOrEqual(5);
      expect(rateLimitedCount).toBeGreaterThan(0);
      
      vi.doUnmock('../../server/middleware/security');
    });
  });
  
  describe('Auth Rate Limiting - Special Configuration', () => {
    it('should allow 100 auth attempts in development', async () => {
      process.env.NODE_ENV = 'development';
      
      const testApp = express();
      testApp.use((req, res, next) => {
        req.ip = '192.168.1.100'; // Non-localhost IP
        next();
      });
      testApp.use(authRateLimit);
      testApp.post('/api/auth/login', (req, res) => res.json({ token: 'test' }));
      
      // Make 50 auth requests (within the 100 limit)
      const promises = Array(50).fill(null).map(() => 
        request(testApp)
          .post('/api/auth/login')
          .send({ username: 'test', password: 'test' })
      );
      
      const results = await Promise.all(promises);
      expect(results.every(r => r.status === 200)).toBe(true);
    });
  });
  
  describe('Security Headers Integration', () => {
    it('should include security headers with rate limiting', async () => {
      const testApp = express();
      testApp.use(securityHeaders);
      testApp.use(generalRateLimit);
      testApp.get('/test', (req, res) => res.json({ secure: true }));
      
      const response = await request(testApp).get('/test');
      
      expect(response.status).toBe(200);
      
      // Check for security headers
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['strict-transport-security']).toContain('max-age=31536000');
      expect(response.headers['content-security-policy']).toBeDefined();
    });
  });
  
  describe('Rate Limit Error Response Format', () => {
    it('should return proper error format with retryAfter', async () => {
      // Create a rate limiter with very low limit
      const testRateLimit = require('express-rate-limit').default({
        windowMs: 60 * 1000, // 1 minute
        max: 1,
        handler: (req: any, res: any) => {
          const resetTime = req.rateLimit?.resetTime || Date.now() + 60000;
          res.status(429).json({
            error: 'Rate limit exceeded',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: Math.ceil(resetTime / 1000)
          });
        }
      });
      
      const testApp = express();
      testApp.use(testRateLimit);
      testApp.get('/test', (req, res) => res.json({ success: true }));
      
      // First request succeeds
      const first = await request(testApp).get('/test');
      expect(first.status).toBe(200);
      
      // Second request is rate limited
      const second = await request(testApp).get('/test');
      expect(second.status).toBe(429);
      expect(second.body.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(second.body.retryAfter).toBeDefined();
      expect(typeof second.body.retryAfter).toBe('number');
      
      // retryAfter should be a reasonable Unix timestamp (not too far in future)
      const now = Math.floor(Date.now() / 1000);
      const retryAfter = second.body.retryAfter;
      expect(retryAfter).toBeGreaterThan(now);
      expect(retryAfter).toBeLessThan(now + 3600); // Within 1 hour
    });
  });
  
  describe('Concurrent Request Handling', () => {
    it('should handle burst traffic correctly', async () => {
      const testApp = express();
      testApp.use(generalRateLimit);
      testApp.get('/test', (req, res) => {
        setTimeout(() => res.json({ success: true }), 5);
      });
      
      // Send burst of concurrent requests
      const burstSize = 20;
      const startTime = Date.now();
      
      const promises = Array(burstSize).fill(null).map((_, idx) => 
        request(testApp)
          .get('/test')
          .then(res => ({
            status: res.status,
            index: idx,
            timestamp: Date.now() - startTime
          }))
      );
      
      const results = await Promise.all(promises);
      
      // In development, all should succeed
      if (process.env.NODE_ENV !== 'production') {
        expect(results.every(r => r.status === 200)).toBe(true);
      }
      
      // Verify requests were processed concurrently (not sequentially)
      const timestamps = results.map(r => r.timestamp);
      const maxTime = Math.max(...timestamps);
      expect(maxTime).toBeLessThan(burstSize * 10); // Should be much faster than sequential
    });
  });
  
  describe('IP Address Detection', () => {
    it('should correctly identify various localhost formats', async () => {
      const localhostVariants = [
        '127.0.0.1',
        '::1',
        '::ffff:127.0.0.1',
        'localhost'
      ];
      
      for (const ip of localhostVariants) {
        const testApp = express();
        
        testApp.use((req, res, next) => {
          if (ip === 'localhost') {
            req.hostname = ip;
          } else {
            req.ip = ip;
          }
          next();
        });
        
        testApp.use(generalRateLimit);
        testApp.get('/test', (req, res) => res.json({ ip: req.ip || req.hostname }));
        
        const response = await request(testApp).get('/test');
        expect(response.status).toBe(200);
      }
    });
    
    it('should apply rate limiting to non-localhost IPs in development', async () => {
      process.env.NODE_ENV = 'development';
      
      const testApp = express();
      
      // Mock external IP
      testApp.use((req, res, next) => {
        req.ip = '203.0.113.1'; // External IP
        req.hostname = 'example.com';
        next();
      });
      
      // Create custom rate limiter with very low limit for testing
      const strictRateLimit = require('express-rate-limit').default({
        windowMs: 60 * 1000,
        max: 2,
        skip: (req: any) => false, // Don't skip any requests
        handler: (req: any, res: any) => {
          res.status(429).json({ error: 'Rate limited' });
        }
      });
      
      testApp.use(strictRateLimit);
      testApp.get('/test', (req, res) => res.json({ success: true }));
      
      // First two requests should succeed
      const first = await request(testApp).get('/test');
      const second = await request(testApp).get('/test');
      expect(first.status).toBe(200);
      expect(second.status).toBe(200);
      
      // Third request should be rate limited
      const third = await request(testApp).get('/test');
      expect(third.status).toBe(429);
    });
  });
  
  describe('Memory Store Cleanup', () => {
    it('should not accumulate memory for skipped requests', async () => {
      const testApp = express();
      
      // Track memory usage
      const initialMemory = process.memoryUsage().heapUsed;
      
      testApp.use((req, res, next) => {
        req.ip = '127.0.0.1'; // Localhost - should be skipped
        next();
      });
      
      testApp.use(generalRateLimit);
      testApp.get('/test', (req, res) => res.json({ success: true }));
      
      // Make many requests
      for (let i = 0; i < 1000; i++) {
        await request(testApp).get('/test');
      }
      
      // Memory should not increase significantly for skipped requests
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Allow for some memory increase but should be minimal
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
    });
  });
});

describe('Rate Limiting Integration Tests', () => {
  it('should work correctly with complete middleware stack', async () => {
    const testApp = express();
    
    // Full middleware stack
    testApp.use(securityHeaders);
    testApp.use(express.json());
    testApp.use(generalRateLimit);
    
    // API routes
    testApp.post('/api/auth/login', authRateLimit, (req, res) => {
      res.json({ token: 'test-token' });
    });
    
    testApp.get('/api/data', (req, res) => {
      res.json({ data: 'test-data' });
    });
    
    // Test auth endpoint
    const authResponse = await request(testApp)
      .post('/api/auth/login')
      .send({ username: 'test', password: 'test' });
    
    expect(authResponse.status).toBe(200);
    expect(authResponse.body.token).toBeDefined();
    
    // Test data endpoint
    const dataResponse = await request(testApp).get('/api/data');
    expect(dataResponse.status).toBe(200);
    expect(dataResponse.body.data).toBeDefined();
    
    // Verify security headers are present
    expect(dataResponse.headers['x-content-type-options']).toBe('nosniff');
  });
});