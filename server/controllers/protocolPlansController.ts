import { Request, Response } from 'express';
import { db } from '../db.js';
import { 
  protocolPlans, 
  protocolPlanAssignments, 
  trainerHealthProtocols, 
  users,
  ProtocolPlan,
  InsertProtocolPlan
} from '../../shared/schema.js';
import { eq, and, desc, asc, ilike, sql, or } from 'drizzle-orm';
import { generateProtocolFromPlan } from '../services/protocolGeneratorService.js';

export const protocolPlansController = {
  /**
   * List all protocol plans for the authenticated trainer
   */
  async list(req: Request, res: Response) {
    try {
      const trainerId = req.user!.id;
      const { search, sortBy = 'createdAt', order = 'desc' } = req.query;
      
      let query = db.select({
        id: protocolPlans.id,
        trainerId: protocolPlans.trainerId,
        planName: protocolPlans.planName,
        planDescription: protocolPlans.planDescription,
        wizardConfiguration: protocolPlans.wizardConfiguration,
        createdAt: protocolPlans.createdAt,
        updatedAt: protocolPlans.updatedAt,
        lastUsedAt: protocolPlans.lastUsedAt,
        usageCount: protocolPlans.usageCount,
      })
      .from(protocolPlans)
      .$dynamic();
      
      // Add WHERE clause
      const conditions = [eq(protocolPlans.trainerId, trainerId)];
      
      if (search && typeof search === 'string') {
        conditions.push(
          or(
            ilike(protocolPlans.planName, `%${search}%`),
            ilike(protocolPlans.planDescription, `%${search}%`)
          )!
        );
      }
      
      query = query.where(and(...conditions));
      
      // Add ORDER BY
      const sortColumn = protocolPlans[sortBy as keyof typeof protocolPlans] || protocolPlans.createdAt;
      query = query.orderBy(order === 'desc' ? desc(sortColumn) : asc(sortColumn));
      
      const plans = await query.execute();
      
      return res.json({ success: true, data: plans });
    } catch (error) {
      console.error('Error listing protocol plans:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to list protocol plans' 
      });
    }
  },

  /**
   * Create a new protocol plan
   */
  async create(req: Request, res: Response) {
    try {
      const trainerId = req.user!.id;
      const { planName, planDescription, wizardConfiguration } = req.body;
      
      // Validate required fields
      if (!planName || !wizardConfiguration) {
        return res.status(400).json({ 
          success: false, 
          error: 'Plan name and wizard configuration are required' 
        });
      }
      
      // Check for duplicate name
      const existing = await db.select()
        .from(protocolPlans)
        .where(and(
          eq(protocolPlans.trainerId, trainerId),
          eq(protocolPlans.planName, planName)
        ))
        .execute();
      
      if (existing.length > 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'A plan with this name already exists' 
        });
      }
      
      // Create the plan
      const [plan] = await db.insert(protocolPlans)
        .values({
          trainerId,
          planName,
          planDescription,
          wizardConfiguration,
        })
        .returning()
        .execute();
      
      return res.json({ success: true, data: plan });
    } catch (error) {
      console.error('Error creating protocol plan:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to create protocol plan' 
      });
    }
  },

  /**
   * Get a specific protocol plan with assignment history
   */
  async get(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const trainerId = req.user!.id;
      
      const [plan] = await db.select()
        .from(protocolPlans)
        .where(and(
          eq(protocolPlans.id, id),
          eq(protocolPlans.trainerId, trainerId)
        ))
        .execute();
      
      if (!plan) {
        return res.status(404).json({ 
          success: false, 
          error: 'Protocol plan not found' 
        });
      }
      
      // Get assignment history
      const assignments = await db.select({
        id: protocolPlanAssignments.id,
        protocolId: protocolPlanAssignments.protocolId,
        customerId: protocolPlanAssignments.customerId,
        customerName: users.name,
        customerEmail: users.email,
        assignedAt: protocolPlanAssignments.assignedAt,
      })
        .from(protocolPlanAssignments)
        .leftJoin(users, eq(protocolPlanAssignments.customerId, users.id))
        .where(eq(protocolPlanAssignments.protocolPlanId, id))
        .orderBy(desc(protocolPlanAssignments.assignedAt))
        .execute();
      
      return res.json({ 
        success: true, 
        data: { ...plan, assignments } 
      });
    } catch (error) {
      console.error('Error getting protocol plan:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to get protocol plan' 
      });
    }
  },

  /**
   * Update a protocol plan
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const trainerId = req.user!.id;
      const { planName, planDescription, wizardConfiguration } = req.body;
      
      // Check ownership
      const [existing] = await db.select()
        .from(protocolPlans)
        .where(and(
          eq(protocolPlans.id, id),
          eq(protocolPlans.trainerId, trainerId)
        ))
        .execute();
      
      if (!existing) {
        return res.status(404).json({ 
          success: false, 
          error: 'Protocol plan not found' 
        });
      }
      
      // Check for duplicate name if name is being changed
      if (planName && planName !== existing.planName) {
        const duplicate = await db.select()
          .from(protocolPlans)
          .where(and(
            eq(protocolPlans.trainerId, trainerId),
            eq(protocolPlans.planName, planName)
          ))
          .execute();
        
        if (duplicate.length > 0) {
          return res.status(400).json({ 
            success: false, 
            error: 'A plan with this name already exists' 
          });
        }
      }
      
      // Update the plan
      const [updated] = await db.update(protocolPlans)
        .set({
          ...(planName && { planName }),
          ...(planDescription !== undefined && { planDescription }),
          ...(wizardConfiguration && { wizardConfiguration }),
          updatedAt: new Date(),
        })
        .where(eq(protocolPlans.id, id))
        .returning()
        .execute();
      
      return res.json({ success: true, data: updated });
    } catch (error) {
      console.error('Error updating protocol plan:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to update protocol plan' 
      });
    }
  },

  /**
   * Delete a protocol plan
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const trainerId = req.user!.id;
      
      // Check ownership
      const [existing] = await db.select()
        .from(protocolPlans)
        .where(and(
          eq(protocolPlans.id, id),
          eq(protocolPlans.trainerId, trainerId)
        ))
        .execute();
      
      if (!existing) {
        return res.status(404).json({ 
          success: false, 
          error: 'Protocol plan not found' 
        });
      }
      
      // Check for active assignments
      const assignments = await db.select()
        .from(protocolPlanAssignments)
        .where(eq(protocolPlanAssignments.protocolPlanId, id))
        .execute();
      
      if (assignments.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Cannot delete plan with ${assignments.length} active assignments`,
          assignmentCount: assignments.length,
        });
      }
      
      // Delete the plan
      await db.delete(protocolPlans)
        .where(eq(protocolPlans.id, id))
        .execute();
      
      return res.json({ success: true });
    } catch (error) {
      console.error('Error deleting protocol plan:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to delete protocol plan' 
      });
    }
  },

  /**
   * Assign a protocol plan to a customer
   */
  async assign(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { customerId } = req.body;
      const trainerId = req.user!.id;
      
      if (!customerId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Customer ID is required' 
        });
      }
      
      // Get the plan
      const [plan] = await db.select()
        .from(protocolPlans)
        .where(and(
          eq(protocolPlans.id, id),
          eq(protocolPlans.trainerId, trainerId)
        ))
        .execute();
      
      if (!plan) {
        return res.status(404).json({ 
          success: false, 
          error: 'Protocol plan not found' 
        });
      }
      
      // Generate protocol from plan
      const protocol = await generateProtocolFromPlan(
        plan.wizardConfiguration as any,
        customerId,
        trainerId
      );
      
      // Record assignment
      await db.insert(protocolPlanAssignments)
        .values({
          protocolPlanId: plan.id,
          protocolId: protocol.id,
          customerId,
          assignedBy: trainerId,
        })
        .execute();
      
      // Update usage stats
      await db.update(protocolPlans)
        .set({
          usageCount: sql`${protocolPlans.usageCount} + 1`,
          lastUsedAt: new Date(),
        })
        .where(eq(protocolPlans.id, plan.id))
        .execute();
      
      return res.json({ 
        success: true, 
        data: { 
          protocol, 
          assignment: { 
            planId: plan.id,
            planName: plan.planName 
          } 
        } 
      });
    } catch (error) {
      console.error('Error assigning protocol plan:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to assign protocol plan' 
      });
    }
  },

  /**
   * Get preview of what would be generated from a plan
   */
  async preview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const trainerId = req.user!.id;
      
      const [plan] = await db.select()
        .from(protocolPlans)
        .where(and(
          eq(protocolPlans.id, id),
          eq(protocolPlans.trainerId, trainerId)
        ))
        .execute();
      
      if (!plan) {
        return res.status(404).json({ 
          success: false, 
          error: 'Protocol plan not found' 
        });
      }
      
      // Generate preview without saving
      const preview = {
        name: plan.wizardConfiguration.name,
        description: plan.wizardConfiguration.description,
        duration: plan.wizardConfiguration.duration,
        intensity: plan.wizardConfiguration.intensity,
        protocolType: plan.wizardConfiguration.protocolType,
        targetAudience: plan.wizardConfiguration.targetAudience,
        healthFocus: plan.wizardConfiguration.healthFocus,
        personalizations: plan.wizardConfiguration.personalizations,
        safetySettings: plan.wizardConfiguration.safetyValidation,
        advancedSettings: plan.wizardConfiguration.advancedOptions,
      };
      
      return res.json({ 
        success: true, 
        data: preview 
      });
    } catch (error) {
      console.error('Error previewing protocol plan:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to preview protocol plan' 
      });
    }
  },
};