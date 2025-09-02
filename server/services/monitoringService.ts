import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { Request, Response, NextFunction } from 'express';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags?: Record<string, string>;
}

interface ErrorMetric {
  error: Error;
  context: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

class MonitoringService {
  private static instance: MonitoringService;
  private metrics: PerformanceMetric[] = [];
  private errors: ErrorMetric[] = [];
  private isInitialized = false;

  private constructor() {}

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  // Initialize Sentry for production
  initializeSentry(dsn?: string) {
    if (!dsn && process.env.NODE_ENV === 'production') {
      console.warn('⚠️ Sentry DSN not provided for production environment');
      return;
    }

    if (dsn) {
      Sentry.init({
        dsn,
        integrations: [
          new Sentry.Integrations.Http({ tracing: true }),
          new Sentry.Integrations.Express(),
          new ProfilingIntegration()
        ],
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        environment: process.env.NODE_ENV || 'development',
        beforeSend(event, hint) {
          // Filter out sensitive data
          if (event.request) {
            delete event.request.cookies;
            delete event.request.headers?.authorization;
            delete event.request.headers?.cookie;
          }
          return event;
        }
      });

      this.isInitialized = true;
      console.log('✅ Sentry monitoring initialized');
    }
  }

  // Express middleware for Sentry
  getRequestHandler() {
    return Sentry.Handlers.requestHandler();
  }

  getTracingHandler() {
    return Sentry.Handlers.tracingHandler();
  }

  getErrorHandler() {
    return Sentry.Handlers.errorHandler();
  }

  // Track custom performance metrics
  trackPerformance(name: string, value: number, unit: string = 'ms', tags?: Record<string, string>) {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date(),
      tags
    };

    this.metrics.push(metric);

    // Keep only last 1000 metrics in memory
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Send to Sentry if initialized
    if (this.isInitialized) {
      const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();
      if (transaction) {
        transaction.setMeasurement(name, value, unit);
      }
    }

    // Log slow operations
    if (unit === 'ms' && value > 1000) {
      console.warn(`⚠️ Slow operation detected: ${name} took ${value}ms`);
    }
  }

  // Track API response times
  trackApiResponseTime() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        const route = req.route?.path || req.path;
        
        this.trackPerformance(`api.${req.method}.${route}`, duration, 'ms', {
          method: req.method,
          route,
          statusCode: String(res.statusCode)
        });

