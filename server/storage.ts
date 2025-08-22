/**
 * EvoFit Health Protocol Storage Layer
 * 
 * This module provides a clean abstraction layer over the database using the
 * Repository pattern. It handles all CRUD operations for users, health protocols,
 * and progress tracking with comprehensive error handling.
 * 
 * Architecture:
 * - IStorage interface defines the contract for all storage operations
 * - DatabaseStorage implements the interface using Drizzle ORM
 * - All database queries are centralized here for consistency
 * - Type safety is maintained through imported schema types
 */

import {
  users,
  customerInvitations,
  passwordResetTokens,
  refreshTokens,
  progressMeasurements,
  progressPhotos,
  customerGoals,
  goalMilestones,
  trainerHealthProtocols,
  protocolAssignments,
  type User,
  type InsertUser,
  type CustomerInvitation,
  type InsertCustomerInvitation,
  type ProgressMeasurement,
  type InsertProgressMeasurement,
  type ProgressPhoto,
  type InsertProgressPhoto,
  type CustomerGoal,
  type InsertCustomerGoal,
  type GoalMilestone,
  type InsertGoalMilestone,
  type TrainerHealthProtocol,
  type InsertTrainerHealthProtocol,
  type ProtocolAssignment,
  type InsertProtocolAssignment,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, lte, gte } from "drizzle-orm";
import { inArray } from "drizzle-orm";

