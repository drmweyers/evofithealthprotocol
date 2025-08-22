/**
 * Security Middleware Module
 * 
 * Comprehensive security middleware implementations for the HealthProtocol application.
 * Provides rate limiting, input sanitization, security headers, and monitoring.
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Rate Limiting Configuration
 * Protects against brute force attacks and API abuse
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth attempts per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`🚨 Rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      error: 'Too many authentication attempts, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(req.rateLimit?.resetTime! / 1000)
    });
  }
});

export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`⚠️ General rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(req.rateLimit?.resetTime! / 1000)
    });
  }
});

/**
 * Security Headers Configuration
 * Implements OWASP security header recommendations
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // TODO: Remove unsafe-inline in production
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.openai.com"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
});

/**
 * Input Sanitization Middleware
 * Sanitizes user input to prevent XSS attacks
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Recursively sanitize object properties
    const sanitizeObject = (obj: any): any => {
      if (obj === null || obj === undefined) return obj;
      
      if (typeof obj === 'string') {
        // Sanitize HTML content but preserve basic formatting
        return DOMPurify.sanitize(obj, {
          ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
          ALLOWED_ATTR: []
        });
      }
      
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }
      
      if (typeof obj === 'object') {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(obj)) {
          sanitized[key] = sanitizeObject(value);
        }
        return sanitized;
      }
      
      return obj;
    };

    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }

    next();
  } catch (error) {
    console.error('🚨 Input sanitization error:', error);
    res.status(400).json({
      error: 'Invalid input format',
      code: 'INVALID_INPUT'
    });
  }
};

/**
 * Health Protocol Input Validation
 * Specific validation for health protocol data
 */
export const validateHealthProtocolInput = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { body } = req;

    // Validate protocol content
    if (body.protocolContent) {
      // Check for potentially dangerous content
      const dangerousPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /eval\s*\(/gi,
        /setTimeout\s*\(/gi,
        /setInterval\s*\(/gi
      ];

      const content = String(body.protocolContent);
      for (const pattern of dangerousPatterns) {
        if (pattern.test(content)) {
          console.log(`🚨 Dangerous content detected in health protocol: ${req.ip}`);
          return res.status(400).json({
            error: 'Invalid protocol content detected',
            code: 'INVALID_PROTOCOL_CONTENT'
          });
        }
      }

      // Limit content size (500KB)
      if (content.length > 500000) {
        return res.status(400).json({
          error: 'Protocol content too large',
          code: 'CONTENT_TOO_LARGE'
        });
      }
    }

    // Validate ailments array
    if (body.ailments && Array.isArray(body.ailments)) {
      if (body.ailments.length > 50) {
        return res.status(400).json({
          error: 'Too many ailments specified',
          code: 'TOO_MANY_AILMENTS'
        });
      }

      // Validate each ailment
      for (const ailment of body.ailments) {
        if (typeof ailment !== 'string' || ailment.length > 100) {
          return res.status(400).json({
            error: 'Invalid ailment format',
            code: 'INVALID_AILMENT'
          });
        }
      }
    }

    next();
  } catch (error) {
    console.error('🚨 Health protocol validation error:', error);
    res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR'
    });
  }
};

/**
 * File Upload Security
 * Validates file uploads for profile images
 */
export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return next();
    }

    const { file } = req;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed',
        code: 'INVALID_FILE_TYPE'
      });
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return res.status(400).json({
        error: 'File too large. Maximum size is 5MB',
        code: 'FILE_TOO_LARGE'
      });
    }

    // Validate file name
    const filename = file.originalname;
    if (filename.length > 255) {
      return res.status(400).json({
        error: 'Filename too long',
        code: 'FILENAME_TOO_LONG'
      });
    }

    // Check for potentially dangerous filenames
    const dangerousPatterns = [
      /\.\./,  // Path traversal
      /[<>:"|?*]/,  // Windows reserved characters
      /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i  // Windows reserved names
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(filename)) {
        return res.status(400).json({
          error: 'Invalid filename',
          code: 'INVALID_FILENAME'
        });
      }
    }

    next();
  } catch (error) {
    console.error('🚨 File upload validation error:', error);
    res.status(400).json({
      error: 'File validation failed',
      code: 'FILE_VALIDATION_ERROR'
    });
  }
};

/**
 * Security Event Logging
 * Logs security-relevant events for monitoring
 */
export const logSecurityEvent = (eventType: string, details: any, req: Request) => {
  const securityEvent = {
    timestamp: new Date().toISOString(),
    type: eventType,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    details
  };

  console.log('🔒 Security Event:', JSON.stringify(securityEvent));

  // TODO: Send to security monitoring system (Datadog, Splunk, etc.)
};

/**
 * Suspicious Activity Detection
 * Detects and logs suspicious user behavior
 */
export const detectSuspiciousActivity = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for suspicious patterns
    const suspiciousPatterns = [
      // SQL injection patterns
      /union\s+select/gi,
      /drop\s+table/gi,
      /delete\s+from/gi,
      /insert\s+into/gi,
      // XSS patterns
      /<script/gi,
      /javascript:/gi,
      /onerror\s*=/gi,
      // Path traversal
      /\.\.\//g,
      /\.\.\\/g
    ];

    const checkString = JSON.stringify({
      ...req.body,
      ...req.query,
      ...req.params
    });

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(checkString)) {
        logSecurityEvent('SUSPICIOUS_INPUT', {
          pattern: pattern.source,
          input: checkString.substring(0, 500)
        }, req);
        
        // Log but don't block - let other middleware handle
        break;
      }
    }

    next();
  } catch (error) {
    console.error('🚨 Suspicious activity detection error:', error);
    next();
  }
};

/**
 * Request Size Limiting
 * Prevents large payload attacks
 */
export const requestSizeLimit = (maxSize: number = 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.get('content-length') || '0');
    
    if (contentLength > maxSize) {
      return res.status(413).json({
        error: 'Request entity too large',
        code: 'PAYLOAD_TOO_LARGE',
        maxSize
      });
    }
    
    next();
  };
};

export default {
  authRateLimit,
  generalRateLimit,
  securityHeaders,
  sanitizeInput,
  validateHealthProtocolInput,
  validateFileUpload,
  logSecurityEvent,
  detectSuspiciousActivity,
  requestSizeLimit
};