        // Log slow API calls
        if (duration > 500) {
          console.warn(`⚠️ Slow API call: ${req.method} ${route} took ${duration}ms`);
        }
      });

      next();
    };
  }

  // Track database query performance
  trackDatabaseQuery(queryName: string, duration: number, rowCount?: number) {
    this.trackPerformance(`db.query.${queryName}`, duration, 'ms', {
      rowCount: rowCount ? String(rowCount) : undefined
    });

    if (duration > 100) {
      console.warn(`⚠️ Slow database query: ${queryName} took ${duration}ms`);
    }
  }

  // Track cache performance
  trackCacheOperation(operation: 'hit' | 'miss' | 'set' | 'delete', key: string, duration?: number) {
    this.trackPerformance(`cache.${operation}`, duration || 0, 'ms', {
      key: key.substring(0, 50) // Truncate long keys
    });
  }

  // Track custom errors
  captureError(error: Error, context?: Record<string, any>, severity: ErrorMetric['severity'] = 'medium') {
    const errorMetric: ErrorMetric = {
      error,
      context: context || {},
      severity,
      timestamp: new Date()
    };

    this.errors.push(errorMetric);

    // Keep only last 100 errors in memory
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(-100);
    }

    // Send to Sentry if initialized
    if (this.isInitialized) {
      Sentry.withScope((scope) => {
        scope.setLevel(this.mapSeverityToSentryLevel(severity));
        scope.setContext('additional', context || {});
        Sentry.captureException(error);
      });
    }

    // Log critical errors
    if (severity === 'critical') {
      console.error('🚨 CRITICAL ERROR:', error, context);
    }
  }

  // Map internal severity to Sentry levels
  private mapSeverityToSentryLevel(severity: ErrorMetric['severity']): Sentry.SeverityLevel {
    switch (severity) {
      case 'low': return 'info';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'fatal';
      default: return 'error';
    }
  }

  // Track user actions
  trackUserAction(userId: string, action: string, metadata?: Record<string, any>) {
    if (this.isInitialized) {
      Sentry.addBreadcrumb({
        category: 'user',
        message: `User ${userId} performed ${action}`,
        level: 'info',
        data: metadata
      });
    }

    console.log(`📊 User action: ${userId} - ${action}`, metadata);
  }

  // Track business metrics
  trackBusinessMetric(metric: string, value: number, metadata?: Record<string, any>) {
    this.trackPerformance(`business.${metric}`, value, 'count', metadata);
    
    console.log(`💼 Business metric: ${metric} = ${value}`, metadata);
  }

  // Health check endpoint data
  getHealthMetrics() {
    const recentMetrics = this.metrics.slice(-100);
    const recentErrors = this.errors.slice(-10);

    // Calculate average response times
    const apiMetrics = recentMetrics.filter(m => m.name.startsWith('api.'));
    const avgApiResponseTime = apiMetrics.length > 0
      ? apiMetrics.reduce((sum, m) => sum + m.value, 0) / apiMetrics.length
      : 0;

    // Calculate database performance
    const dbMetrics = recentMetrics.filter(m => m.name.startsWith('db.'));
    const avgDbResponseTime = dbMetrics.length > 0
      ? dbMetrics.reduce((sum, m) => sum + m.value, 0) / dbMetrics.length
      : 0;

    // Calculate cache hit rate
    const cacheHits = recentMetrics.filter(m => m.name === 'cache.hit').length;
    const cacheMisses = recentMetrics.filter(m => m.name === 'cache.miss').length;
    const cacheHitRate = cacheHits + cacheMisses > 0
      ? (cacheHits / (cacheHits + cacheMisses)) * 100
      : 0;

    return {
      performance: {
        avgApiResponseTime: Math.round(avgApiResponseTime),
        avgDbResponseTime: Math.round(avgDbResponseTime),
        cacheHitRate: Math.round(cacheHitRate),
        totalMetrics: this.metrics.length
      },
      errors: {
        total: this.errors.length,
        recent: recentErrors.map(e => ({
          message: e.error.message,
          severity: e.severity,
          timestamp: e.timestamp
        }))
      },
      status: {
        monitoring: this.isInitialized ? 'active' : 'inactive',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
      }
    };
  }

  // Performance profiling middleware
  profilePerformance(label: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = process.hrtime.bigint();
      const startMemory = process.memoryUsage();

      res.on('finish', () => {
        const endTime = process.hrtime.bigint();
        const endMemory = process.memoryUsage();

        const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
        const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;

        this.trackPerformance(`profile.${label}.time`, duration, 'ms');
        this.trackPerformance(`profile.${label}.memory`, memoryDelta, 'bytes');

        if (duration > 1000) {
          console.warn(`⚠️ Performance warning: ${label} took ${duration}ms`);
        }

        if (memoryDelta > 10 * 1024 * 1024) { // 10MB
          console.warn(`⚠️ Memory warning: ${label} used ${(memoryDelta / 1024 / 1024).toFixed(2)}MB`);
        }
      });

      next();
    };
  }

  // Custom alerts
  sendAlert(message: string, severity: 'info' | 'warning' | 'error' | 'critical', metadata?: Record<string, any>) {
    const alert = {
      message,
      severity,
      metadata,
      timestamp: new Date().toISOString()
    };

    // Log locally
    switch (severity) {
      case 'info':
        console.log(`ℹ️ Alert: ${message}`, metadata);
        break;
      case 'warning':
        console.warn(`⚠️ Alert: ${message}`, metadata);
        break;
      case 'error':
        console.error(`❌ Alert: ${message}`, metadata);
        break;
      case 'critical':
        console.error(`🚨 CRITICAL ALERT: ${message}`, metadata);
        break;
    }

    // Send to Sentry if initialized
    if (this.isInitialized && (severity === 'error' || severity === 'critical')) {
      Sentry.captureMessage(message, this.mapSeverityToSentryLevel(severity as any));
    }

    // TODO: Integrate with PagerDuty, Slack, or email for critical alerts
  }

  // Database connection monitoring
  monitorDatabaseConnection(isConnected: boolean, latency?: number) {
    if (!isConnected) {
      this.sendAlert('Database connection lost', 'critical', {
        timestamp: new Date().toISOString()
      });
    } else if (latency && latency > 1000) {
      this.sendAlert('Database latency high', 'warning', {
        latency,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Redis connection monitoring
  monitorRedisConnection(isConnected: boolean, latency?: number) {
    if (!isConnected) {
      this.sendAlert('Redis connection lost', 'warning', {
        timestamp: new Date().toISOString()
      });
    } else if (latency && latency > 100) {
      this.sendAlert('Redis latency high', 'warning', {
        latency,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Clean up old metrics periodically
  startMetricsCleanup(intervalMs: number = 3600000) { // Default 1 hour
    setInterval(() => {
      const oneHourAgo = new Date(Date.now() - 3600000);
      
      // Clean up old metrics
      this.metrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
      
      // Clean up old errors
      const oneDayAgo = new Date(Date.now() - 86400000);
      this.errors = this.errors.filter(e => e.timestamp > oneDayAgo);
      
      console.log('🧹 Cleaned up old monitoring data');
    }, intervalMs);
  }
}

// Export singleton instance
export const monitoringService = MonitoringService.getInstance();

// Export middleware functions
export const trackApiResponseTime = monitoringService.trackApiResponseTime.bind(monitoringService);
export const profilePerformance = monitoringService.profilePerformance.bind(monitoringService);

// Helper function for async error handling
export function asyncErrorHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      monitoringService.captureError(error, {
        path: req.path,
        method: req.method,
        ip: req.ip
      }, 'high');
      next(error);
    });
  };
}

export default monitoringService;