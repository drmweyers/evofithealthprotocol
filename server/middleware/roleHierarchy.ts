/**
 * Role Hierarchy and Access Control System
 * 
 * Implements a hierarchical role system where:
 * - Admin: Full access to all features and can act as any role
 * - Trainer: Can access their own features and manage assigned customers
 * - Customer: Can access their own data and resources shared by their trainer
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { users, protocolAssignments } from '../../shared/schema';
import { eq, and, or } from 'drizzle-orm';
import { requireAuth } from './auth';

/**
 * Role hierarchy definition
 * Higher numbers have more privileges
 */
export const ROLE_HIERARCHY = {
  admin: 3,
  trainer: 2,
  customer: 1
} as const;

/**
 * Extended request interface with role context
 */
declare global {
  namespace Express {
    interface Request {
      roleContext?: {
        actualRole: 'admin' | 'trainer' | 'customer';
        effectiveRole: 'admin' | 'trainer' | 'customer';
        canAccessRole: (role: 'admin' | 'trainer' | 'customer') => boolean;
        isActingAs: boolean;
        assignedCustomers?: string[]; // For trainers
        assignedTrainer?: string; // For customers
      };
    }
  }
}

/**
 * Check if a user has a trainer-customer relationship
 */
async function getTrainerCustomerRelationship(trainerId: string, customerId: string): Promise<boolean> {
  try {
    const assignments = await db
      .select()
      .from(protocolAssignments)
      .where(
        and(
          eq(protocolAssignments.trainerId, trainerId),
          eq(protocolAssignments.customerId, customerId)
        )
      )
      .limit(1);
    
    return assignments.length > 0;
  } catch (error) {
    console.error('Error checking trainer-customer relationship:', error);
    return false;
  }
}

/**
 * Get all customers assigned to a trainer
 */
async function getTrainerCustomers(trainerId: string): Promise<string[]> {
  try {
    const assignments = await db
      .select({ customerId: protocolAssignments.customerId })
      .from(protocolAssignments)
      .where(eq(protocolAssignments.trainerId, trainerId));
    
    return [...new Set(assignments.map(a => a.customerId))];
  } catch (error) {
    console.error('Error fetching trainer customers:', error);
    return [];
  }
}

/**
 * Get the trainer assigned to a customer
 */
async function getCustomerTrainer(customerId: string): Promise<string | null> {
  try {
    const assignment = await db
      .select({ trainerId: protocolAssignments.trainerId })
      .from(protocolAssignments)
      .where(eq(protocolAssignments.customerId, customerId))
      .limit(1);
    
    return assignment[0]?.trainerId || null;
  } catch (error) {
    console.error('Error fetching customer trainer:', error);
    return null;
  }
}

/**
 * Enhanced authentication middleware with role hierarchy
 */
export const requireAuthWithHierarchy = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  await requireAuth(req, res, async () => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Set up role context
    req.roleContext = {
      actualRole: req.user.role,
      effectiveRole: req.user.role,
      canAccessRole: (role: 'admin' | 'trainer' | 'customer') => {
        const userLevel = ROLE_HIERARCHY[req.user!.role];
        const requiredLevel = ROLE_HIERARCHY[role];
        return userLevel >= requiredLevel;
      },
      isActingAs: false
    };

    // Load relationship data based on role
    if (req.user.role === 'trainer') {
      req.roleContext.assignedCustomers = await getTrainerCustomers(req.user.id);
    } else if (req.user.role === 'customer') {
      const trainerId = await getCustomerTrainer(req.user.id);
      if (trainerId) {
        req.roleContext.assignedTrainer = trainerId;
      }
    }

    next();
  });
};

/**
 * Middleware to allow admins to act as other roles
 */
export const allowRoleImpersonation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Check for impersonation header
  const impersonateRole = req.headers['x-impersonate-role'] as string;
  
  if (impersonateRole && req.user?.role === 'admin') {
    if (['admin', 'trainer', 'customer'].includes(impersonateRole)) {
      req.roleContext = {
        ...req.roleContext!,
        effectiveRole: impersonateRole as 'admin' | 'trainer' | 'customer',
        isActingAs: true
      };
    }
  }
  
  next();
};

/**
 * Check if user can access customer data
 */
