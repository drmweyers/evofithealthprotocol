import Redis from 'ioredis';
import { createHash } from 'crypto';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Tags for cache invalidation
  compress?: boolean; // Compress large values
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
}

class CacheService {
  private static instance: CacheService;
  private redis: Redis | null = null;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0
  };
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  private constructor() {
    this.initializeRedis();
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private initializeRedis() {
    try {
      this.redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
        retryStrategy: (times: number) => {
          if (times > this.maxReconnectAttempts) {
            console.error('Redis: Max reconnection attempts reached');
            return null;
          }
          const delay = Math.min(times * 1000, 5000);
          return delay;
        },
        enableOfflineQueue: true,
        lazyConnect: true
      });

      this.redis.on('connect', () => {
        console.log('Redis: Connected successfully');
        this.isConnected = true;
        this.reconnectAttempts = 0;
      });

      this.redis.on('error', (error) => {
        console.error('Redis error:', error);
        this.stats.errors++;
        this.isConnected = false;
      });

      this.redis.on('close', () => {
        console.log('Redis: Connection closed');
        this.isConnected = false;
      });

      this.redis.on('reconnecting', () => {
        this.reconnectAttempts++;
        console.log(`Redis: Reconnecting... (attempt ${this.reconnectAttempts})`);
      });

      // Attempt to connect
      this.redis.connect().catch((error) => {
        console.error('Redis: Initial connection failed:', error);
        this.isConnected = false;
      });
    } catch (error) {
      console.error('Redis: Failed to initialize:', error);
      this.redis = null;
      this.isConnected = false;
    }
  }

  // Generate cache key with namespace
  private generateKey(key: string, namespace?: string): string {
    const prefix = namespace || 'app';
    return `${prefix}:${key}`;
  }

  // Hash function for consistent key generation
  private hashKey(data: any): string {
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    return createHash('md5').update(str).digest('hex');
  }

  // Compress data if needed
  private compress(data: string): string {
    // For now, just return the data
    // In production, use zlib or similar
    return data;
  }

  // Decompress data if needed
  private decompress(data: string): string {
    // For now, just return the data
    // In production, use zlib or similar
    return data;
  }

  // Get value from cache
  async get<T>(key: string, namespace?: string): Promise<T | null> {
    if (!this.isConnected || !this.redis) {
      return null;
    }

    try {
      const fullKey = this.generateKey(key, namespace);
      const value = await this.redis.get(fullKey);

      if (value) {
        this.stats.hits++;
        const decompressed = this.decompress(value);
        return JSON.parse(decompressed);
      }

      this.stats.misses++;
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      this.stats.errors++;
      return null;
    }
  }

  // Set value in cache
  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {},
    namespace?: string
  ): Promise<boolean> {
    if (!this.isConnected || !this.redis) {
      return false;
    }

    try {
      const fullKey = this.generateKey(key, namespace);
      const serialized = JSON.stringify(value);
      const compressed = options.compress ? this.compress(serialized) : serialized;
      
      const ttl = options.ttl || 3600; // Default 1 hour

      if (ttl > 0) {
        await this.redis.setex(fullKey, ttl, compressed);
      } else {
        await this.redis.set(fullKey, compressed);
      }

      // Handle tags for grouped invalidation
      if (options.tags && options.tags.length > 0) {
        for (const tag of options.tags) {
          await this.redis.sadd(`tag:${tag}`, fullKey);
        }
      }

      this.stats.sets++;
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      this.stats.errors++;
      return false;
    }
  }

  // Delete value from cache
  async delete(key: string, namespace?: string): Promise<boolean> {
    if (!this.isConnected || !this.redis) {
      return false;
    }

    try {
      const fullKey = this.generateKey(key, namespace);
      const result = await this.redis.del(fullKey);
      this.stats.deletes++;
      return result > 0;
    } catch (error) {
      console.error('Cache delete error:', error);
      this.stats.errors++;
      return false;
    }
  }

  // Delete all keys with a specific tag
  async invalidateTag(tag: string): Promise<number> {
    if (!this.isConnected || !this.redis) {
      return 0;
    }

    try {
      const keys = await this.redis.smembers(`tag:${tag}`);
      if (keys.length === 0) {
        return 0;
      }

      const pipeline = this.redis.pipeline();
      keys.forEach(key => pipeline.del(key));
      pipeline.del(`tag:${tag}`);
      
      const results = await pipeline.exec();
      this.stats.deletes += keys.length;
      
      return keys.length;
    } catch (error) {
      console.error('Cache invalidate tag error:', error);
      this.stats.errors++;
      return 0;
    }
  }

  // Clear all cache
  async flush(): Promise<boolean> {
    if (!this.isConnected || !this.redis) {
      return false;
    }

    try {
      await this.redis.flushdb();
      return true;
    } catch (error) {
      console.error('Cache flush error:', error);
      this.stats.errors++;
      return false;
    }
  }

  // Get or set cache (fetch if not exists)
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {},
    namespace?: string
  ): Promise<T | null> {
    // Try to get from cache first
    const cached = await this.get<T>(key, namespace);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    try {
      const freshData = await fetcher();
      await this.set(key, freshData, options, namespace);
      return freshData;
    } catch (error) {
      console.error('Cache getOrSet error:', error);
      return null;
    }
  }

  // Batch get multiple keys
  async mget<T>(keys: string[], namespace?: string): Promise<(T | null)[]> {
    if (!this.isConnected || !this.redis) {
      return keys.map(() => null);
    }

    try {
      const fullKeys = keys.map(key => this.generateKey(key, namespace));
      const values = await this.redis.mget(...fullKeys);
      
      return values.map(value => {
        if (value) {
          this.stats.hits++;
          const decompressed = this.decompress(value);
          return JSON.parse(decompressed);
        }
        this.stats.misses++;
        return null;
      });
    } catch (error) {
      console.error('Cache mget error:', error);
      this.stats.errors++;
      return keys.map(() => null);
    }
  }

  // Batch set multiple keys
  async mset<T>(
    items: Array<{ key: string; value: T }>,
    options: CacheOptions = {},
    namespace?: string
  ): Promise<boolean> {
    if (!this.isConnected || !this.redis) {
      return false;
    }

    try {
      const pipeline = this.redis.pipeline();
      const ttl = options.ttl || 3600;

      for (const item of items) {
        const fullKey = this.generateKey(item.key, namespace);
        const serialized = JSON.stringify(item.value);
        const compressed = options.compress ? this.compress(serialized) : serialized;
        
        if (ttl > 0) {
          pipeline.setex(fullKey, ttl, compressed);
        } else {
          pipeline.set(fullKey, compressed);
        }
      }

      await pipeline.exec();
      this.stats.sets += items.length;
      return true;
    } catch (error) {
      console.error('Cache mset error:', error);
      this.stats.errors++;
      return false;
    }
  }

  // Get cache statistics
  getStats(): CacheStats {
    return { ...this.stats };
  }

  // Reset statistics
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0
    };
  }

  // Check if cache is available
  isAvailable(): boolean {
    return this.isConnected && this.redis !== null;
  }

  // Close Redis connection
  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
      this.isConnected = false;
    }
  }
}

// Export singleton instance
export const cacheService = CacheService.getInstance();

// Cache decorators for class methods
export function Cacheable(options: CacheOptions & { keyGenerator?: (...args: any[]) => string } = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cache = CacheService.getInstance();
      
      // Generate cache key
      const key = options.keyGenerator 
        ? options.keyGenerator(...args)
        : `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;

      // Try to get from cache
      const cached = await cache.get(key);
      if (cached !== null) {
        return cached;
      }

      // Execute original method
      const result = await originalMethod.apply(this, args);
      
      // Store in cache
      await cache.set(key, result, options);
      
      return result;
    };

    return descriptor;
  };
}

// Cache invalidation decorator
export function CacheInvalidate(tags: string[]) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cache = CacheService.getInstance();
      
      // Execute original method
      const result = await originalMethod.apply(this, args);
      
      // Invalidate cache tags
      for (const tag of tags) {
        await cache.invalidateTag(tag);
      }
      
      return result;
    };

    return descriptor;
  };
}