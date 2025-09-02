import { Request, Response, NextFunction } from 'express';
import compression from 'compression';
import etag from 'etag';
import crypto from 'crypto';

// Response compression middleware
export const responseCompression = compression({
  // Enable compression for responses larger than 1KB
  threshold: 1024,
  // Compression level (1-9, higher = better compression but slower)
  level: 6,
  // Custom filter to determine if response should be compressed
  filter: (req: Request, res: Response) => {
    // Don't compress for IE6
    if (req.headers['user-agent']?.indexOf('MSIE 6') !== -1) {
      return false;
    }

    // Fallback to standard filter function
    return compression.filter(req, res);
  }
});

// ETag generation for cache validation
export const generateETag = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  
  res.send = function(body: any) {
    // Generate ETag for successful responses
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
      const hash = etag(bodyString);
      
      res.setHeader('ETag', hash);
      
      // Check if client has matching ETag
      const clientETag = req.headers['if-none-match'];
      if (clientETag === hash) {
        res.status(304).end();
        return res;
      }
    }
    
    return originalSend.call(this, body);
  } as any;
  
  next();
};

// Response time header
export const responseTimeHeader = (req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime.bigint();
  
  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const responseTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    res.setHeader('X-Response-Time', `${responseTime.toFixed(2)}ms`);
  });
  
  next();
};

// Pagination optimization
export const paginationOptimizer = (req: Request, res: Response, next: NextFunction) => {
  // Set default and maximum limits
  const DEFAULT_LIMIT = 20;
  const MAX_LIMIT = 100;
  
  // Parse pagination parameters
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const requestedLimit = parseInt(req.query.limit as string) || DEFAULT_LIMIT;
  const limit = Math.min(requestedLimit, MAX_LIMIT);
  const offset = (page - 1) * limit;
  
  // Attach to request for use in controllers
  (req as any).pagination = {
    page,
    limit,
    offset
  };
  
  // Add pagination helper to response
  (res as any).sendPaginated = function(data: any[], total: number) {
    const totalPages = Math.ceil(total / limit);
    
    res.setHeader('X-Total-Count', total.toString());
    res.setHeader('X-Page-Count', totalPages.toString());
    res.setHeader('X-Current-Page', page.toString());
    res.setHeader('X-Per-Page', limit.toString());
    
    // Add Link header for API navigation
    const links: string[] = [];
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
    
    if (page > 1) {
      links.push(`<${baseUrl}?page=1&limit=${limit}>; rel="first"`);
      links.push(`<${baseUrl}?page=${page - 1}&limit=${limit}>; rel="prev"`);
    }
    
    if (page < totalPages) {
      links.push(`<${baseUrl}?page=${page + 1}&limit=${limit}>; rel="next"`);
      links.push(`<${baseUrl}?page=${totalPages}&limit=${limit}>; rel="last"`);
    }
    
    if (links.length > 0) {
      res.setHeader('Link', links.join(', '));
    }
    
    res.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  };
  
  next();
};

// JSON optimization with selective field inclusion
export const fieldSelector = (req: Request, res: Response, next: NextFunction) => {
  const fields = req.query.fields as string;
  
  if (fields) {
    const fieldList = fields.split(',').map(f => f.trim());
    (req as any).selectedFields = fieldList;
    
    // Helper function to filter object fields
    (res as any).sendFiltered = function(data: any) {
      const filterFields = (obj: any): any => {
        if (Array.isArray(obj)) {
          return obj.map(filterFields);
        }
        
        if (obj && typeof obj === 'object') {
          const filtered: any = {};
          fieldList.forEach(field => {
            if (field.includes('.')) {
              // Handle nested fields
              const [parent, child] = field.split('.');
              if (obj[parent]) {
                if (!filtered[parent]) filtered[parent] = {};
                filtered[parent][child] = obj[parent][child];
              }
            } else if (obj.hasOwnProperty(field)) {
              filtered[field] = obj[field];
            }
          });
          return filtered;
        }
        
        return obj;
      };
      
      res.json(filterFields(data));
    };
  }
  
  next();
};

