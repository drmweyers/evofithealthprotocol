/**
 * Role Testing Routes
 * 
 * API endpoints to demonstrate and test the hierarchical role system
 * Shows how Admin, Trainer, and Customer roles interact
 */

import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { users } from '../../shared/schema.js';
import { eq, and, or, sql } from 'drizzle-orm';
import {
  requireAuthWithHierarchy,
  allowRoleImpersonation,
  canAccessCustomerData,
  canAccessTrainerData,
  requireRoleWithHierarchy,
  filterDataByRole
} from '../middleware/roleHierarchy.js';

const router = Router();

/**
 * Get current user's role context and permissions
 */
router.get('/current-role', requireAuthWithHierarchy, async (req: Request, res: Response) => {
  try {
    const user = await db.select().from(users).where(eq(users.id, req.user!.id)).limit(1);
    
    res.json({
      status: 'success',
      data: {
        user: {
          id: req.user!.id,
          email: user[0].email,
          name: user[0].name,
          role: req.user!.role,
          roleDisplayName: user[0].roleDisplayName || req.user!.role
        },
        roleContext: req.roleContext,
        permissions: {
          canViewAllUsers: req.roleContext?.canAccessRole('admin'),
          canManageProtocols: req.roleContext?.canAccessRole('trainer'),
          canViewOwnData: true,
          hierarchyLevel: req.user!.role === 'admin' ? 3 : 
                         req.user!.role === 'trainer' ? 2 : 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching role context:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch role context'
    });
  }
});

/**
 * Admin endpoint - View system overview
 * Only accessible by admin
 */
router.get('/admin/system-overview', requireRoleWithHierarchy('admin'), async (req: Request, res: Response) => {
  try {
    // Get counts by role
    const userCounts = await db
      .select({
        role: users.role,
        count: sql<number>`count(*)::int`
      })
      .from(users)
      .groupBy(users.role);

    // Get active relationships
    const relationships = await db
      .select({
        count: sql<number>`count(*)::int`
      })
      .from(trainerCustomerRelationships)
      .where(eq(trainerCustomerRelationships.status, 'active'));

    // Get recent activity
    const recentUsers = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt
      })
      .from(users)
      .orderBy(users.createdAt)
      .limit(5);

    res.json({
      status: 'success',
      message: 'Admin can see complete system overview',
      data: {
        userCounts,
        activeRelationships: relationships[0]?.count || 0,
        recentUsers,
        accessLevel: 'FULL_SYSTEM_ACCESS'
      }
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch system overview'
    });
  }
});

/**
 * Trainer endpoint - View assigned customers
 * Accessible by trainer (own customers) and admin (all)
 */
router.get('/trainer/my-customers', 
  requireAuthWithHierarchy,
  filterDataByRole,
  async (req: Request, res: Response) => {
    try {
      let customers;
      
      if (req.roleContext?.actualRole === 'admin') {
        // Admin sees all customers with their trainers
        customers = await db
          .select({
            customerId: users.id,
            customerEmail: users.email,
            customerName: users.name,
            trainerId: trainerCustomerRelationships.trainerId,
            assignedDate: trainerCustomerRelationships.assignedDate,
            relationshipType: trainerCustomerRelationships.relationshipType
          })
          .from(users)
          .leftJoin(
            trainerCustomerRelationships,
            and(
              eq(users.id, trainerCustomerRelationships.customerId),
              eq(trainerCustomerRelationships.status, 'active')
            )
          )
          .where(eq(users.role, 'customer'));
          
        return res.json({
          status: 'success',
          message: 'Admin viewing all customer-trainer relationships',
          data: {
            customers,
            accessLevel: 'ADMIN_FULL_ACCESS',
            totalCount: customers.length
          }
        });
      } else if (req.roleContext?.actualRole === 'trainer') {
        // Trainer sees only their assigned customers
        customers = await db
          .select({
            customerId: users.id,
            customerEmail: users.email,
            customerName: users.name,
            assignedDate: trainerCustomerRelationships.assignedDate,
            relationshipType: trainerCustomerRelationships.relationshipType,
            canViewProtocols: trainerCustomerRelationships.canViewProtocols,
            canMessageTrainer: trainerCustomerRelationships.canMessageTrainer
          })
          .from(trainerCustomerRelationships)
          .innerJoin(users, eq(users.id, trainerCustomerRelationships.customerId))
          .where(
            and(
              eq(trainerCustomerRelationships.trainerId, req.user!.id),
              eq(trainerCustomerRelationships.status, 'active')
            )
          );
          
        return res.json({
          status: 'success',
          message: 'Trainer viewing assigned customers',
          data: {
            customers,
            accessLevel: 'TRAINER_ASSIGNED_ONLY',
            totalCount: customers.length
          }
        });
      } else {
        return res.status(403).json({
          status: 'error',
          message: 'Customers cannot access this endpoint',
          accessLevel: 'DENIED'
        });
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch customers'
      });
    }
});

