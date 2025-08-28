declare namespace Express {
  export interface Request {
    user?: {
      id: string;
      role: 'admin' | 'trainer' | 'customer';
    };
    session?: any;
    rateLimit?: {
      limit: number;
      current: number;
      remaining: number;
      resetTime?: number;
    };
  }
} 