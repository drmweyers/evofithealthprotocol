import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { storage } from '../storage';
import { eq, sql, and } from 'drizzle-orm';
import { 
  protocolAssignments, 
  progressMeasurements, 
  customerGoals,
  createMeasurementSchema,
  createGoalSchema,
  uploadProgressPhotoSchema,
  users 
} from '@shared/schema';
import { db } from '../db';
import { z } from 'zod';

const customerRouter = Router();

// Get customer profile with linked trainer
customerRouter.get('/profile', requireAuth, requireRole('customer'), async (req, res) => {
  try {
    const customerId = req.user!.id;
    
    // Get customer user info
    const customerUser = await storage.getUser(customerId);
    if (!customerUser) {
      return res.status(404).json({ error: 'Customer user not found' });
    }
    
    // Get assigned trainer (through most recent protocol assignment)
    // TODO: Fix trainer query - temporarily disabled due to Drizzle ORM error
    let trainer = undefined;
    /*
    try {
      // First get the trainer ID from protocol assignments
      const [assignment] = await db
        .select({ trainerId: protocolAssignments.trainerId })
        .from(protocolAssignments)
        .where(eq(protocolAssignments.customerId, customerId))
        .limit(1);
      
      if (assignment?.trainerId) {
        // Then get the trainer details separately
        const trainerUser = await storage.getUser(assignment.trainerId);
        if (trainerUser) {
          trainer = {
            id: trainerUser.id,
            name: `${trainerUser.firstName || ''} ${trainerUser.lastName || ''}`.trim() || trainerUser.email,
            email: trainerUser.email,
            profileImage: trainerUser.profileImage,
            specialization: 'Fitness & Nutrition Specialist',
            experience: 5,
            contactInfo: 'Available via in-app messaging',
          };
        }
      }
    } catch (queryError) {
      console.log('No trainer assigned or query error:', queryError);
      // Continue without trainer data
    }
    */
    
    const profile = {
      id: customerUser.id,
      email: customerUser.email,
      firstName: customerUser.firstName,
      lastName: customerUser.lastName,
      profileImage: customerUser.profileImage,
      role: customerUser.role,
      createdAt: customerUser.createdAt,
      trainer: trainer,
      healthGoals: customerUser.healthGoals || [],
      medicalConditions: customerUser.medicalConditions || [],
      supplements: customerUser.supplements || [],
      activityLevel: customerUser.activityLevel,
      weight: customerUser.weight,
      height: customerUser.height,
      age: customerUser.age,
      bio: customerUser.bio,
    };
    
    res.json(profile);
  } catch (error) {
    console.error('Failed to fetch customer profile:', error);
    res.status(500).json({ error: 'Failed to fetch customer profile' });
  }
});

// Customer profile statistics endpoint
customerRouter.get('/profile/stats', requireAuth, requireRole('customer'), async (req, res) => {
  try {
    const customerId = req.user!.id;
    
    // Get count of assigned protocols
    const [protocolsCount] = await db.select({
      count: sql<number>`count(*)::int`,
    })
    .from(protocolAssignments)
    .where(eq(protocolAssignments.customerId, customerId));

    // Get count of active protocols
    const [activeProtocolsCount] = await db.select({
      count: sql<number>`count(*)::int`,
    })
    .from(protocolAssignments)
    .where(
      and(
        eq(protocolAssignments.customerId, customerId),
        eq(protocolAssignments.status, 'active')
      )
    );

    // Get count of completed protocols
    const [completedProtocolsCount] = await db.select({
      count: sql<number>`count(*)::int`,
    })
    .from(protocolAssignments)
    .where(
      and(
        eq(protocolAssignments.customerId, customerId),
        eq(protocolAssignments.status, 'completed')
      )
    );

    // Get progress measurements count
    const [measurementsCount] = await db.select({
      count: sql<number>`count(*)::int`,
    })
    .from(progressMeasurements)
    .where(eq(progressMeasurements.customerId, customerId));

    // Get active goals count
    const [activeGoalsCount] = await db.select({
      count: sql<number>`count(*)::int`,
    })
    .from(customerGoals)
    .where(
      and(
        eq(customerGoals.customerId, customerId),
        eq(customerGoals.status, 'active')
      )
    );

    const stats = {
      totalProtocols: protocolsCount?.count || 0,
      activeProtocols: activeProtocolsCount?.count || 0,
      completedProtocols: completedProtocolsCount?.count || 0,
      totalMeasurements: measurementsCount?.count || 0,
      activeGoals: activeGoalsCount?.count || 0,
      healthScore: 85, // Mock health score - would be calculated based on progress
      complianceRate: 92, // Mock compliance rate - would be calculated from protocol adherence
    };

    res.json(stats);
  } catch (error) {
    console.error('Customer stats error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to fetch customer statistics',
      code: 'SERVER_ERROR'
    });
  }
});