/**
 * Customer endpoint - View assigned trainer and shared resources
 * Accessible by customer (own trainer) and admin (all)
 */
router.get('/customer/my-trainer',
  requireAuthWithHierarchy,
  async (req: Request, res: Response) => {
    try {
      if (req.roleContext?.actualRole === 'admin') {
        // Admin can view any customer's trainer
        const customerId = req.query.customerId as string || req.user!.id;
        
        const relationship = await db
          .select({
            trainerId: users.id,
            trainerEmail: users.email,
            trainerName: users.name,
            assignedDate: trainerCustomerRelationships.assignedDate,
            relationshipType: trainerCustomerRelationships.relationshipType
          })
          .from(trainerCustomerRelationships)
          .innerJoin(users, eq(users.id, trainerCustomerRelationships.trainerId))
          .where(
            and(
              eq(trainerCustomerRelationships.customerId, customerId),
              eq(trainerCustomerRelationships.status, 'active')
            )
          )
          .limit(1);
          
        return res.json({
          status: 'success',
          message: 'Admin viewing customer-trainer relationship',
          data: {
            trainer: relationship[0] || null,
            accessLevel: 'ADMIN_FULL_ACCESS'
          }
        });
      } else if (req.roleContext?.actualRole === 'customer') {
        // Customer sees their assigned trainer
        const relationship = await db
          .select({
            trainerId: users.id,
            trainerEmail: users.email,
            trainerName: users.name,
            assignedDate: trainerCustomerRelationships.assignedDate
          })
          .from(trainerCustomerRelationships)
          .innerJoin(users, eq(users.id, trainerCustomerRelationships.trainerId))
          .where(
            and(
              eq(trainerCustomerRelationships.customerId, req.user!.id),
              eq(trainerCustomerRelationships.status, 'active')
            )
          )
          .limit(1);
          
        // Get protocols shared by trainer
        const sharedProtocols = await db
          .select({
            protocolId: protocolAssignments.protocolId,
            assignedDate: protocolAssignments.assignedDate
          })
          .from(protocolAssignments)
          .where(
            and(
              eq(protocolAssignments.customerId, req.user!.id),
              eq(protocolAssignments.trainerId, relationship[0]?.trainerId)
            )
          )
          .limit(5);
          
        return res.json({
          status: 'success',
          message: 'Customer viewing assigned trainer',
          data: {
            trainer: relationship[0] || null,
            sharedProtocols: sharedProtocols,
            accessLevel: 'CUSTOMER_LIMITED_ACCESS'
          }
        });
      } else if (req.roleContext?.actualRole === 'trainer') {
        return res.status(403).json({
          status: 'error',
          message: 'Trainers cannot access customer trainer view',
          accessLevel: 'DENIED'
        });
      }
    } catch (error) {
      console.error('Error fetching trainer:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch trainer information'
      });
    }
});

/**
 * Cross-role data access demonstration
 * Shows how different roles see the same data differently
 */