export const canAccessCustomerData = (customerId: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await requireAuthWithHierarchy(req, res, async () => {
      if (!req.user || !req.roleContext) {
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      // Admin can access all customer data
      if (req.roleContext.actualRole === 'admin') {
        return next();
      }

      // Customer can only access their own data
      if (req.roleContext.actualRole === 'customer') {
        if (req.user.id !== customerId) {
          return res.status(403).json({ 
            error: 'Access denied to this customer data',
            code: 'CUSTOMER_ACCESS_DENIED'
          });
        }
        return next();
      }

      // Trainer can access their assigned customers
      if (req.roleContext.actualRole === 'trainer') {
        const hasRelationship = await getTrainerCustomerRelationship(req.user.id, customerId);
        if (!hasRelationship) {
          return res.status(403).json({ 
            error: 'Access denied - customer not assigned to you',
            code: 'NOT_ASSIGNED_CUSTOMER'
          });
        }
        return next();
      }

      return res.status(403).json({ 
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    });
  };
};

/**
 * Check if user can access trainer data
 */
export const canAccessTrainerData = (trainerId: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await requireAuthWithHierarchy(req, res, async () => {
      if (!req.user || !req.roleContext) {
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      // Admin can access all trainer data
      if (req.roleContext.actualRole === 'admin') {
        return next();
      }

      // Trainer can only access their own data
      if (req.roleContext.actualRole === 'trainer') {
        if (req.user.id !== trainerId) {
          return res.status(403).json({ 
            error: 'Access denied to other trainer data',
            code: 'TRAINER_ACCESS_DENIED'
          });
        }
        return next();
      }

      // Customer can access their assigned trainer's limited data
      if (req.roleContext.actualRole === 'customer') {
        if (req.roleContext.assignedTrainer !== trainerId) {
          return res.status(403).json({ 
            error: 'Access denied - not your assigned trainer',
            code: 'NOT_ASSIGNED_TRAINER'
          });
        }
        // Customer gets limited access - handle in route
        req.roleContext.effectiveRole = 'customer'; // Ensure limited access
        return next();
      }

      return res.status(403).json({ 
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    });
  };
};

/**
 * Require specific role with hierarchy support
 */
export const requireRoleWithHierarchy = (minRole: 'admin' | 'trainer' | 'customer') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await requireAuthWithHierarchy(req, res, () => {
      if (!req.roleContext) {
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      if (!req.roleContext.canAccessRole(minRole)) {
        return res.status(403).json({ 
          error: `${minRole} access or higher required`,
          code: `${minRole.toUpperCase()}_REQUIRED`
        });
      }

      next();
    });
  };
};

/**
 * Middleware to handle hierarchical data access
 * Admin sees all, Trainer sees their customers, Customer sees only their data
 */
export const filterDataByRole = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.roleContext) {
    return next();
  }

  // Store filter criteria in request for use in routes
  switch (req.roleContext.actualRole) {
    case 'admin':
      // No filtering needed
      req.query.roleFilter = 'none';
      break;
      
    case 'trainer':
      // Filter to show only trainer's customers
      req.query.roleFilter = 'trainer_customers';
      req.query.trainerId = req.user.id;
      break;
      
    case 'customer':
      // Filter to show only customer's own data
      req.query.roleFilter = 'customer_only';
      req.query.customerId = req.user.id;
      break;
  }
  
  next();
};

/**
 * Helper function to check if a user can perform actions on behalf of another user
 */
export function canActOnBehalfOf(
  actorRole: 'admin' | 'trainer' | 'customer',
  targetRole: 'admin' | 'trainer' | 'customer',
  relationship?: { isAssigned?: boolean }
): boolean {
  // Admin can act on behalf of anyone
  if (actorRole === 'admin') {
    return true;
  }
  
  // Trainer can act on behalf of assigned customers
  if (actorRole === 'trainer' && targetRole === 'customer' && relationship?.isAssigned) {
    return true;
  }
  
  // Users can only act on their own behalf otherwise
  return false;
}

export default {
  requireAuthWithHierarchy,
  allowRoleImpersonation,
  canAccessCustomerData,
  canAccessTrainerData,
  requireRoleWithHierarchy,
  filterDataByRole,
  canActOnBehalfOf,
  ROLE_HIERARCHY
};