// Get customer's assigned protocols
customerRouter.get('/protocols', requireAuth, requireRole('customer'), async (req, res) => {
  try {
    const customerId = req.user!.id;
    const assignments = await storage.getCustomerProtocolAssignments(customerId);
    res.json(assignments);
  } catch (error) {
    console.error('Failed to fetch customer protocols:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to fetch assigned protocols',
      code: 'SERVER_ERROR'
    });
  }
});

// Get customer's progress measurements
customerRouter.get('/progress/measurements', requireAuth, requireRole('customer'), async (req, res) => {
  try {
    const customerId = req.user!.id;
    const measurements = await storage.getProgressMeasurements(customerId);
    res.json(measurements);
  } catch (error) {
    console.error('Failed to fetch progress measurements:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to fetch progress measurements',
      code: 'SERVER_ERROR'
    });
  }
});

// Create a new progress measurement
customerRouter.post('/progress/measurements', requireAuth, requireRole('customer'), async (req, res) => {
  try {
    const customerId = req.user!.id;
    const measurementData = createMeasurementSchema.parse(req.body);
    
    const measurement = await storage.createProgressMeasurement({
      ...measurementData,
      customerId,
      measurementDate: new Date(measurementData.measurementDate),
    });
    
    res.status(201).json(measurement);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Invalid measurement data',
        errors: error.errors
      });
    }
    console.error('Failed to create progress measurement:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to create progress measurement',
      code: 'SERVER_ERROR'
    });
  }
});

// Update a progress measurement
customerRouter.put('/progress/measurements/:id', requireAuth, requireRole('customer'), async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user!.id;
    const updates = req.body;
    
    // Verify ownership
    const measurements = await storage.getProgressMeasurements(customerId);
    const measurement = measurements.find(m => m.id === id);
    
    if (!measurement) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Measurement not found or access denied' 
      });
    }
    
    const updated = await storage.updateProgressMeasurement(id, updates);
    res.json(updated);
  } catch (error) {
    console.error('Failed to update progress measurement:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to update progress measurement',
      code: 'SERVER_ERROR'
    });
  }
});

// Delete a progress measurement
customerRouter.delete('/progress/measurements/:id', requireAuth, requireRole('customer'), async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user!.id;
    
    // Verify ownership
    const measurements = await storage.getProgressMeasurements(customerId);
    const measurement = measurements.find(m => m.id === id);
    
    if (!measurement) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Measurement not found or access denied' 
      });
    }
    
    const deleted = await storage.deleteProgressMeasurement(id);
    if (deleted) {
      res.json({ message: 'Measurement deleted successfully' });
    } else {
      res.status(500).json({ 
        status: 'error',
        message: 'Failed to delete measurement' 
      });
    }
  } catch (error) {
    console.error('Failed to delete progress measurement:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to delete progress measurement',
      code: 'SERVER_ERROR'
    });
  }
});

// Get customer's progress photos
customerRouter.get('/progress/photos', requireAuth, requireRole('customer'), async (req, res) => {
  try {
    const customerId = req.user!.id;
    const photos = await storage.getProgressPhotos(customerId);
    res.json(photos);
  } catch (error) {
    console.error('Failed to fetch progress photos:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to fetch progress photos',
      code: 'SERVER_ERROR'
    });
  }
});

// Create a new progress photo
customerRouter.post('/progress/photos', requireAuth, requireRole('customer'), async (req, res) => {
  try {
    const customerId = req.user!.id;
    const photoData = uploadProgressPhotoSchema.parse(req.body);
    
    const photo = await storage.createProgressPhoto({
      ...photoData,
      customerId,
      photoDate: new Date(photoData.photoDate),
      photoUrl: req.body.photoUrl, // This would come from file upload
      thumbnailUrl: req.body.thumbnailUrl, // Generated thumbnail
    });
    
    res.status(201).json(photo);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Invalid photo data',
        errors: error.errors
      });
    }
    console.error('Failed to create progress photo:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to create progress photo',
      code: 'SERVER_ERROR'
    });
  }
});

