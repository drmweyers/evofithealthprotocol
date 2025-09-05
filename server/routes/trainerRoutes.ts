import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { storage } from '../storage';
import { eq, sql, and, desc, inArray } from 'drizzle-orm';
import { 
  users, 
  progressMeasurements, 
  customerGoals, 
  trainerHealthProtocols,
  protocolAssignments,
  createHealthProtocolSchema,
  assignProtocolSchema,
  type TrainerHealthProtocol,
  type ProtocolAssignment 
} from '@shared/schema';
import { db } from '../db';
import { z } from 'zod';
import { generateHealthProtocol, parseNaturalLanguageForHealthProtocol } from '../services/openai';

const trainerRouter = Router();

// Get trainer profile with client list
trainerRouter.get('/profile', requireAuth, requireRole('trainer'), async (req, res) => {
  try {
    const trainerId = req.user!.id;
    
    // Get trainer user info
    const trainerUser = await storage.getUser(trainerId);
    if (!trainerUser) {
      return res.status(404).json({ error: 'Trainer user not found' });
    }
    
    // Get trainer's clients
    const [clientsResult] = await db.select({
      id: users.id,
      name: sql<string>`COALESCE(${users.firstName} || ' ' || ${users.lastName}, ${users.email})`,
      email: users.email,
      assignedAt: protocolAssignments.createdAt,
      status: sql<string>`'active'`,
      lastActivity: sql<Date>`MAX(${protocolAssignments.updatedAt})`,
    })
    .from(protocolAssignments)
    .innerJoin(users, eq(users.id, protocolAssignments.customerId))
    .where(eq(protocolAssignments.trainerId, trainerId))
    .groupBy(users.id, users.firstName, users.lastName, users.email, protocolAssignments.createdAt);

    // Get stats
    const [protocolsCreated] = await db.select({
      count: sql<number>`count(*)::int`,
    })
    .from(trainerHealthProtocols)
    .where(eq(trainerHealthProtocols.trainerId, trainerId));
    
    const [activePrograms] = await db.select({
      count: sql<number>`count(*)::int`,
    })
    .from(protocolAssignments)
    .where(and(
      eq(protocolAssignments.trainerId, trainerId),
      eq(protocolAssignments.status, 'active')
    ));

    const profile = {
      id: trainerUser.id,
      email: trainerUser.email,
      firstName: trainerUser.firstName || 'Trainer',
      lastName: trainerUser.lastName || 'User',
      profileImage: trainerUser.profileImage,
      specialization: 'Fitness & Nutrition', // Could be stored in trainer table
      experience: 5, // Could be stored in trainer table
      certifications: ['CPT', 'Nutrition Specialist'], // Could be stored
      clients: clientsResult || [],
      stats: {
        totalClients: clientsResult?.length || 0,
        activePrograms: activePrograms?.count || 0,
        completedPrograms: 0, // Could calculate from assignments
        avgClientSatisfaction: 4.8, // Could calculate from reviews
      },
    };
    
    res.json(profile);
  } catch (error) {
    console.error('Failed to fetch trainer profile:', error);
    res.status(500).json({ error: 'Failed to fetch trainer profile' });
  }
});

// Trainer profile statistics endpoint
trainerRouter.get('/profile/stats', requireAuth, requireRole('trainer'), async (req, res) => {
  try {
    const trainerId = req.user!.id;
    
    // Get count of clients (customers with assigned protocols from this trainer)
    const [clientsWithProtocols] = await db.select({
      count: sql<number>`count(distinct ${protocolAssignments.customerId})::int`,
    })
    .from(protocolAssignments)
    .where(eq(protocolAssignments.trainerId, trainerId));

    // Get total protocols created by this trainer
    const [protocolsCreated] = await db.select({
      count: sql<number>`count(*)::int`,
    })
    .from(trainerHealthProtocols)
    .where(eq(trainerHealthProtocols.trainerId, trainerId));

    // Get total protocol assignments by this trainer
    const [protocolsAssigned] = await db.select({
      count: sql<number>`count(*)::int`,
    })
    .from(protocolAssignments)
    .where(eq(protocolAssignments.trainerId, trainerId));

    // Get active protocol assignments
    const [activeProtocols] = await db.select({
      count: sql<number>`count(*)::int`,
    })
    .from(protocolAssignments)
    .where(
      and(
        eq(protocolAssignments.trainerId, trainerId),
        eq(protocolAssignments.status, 'active')
      )
    );

    const stats = {
      totalClients: clientsWithProtocols?.count || 0,
      totalProtocolsCreated: protocolsCreated?.count || 0,
      totalProtocolsAssigned: protocolsAssigned?.count || 0,
      activeProtocols: activeProtocols?.count || 0,
      clientCompletionRate: 85, // Mock data - would be calculated from completed protocols
    };

    res.json(stats);
  } catch (error) {
    console.error('Trainer stats error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to fetch trainer statistics',
      code: 'SERVER_ERROR'
    });
  }
});

