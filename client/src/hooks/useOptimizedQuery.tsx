import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useCallback, useRef, useEffect } from 'react';
import { useToast } from './use-toast';
import { useAuth } from '../contexts/AuthContext';

interface CacheConfig {
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  retry?: number | boolean;
}

const DEFAULT_CACHE_CONFIG: CacheConfig = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  retry: 1
};

interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
  timeout?: number;
}

// Performance tracking
class PerformanceTracker {
  private static instance: PerformanceTracker;
  private metrics: Map<string, number[]> = new Map();

  static getInstance() {
    if (!this.instance) {
      this.instance = new PerformanceTracker();
    }
    return this.instance;
  }

  track(endpoint: string, duration: number) {
    const existing = this.metrics.get(endpoint) || [];
    existing.push(duration);
    // Keep only last 100 measurements
    if (existing.length > 100) {
      existing.shift();
    }
    this.metrics.set(endpoint, existing);
  }

  getAverage(endpoint: string): number {
    const measurements = this.metrics.get(endpoint) || [];
    if (measurements.length === 0) return 0;
    return measurements.reduce((a, b) => a + b, 0) / measurements.length;
  }

  getP95(endpoint: string): number {
    const measurements = this.metrics.get(endpoint) || [];
    if (measurements.length === 0) return 0;
    const sorted = [...measurements].sort((a, b) => a - b);
    const index = Math.floor(sorted.length * 0.95);
    return sorted[index] || 0;
  }
}

// Request deduplication
class RequestDeduplicator {
  private static instance: RequestDeduplicator;
  private pending: Map<string, Promise<any>> = new Map();

  static getInstance() {
    if (!this.instance) {
      this.instance = new RequestDeduplicator();
    }
    return this.instance;
  }

  async deduplicate<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const existing = this.pending.get(key);
    if (existing) {
      return existing;
    }

    const promise = fn().finally(() => {
      this.pending.delete(key);
    });

    this.pending.set(key, promise);
    return promise;
  }
}

// Optimized fetch with timeout and error handling
async function optimizedFetch(
  url: string,
  options: RequestOptions = {}
): Promise<Response> {
  const { timeout = 30000, params, ...fetchOptions } = options;

  // Add query params if provided
  let finalUrl = url;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      finalUrl += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const startTime = performance.now();
    const response = await fetch(finalUrl, {
      ...fetchOptions,
      signal: controller.signal,
      credentials: 'include'
    });

    const duration = performance.now() - startTime;
    PerformanceTracker.getInstance().track(url, duration);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Main hook for optimized data fetching
export function useOptimizedQuery<T = any>(
  key: string | string[],
  endpoint: string,
  options?: RequestOptions & {
    cacheConfig?: CacheConfig;
    transform?: (data: any) => T;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    enabled?: boolean;
  }
) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const deduplicator = RequestDeduplicator.getInstance();

  const {
    cacheConfig = DEFAULT_CACHE_CONFIG,
    transform,
    onSuccess,
    onError,
    enabled = true,
    ...requestOptions
  } = options || {};

  const queryKey = Array.isArray(key) ? key : [key];
  const cacheKey = queryKey.join(':');

  const fetchData = useCallback(async () => {
    return deduplicator.deduplicate(cacheKey, async () => {
      try {
        const response = await optimizedFetch(endpoint, requestOptions);
        const data = await response.json();
        return transform ? transform(data) : data;
      } catch (error) {
        console.error(`Query error for ${endpoint}:`, error);
        throw error;
      }
    });
  }, [endpoint, cacheKey, transform, JSON.stringify(requestOptions)]);

  return useQuery<T>({
    queryKey,
    queryFn: fetchData,
    enabled: enabled && !!user,
    ...cacheConfig,
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      onError?.(error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch data',
        variant: 'destructive'
      });
    }
  } as UseQueryOptions<T>);
}

// Optimized mutation hook
export function useOptimizedMutation<TData = any, TVariables = any>(
  endpoint: string,
  options?: {
    method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    invalidateKeys?: string[];
    onSuccess?: (data: TData) => void;
    onError?: (error: Error) => void;
    optimisticUpdate?: (variables: TVariables) => void;
  }
) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController>();

  const {
    method = 'POST',
    invalidateKeys = [],
    onSuccess,
    onError,
    optimisticUpdate
  } = options || {};

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      // Cancel any in-flight requests
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      // Optimistic update
      if (optimisticUpdate) {
        optimisticUpdate(variables);
      }

      const response = await optimizedFetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(variables),
        signal: abortControllerRef.current.signal
      });

      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate related queries
      invalidateKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });

      onSuccess?.(data);
      
      toast({
        title: 'Success',
        description: 'Operation completed successfully'
      });
    },
    onError: (error) => {
      onError?.(error);
      
      toast({
        title: 'Error',
        description: error.message || 'Operation failed',
        variant: 'destructive'
      });
    }
  } as UseMutationOptions<TData, Error, TVariables>);
}

// Batch request hook for multiple operations
export function useBatchRequest<T = any>(
  requests: Array<{
    key: string;
    endpoint: string;
    options?: RequestOptions;
  }>,
  enabled = true
) {
  const results = useQuery({
    queryKey: ['batch', ...requests.map(r => r.key)],
    queryFn: async () => {
      const promises = requests.map(({ endpoint, options }) =>
        optimizedFetch(endpoint, options).then(r => r.json())
      );
      
      const results = await Promise.allSettled(promises);
      
      return results.map((result, index) => ({
        key: requests[index].key,
        data: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason : null
      }));
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000
  });

  return results;
}

// Performance metrics hook
export function usePerformanceMetrics() {
  const tracker = PerformanceTracker.getInstance();

  return {
    getAverage: (endpoint: string) => tracker.getAverage(endpoint),
    getP95: (endpoint: string) => tracker.getP95(endpoint)
  };
}