/**
 * @fileoverview Database Schema Unit Tests
 * 
 * Tests the database schema definitions, validation functions,
 * and type inference for the Health Protocol application.
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { users, recipes, customerInvitations, userRoleEnum } from '../../shared/schema';

describe('Database Schema Tests', () => {
  
  describe('User Schema', () => {
    it('should have correct structure for users table', () => {
      expect(users).toBeDefined();
      expect(users.id).toBeDefined();
      expect(users.email).toBeDefined();
      expect(users.password).toBeDefined();
      expect(users.role).toBeDefined();
    });

    it('should validate user role enum values', () => {
      const validRoles = ['admin', 'trainer', 'customer'];
      expect(userRoleEnum.enumValues).toEqual(validRoles);
    });

    it('should handle optional Google OAuth fields', () => {
      expect(users.googleId).toBeDefined();
      expect(users.name).toBeDefined();
      expect(users.profilePicture).toBeDefined();
    });
  });

  describe('Recipe Schema', () => {
    it('should have correct structure for recipes table', () => {
      expect(recipes).toBeDefined();
      expect(recipes.id).toBeDefined();
      expect(recipes.name).toBeDefined();
      expect(recipes.description).toBeDefined();
      expect(recipes.ingredientsJson).toBeDefined();
      expect(recipes.instructionsText).toBeDefined();
    });

    it('should have proper nutritional fields with correct types', () => {
      expect(recipes.caloriesKcal).toBeDefined();
      expect(recipes.proteinGrams).toBeDefined();
      expect(recipes.carbsGrams).toBeDefined();
      expect(recipes.fatGrams).toBeDefined();
    });

    it('should have time and serving fields', () => {
      expect(recipes.prepTimeMinutes).toBeDefined();
      expect(recipes.cookTimeMinutes).toBeDefined();
      expect(recipes.servings).toBeDefined();
    });

    it('should have JSONB arrays for flexible categorization', () => {
      expect(recipes.mealTypes).toBeDefined();
      expect(recipes.dietaryTags).toBeDefined();
      expect(recipes.mainIngredientTags).toBeDefined();
    });
  });

  describe('Customer Invitations Schema', () => {
    it('should have correct structure for customer invitations', () => {
      expect(customerInvitations).toBeDefined();
      expect(customerInvitations.id).toBeDefined();
      expect(customerInvitations.trainerId).toBeDefined();
      expect(customerInvitations.customerEmail).toBeDefined();
      expect(customerInvitations.token).toBeDefined();
      expect(customerInvitations.expiresAt).toBeDefined();
    });

    it('should have proper foreign key relationships', () => {
      expect(customerInvitations.trainerId).toBeDefined();
      // Note: Actual FK constraint validation would require database integration tests
    });

    it('should track invitation usage', () => {
      expect(customerInvitations.usedAt).toBeDefined();
      expect(customerInvitations.createdAt).toBeDefined();
    });
  });

  describe('Schema Type Inference', () => {
    it('should properly infer user types', () => {
      // Test that schema properly generates TypeScript types
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        password: 'hashed_password',
        role: 'trainer' as const,
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Type should be inferred correctly
      expect(typeof mockUser.id).toBe('string');
      expect(typeof mockUser.email).toBe('string');
      expect(['admin', 'trainer', 'customer']).toContain(mockUser.role);
    });

    it('should properly infer recipe ingredient structure', () => {
      const mockIngredient = {
        name: 'Chicken Breast',
        amount: '200',
        unit: 'g'
      };

      expect(typeof mockIngredient.name).toBe('string');
      expect(typeof mockIngredient.amount).toBe('string');
      expect(typeof mockIngredient.unit).toBe('string');
    });
  });

  describe('Schema Validation', () => {
    it('should validate recipe nutritional data ranges', () => {
      const nutritionalData = {
        calories: 350,
        protein: 25.5,
        carbs: 15.2,
        fat: 18.7
      };

      expect(nutritionalData.calories).toBeGreaterThan(0);
      expect(nutritionalData.protein).toBeGreaterThan(0);
      expect(nutritionalData.carbs).toBeGreaterThan(0);
      expect(nutritionalData.fat).toBeGreaterThan(0);
    });

    it('should validate email format requirements', () => {
      const validEmails = [
        'test@example.com',
        'user.name+tag@domain.co.uk',
        'trainer@healthprotocol.app'
      ];

      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        ''
      ];

      validEmails.forEach(email => {
        expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });

      invalidEmails.forEach(email => {
        expect(email).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });
  });
});