// Get all customers assigned to this trainer
trainerRouter.get('/customers', requireAuth, requireRole('trainer'), async (req, res) => {
  try {
    const trainerId = req.user!.id;
    
    // Get unique customers who have protocols assigned by this trainer
    const customersWithProtocols = await db.select({
      customerId: protocolAssignments.customerId,
      customerEmail: users.email,
      customerName: users.name,
      assignedAt: protocolAssignments.assignedAt,
      status: protocolAssignments.status,
    })
    .from(protocolAssignments)
    .innerJoin(users, eq(users.id, protocolAssignments.customerId))
    .where(eq(protocolAssignments.trainerId, trainerId))
    .orderBy(desc(protocolAssignments.assignedAt));
    
    // Group by customer to avoid duplicates
    const customerMap = new Map();
    customersWithProtocols.forEach(customer => {
      if (!customerMap.has(customer.customerId)) {
        customerMap.set(customer.customerId, {
          id: customer.customerId,
          email: customer.customerEmail,
          name: customer.customerName,
          firstAssignedAt: customer.assignedAt?.toISOString() || new Date().toISOString(),
          activeProtocols: 0,
          completedProtocols: 0,
        });
      }
      
      const customerData = customerMap.get(customer.customerId);
      if (customer.status === 'active') {
        customerData.activeProtocols++;
      } else if (customer.status === 'completed') {
        customerData.completedProtocols++;
      }
    });
    
    const customers = Array.from(customerMap.values());
    res.json(customers);
  } catch (error) {
    console.error('Failed to fetch trainer customers:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to fetch customers',
      code: 'SERVER_ERROR'
    });
  }
});

// Get trainer's health protocols
trainerRouter.get('/protocols', requireAuth, requireRole('trainer'), async (req, res) => {
  try {
    const trainerId = req.user!.id;
    const protocols = await storage.getTrainerHealthProtocols(trainerId);
    
    // Add assignment count for each protocol
    const protocolsWithStats = await Promise.all(
      protocols.map(async (protocol) => {
        const assignments = await storage.getProtocolAssignments(protocol.id);
        return {
          ...protocol,
          totalAssignments: assignments.length,
          activeAssignments: assignments.filter(a => a.status === 'active').length,
        };
      })
    );
    
    res.json(protocolsWithStats);
  } catch (error) {
    console.error('Failed to fetch trainer protocols:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to fetch protocols',
      code: 'SERVER_ERROR'
    });
  }
});

// Create a new health protocol
trainerRouter.post('/protocols', requireAuth, requireRole('trainer'), async (req, res) => {
  try {
    const trainerId = req.user!.id;
    const protocolData = createHealthProtocolSchema.parse(req.body);
    
    const protocol = await storage.createHealthProtocol({
      ...protocolData,
      trainerId,
    });
    
    res.status(201).json(protocol);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Invalid protocol data',
        errors: error.errors
      });
    }
    console.error('Failed to create protocol:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to create protocol',
      code: 'SERVER_ERROR'
    });
  }
});

// Generate a health protocol using AI
trainerRouter.post('/protocols/generate', requireAuth, requireRole('trainer'), async (req, res) => {
  try {
    const trainerId = req.user!.id;
    const {
      protocolType,
      intensity,
      duration,
      userAge,
      healthConditions,
      currentMedications,
      experience,
      specificGoals,
      naturalLanguagePrompt
    } = req.body;
    
    const generatedProtocol = await generateHealthProtocol({
      protocolType,
      intensity,
      duration,
      userAge,
      healthConditions,
      currentMedications,
      experience,
      specificGoals,
      naturalLanguagePrompt
    });
    
    // Save the generated protocol
    const protocol = await storage.createHealthProtocol({
      name: generatedProtocol.name,
      description: generatedProtocol.description,
      type: generatedProtocol.type,
      duration: generatedProtocol.duration,
      intensity: generatedProtocol.intensity,
      config: generatedProtocol.config,
      tags: generatedProtocol.tags,
      trainerId,
    });
    
    res.json({
      protocol,
      aiRecommendations: generatedProtocol.recommendations,
    });
  } catch (error) {
    console.error('Failed to generate protocol:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to generate protocol',
      code: 'SERVER_ERROR'
    });
  }
});

// Parse natural language input for protocol creation
trainerRouter.post('/protocols/parse-language', requireAuth, requireRole('trainer'), async (req, res) => {
  try {
    const { naturalLanguageInput } = req.body;
    
    if (!naturalLanguageInput || typeof naturalLanguageInput !== 'string') {
      return res.status(400).json({ 
        status: 'error',
        message: 'Natural language input is required' 
      });
    }
    
    const parsedData = await parseNaturalLanguageForHealthProtocol(naturalLanguageInput);
    res.json(parsedData);
  } catch (error) {
    console.error('Failed to parse natural language:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to parse natural language input',
      code: 'SERVER_ERROR'
    });
  }
});