router.get('/shared-resource/:customerId',
  requireAuthWithHierarchy,
  async (req: Request, res: Response) => {
    try {
      const { customerId } = req.params;
      
      // Check access permissions
      const canAccess = await db.execute(
        sql`SELECT can_access_user_data(${req.user!.id}::uuid, ${customerId}::uuid) as can_access`
      );
      
      if (!canAccess.rows[0]?.can_access) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied to this customer data',
          yourRole: req.roleContext?.actualRole,
          accessLevel: 'DENIED'
        });
      }
      
      // Get customer data based on role
      let responseData: any = {};
      
      if (req.roleContext?.actualRole === 'admin') {
        // Admin sees everything
        const fullData = await db
          .select()
          .from(users)
          .where(eq(users.id, customerId))
          .limit(1);
          
        responseData = {
          customer: fullData[0],
          protocols: await db.select().from(protocolAssignments).where(eq(protocolAssignments.customerId, customerId)),
          accessLevel: 'ADMIN_FULL_ACCESS',
          visibleFields: 'ALL_FIELDS'
        };
      } else if (req.roleContext?.actualRole === 'trainer') {
        // Trainer sees customer's health data
        const limitedData = await db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
            createdAt: users.createdAt
          })
          .from(users)
          .where(eq(users.id, customerId))
          .limit(1);
          
        responseData = {
          customer: limitedData[0],
          protocols: await db.select().from(protocolAssignments)
            .where(
              and(
                eq(protocolAssignments.customerId, customerId),
                eq(protocolAssignments.trainerId, req.user!.id)
              )
            ),
          accessLevel: 'TRAINER_HEALTH_DATA_ACCESS',
          visibleFields: 'HEALTH_RELATED_ONLY'
        };
      } else if (req.roleContext?.actualRole === 'customer') {
        // Customer sees only their own data
        if (customerId === req.user!.id) {
          const ownData = await db
            .select({
              id: users.id,
              name: users.name,
              email: users.email
            })
            .from(users)
            .where(eq(users.id, customerId))
            .limit(1);
            
          responseData = {
            customer: ownData[0],
            protocols: await db.select().from(protocolAssignments).where(eq(protocolAssignments.customerId, customerId)),
            accessLevel: 'CUSTOMER_OWN_DATA',
            visibleFields: 'OWN_DATA_ONLY'
          };
        }
      }
      
      res.json({
        status: 'success',
        message: `Data filtered based on ${req.roleContext?.actualRole} role`,
        data: responseData
      });
    } catch (error) {
      console.error('Error accessing shared resource:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to access resource'
      });
    }
});

/**
 * Assign a customer to a trainer (Admin only)
 */
router.post('/admin/assign-customer',
  requireRoleWithHierarchy('admin'),
  async (req: Request, res: Response) => {
    try {
      const { trainerId, customerId } = req.body;
      
      if (!trainerId || !customerId) {
        return res.status(400).json({
          status: 'error',
          message: 'Both trainerId and customerId are required'
        });
      }
      
      // Create or update relationship
      await db
        .insert(trainerCustomerRelationships)
        .values({
          trainerId,
          customerId,
          status: 'active',
          relationshipType: 'primary',
          canViewProtocols: true,
          canMessageTrainer: true,
          canBookSessions: true
        })
        .onConflictDoUpdate({
          target: [trainerCustomerRelationships.trainerId, trainerCustomerRelationships.customerId],
          set: {
            status: 'active',
            assignedDate: sql`NOW()`
          }
        });
      
      res.json({
        status: 'success',
        message: 'Customer assigned to trainer successfully',
        data: {
          trainerId,
          customerId,
          relationship: 'active'
        }
      });
    } catch (error) {
      console.error('Error assigning customer:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to assign customer to trainer'
      });
    }
});

/**
 * Role impersonation for admin (testing purposes)
 */
router.get('/admin/impersonate/:role',
  requireRoleWithHierarchy('admin'),
  allowRoleImpersonation,
  async (req: Request, res: Response) => {
    const { role } = req.params;
    
    if (!['admin', 'trainer', 'customer'].includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role for impersonation'
      });
    }
    
    res.json({
      status: 'success',
      message: `Admin is now viewing system as ${role}`,
      data: {
        actualRole: req.roleContext?.actualRole,
        effectiveRole: role,
        isImpersonating: true,
        note: 'Set X-Impersonate-Role header to maintain this view'
      }
    });
});

export default router;