/**
 * Storage Interface
 * 
 * Defines all storage operations available in the application.
 * This interface allows for easy testing and potential future
 * implementations (e.g., in-memory storage for tests).
 */
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createGoogleUser(user: { email: string; googleId: string; name: string; profilePicture?: string; role: 'admin' | 'trainer' | 'customer' }): Promise<User>;
  linkGoogleAccount(userId: string, googleId: string): Promise<void>;
  updateUserPassword(userId: string, password: string): Promise<void>;
  updateUserEmail(userId: string, email: string): Promise<void>;
  getCustomers(): Promise<User[]>;
  getTrainers(): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  
  // Password Reset
  createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void>;
  getPasswordResetToken(token: string): Promise<{ userId: string, expiresAt: Date } | undefined>;
  deletePasswordResetToken(token: string): Promise<void>;
  
  // Refresh Token Operations
  createRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void>;
  getRefreshToken(token: string): Promise<{ userId: string, expiresAt: Date } | undefined>;
  deleteRefreshToken(token: string): Promise<void>;
  
  // Customer Invitation Operations
  createInvitation(invitation: InsertCustomerInvitation): Promise<CustomerInvitation>;
  getInvitation(token: string): Promise<CustomerInvitation | undefined>;
  getInvitationsByTrainer(trainerId: string): Promise<CustomerInvitation[]>;
  markInvitationAsUsed(token: string): Promise<void>;
  deleteExpiredInvitations(): Promise<number>;
  
  // Progress Tracking Operations
  createProgressMeasurement(measurement: InsertProgressMeasurement): Promise<ProgressMeasurement>;
  getProgressMeasurements(customerId: string): Promise<ProgressMeasurement[]>;
  updateProgressMeasurement(id: string, updates: Partial<InsertProgressMeasurement>): Promise<ProgressMeasurement | undefined>;
  deleteProgressMeasurement(id: string): Promise<boolean>;
  
  createProgressPhoto(photo: InsertProgressPhoto): Promise<ProgressPhoto>;
  getProgressPhotos(customerId: string): Promise<ProgressPhoto[]>;
  deleteProgressPhoto(id: string): Promise<boolean>;
  
  createCustomerGoal(goal: InsertCustomerGoal): Promise<CustomerGoal>;
  getCustomerGoals(customerId: string): Promise<CustomerGoal[]>;
  updateCustomerGoal(id: string, updates: Partial<InsertCustomerGoal>): Promise<CustomerGoal | undefined>;
  deleteCustomerGoal(id: string): Promise<boolean>;
  
  createGoalMilestone(milestone: InsertGoalMilestone): Promise<GoalMilestone>;
  getGoalMilestones(goalId: string): Promise<GoalMilestone[]>;
  updateGoalMilestone(id: string, updates: Partial<InsertGoalMilestone>): Promise<GoalMilestone | undefined>;
  deleteGoalMilestone(id: string): Promise<boolean>;
  
  // Health Protocol Operations
  createHealthProtocol(protocol: InsertTrainerHealthProtocol): Promise<TrainerHealthProtocol>;
  getHealthProtocol(id: string): Promise<TrainerHealthProtocol | undefined>;
  getTrainerHealthProtocols(trainerId: string): Promise<TrainerHealthProtocol[]>;
  getAllHealthProtocols(): Promise<TrainerHealthProtocol[]>;
  updateHealthProtocol(id: string, updates: Partial<InsertTrainerHealthProtocol>): Promise<TrainerHealthProtocol | undefined>;
  deleteHealthProtocol(id: string): Promise<boolean>;
  
  // Protocol Assignment Operations
  assignProtocolToCustomer(assignment: InsertProtocolAssignment): Promise<ProtocolAssignment>;
  getProtocolAssignments(protocolId: string): Promise<ProtocolAssignment[]>;
  getCustomerProtocolAssignments(customerId: string): Promise<ProtocolAssignment[]>;
  getTrainerProtocolAssignments(trainerId: string): Promise<ProtocolAssignment[]>;
  updateProtocolAssignment(id: string, updates: Partial<InsertProtocolAssignment>): Promise<ProtocolAssignment | undefined>;
  unassignProtocolFromCustomer(protocolId: string, customerId: string): Promise<boolean>;
  
  // Customer management
  getTrainerCustomers(trainerId: string): Promise<{id: string; email: string; firstAssignedAt: string}[]>;
  
  // Transaction support
  transaction<T>(action: (trx: any) => Promise<T>): Promise<T>;
  
  // Health Protocol Methods
  getLongevityProtocolTemplates(): Promise<any[]>;
  getAntiParasiticIngredients(): Promise<any[]>;
  getUserHealthPreferences(userId: string): Promise<any>;
  updateUserHealthPreferences(userId: string, preferences: any): Promise<void>;
  getActiveProtocols(userId: string): Promise<any[]>;
  logProtocolSymptoms(userId: string, logData: any): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async createGoogleUser(userData: { email: string; googleId: string; name: string; profilePicture?: string; role: 'admin' | 'trainer' | 'customer' }): Promise<User> {
    const [user] = await db.insert(users).values({
      email: userData.email,
      googleId: userData.googleId,
      name: userData.name,
      profilePicture: userData.profilePicture,
      role: userData.role,
      password: null, // No password for Google OAuth users
    }).returning();
    return user;
  }

  async linkGoogleAccount(userId: string, googleId: string): Promise<void> {
    await db.update(users).set({ googleId }).where(eq(users.id, userId));
  }

  async updateUserPassword(userId: string, password: string): Promise<void> {
    await db.update(users).set({ password }).where(eq(users.id, userId));
  }

  async updateUserEmail(userId: string, email: string): Promise<void> {
    await db.update(users).set({ email }).where(eq(users.id, userId));
  }

  async getCustomers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, 'customer'));
  }

  async getTrainers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, 'trainer'));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  // Password Reset
  async createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    await db.insert(passwordResetTokens).values({ userId, token, expiresAt });
  }

  async getPasswordResetToken(token: string): Promise<{ userId: string; expiresAt: Date; } | undefined> {
    const [result] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token));
    return result;
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
  }

  // Refresh Token Operations
  async createRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    await db.insert(refreshTokens).values({ userId, token, expiresAt });
  }

  async getRefreshToken(token: string): Promise<{ userId: string; expiresAt: Date; } | undefined> {
    const [result] = await db.select().from(refreshTokens).where(eq(refreshTokens.token, token));
    return result;
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
  }

  // Customer Invitation Operations
  async createInvitation(invitationData: InsertCustomerInvitation): Promise<CustomerInvitation> {
    const [invitation] = await db.insert(customerInvitations).values(invitationData).returning();
    return invitation;
  }

  async getInvitation(token: string): Promise<CustomerInvitation | undefined> {
    const [invitation] = await db.select().from(customerInvitations).where(eq(customerInvitations.token, token));
    return invitation;
  }

  async getInvitationsByTrainer(trainerId: string): Promise<CustomerInvitation[]> {
    return await db
      .select()
      .from(customerInvitations)
      .where(eq(customerInvitations.trainerId, trainerId))
      .orderBy(desc(customerInvitations.createdAt));
  }

  async markInvitationAsUsed(token: string): Promise<void> {
    await db
      .update(customerInvitations)
      .set({ usedAt: new Date() })
      .where(eq(customerInvitations.token, token));
  }

  async deleteExpiredInvitations(): Promise<number> {
    try {
      const result = await db
        .delete(customerInvitations)
        .where(lte(customerInvitations.expiresAt, new Date()));
      return Number(result.rowCount) || 0;
    } catch (error) {
      console.error('Error deleting expired invitations:', error);
      return 0;
    }
  }

  // Progress Tracking Operations
  async createProgressMeasurement(measurementData: InsertProgressMeasurement): Promise<ProgressMeasurement> {
    const [measurement] = await db.insert(progressMeasurements).values(measurementData).returning();
    return measurement;
  }

  async getProgressMeasurements(customerId: string): Promise<ProgressMeasurement[]> {
    return await db
      .select()
      .from(progressMeasurements)
      .where(eq(progressMeasurements.customerId, customerId))
      .orderBy(desc(progressMeasurements.measurementDate));
  }

  async updateProgressMeasurement(id: string, updates: Partial<InsertProgressMeasurement>): Promise<ProgressMeasurement | undefined> {
    const [updated] = await db
      .update(progressMeasurements)
      .set(updates)
      .where(eq(progressMeasurements.id, id))
      .returning();
    return updated;
  }

  async deleteProgressMeasurement(id: string): Promise<boolean> {
    const result = await db.delete(progressMeasurements).where(eq(progressMeasurements.id, id));
    return Number(result.rowCount) > 0;
  }

  async createProgressPhoto(photoData: InsertProgressPhoto): Promise<ProgressPhoto> {
    const [photo] = await db.insert(progressPhotos).values(photoData).returning();
    return photo;
  }

  async getProgressPhotos(customerId: string): Promise<ProgressPhoto[]> {
    return await db
      .select()
      .from(progressPhotos)
      .where(eq(progressPhotos.customerId, customerId))
      .orderBy(desc(progressPhotos.photoDate));
  }

  async deleteProgressPhoto(id: string): Promise<boolean> {
    const result = await db.delete(progressPhotos).where(eq(progressPhotos.id, id));
    return Number(result.rowCount) > 0;
  }

  async createCustomerGoal(goalData: InsertCustomerGoal): Promise<CustomerGoal> {
    const [goal] = await db.insert(customerGoals).values(goalData).returning();
    return goal;
  }

  async getCustomerGoals(customerId: string): Promise<CustomerGoal[]> {
    return await db
      .select()
      .from(customerGoals)
      .where(eq(customerGoals.customerId, customerId))
      .orderBy(desc(customerGoals.createdAt));
  }

  async updateCustomerGoal(id: string, updates: Partial<InsertCustomerGoal>): Promise<CustomerGoal | undefined> {
    const [updated] = await db
      .update(customerGoals)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(customerGoals.id, id))
      .returning();
    return updated;
  }

  async deleteCustomerGoal(id: string): Promise<boolean> {
    const result = await db.delete(customerGoals).where(eq(customerGoals.id, id));
    return Number(result.rowCount) > 0;
  }

  async createGoalMilestone(milestoneData: InsertGoalMilestone): Promise<GoalMilestone> {
    const [milestone] = await db.insert(goalMilestones).values(milestoneData).returning();
    return milestone;
  }

  async getGoalMilestones(goalId: string): Promise<GoalMilestone[]> {
    return await db
      .select()
      .from(goalMilestones)
      .where(eq(goalMilestones.goalId, goalId))
      .orderBy(desc(goalMilestones.createdAt));
  }

  async updateGoalMilestone(id: string, updates: Partial<InsertGoalMilestone>): Promise<GoalMilestone | undefined> {
    const [updated] = await db
      .update(goalMilestones)
      .set(updates)
      .where(eq(goalMilestones.id, id))
      .returning();
    return updated;
  }

  async deleteGoalMilestone(id: string): Promise<boolean> {
    const result = await db.delete(goalMilestones).where(eq(goalMilestones.id, id));
    return Number(result.rowCount) > 0;
  }

  // Health Protocol Operations
  async createHealthProtocol(protocolData: InsertTrainerHealthProtocol): Promise<TrainerHealthProtocol> {
    const [protocol] = await db.insert(trainerHealthProtocols).values(protocolData).returning();
    return protocol;
  }

  async getHealthProtocol(id: string): Promise<TrainerHealthProtocol | undefined> {
    const [protocol] = await db.select().from(trainerHealthProtocols).where(eq(trainerHealthProtocols.id, id));
    return protocol;
  }

  async getTrainerHealthProtocols(trainerId: string): Promise<TrainerHealthProtocol[]> {
    return await db
      .select()
      .from(trainerHealthProtocols)
      .where(eq(trainerHealthProtocols.trainerId, trainerId))
      .orderBy(desc(trainerHealthProtocols.createdAt));
  }

  async getAllHealthProtocols(): Promise<TrainerHealthProtocol[]> {
    return await db
      .select()
      .from(trainerHealthProtocols)
      .orderBy(desc(trainerHealthProtocols.createdAt));
  }

  async updateHealthProtocol(id: string, updates: Partial<InsertTrainerHealthProtocol>): Promise<TrainerHealthProtocol | undefined> {
    const [updated] = await db
      .update(trainerHealthProtocols)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(trainerHealthProtocols.id, id))
      .returning();
    return updated;
  }

  async deleteHealthProtocol(id: string): Promise<boolean> {
    const result = await db.delete(trainerHealthProtocols).where(eq(trainerHealthProtocols.id, id));
    return Number(result.rowCount) > 0;
  }

  // Protocol Assignment Operations
  async assignProtocolToCustomer(assignmentData: InsertProtocolAssignment): Promise<ProtocolAssignment> {
    const [assignment] = await db.insert(protocolAssignments).values(assignmentData).returning();
    return assignment;
  }

  async getProtocolAssignments(protocolId: string): Promise<ProtocolAssignment[]> {
    return await db
      .select()
      .from(protocolAssignments)
      .where(eq(protocolAssignments.protocolId, protocolId))
      .orderBy(desc(protocolAssignments.assignedAt));
  }

  async getCustomerProtocolAssignments(customerId: string): Promise<ProtocolAssignment[]> {
    return await db
      .select()
      .from(protocolAssignments)
      .where(eq(protocolAssignments.customerId, customerId))
      .orderBy(desc(protocolAssignments.assignedAt));
  }

  async getTrainerProtocolAssignments(trainerId: string): Promise<ProtocolAssignment[]> {
    return await db
      .select()
      .from(protocolAssignments)
      .where(eq(protocolAssignments.trainerId, trainerId))
      .orderBy(desc(protocolAssignments.assignedAt));
  }

  async updateProtocolAssignment(id: string, updates: Partial<InsertProtocolAssignment>): Promise<ProtocolAssignment | undefined> {
    const [updated] = await db
      .update(protocolAssignments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(protocolAssignments.id, id))
      .returning();
    return updated;
  }

  async unassignProtocolFromCustomer(protocolId: string, customerId: string): Promise<boolean> {
    const result = await db
      .delete(protocolAssignments)
      .where(
        and(
          eq(protocolAssignments.protocolId, protocolId),
          eq(protocolAssignments.customerId, customerId)
        )
      );
    return Number(result.rowCount) > 0;
  }

  // Customer management functions
  async getTrainerCustomers(trainerId: string): Promise<{id: string; email: string; firstAssignedAt: string}[]> {
    // Get unique customers who have protocols assigned by this trainer
    const customersWithProtocols = await db.select({
      customerId: protocolAssignments.customerId,
      customerEmail: users.email,
      assignedAt: protocolAssignments.assignedAt,
    })
    .from(protocolAssignments)
    .innerJoin(users, eq(users.id, protocolAssignments.customerId))
    .where(eq(protocolAssignments.trainerId, trainerId));
    
    // Combine and deduplicate customers
    const customerMap = new Map();
    
    customersWithProtocols.forEach(customer => {
      if (!customerMap.has(customer.customerId)) {
        customerMap.set(customer.customerId, {
          id: customer.customerId,
          email: customer.customerEmail,
          firstAssignedAt: customer.assignedAt?.toISOString() || new Date().toISOString(),
        });
      } else {
        const existing = customerMap.get(customer.customerId);
        if (customer.assignedAt && existing.firstAssignedAt && customer.assignedAt < new Date(existing.firstAssignedAt)) {
          existing.firstAssignedAt = customer.assignedAt.toISOString();
        }
      }
    });
    
    return Array.from(customerMap.values());
  }

  // Transaction support
  async transaction<T>(action: (trx: any) => Promise<T>): Promise<T> {
    return db.transaction(action);
  }
  
  // Health Protocol Methods Implementation
  async getLongevityProtocolTemplates(): Promise<any[]> {
    // Mock data for longevity protocol templates
    return [
      {
        id: 'longevity-beginner',
        name: 'Beginner Longevity Protocol',
        fastingType: '16:8',
        duration: 30,
        antioxidantFocus: ['berries', 'leafyGreens']
      },
      {
        id: 'longevity-advanced',
        name: 'Advanced Longevity Protocol', 
        fastingType: '20:4',
        duration: 60,
        antioxidantFocus: ['all']
      }
    ];
  }

  async getAntiParasiticIngredients(): Promise<any[]> {
    // Mock data for anti-parasitic ingredients
    return [
      {
        id: 'garlic',
        name: 'Garlic',
        category: 'antiParasitic',
        properties: ['antimicrobial', 'immune-supporting']
      },
      {
        id: 'ginger',
        name: 'Ginger',
        category: 'antiParasitic',
        properties: ['digestive', 'anti-inflammatory']
      },
      {
        id: 'turmeric',
        name: 'Turmeric',
        category: 'antiParasitic',
        properties: ['anti-inflammatory', 'liver-supporting']
      },
      {
        id: 'pumpkin-seeds',
        name: 'Pumpkin Seeds',
        category: 'antiParasitic',
        properties: ['zinc-rich', 'traditionally-used']
      }
    ];
  }

  async getUserHealthPreferences(userId: string): Promise<any> {
    // Mock implementation - in a real app, this would fetch from database
    return {
      longevityGoals: [],
      fastingProtocol: '16:8',
      cleanseExperience: 'beginner',
      culturalPreferences: [],
      medicalConditions: [],
      pregnancyBreastfeeding: false
    };
  }

  async updateUserHealthPreferences(userId: string, preferences: any): Promise<void> {
    // Mock implementation - in a real app, this would update database
    console.log(`Updating health preferences for user ${userId}:`, preferences);
  }

  async getActiveProtocols(userId: string): Promise<any[]> {
    // Mock implementation - in a real app, this would fetch active protocols from database
    return [];
  }

  async logProtocolSymptoms(userId: string, logData: any): Promise<void> {
    // Mock implementation - in a real app, this would log symptoms to database
    console.log(`Logging symptoms for user ${userId}:`, logData);
  }
}

export const storage: IStorage = new DatabaseStorage();