// Delete a progress photo
customerRouter.delete('/progress/photos/:id', requireAuth, requireRole('customer'), async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user!.id;
    
    // Verify ownership
    const photos = await storage.getProgressPhotos(customerId);
    const photo = photos.find(p => p.id === id);
    
    if (!photo) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Photo not found or access denied' 
      });
    }
    
    const deleted = await storage.deleteProgressPhoto(id);
    if (deleted) {
      res.json({ message: 'Photo deleted successfully' });
    } else {
      res.status(500).json({ 
        status: 'error',
        message: 'Failed to delete photo' 
      });
    }
  } catch (error) {
    console.error('Failed to delete progress photo:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to delete progress photo',
      code: 'SERVER_ERROR'
    });
  }
});

// Get customer's goals
customerRouter.get('/goals', requireAuth, requireRole('customer'), async (req, res) => {
  try {
    const customerId = req.user!.id;
    const goals = await storage.getCustomerGoals(customerId);
    res.json(goals);
  } catch (error) {
    console.error('Failed to fetch customer goals:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to fetch goals',
      code: 'SERVER_ERROR'
    });
  }
});

// Create a new goal
customerRouter.post('/goals', requireAuth, requireRole('customer'), async (req, res) => {
  try {
    const customerId = req.user!.id;
    const goalData = createGoalSchema.parse(req.body);
    
    const goal = await storage.createCustomerGoal({
      ...goalData,
      customerId,
      startDate: new Date(goalData.startDate),
      targetDate: goalData.targetDate ? new Date(goalData.targetDate) : undefined,
    });
    
    res.status(201).json(goal);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Invalid goal data',
        errors: error.errors
      });
    }
    console.error('Failed to create goal:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to create goal',
      code: 'SERVER_ERROR'
    });
  }
});

// Update a goal
customerRouter.put('/goals/:id', requireAuth, requireRole('customer'), async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user!.id;
    const updates = req.body;
    
    // Verify ownership
    const goals = await storage.getCustomerGoals(customerId);
    const goal = goals.find(g => g.id === id);
    
    if (!goal) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Goal not found or access denied' 
      });
    }
    
    const updated = await storage.updateCustomerGoal(id, updates);
    res.json(updated);
  } catch (error) {
    console.error('Failed to update goal:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to update goal',
      code: 'SERVER_ERROR'
    });
  }
});

// Delete a goal
customerRouter.delete('/goals/:id', requireAuth, requireRole('customer'), async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user!.id;
    
    // Verify ownership
    const goals = await storage.getCustomerGoals(customerId);
    const goal = goals.find(g => g.id === id);
    
    if (!goal) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Goal not found or access denied' 
      });
    }
    
    const deleted = await storage.deleteCustomerGoal(id);
    if (deleted) {
      res.json({ message: 'Goal deleted successfully' });
    } else {
      res.status(500).json({ 
        status: 'error',
        message: 'Failed to delete goal' 
      });
    }
  } catch (error) {
    console.error('Failed to delete goal:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to delete goal',
      code: 'SERVER_ERROR'
    });
  }
});

// Update protocol assignment status (for customer to mark progress)
customerRouter.put('/protocols/:assignmentId/status', requireAuth, requireRole('customer'), async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { status, progressData } = req.body;
    const customerId = req.user!.id;
    
    // Verify the assignment belongs to this customer
    const assignments = await storage.getCustomerProtocolAssignments(customerId);
    const assignment = assignments.find(a => a.id === assignmentId);
    
    if (!assignment) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Protocol assignment not found or access denied' 
      });
    }
    
    const updates: any = { status };
    if (progressData) {
      updates.progressData = progressData;
    }
    if (status === 'completed') {
      updates.completedDate = new Date();
    }
    
    const updated = await storage.updateProtocolAssignment(assignmentId, updates);
    res.json(updated);
  } catch (error) {
    console.error('Failed to update protocol status:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to update protocol status',
      code: 'SERVER_ERROR'
    });
  }
});

// Handle removed meal plan endpoints
customerRouter.all('/meal-plans*', (req, res) => {
  res.status(404).json({ 
    message: 'Meal plan endpoints have been removed. This application now focuses on health protocols.' 
  });
});

customerRouter.all('/recipes*', (req, res) => {
  res.status(404).json({ 
    message: 'Recipe endpoints have been removed. This application now focuses on health protocols.' 
  });
});

export default customerRouter;