// Cache control headers
export const cacheControl = (options: {
  public?: boolean;
  private?: boolean;
  maxAge?: number;
  mustRevalidate?: boolean;
  noCache?: boolean;
  noStore?: boolean;
} = {}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const directives: string[] = [];
    
    if (options.public) directives.push('public');
    if (options.private) directives.push('private');
    if (options.noCache) directives.push('no-cache');
    if (options.noStore) directives.push('no-store');
    if (options.mustRevalidate) directives.push('must-revalidate');
    if (options.maxAge !== undefined) directives.push(`max-age=${options.maxAge}`);
    
    if (directives.length > 0) {
      res.setHeader('Cache-Control', directives.join(', '));
    }
    
    next();
  };
};

// Conditional request handling
export const conditionalRequests = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  
  res.json = function(body: any) {
    // Generate content hash for conditional requests
    const content = JSON.stringify(body);
    const hash = crypto.createHash('md5').update(content).digest('hex');
    const lastModified = new Date().toUTCString();
    
    res.setHeader('Last-Modified', lastModified);
    res.setHeader('ETag', `"${hash}"`);
    
    // Check If-Modified-Since
    const ifModifiedSince = req.headers['if-modified-since'];
    if (ifModifiedSince && new Date(ifModifiedSince) >= new Date(lastModified)) {
      res.status(304).end();
      return res;
    }
    
    // Check If-None-Match
    const ifNoneMatch = req.headers['if-none-match'];
    if (ifNoneMatch && ifNoneMatch === `"${hash}"`) {
      res.status(304).end();
      return res;
    }
    
    return originalJson.call(this, body);
  } as any;
  
  next();
};

// Query optimization hints
export const queryOptimizationHints = (req: Request, res: Response, next: NextFunction) => {
  // Parse include/exclude parameters for eager loading
  const include = req.query.include as string;
  const exclude = req.query.exclude as string;
  const sort = req.query.sort as string;
  
  (req as any).queryHints = {
    include: include ? include.split(',').map(i => i.trim()) : [],
    exclude: exclude ? exclude.split(',').map(e => e.trim()) : [],
    sort: sort ? parseSort(sort) : null
  };
  
  function parseSort(sortString: string) {
    const sorts = sortString.split(',').map(s => {
      const trimmed = s.trim();
      const descending = trimmed.startsWith('-');
      const field = descending ? trimmed.substring(1) : trimmed;
      return { field, order: descending ? 'DESC' : 'ASC' };
    });
    return sorts;
  }
  
  next();
};

// Response streaming for large datasets
export const streamLargeResponses = (req: Request, res: Response, next: NextFunction) => {
  (res as any).streamJson = function(data: any[], options: { batchSize?: number } = {}) {
    const { batchSize = 100 } = options;
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');
    
    res.write('[');
    
    let first = true;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      batch.forEach(item => {
        if (!first) res.write(',');
        res.write(JSON.stringify(item));
        first = false;
      });
    }
    
    res.write(']');
    res.end();
  };
  
  next();
};

// API versioning middleware
export const apiVersioning = (req: Request, res: Response, next: NextFunction) => {
  // Get version from header or URL
  const versionHeader = req.headers['api-version'] as string;
  const versionQuery = req.query.v as string;
  const versionUrl = req.path.match(/^\/v(\d+)\//)?.[1];
  
  const version = versionHeader || versionQuery || versionUrl || '1';
  
  (req as any).apiVersion = version;
  res.setHeader('API-Version', version);
  
  // Version deprecation warnings
  if (version === '1') {
    res.setHeader('Deprecation', 'true');
    res.setHeader('Sunset', '2025-01-01');
    res.setHeader('Link', '</api/v2>; rel="successor-version"');
  }
  
  next();
};

// Request ID for tracing
export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const id = req.headers['x-request-id'] as string || crypto.randomUUID();
  
  (req as any).id = id;
  res.setHeader('X-Request-Id', id);
  
  next();
};

// Combined optimization middleware
export const applyApiOptimizations = [
  responseCompression,
  responseTimeHeader,
  requestId,
  paginationOptimizer,
  fieldSelector,
  queryOptimizationHints,
  conditionalRequests,
  apiVersioning
];

export default {
  responseCompression,
  generateETag,
  responseTimeHeader,
  paginationOptimizer,
  fieldSelector,
  cacheControl,
  conditionalRequests,
  queryOptimizationHints,
  streamLargeResponses,
  apiVersioning,
  requestId,
  applyApiOptimizations
};