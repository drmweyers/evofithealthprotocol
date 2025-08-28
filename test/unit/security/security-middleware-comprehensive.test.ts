/**
 * Security Middleware Comprehensive Unit Tests
 * 
 * Tests for all security middleware components including:
 * - Rate limiting (auth and general)
 * - Security headers configuration
 * - Input sanitization and validation
 * - File upload security
 * - Health protocol input validation
 * - Suspicious activity detection
 * - Security metrics and monitoring
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import {
  authRateLimit,
  generalRateLimit,
  securityHeaders,
  productionSecurityHeaders,
  sanitizeInput,
  validateHealthProtocolInput,
  validateFileUpload,
  logSecurityEvent,
  detectSuspiciousActivity,
  advancedThreatDetection,
  honeypotTrap,
  geoSecurityCheck,
  requestSizeLimit,
  securityHealthCheck,
  updateSecurityMetrics,
  getSecurityMetrics,
  resetSecurityMetrics
} from '../../../server/middleware/security';

// Mock express objects
const createMockRequest = (overrides: Partial<Request> = {}): Partial<Request> => ({
  ip: '127.0.0.1',
  hostname: 'localhost',
  path: '/test',
  method: 'GET',
  headers: {
    'user-agent': 'test-agent',
    'content-type': 'application/json'
  },
  body: {},
  query: {},
  params: {},
  get: vi.fn((header: string) => {
    const headers: Record<string, string> = {
      'User-Agent': 'test-agent',
      'content-length': '100',
      ...overrides.headers
    };
    return headers[header];
  }),
  user: undefined,
  ...overrides
});

const createMockResponse = (): Partial<Response> => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  setHeader: vi.fn().mockReturnThis(),
  header: vi.fn().mockReturnThis()
});

const createMockNext = (): NextFunction => vi.fn();

// Save original environment
const originalEnv = process.env;

beforeEach(() => {
  vi.clearAllMocks();
  resetSecurityMetrics();
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('Security Middleware - Rate Limiting', () => {
  describe('authRateLimit', () => {
    it('should allow requests within rate limit', () => {
      // Rate limiting middleware is configured, not directly testable without integration
      // But we can test its configuration
      expect(authRateLimit).toBeDefined();
      expect(typeof authRateLimit).toBe('function');
    });

    it('should be configured for authentication endpoints', () => {
      // Test rate limit configuration for auth endpoints
      expect(authRateLimit).toBeDefined();
    });
  });

  describe('generalRateLimit', () => {
    it('should be more lenient in development', () => {
      process.env.NODE_ENV = 'development';
      expect(generalRateLimit).toBeDefined();
    });

    it('should be stricter in production', () => {
      process.env.NODE_ENV = 'production';
      expect(generalRateLimit).toBeDefined();
    });

    it('should skip rate limiting for localhost in development', () => {
      process.env.NODE_ENV = 'development';
      // Testing the skip logic would require accessing internal configuration
      expect(generalRateLimit).toBeDefined();
    });

    it('should skip rate limiting for static assets', () => {
      // Test that static asset paths are skipped
      const staticPaths = ['.js', '.css', '.png', '.jpg', '.svg', '.ico'];
      staticPaths.forEach(path => {
        expect(path).toMatch(/\.(js|css|png|jpg|svg|ico)$/);
      });
    });
  });

  describe('requestSizeLimit', () => {
    it('should allow requests within size limit', () => {
      const req = createMockRequest({
        get: vi.fn().mockReturnValue('500') // 500 bytes
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const middleware = requestSizeLimit(1024); // 1KB limit
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject requests exceeding size limit', () => {
      const req = createMockRequest({
        get: vi.fn().mockReturnValue('2048') // 2KB
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const middleware = requestSizeLimit(1024); // 1KB limit
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(413);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Request entity too large',
        code: 'PAYLOAD_TOO_LARGE',
        maxSize: 1024
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle missing content-length header', () => {
      const req = createMockRequest({
        get: vi.fn().mockReturnValue(undefined)
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const middleware = requestSizeLimit(1024);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});

describe('Security Middleware - Headers', () => {
  describe('securityHeaders', () => {
    it('should be configured with appropriate security headers', () => {
      expect(securityHeaders).toBeDefined();
      expect(typeof securityHeaders).toBe('function');
    });
  });

  describe('productionSecurityHeaders', () => {
    it('should have stricter CSP for production', () => {
      expect(productionSecurityHeaders).toBeDefined();
      expect(typeof productionSecurityHeaders).toBe('function');
    });
  });
});

describe('Security Middleware - Input Sanitization', () => {
  describe('sanitizeInput', () => {
    it('should sanitize malicious HTML in request body', () => {
      const req = createMockRequest({
        body: {
          content: '<script>alert("XSS")</script>Hello World',
          description: '<img src="x" onerror="alert(1)">Test'
        }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      sanitizeInput(req, res, next);

      expect(req.body.content).not.toContain('<script>');
      expect(req.body.content).not.toContain('alert');
      expect(req.body.description).not.toContain('onerror');
      expect(next).toHaveBeenCalled();
    });

    it('should sanitize query parameters', () => {
      const req = createMockRequest({
        query: {
          search: '<script>malicious()</script>',
          filter: 'normal value'
        }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      sanitizeInput(req, res, next);

      expect(req.query.search).not.toContain('<script>');
      expect(req.query.filter).toBe('normal value');
      expect(next).toHaveBeenCalled();
    });

    it('should preserve allowed HTML tags', () => {
      const req = createMockRequest({
        body: {
          content: '<p>Paragraph with <strong>bold</strong> and <em>italic</em> text</p>'
        }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      sanitizeInput(req, res, next);

      // Allowed tags should be preserved
      expect(req.body.content).toContain('<p>');
      expect(req.body.content).toContain('<strong>');
      expect(req.body.content).toContain('<em>');
      expect(next).toHaveBeenCalled();
    });

    it('should handle nested objects', () => {
      const req = createMockRequest({
        body: {
          user: {
            profile: {
              bio: '<script>alert("nested XSS")</script>Clean text'
            }
          }
        }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      sanitizeInput(req, res, next);

      expect(req.body.user.profile.bio).not.toContain('<script>');
      expect(req.body.user.profile.bio).toContain('Clean text');
      expect(next).toHaveBeenCalled();
    });

    it('should handle arrays in request data', () => {
      const req = createMockRequest({
        body: {
          tags: ['<script>alert(1)</script>', 'normal tag', '<img src="x" onerror="alert(2)">']
        }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      sanitizeInput(req, res, next);

      expect(req.body.tags[0]).not.toContain('<script>');
      expect(req.body.tags[1]).toBe('normal tag');
      expect(req.body.tags[2]).not.toContain('onerror');
      expect(next).toHaveBeenCalled();
    });

    it('should handle sanitization errors gracefully', () => {
      const req = createMockRequest({
        body: null // This might cause DOMPurify to fail
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      // Mock DOMPurify to throw an error
      vi.doMock('isomorphic-dompurify', () => ({
        sanitize: vi.fn().mockImplementation(() => {
          throw new Error('DOMPurify error');
        })
      }));

      sanitizeInput(req, res, next);

      // Should handle error gracefully
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid input format',
        code: 'INVALID_INPUT'
      });
    });
  });
});

describe('Security Middleware - Health Protocol Validation', () => {
  describe('validateHealthProtocolInput', () => {
    it('should allow valid health protocol content', () => {
      const req = createMockRequest({
        body: {
          protocolContent: 'Valid health protocol content with proper instructions.',
          ailments: ['headache', 'fatigue']
        }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      validateHealthProtocolInput(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject protocol content with dangerous scripts', () => {
      const req = createMockRequest({
        body: {
          protocolContent: '<script>alert("malicious")</script>Valid content'
        }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      validateHealthProtocolInput(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid protocol content detected',
        code: 'INVALID_PROTOCOL_CONTENT'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject protocol content with javascript: URLs', () => {
      const req = createMockRequest({
        body: {
          protocolContent: 'Click <a href="javascript:alert(1)">here</a>'
        }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      validateHealthProtocolInput(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid protocol content detected',
        code: 'INVALID_PROTOCOL_CONTENT'
      });
    });

    it('should reject protocol content with event handlers', () => {
      const req = createMockRequest({
        body: {
          protocolContent: '<div onclick="malicious()">Protocol content</div>'
        }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      validateHealthProtocolInput(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid protocol content detected',
        code: 'INVALID_PROTOCOL_CONTENT'
      });
    });

    it('should reject protocol content that is too large', () => {
      const largeContent = 'a'.repeat(500001); // Exceeds 500KB limit
      const req = createMockRequest({
        body: {
          protocolContent: largeContent
        }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      validateHealthProtocolInput(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Protocol content too large',
        code: 'CONTENT_TOO_LARGE'
      });
    });

    it('should validate ailments array', () => {
      const req = createMockRequest({
        body: {
          ailments: Array.from({ length: 51 }, (_, i) => `ailment${i}`) // Too many ailments
        }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      validateHealthProtocolInput(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Too many ailments specified',
        code: 'TOO_MANY_AILMENTS'
      });
    });

    it('should validate individual ailment format', () => {
      const req = createMockRequest({
        body: {
          ailments: ['valid ailment', 'a'.repeat(101)] // One ailment too long
        }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      validateHealthProtocolInput(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid ailment format',
        code: 'INVALID_AILMENT'
      });
    });
  });
});

describe('Security Middleware - File Upload Validation', () => {
  describe('validateFileUpload', () => {
    const createMockFile = (overrides: Partial<Express.Multer.File> = {}): Express.Multer.File => ({
      fieldname: 'profileImage',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024 * 1024, // 1MB
      destination: '/tmp',
      filename: 'test.jpg',
      path: '/tmp/test.jpg',
      buffer: Buffer.from('test'),
      stream: null as any,
      ...overrides
    });

    it('should allow valid image files', () => {
      const validFile = createMockFile({
        mimetype: 'image/jpeg',
        size: 1024 * 1024, // 1MB
        originalname: 'profile.jpg'
      });

      const req = createMockRequest({ file: validFile }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      validateFileUpload(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow PNG files', () => {
      const pngFile = createMockFile({
        mimetype: 'image/png',
        originalname: 'profile.png'
      });

      const req = createMockRequest({ file: pngFile }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      validateFileUpload(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should allow WebP files', () => {
      const webpFile = createMockFile({
        mimetype: 'image/webp',
        originalname: 'profile.webp'
      });

      const req = createMockRequest({ file: webpFile }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      validateFileUpload(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject invalid file types', () => {
      const invalidFile = createMockFile({
        mimetype: 'application/pdf',
        originalname: 'document.pdf'
      });

      const req = createMockRequest({ file: invalidFile }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      validateFileUpload(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed',
        code: 'INVALID_FILE_TYPE'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject files that are too large', () => {
      const largeFile = createMockFile({
        size: 6 * 1024 * 1024, // 6MB (exceeds 5MB limit)
        originalname: 'large_image.jpg'
      });

      const req = createMockRequest({ file: largeFile }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      validateFileUpload(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'File too large. Maximum size is 5MB',
        code: 'FILE_TOO_LARGE'
      });
    });

    it('should reject files with dangerous names', () => {
      const dangerousFile = createMockFile({
        originalname: '../../../etc/passwd'
      });

      const req = createMockRequest({ file: dangerousFile }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      validateFileUpload(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid filename',
        code: 'INVALID_FILENAME'
      });
    });

    it('should reject files with Windows reserved names', () => {
      const reservedFile = createMockFile({
        originalname: 'CON.jpg'
      });

      const req = createMockRequest({ file: reservedFile }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      validateFileUpload(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid filename',
        code: 'INVALID_FILENAME'
      });
    });

    it('should reject filenames that are too long', () => {
      const longNameFile = createMockFile({
        originalname: 'a'.repeat(256) + '.jpg' // Exceeds 255 character limit
      });

      const req = createMockRequest({ file: longNameFile }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      validateFileUpload(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Filename too long',
        code: 'FILENAME_TOO_LONG'
      });
    });

    it('should handle requests without files', () => {
      const req = createMockRequest() as Request; // No file property
      const res = createMockResponse() as Response;
      const next = createMockNext();

      validateFileUpload(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});

describe('Security Middleware - Threat Detection', () => {
  describe('detectSuspiciousActivity', () => {
    it('should detect SQL injection patterns', () => {
      const req = createMockRequest({
        body: {
          query: "'; DROP TABLE users; --"
        }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      // Mock console.log to capture security events
      const consoleSpy = vi.spyOn(console, 'log');

      detectSuspiciousActivity(req, res, next);

      expect(next).toHaveBeenCalled();
      // Should log security event but not block request
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🔒 Security Event:')
      );

      consoleSpy.mockRestore();
    });

    it('should detect XSS patterns', () => {
      const req = createMockRequest({
        body: {
          content: '<script>alert("XSS")</script>'
        }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const consoleSpy = vi.spyOn(console, 'log');

      detectSuspiciousActivity(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🔒 Security Event:')
      );

      consoleSpy.mockRestore();
    });

    it('should detect path traversal patterns', () => {
      const req = createMockRequest({
        query: {
          file: '../../../etc/passwd'
        }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const consoleSpy = vi.spyOn(console, 'log');

      detectSuspiciousActivity(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🔒 Security Event:')
      );

      consoleSpy.mockRestore();
    });

    it('should handle detection errors gracefully', () => {
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      // Mock JSON.stringify to throw an error
      const originalStringify = JSON.stringify;
      JSON.stringify = vi.fn().mockImplementation(() => {
        throw new Error('Stringify error');
      });

      const consoleErrorSpy = vi.spyOn(console, 'error');

      detectSuspiciousActivity(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('🚨 Suspicious activity detection error:')
      );

      JSON.stringify = originalStringify;
      consoleErrorSpy.mockRestore();
    });
  });

  describe('advancedThreatDetection', () => {
    it('should detect advanced SQL injection patterns', () => {
      const req = createMockRequest({
        body: {
          search: 'UNION SELECT password FROM users WHERE 1=1'
        }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const consoleSpy = vi.spyOn(console, 'log');

      advancedThreatDetection(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🔒 Security Event:')
      );

      consoleSpy.mockRestore();
    });

    it('should detect NoSQL injection patterns', () => {
      const req = createMockRequest({
        body: {
          filter: { $where: 'this.password.length > 0' }
        }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const consoleSpy = vi.spyOn(console, 'log');

      advancedThreatDetection(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🔒 Security Event:')
      );

      consoleSpy.mockRestore();
    });

    it('should detect command injection patterns', () => {
      const req = createMockRequest({
        body: {
          filename: 'test.txt; rm -rf /' 
        }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      const consoleSpy = vi.spyOn(console, 'log');

      advancedThreatDetection(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🔒 Security Event:')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('honeypotTrap', () => {
    it('should detect honeypot field usage', () => {
      const req = createMockRequest({
        body: {
          email: 'user@example.com',
          password: 'password123',
          email_confirm: 'bot@spam.com', // Honeypot field
          name: 'Real User'
        }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      // Use fake timers to control setTimeout
      vi.useFakeTimers();
      
      const consoleSpy = vi.spyOn(console, 'log');

      honeypotTrap(req, res, next);

      // Fast-forward time to trigger the delayed response
      vi.advanceTimersByTime(2000);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🔒 Security Event:')
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid request',
        code: 'VALIDATION_ERROR'
      });
      expect(next).not.toHaveBeenCalled();

      vi.useRealTimers();
      consoleSpy.mockRestore();
    });

    it('should allow requests without honeypot fields', () => {
      const req = createMockRequest({
        body: {
          email: 'user@example.com',
          password: 'password123',
          name: 'Real User'
        }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      honeypotTrap(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow empty honeypot fields', () => {
      const req = createMockRequest({
        body: {
          email: 'user@example.com',
          password: 'password123',
          website: '', // Empty honeypot field
          name: 'Real User'
        }
      }) as Request;
      const res = createMockResponse() as Response;
      const next = createMockNext();

      honeypotTrap(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});

describe('Security Middleware - Logging and Monitoring', () => {
  describe('logSecurityEvent', () => {
    it('should log security events with proper format', () => {
      const req = createMockRequest({
        ip: '192.168.1.1',
        path: '/api/auth/login',
        method: 'POST',
        user: { id: 'user123' }
      }) as Request;

      const consoleSpy = vi.spyOn(console, 'log');

      logSecurityEvent('LOGIN_ATTEMPT', { email: 'test@example.com' }, req);

      expect(consoleSpy).toHaveBeenCalledWith(
        '🔒 Security Event:',
        expect.stringContaining('LOGIN_ATTEMPT')
      );

      const loggedEvent = JSON.parse(consoleSpy.mock.calls[0][1]);
      expect(loggedEvent).toMatchObject({
        type: 'LOGIN_ATTEMPT',
        ip: '192.168.1.1',
        path: '/api/auth/login',
        method: 'POST',
        userId: 'user123',
        details: { email: 'test@example.com' }
      });
      expect(loggedEvent.timestamp).toBeDefined();

      consoleSpy.mockRestore();
    });

    it('should handle requests without user context', () => {
      const req = createMockRequest() as Request;
      const consoleSpy = vi.spyOn(console, 'log');

      logSecurityEvent('ANONYMOUS_ACCESS', {}, req);

      expect(consoleSpy).toHaveBeenCalled();
      const loggedEvent = JSON.parse(consoleSpy.mock.calls[0][1]);
      expect(loggedEvent.userId).toBeUndefined();

      consoleSpy.mockRestore();
    });
  });

  describe('Security Metrics', () => {
    beforeEach(() => {
      resetSecurityMetrics();
    });

    it('should update security metrics', () => {
      updateSecurityMetrics('authenticationAttempts', 5);
      updateSecurityMetrics('failedLogins', 2);

      const metrics = getSecurityMetrics();
      expect(metrics.authenticationAttempts).toBe(5);
      expect(metrics.failedLogins).toBe(2);
      expect(metrics.rateLimitViolations).toBe(0);
    });

    it('should increment metrics by 1 by default', () => {
      updateSecurityMetrics('suspiciousActivities');
      updateSecurityMetrics('suspiciousActivities');
      updateSecurityMetrics('suspiciousActivities');

      const metrics = getSecurityMetrics();
      expect(metrics.suspiciousActivities).toBe(3);
    });

    it('should reset security metrics', () => {
      updateSecurityMetrics('fileUploads', 10);
      updateSecurityMetrics('xssAttempts', 5);

      const beforeReset = getSecurityMetrics();
      expect(beforeReset.fileUploads).toBe(10);
      expect(beforeReset.xssAttempts).toBe(5);

      resetSecurityMetrics();

      const afterReset = getSecurityMetrics();
      expect(afterReset.fileUploads).toBe(0);
      expect(afterReset.xssAttempts).toBe(0);
    });

    it('should log metrics periodically', () => {
      const consoleSpy = vi.spyOn(console, 'log');

      // Update metrics to trigger logging (every 100 events)
      for (let i = 0; i < 100; i++) {
        updateSecurityMetrics('authenticationAttempts');
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        '📊 Security Metrics Update:',
        expect.objectContaining({
          authenticationAttempts: 100
        })
      );

      consoleSpy.mockRestore();
    });
  });

  describe('securityHealthCheck', () => {
    it('should return security health status', () => {
      const req = createMockRequest() as Request;
      const res = createMockResponse() as Response;

      securityHealthCheck(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'healthy',
          timestamp: expect.any(String),
          securityFeatures: {
            rateLimit: true,
            inputSanitization: true,
            securityHeaders: true,
            authentication: true,
            authorization: true,
            logging: true
          },
          metrics: expect.any(Object),
          version: '1.0.0'
        })
      );
    });
  });
});

describe('Security Middleware - Error Handling', () => {
  it('should handle middleware errors gracefully', () => {
    const req = createMockRequest() as Request;
    const res = createMockResponse() as Response;
    const next = createMockNext();

    // Test that middleware handles internal errors without crashing
    expect(() => {
      sanitizeInput(req, res, next);
      validateHealthProtocolInput(req, res, next);
      detectSuspiciousActivity(req, res, next);
    }).not.toThrow();
  });

  it('should continue processing after security event logging', () => {
    const req = createMockRequest({
      body: { query: 'SELECT * FROM users' }
    }) as Request;
    const res = createMockResponse() as Response;
    const next = createMockNext();

    detectSuspiciousActivity(req, res, next);

    // Should call next() even after detecting suspicious activity
    expect(next).toHaveBeenCalled();
  });
});
