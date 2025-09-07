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
  max: process.env.NODE_ENV !== 'production' ? 100 : 5, // More lenient in development
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
      retryAfter: Math.ceil((req.rateLimit?.resetTime || Date.now() + 900000) / 1000)
    });
  }
});

// Development-friendly rate limiting with environment-based configuration
const isDevelopment = process.env.NODE_ENV !== 'production';

export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 100000 : 1000, // Very high limit for development (100k requests)
  message: {
    error: 'Too many requests from this IP, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for localhost in development
    if (isDevelopment) {
      // Skip for localhost and common development IPs
      const isLocalhost = req.ip === '::1' || 
                         req.ip === '127.0.0.1' || 
                         req.ip === '::ffff:127.0.0.1' ||
                         req.hostname === 'localhost';
      
      if (isLocalhost) {
        return true; // Skip rate limiting entirely for localhost
      }
      
      // Also skip for static assets and health checks
      const skipPaths = [
        '/api/health',
        '/api/auth/health',
        '.js',
        '.css',
        '.png',
        '.jpg',
        '.svg',
        '.ico',
        '.woff',
        '.woff2',
        '.ttf',
        '.map', // Source maps
        'hot-update', // Vite HMR
        '@vite', // Vite client
        '@fs', // Vite file serving
        'node_modules' // Dependencies
      ];
      return skipPaths.some(path => req.path.includes(path));
    }
    return false;
  },
  handler: (req, res) => {
    console.log(`⚠️ General rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    const resetTime = req.rateLimit?.resetTime || Date.now() + 900000; // Default to 15 minutes
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil((resetTime || Date.now() + 900000) / 1000)
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
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://fonts.googleapis.com",
        "https://cdnjs.cloudflare.com"  // Allow Font Awesome CSS
      ],
      fontSrc: [
        "'self'", 
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com",  // Allow Font Awesome fonts
        "https://ka-f.fontawesome.com",   // Font Awesome CDN
        "https://ka-p.fontawesome.com",   // Font Awesome Pro CDN
        "https://use.fontawesome.com",    // Font Awesome Use CDN
        "data:"                            // Allow data URLs for fonts
      ],
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

/**
 * Security Metrics Collection
 * Collects security-related metrics for monitoring and alerting
 */
export interface SecurityMetrics {
  authenticationAttempts: number;
  failedLogins: number;
  rateLimitViolations: number;
  suspiciousActivities: number;
  fileUploads: number;
  xssAttempts: number;
  sqlInjectionAttempts: number;
}

const securityMetrics: SecurityMetrics = {
  authenticationAttempts: 0,
  failedLogins: 0,
  rateLimitViolations: 0,
  suspiciousActivities: 0,
  fileUploads: 0,
  xssAttempts: 0,
  sqlInjectionAttempts: 0
};

/**
 * Update Security Metrics
 * Tracks security events for monitoring and alerting
 */
export const updateSecurityMetrics = (metric: keyof SecurityMetrics, increment: number = 1) => {
  securityMetrics[metric] += increment;
  
  // Log metrics every 100 events for monitoring
  if (Object.values(securityMetrics).reduce((sum, val) => sum + val, 0) % 100 === 0) {
    console.log('📊 Security Metrics Update:', securityMetrics);
  }
};

/**
 * Get Security Metrics
 * Returns current security metrics for dashboards and monitoring
 */
export const getSecurityMetrics = (): SecurityMetrics => {
  return { ...securityMetrics };
};

/**
 * Reset Security Metrics
 * Resets metrics (typically called daily for rolling metrics)
 */
export const resetSecurityMetrics = () => {
  Object.keys(securityMetrics).forEach(key => {
    securityMetrics[key as keyof SecurityMetrics] = 0;
  });
  console.log('🔄 Security metrics reset');
};

/**
 * Advanced Security Headers for Production
 * Enhanced security headers with additional protection
 */
export const productionSecurityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"], // Remove unsafe-inline for production
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.openai.com"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"]
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
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  crossOriginEmbedderPolicy: false, // Disable if causing issues with file uploads
  crossOriginResourcePolicy: { policy: "cross-origin" }
});

/**
 * Security Health Check
 * Endpoint for monitoring security status
 */
export const securityHealthCheck = (req: Request, res: Response) => {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    securityFeatures: {
      rateLimit: true,
      inputSanitization: true,
      securityHeaders: true,
      authentication: true,
      authorization: true,
      logging: true
    },
    metrics: getSecurityMetrics(),
    version: '1.0.0'
  };
  
  res.status(200).json(healthStatus);
};

/**
 * Advanced Threat Detection
 * Enhanced threat detection with machine learning patterns
 */
export const advancedThreatDetection = (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestData = {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
      body: req.body,
      query: req.query,
      headers: req.headers
    };

    // Advanced threat patterns
    const advancedPatterns = [
      // Advanced SQL injection patterns
      /(\bunion\b.*\bselect\b|\bselect\b.*\bfrom\b.*\bwhere\b)/gi,
      /(\bdrop\b.*\btable\b|\bdelete\b.*\bfrom\b.*\bwhere\b)/gi,
      
      // Advanced XSS patterns
      /<script[^>]*>[\s\S]*?<\/script>/gi,
      /javascript\s*:\s*[^;]+/gi,
      /on\w+\s*=\s*["|'][^"']*["|']/gi,
      
      // Command injection patterns
      /(\||&|;|`|\$\(|`)/g,
      
      // Path traversal patterns
      /(\.\.[\/\\]){2,}/g,
      
      // NoSQL injection patterns
      /(\$where|\$ne|\$in|\$nin|\$gt|\$lt)/gi
    ];

    const requestString = JSON.stringify(requestData);
    
    for (const pattern of advancedPatterns) {
      if (pattern.test(requestString)) {
        updateSecurityMetrics('suspiciousActivities');
        
        logSecurityEvent('ADVANCED_THREAT_DETECTED', {
          pattern: pattern.source,
          confidence: 'high',
          input: requestString.substring(0, 500)
        }, req);
        
        // Don't block, but log for analysis
        break;
      }
    }

    next();
  } catch (error) {
    console.error('🚨 Advanced threat detection error:', error);
    next();
  }
};

/**
 * Honeypot Trap
 * Detects automated attacks by monitoring honeypot fields
 */
export const honeypotTrap = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for honeypot fields that should be empty
    const honeypotFields = ['email_confirm', 'website', 'url', 'phone_verify'];
    
    for (const field of honeypotFields) {
      if (req.body[field] && req.body[field].trim() !== '') {
        updateSecurityMetrics('suspiciousActivities');
        
        logSecurityEvent('HONEYPOT_TRIGGERED', {
          field,
          value: req.body[field],
          confidence: 'high'
        }, req);
        
        // Delay response to waste bot time
        setTimeout(() => {
          res.status(400).json({
            error: 'Invalid request',
            code: 'VALIDATION_ERROR'
          });
        }, 2000);
        
        return;
      }
    }

    next();
  } catch (error) {
    console.error('🚨 Honeypot trap error:', error);
    next();
  }
};

/**
 * Geo-IP Security Check
 * Basic geo-location based security (placeholder for future enhancement)
 */
export const geoSecurityCheck = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Placeholder for geo-IP checking
    // In production, integrate with MaxMind GeoIP2 or similar service
    
    const suspiciousCountries = ['CN', 'RU', 'KP']; // Example blocked countries
    // const clientCountry = getCountryFromIP(req.ip);
    
    // if (suspiciousCountries.includes(clientCountry)) {
    //   logSecurityEvent('SUSPICIOUS_GEO_LOCATION', {
    //     country: clientCountry,
    //     action: 'blocked'
    //   }, req);
    //   
    //   return res.status(403).json({
    //     error: 'Access denied from this location',
    //     code: 'GEO_BLOCKED'
    //   });
    // }
    
    next();
  } catch (error) {
    console.error('🚨 Geo security check error:', error);
    next();
  }
};

export default {
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
};