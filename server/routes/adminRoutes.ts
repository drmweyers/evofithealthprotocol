import { Router } from 'express';
import { requireAdmin, requireTrainerOrAdmin, requireAuth } from '../middleware/auth';
import { storage } from '../storage';
import { z } from 'zod';
import { users } from '@shared/schema';
import { db } from '../db';

const adminRouter = Router();

// Admin-only routes

// Get all users for admin management
adminRouter.get('/users', requireAdmin, async (req, res) => {
  try {
    const users = await storage.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get system statistics
adminRouter.get('/stats', requireAdmin, async (req, res) => {
  try {
    const customers = await storage.getCustomers();
    const trainers = await storage.getTrainers();
    const protocols = await storage.getAllHealthProtocols();
    
    const stats = {
      totalUsers: customers.length + trainers.length,
      totalCustomers: customers.length,
      totalTrainers: trainers.length,
      totalProtocols: protocols.length,
      protocolsByType: protocols.reduce((acc, protocol) => {
        acc[protocol.type] = (acc[protocol.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Failed to fetch system stats:', error);
    res.status(500).json({ error: 'Failed to fetch system stats' });
  }
});

// Get admin profile with statistics
adminRouter.get('/profile', requireAdmin, async (req, res) => {
  try {
    const adminId = (req.user as any)?.claims?.sub;
    
    if (!adminId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Get admin user info
    const adminUser = await storage.getUser(adminId);
    if (!adminUser) {
      return res.status(404).json({ error: 'Admin user not found' });
    }
    
    // Get system statistics
    const customers = await storage.getCustomers();
    const trainers = await storage.getTrainers();
    const protocols = await storage.getAllHealthProtocols();
    const recipes = await storage.getAllRecipes ? await storage.getAllRecipes() : [];
    
    const profile = {
      id: adminUser.id,
      email: adminUser.email,
      firstName: adminUser.firstName || 'Admin',
      lastName: adminUser.lastName || 'User',
      profileImage: adminUser.profileImage,
      role: adminUser.role,
      createdAt: adminUser.createdAt,
      lastLogin: new Date().toISOString(),
      stats: {
        totalUsers: customers.length + trainers.length + 1, // +1 for admin
        totalTrainers: trainers.length,
        totalCustomers: customers.length,
        activeProtocols: protocols.filter((p: any) => p.status === 'active').length,
        totalRecipes: recipes.length,
        systemHealth: 'healthy' as const,
      },
      permissions: [
        'User Management',
        'Content Moderation',
        'System Configuration',
        'Database Access',
        'Analytics View',
        'Protocol Management',
        'Recipe Management',
        'Billing Access',
      ],
    };
    
    res.json(profile);
  } catch (error) {
    console.error('Failed to fetch admin profile:', error);
    res.status(500).json({ error: 'Failed to fetch admin profile' });
  }
});

// Routes accessible by both trainers and admins
adminRouter.get('/customers', requireTrainerOrAdmin, async (req, res) => {
  try {
    const customers = await storage.getCustomers();
    res.json(customers);
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get all health protocols (admin/trainer view)
adminRouter.get('/protocols', requireTrainerOrAdmin, async (req, res) => {
  try {
    const protocols = await storage.getAllHealthProtocols();
    res.json(protocols);
  } catch (error) {
    console.error('Failed to fetch health protocols:', error);
    res.status(500).json({ error: 'Failed to fetch health protocols' });
  }
});

// Assign protocol to customers
const assignProtocolSchema = z.object({
  protocolId: z.string().uuid(),
  customerIds: z.array(z.string().uuid()),
  notes: z.string().optional(),
});

adminRouter.post('/assign-protocol', requireTrainerOrAdmin, async (req, res) => {
  try {
    const { protocolId, customerIds, notes } = assignProtocolSchema.parse(req.body);
    const trainerId = (req.user as any)?.claims?.sub;
    
    if (!trainerId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Verify protocol exists
    const protocol = await storage.getHealthProtocol(protocolId);
    if (!protocol) {
      return res.status(404).json({ error: 'Protocol not found' });
    }
    
    // Create assignments for each customer
    const assignments = [];
    for (const customerId of customerIds) {
      const assignment = await storage.assignProtocolToCustomer({
        protocolId,
        customerId,
        trainerId,
        notes,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + protocol.duration * 24 * 60 * 60 * 1000), // Add duration in days
      });
      assignments.push(assignment);
    }
    
    res.json({ 
      message: `Protocol assigned to ${customerIds.length} customer(s)`,
      assignments 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request data', details: error.errors });
    }
    console.error('Failed to assign protocol:', error);
    res.status(500).json({ error: 'Failed to assign protocol' });
  }
});

// Get protocol assignments for admin/trainer view
adminRouter.get('/protocol-assignments', requireTrainerOrAdmin, async (req, res) => {
  try {
    const trainerId = (req.user as any)?.claims?.sub;
    const userRole = (req.user as any)?.claims?.role;
    
    let assignments;
    if (userRole === 'admin') {
      // Admin can see all assignments - we'll need to implement this in storage
      // For now, get assignments for the current trainer
      assignments = await storage.getTrainerProtocolAssignments(trainerId);
    } else {
      assignments = await storage.getTrainerProtocolAssignments(trainerId);
    }
    
    res.json(assignments);
  } catch (error) {
    console.error('Failed to fetch protocol assignments:', error);
    res.status(500).json({ error: 'Failed to fetch protocol assignments' });
  }
});

// Delete protocol assignment
adminRouter.delete('/protocol-assignments/:assignmentId', requireTrainerOrAdmin, async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const trainerId = (req.user as any)?.claims?.sub;
    const userRole = (req.user as any)?.claims?.role;
    
    // For now, we'll update the assignment status instead of deleting
    // In a real implementation, you might want to actually delete or archive
    const updated = await storage.updateProtocolAssignment(assignmentId, {
      status: 'cancelled',
      completedDate: new Date(),
    });
    
    if (!updated) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    
    res.json({ message: 'Protocol assignment cancelled successfully' });
  } catch (error) {
    console.error('Failed to cancel protocol assignment:', error);
    res.status(500).json({ error: 'Failed to cancel protocol assignment' });
  }
});

// Health check endpoint for admin routes
adminRouter.get('/health', requireAuth, (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Admin Routes',
    timestamp: new Date().toISOString() 
  });
});

// Handle removed meal plan endpoints
adminRouter.all('/generate*', (req, res) => {
  res.status(404).json({ 
    message: 'Recipe generation endpoints have been removed. This application now focuses on health protocols.' 
  });
});

adminRouter.all('/assign-recipe*', (req, res) => {
  res.status(404).json({ 
    message: 'Recipe assignment endpoints have been removed. Use protocol assignment instead.' 
  });
});

adminRouter.all('/assign-meal-plan*', (req, res) => {
  res.status(404).json({ 
    message: 'Meal plan assignment endpoints have been removed. Use protocol assignment instead.' 
  });
});

export default adminRouter;