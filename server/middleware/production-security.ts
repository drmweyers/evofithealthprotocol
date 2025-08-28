// server/middleware/production-security.ts
/**
 * Production-specific security middleware
 * Enhanced security configuration for production deployment
 */

import { Request, Response, NextFunction, Application } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';

/**
 * Production security headers with strict CSP
 */
export const productionSecurityHeaders = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://cdn.jsdelivr.net"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdn.jsdelivr.net"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https://*.amazonaws.com",
        "https://openai.com",
        "https://oaidalleapiprodscus.blob.core.windows.net"
      ],
      scriptSrc: [
        "'self'",
        // Only allow specific trusted CDNs in production
      ],
      connectSrc: [
        "'self'",
        "https://api.openai.com",
        process.env.FRONTEND_URL || "https://yourdomain.com"
      ],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    },
    reportOnly: false
  },
  
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  
  // Other security headers
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  
  // Permissions Policy (formerly Feature Policy)
  permittedCrossDomainPolicies: false,
  
  // Cross-Origin policies
  crossOriginEmbedderPolicy: false, // Can cause issues with PDFs
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false
});

/**
 * Production rate limiting - stricter limits
 */
export const productionRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '1000', 10), // configurable
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    console.warn(`🚨 Production rate limit exceeded - IP: ${req.ip}, Path: ${req.path}, User-Agent: ${req.get('user-agent')?.slice(0, 100)}`);
    
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil((req.rateLimit?.resetTime || Date.now() + 900000) / 1000),
      timestamp: new Date().toISOString()
    });
  },
  
  // Skip rate limiting for health checks
  skip: (req: Request) => {
    return req.path.startsWith('/health') || 
           req.path.startsWith('/ready') || 
           req.path.startsWith('/live') ||
           req.path.startsWith('/metrics');
  }
});

/**
 * API-specific rate limiting for authentication endpoints
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Very strict for auth endpoints
  message: {
    error: 'Too many authentication attempts, please try again in 15 minutes.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful auth attempts
  handler: (req: Request, res: Response) => {
    console.warn(`🔐 Auth rate limit exceeded - IP: ${req.ip}, Path: ${req.path}`);
    
    res.status(429).json({
      error: 'Too many authentication attempts, please try again in 15 minutes.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(req.rateLimit?.resetTime! / 1000)
    });
  }
});

/**
 * Slow down repeated requests (progressive delay)
 */
export const slowDownMiddleware = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per window at full speed
  delayMs: (hits) => hits * 100, // Add 100ms delay per request after threshold
  maxDelayMs: 5000, // Maximum delay of 5 seconds
  
  // Skip slow down for health checks
  skip: (req: Request) => {
    return req.path.startsWith('/health') || 
           req.path.startsWith('/ready') || 
           req.path.startsWith('/live') ||
           req.path.startsWith('/metrics');
  }
});

/**
 * Production IP filtering and monitoring
 */
export const productionIPMonitoring = (req: Request, res: Response, next: NextFunction) => {
  // Get real IP behind proxy/load balancer
  const forwardedIps = req.headers['x-forwarded-for'];
  const realIp = Array.isArray(forwardedIps) 
    ? forwardedIps[0] 
    : forwardedIps?.split(',')[0] || req.ip;
  
  // Log suspicious patterns
  const suspiciousPatterns = [
    /admin/i,
    /wp-admin/i,
    /\.php$/i,
    /\.asp$/i,
    /\/etc\/passwd/i,
    /script>/i,
    /union.*select/i
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(req.path) || pattern.test(req.url)
  );
  
  if (isSuspicious) {
    console.warn(`🔍 Suspicious request detected - IP: ${realIp}, Path: ${req.path}, User-Agent: ${req.get('user-agent')?.slice(0, 100)}`);
    
    // You could implement IP blocking here
    // return res.status(403).json({ error: 'Forbidden' });
  }
  
  // Add real IP to request for downstream middleware
  req.realIp = realIp;
  
  next();
};

/**
 * Production request validation
 */
export const productionRequestValidation = (req: Request, res: Response, next: NextFunction) => {
  // Validate request size
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  const maxSize = parseInt(process.env.MAX_REQUEST_SIZE?.replace(/[^\d]/g, '') || '52428800', 10); // 50MB default
  
  if (contentLength > maxSize) {
    console.warn(`📋 Request too large - IP: ${req.realIp || req.ip}, Size: ${contentLength}`);
    return res.status(413).json({
      error: 'Request entity too large',
      maxSize: `${Math.floor(maxSize / 1024 / 1024)}MB`
    });
  }
  
  // Validate content type for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    
    if (!contentType) {
      return res.status(400).json({
        error: 'Content-Type header is required for this request'
      });
    }
    
    const allowedTypes = [
      'application/json',
      'application/x-www-form-urlencoded',
      'multipart/form-data'
    ];
    
    if (!allowedTypes.some(type => contentType.includes(type))) {
      return res.status(415).json({
        error: 'Unsupported Media Type',
        allowedTypes
      });
    }
  }
  
  next();
};

/**
 * Apply all production security middleware to Express app
 */
export const applyProductionSecurity = (app: Application) => {
  console.log('🔐 Applying production security middleware...');
  
  // Trust proxy if configured (important for load balancers)
  if (process.env.TRUST_PROXY === 'true') {
    app.set('trust proxy', 1);
    console.log('✅ Proxy trust enabled');
  }
  
  // Apply security headers
  app.use(productionSecurityHeaders);
  console.log('✅ Security headers configured');
  
  // Apply IP monitoring
  app.use(productionIPMonitoring);
  console.log('✅ IP monitoring enabled');
  
  // Apply request validation
  app.use(productionRequestValidation);
  console.log('✅ Request validation enabled');
  
  // Apply slow down middleware
  app.use(slowDownMiddleware);
  console.log('✅ Slow down protection enabled');
  
  // Apply general rate limiting
  app.use(productionRateLimit);
  console.log('✅ Rate limiting configured');
  
  console.log('🎯 Production security fully configured');
};

// Type augmentation for custom properties
declare global {
  namespace Express {
    interface Request {
      realIp?: string;
    }
  }
}