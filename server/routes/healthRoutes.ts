// server/routes/healthRoutes.ts
import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { users } from '../../shared/schema.js';

const router = Router();

// Basic health check - minimal response for load balancers
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Readiness check - includes dependency checks
router.get('/ready', async (req: Request, res: Response) => {
  const health = {
    status: 'ready',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      openai: 'unknown',
      s3: 'unknown'
    },
    performance: {
      uptime: Math.floor(process.uptime()),
      memory: process.memoryUsage(),
      pid: process.pid
    }
  };

  let overallStatus = 'ready';
  const timeout = parseInt(process.env.HEALTH_CHECK_DB_TIMEOUT || '5000', 10);

  try {
    // Test database connection with timeout
    const dbCheck = new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error('Database timeout')), timeout);
      db.select().from(users).limit(1).then(resolve).catch(reject);
    });
    
    await dbCheck;
    health.services.database = 'healthy';
  } catch (error) {
    health.services.database = 'unhealthy';
    overallStatus = 'degraded';
    console.error('Health check database error:', error);
  }

  // Test OpenAI API availability (optional)
  if (process.env.OPENAI_API_KEY) {
    try {
      // Simple check - just verify API key format
      if (process.env.OPENAI_API_KEY.startsWith('sk-')) {
        health.services.openai = 'configured';
      } else {
        health.services.openai = 'misconfigured';
        overallStatus = 'degraded';
      }
    } catch (error) {
      health.services.openai = 'error';
      overallStatus = 'degraded';
    }
  } else {
    health.services.openai = 'not_configured';
  }

  // Test AWS S3 configuration (optional)
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_S3_BUCKET_NAME) {
    health.services.s3 = 'configured';
  } else {
    health.services.s3 = 'not_configured';
  }

  health.status = overallStatus;
  const statusCode = overallStatus === 'ready' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Liveness check - verifies app is responsive (for Kubernetes/Docker)
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    pid: process.pid
  });
});

// Detailed health check - comprehensive system status
router.get('/health/detailed', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'unknown',
    services: {
      database: { status: 'unknown', responseTime: 0 },
      openai: { status: 'unknown', configured: false },
      email: { status: 'unknown', configured: false },
      s3: { status: 'unknown', configured: false }
    },
    system: {
      uptime: Math.floor(process.uptime()),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      pid: process.pid,
      platform: process.platform,
      nodeVersion: process.version
    },
    build: {
      version: process.env.BUILD_VERSION || 'development',
      commit: process.env.BUILD_COMMIT || 'unknown',
      date: process.env.BUILD_DATE || 'unknown'
    }
  };

  let overallStatus = 'healthy';

  // Database health check with timing
  try {
    const dbStart = Date.now();
    await db.select().from(users).limit(1);
    health.services.database = {
      status: 'healthy',
      responseTime: Date.now() - dbStart
    };
  } catch (error) {
    health.services.database = {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    overallStatus = 'degraded';
  }

  // OpenAI service check
  health.services.openai = {
    status: process.env.OPENAI_API_KEY ? 'configured' : 'not_configured',
    configured: !!process.env.OPENAI_API_KEY
  };

  // Email service check
  health.services.email = {
    status: (process.env.EMAIL_HOST || process.env.RESEND_API_KEY) ? 'configured' : 'not_configured',
    configured: !!(process.env.EMAIL_HOST || process.env.RESEND_API_KEY)
  };

  // S3 service check
  health.services.s3 = {
    status: (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_S3_BUCKET_NAME) ? 'configured' : 'not_configured',
    configured: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_S3_BUCKET_NAME)
  };

  health.status = overallStatus;
  const responseTime = Date.now() - startTime;
  
  const statusCode = overallStatus === 'healthy' ? 200 : 503;
  res.status(statusCode).json({
    ...health,
    meta: {
      responseTime,
      timestamp: new Date().toISOString()
    }
  });
});

// Metrics endpoint for monitoring systems (Prometheus-compatible)
router.get('/metrics', (req: Request, res: Response) => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  const metrics = [
    `# HELP process_uptime_seconds Process uptime in seconds`,
    `# TYPE process_uptime_seconds counter`,
    `process_uptime_seconds ${Math.floor(process.uptime())}`,
    ``,
    `# HELP process_memory_usage_bytes Process memory usage in bytes`,
    `# TYPE process_memory_usage_bytes gauge`,
    `process_memory_usage_bytes{type="rss"} ${memUsage.rss}`,
    `process_memory_usage_bytes{type="heapTotal"} ${memUsage.heapTotal}`,
    `process_memory_usage_bytes{type="heapUsed"} ${memUsage.heapUsed}`,
    `process_memory_usage_bytes{type="external"} ${memUsage.external}`,
    ``,
    `# HELP process_cpu_usage_microseconds Process CPU usage in microseconds`,
    `# TYPE process_cpu_usage_microseconds counter`,
    `process_cpu_usage_microseconds{type="user"} ${cpuUsage.user}`,
    `process_cpu_usage_microseconds{type="system"} ${cpuUsage.system}`,
    ``,
    `# HELP healthprotocol_info Application information`,
    `# TYPE healthprotocol_info gauge`,
    `healthprotocol_info{version="${process.env.npm_package_version || '1.0.0'}",environment="${process.env.NODE_ENV || 'unknown'}"} 1`
  ].join('\n');

  res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
  res.status(200).send(metrics);
});

export default router;