// Update a health protocol
trainerRouter.put('/protocols/:id', requireAuth, requireRole('trainer'), async (req, res) => {
  try {
    const { id } = req.params;
    const trainerId = req.user!.id;
    const updates = req.body;
    
    // Verify ownership
    const existingProtocol = await storage.getHealthProtocol(id);
    if (!existingProtocol || existingProtocol.trainerId !== trainerId) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Protocol not found or access denied' 
      });
    }
    
    const updatedProtocol = await storage.updateHealthProtocol(id, updates);
    res.json(updatedProtocol);
  } catch (error) {
    console.error('Failed to update protocol:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to update protocol',
      code: 'SERVER_ERROR'
    });
  }
});

// Delete a health protocol
trainerRouter.delete('/protocols/:id', requireAuth, requireRole('trainer'), async (req, res) => {
  try {
    const { id } = req.params;
    const trainerId = req.user!.id;
    
    // Verify ownership
    const existingProtocol = await storage.getHealthProtocol(id);
    if (!existingProtocol || existingProtocol.trainerId !== trainerId) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Protocol not found or access denied' 
      });
    }
    
    const deleted = await storage.deleteHealthProtocol(id);
    if (deleted) {
      res.json({ message: 'Protocol deleted successfully' });
    } else {
      res.status(500).json({ 
        status: 'error',
        message: 'Failed to delete protocol' 
      });
    }
  } catch (error) {
    console.error('Failed to delete protocol:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to delete protocol',
      code: 'SERVER_ERROR'
    });
  }
});

// Assign protocol to customers
trainerRouter.post('/protocols/:id/assign', requireAuth, requireRole('trainer'), async (req, res) => {
  try {
    const { id: protocolId } = req.params;
    // Parse the body without protocolId since it comes from URL
    const bodySchema = z.object({
      clientIds: z.array(z.string().uuid()),
      notes: z.string().optional(),
      startDate: z.string().datetime().optional(),
    });
    const { clientIds, notes, startDate } = bodySchema.parse(req.body);
    const trainerId = req.user!.id;
    
    // Verify protocol ownership
    const protocol = await storage.getHealthProtocol(protocolId);
    if (!protocol || protocol.trainerId !== trainerId) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Protocol not found or access denied' 
      });
    }
    
    // Create assignments for each client
    const assignments = [];
    for (const clientId of clientIds) {
      const assignment = await storage.assignProtocolToCustomer({
        protocolId,
        customerId: clientId,
        trainerId,
        notes,
        status: 'active',
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: new Date(Date.now() + protocol.duration * 24 * 60 * 60 * 1000), // Add duration in days
      });
      assignments.push(assignment);
    }
    
    res.json({ 
      message: `Protocol assigned to ${clientIds.length} client(s)`,
      assignments 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Invalid assignment data',
        errors: error.errors
      });
    }
    console.error('Failed to assign protocol:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to assign protocol',
      code: 'SERVER_ERROR'
    });
  }
});

// Get protocol assignments for this trainer
trainerRouter.get('/protocol-assignments', requireAuth, requireRole('trainer'), async (req, res) => {
  try {
    const trainerId = req.user!.id;
    const assignments = await storage.getTrainerProtocolAssignments(trainerId);
    res.json(assignments);
  } catch (error) {
    console.error('Failed to fetch protocol assignments:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to fetch assignments',
      code: 'SERVER_ERROR'
    });
  }
});

// Get customer details for trainer
trainerRouter.get('/customers/:customerId', requireAuth, requireRole('trainer'), async (req, res) => {
  try {
    const { customerId } = req.params;
    const trainerId = req.user!.id;
    
    // Get customer basic info
    const customer = await storage.getUser(customerId);
    if (!customer) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Customer not found' 
      });
    }
    
    // Get customer's protocol assignments from this trainer
    const assignments = await storage.getCustomerProtocolAssignments(customerId);
    const trainerAssignments = assignments.filter(a => a.trainerId === trainerId);
    
    // Get customer's progress measurements
    const measurements = await storage.getProgressMeasurements(customerId);
    
    // Get customer's goals
    const goals = await storage.getCustomerGoals(customerId);
    
    res.json({
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        profilePicture: customer.profilePicture,
      },
      protocolAssignments: trainerAssignments,
      progressMeasurements: measurements.slice(0, 10), // Last 10 measurements
      goals: goals.filter(g => g.status === 'active'),
    });
  } catch (error) {
    console.error('Failed to fetch customer details:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to fetch customer details',
      code: 'SERVER_ERROR'
    });
  }
});

// Handle removed meal plan endpoints
trainerRouter.all('/meal-plans*', (req, res) => {
  res.status(404).json({ 
    message: 'Meal plan endpoints have been removed. This application now focuses on health protocols.' 
  });
});

trainerRouter.all('/recipes*', (req, res) => {
  res.status(404).json({ 
    message: 'Recipe endpoints have been removed. This application now focuses on health protocols.' 
  });
});

export default trainerRouter;