# Security Middleware Configuration

## Overview
The HealthProtocol application implements comprehensive security middleware to protect against common web vulnerabilities and attacks. This document outlines the configuration and best practices implemented.

## Middleware Stack Order

The security middleware is applied in the following order (important for proper functionality):

1. **Security Headers** - `securityHeaders`
2. **Suspicious Activity Detection** - `detectSuspiciousActivity`
3. **General Rate Limiting** - `generalRateLimit`
4. **Body Parsing** - `express.json()` with limits
5. **Input Sanitization** - `sanitizeInput`
6. **Route-specific middleware** (auth rate limiting, validation)

## Rate Limiting Configuration

### General Rate Limiting
- **Development**: 100,000 requests per 15-minute window
- **Production**: 1,000 requests per 15-minute window
- **Localhost Exemption**: Complete exemption for localhost IPs in development
- **Skip Patterns**: Static assets, health checks, Vite HMR endpoints

```typescript
// Skipped paths in development
const skipPaths = [
  '/api/health',
  '/api/auth/health',
  '.js', '.css', '.png', '.jpg', '.svg', '.ico',
  '.woff', '.woff2', '.ttf', '.map',
  'hot-update', '@vite', '@fs', 'node_modules'
];
```

### Authentication Rate Limiting
- **Development**: 100 attempts per 15-minute window
- **Production**: 5 attempts per 15-minute window
- Applied to `/api/auth/login` and `/api/auth/register` endpoints

### Rate Limit Response Format
```json
{
  "error": "Too many requests from this IP, please try again later",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 1640995200
}
```

## Security Headers

Implements OWASP security header recommendations using Helmet.js:

### Content Security Policy (CSP)
```
default-src 'self'
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
font-src 'self' https://fonts.gstatic.com
script-src 'self' 'unsafe-inline'
img-src 'self' data: https: blob:
connect-src 'self' https://api.openai.com
media-src 'self'
frame-src 'none'
object-src 'none'
base-uri 'self'
form-action 'self'
```

### Additional Headers
- **HSTS**: `max-age=31536000; includeSubDomains; preload`
- **X-Content-Type-Options**: `nosniff`
- **X-Frame-Options**: `DENY`
- **X-XSS-Protection**: `0` (modern browsers use CSP)
- **Referrer-Policy**: `strict-origin-when-cross-origin`

## Input Sanitization

### DOMPurify Configuration
- **Allowed Tags**: `['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li']`
- **Allowed Attributes**: None (empty array for security)
- **Recursive Sanitization**: Handles nested objects and arrays

### Sanitization Scope
- Request body (`req.body`)
- Query parameters (`req.query`)
- Nested object properties
- Array elements

## Health Protocol Specific Validation

### Protocol Content Validation
- **Dangerous Patterns Blocked**:
  - `<script>` tags
  - `javascript:` URLs
  - Event handlers (`on\w+\s*=`)
  - `eval()`, `setTimeout()`, `setInterval()`
- **Size Limits**: Maximum 500KB per protocol

### Ailments Validation
- **Maximum Count**: 50 ailments per protocol
- **Format**: String type only
- **Length Limit**: 100 characters per ailment

## File Upload Security

### Profile Image Validation
- **Allowed Types**: JPEG, PNG, WebP
- **Size Limit**: 5MB maximum
- **Filename Validation**: 
  - No path traversal (`../`)
  - No Windows reserved characters
  - No reserved Windows names (CON, PRN, etc.)
- **Length Limit**: 255 characters

## Suspicious Activity Detection

### Monitored Patterns
- **SQL Injection**: `union select`, `drop table`, `delete from`, `insert into`
- **XSS Attempts**: `<script>`, `javascript:`, `onerror=`
- **Path Traversal**: `../`, `..\`

### Response Behavior
- **Logging Only**: Events are logged but requests are not blocked
- **Security Event Format**:
```json
{
  "timestamp": "2023-12-07T10:30:00.000Z",
  "type": "SUSPICIOUS_INPUT",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "path": "/api/endpoint",
  "method": "POST",
  "userId": "user123",
  "details": {
    "pattern": "pattern_detected",
    "input": "sanitized_input_sample"
  }
}
```

## Environment-Specific Behavior

### Development Mode
- **Rate Limits**: Very high limits (100k requests)
- **Localhost Exemption**: Complete bypass for `127.0.0.1`, `::1`, `localhost`
- **Asset Skipping**: Static assets bypass rate limiting
- **Logging**: Verbose security event logging

### Production Mode
- **Rate Limits**: Strict limits (1k requests, 5 auth attempts)
- **No Exemptions**: All IPs subject to rate limiting
- **Enhanced Validation**: Stricter input validation
- **Security Monitoring**: Integration ready for external systems

## Error Handling

### Validation Errors
```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR"
}
```

### File Upload Errors
```json
{
  "error": "Invalid file type. Only JPEG, PNG, and WebP images are allowed",
  "code": "INVALID_FILE_TYPE"
}
```

### Rate Limit Errors
```json
{
  "error": "Too many requests from this IP, please try again later",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 1640995200
}
```

## Testing Coverage

### Unit Tests
- Rate limiting configuration
- Environment-based behavior
- Error response formats
- Skip logic for development

### Integration Tests
- Complete middleware stack
- Security header presence
- Input sanitization effectiveness
- CORS handling

### E2E Tests
- Browser-based security header verification
- Real-world rate limiting behavior
- CSP enforcement
- Asset loading with security restrictions

## Best Practices

### Development
1. Use localhost for development to bypass rate limiting
2. Monitor security logs for suspicious patterns
3. Test with malicious input during development
4. Verify CSP compliance for new external resources

### Production
1. Monitor rate limit usage patterns
2. Set up external security monitoring
3. Regular security header audits
4. Review and update CSP policies

### Deployment
1. Environment variables for rate limit configuration
2. Separate CSP policies for development/production
3. Security header testing in CI/CD pipeline
4. Performance impact monitoring

## Configuration Options

### Environment Variables
```env
NODE_ENV=production|development
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=1000
AUTH_RATE_LIMIT_MAX=5
```

### CSP Customization
Modify `server/middleware/security.ts` to adjust CSP directives:
```typescript
contentSecurityPolicy: {
  directives: {
    connectSrc: ["'self'", "https://api.openai.com", "wss://localhost:*"]
  }
}
```

## Security Monitoring Integration

### Recommended External Services
- **Datadog**: Security event aggregation
- **Splunk**: Log analysis and alerting
- **Sentry**: Error tracking with security context
- **AWS CloudWatch**: Infrastructure-level monitoring

### Custom Integration Points
```typescript
// server/middleware/security.ts
export const logSecurityEvent = (eventType: string, details: any, req: Request) => {
  // TODO: Send to security monitoring system
  // Example: datadog.increment('security.event', 1, [`type:${eventType}`]);
};
```

## Troubleshooting

### Common Issues
1. **Rate limit hit during development**: Check localhost exemption
2. **CSP violations**: Add domains to appropriate directives
3. **File upload failures**: Verify MIME type and size limits
4. **Sanitization removing content**: Adjust allowed tags/attributes

### Debugging
- Enable verbose logging in development
- Check browser console for CSP violations
- Monitor network tab for rate limit headers
- Review security event logs

## Updates and Maintenance

### Regular Tasks
- [ ] Review and update CSP policies quarterly
- [ ] Audit rate limiting effectiveness monthly
- [ ] Update dependency versions for security patches
- [ ] Test security middleware with new features

### Security Patches
1. Monitor security advisories for used packages
2. Test security updates in staging environment
3. Document any configuration changes
4. Update this documentation with changes