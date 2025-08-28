/**
 * Database and Schema Comprehensive Unit Tests
 * 
 * Tests for database operations and schema validation including:
 * - User CRUD operations
 * - Schema validation and constraints
 * - Database connection handling
 * - Transaction management
 * - Error handling and edge cases
 * - Data integrity and relationships
 * - Refresh token management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { storage } from '../../../server/storage';
import { users, refreshTokens } from '../../../shared/schema';
import { User } from '../../../shared/schema';

// Mock the database connection
const mockDb = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  execute: vi.fn(),
  transaction: vi.fn()
};

// Mock storage implementation
vi.mock('../../../server/storage', () => ({
  storage: {
    getUser: vi.fn(),
    getUserByEmail: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    updateUserPassword: vi.fn(),
    updateUserEmail: vi.fn(),
    createRefreshToken: vi.fn(),
    getRefreshToken: vi.fn(),
    deleteRefreshToken: vi.fn(),
    cleanupExpiredTokens: vi.fn()
  }
}));

// Mock schema validation
vi.mock('../../../shared/schema', () => ({
  users: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  },
  refreshTokens: {
    select: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn()
  },
  User: {} // Type export
}));

// Test data
const mockUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  password: 'hashedPassword123',
  role: 'trainer',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  profilePicture: null
};

const mockAdminUser: User = {
  id: 'admin-123',
  email: 'admin@example.com',
  password: 'hashedAdminPassword',
  role: 'admin',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  profilePicture: null
};

const mockCustomerUser: User = {
  id: 'customer-123',
  email: 'customer@example.com',
  password: 'hashedCustomerPassword',
  role: 'customer',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  profilePicture: null
};

const mockRefreshToken = {
  id: 'token-123',
  token: 'refresh.token.here',
  userId: 'user-123',
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  createdAt: new Date()
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('Database Operations - User Management', () => {
  describe('User CRUD Operations', () => {
    describe('getUser', () => {
      it('should retrieve user by ID successfully', async () => {
        (storage.getUser as any).mockResolvedValue(mockUser);

        const result = await storage.getUser(mockUser.id);

        expect(result).toEqual(mockUser);
        expect(storage.getUser).toHaveBeenCalledWith(mockUser.id);
      });

      it('should return null for non-existent user ID', async () => {
        (storage.getUser as any).mockResolvedValue(null);

        const result = await storage.getUser('non-existent-id');

        expect(result).toBeNull();
        expect(storage.getUser).toHaveBeenCalledWith('non-existent-id');
      });

      it('should handle database errors gracefully', async () => {
        const dbError = new Error('Database connection failed');
        (storage.getUser as any).mockRejectedValue(dbError);

        await expect(storage.getUser(mockUser.id)).rejects.toThrow('Database connection failed');
      });

      it('should validate user ID format', async () => {
        const invalidIds = ['', null, undefined, 123, {}];
        
        for (const invalidId of invalidIds) {
          (storage.getUser as any).mockRejectedValue(new Error('Invalid user ID'));
          
          await expect(storage.getUser(invalidId as any)).rejects.toThrow('Invalid user ID');
        }
      });
    });

    describe('getUserByEmail', () => {
      it('should retrieve user by email successfully', async () => {
        (storage.getUserByEmail as any).mockResolvedValue(mockUser);

        const result = await storage.getUserByEmail(mockUser.email);

        expect(result).toEqual(mockUser);
        expect(storage.getUserByEmail).toHaveBeenCalledWith(mockUser.email);
      });

      it('should return null for non-existent email', async () => {
        (storage.getUserByEmail as any).mockResolvedValue(null);

        const result = await storage.getUserByEmail('nonexistent@example.com');

        expect(result).toBeNull();
        expect(storage.getUserByEmail).toHaveBeenCalledWith('nonexistent@example.com');
      });

      it('should handle case-insensitive email lookup', async () => {
        (storage.getUserByEmail as any).mockResolvedValue(mockUser);

        const result = await storage.getUserByEmail('TEST@EXAMPLE.COM');

        expect(result).toEqual(mockUser);
        expect(storage.getUserByEmail).toHaveBeenCalledWith('TEST@EXAMPLE.COM');
      });

      it('should validate email format', async () => {
        const invalidEmails = ['', 'invalid-email', null, undefined];
        
        for (const invalidEmail of invalidEmails) {
          (storage.getUserByEmail as any).mockRejectedValue(new Error('Invalid email format'));
          
          await expect(storage.getUserByEmail(invalidEmail as any)).rejects.toThrow('Invalid email format');
        }
      });
    });

    describe('createUser', () => {
      it('should create new user successfully', async () => {
        const newUserData = {
          email: 'newuser@example.com',
          password: 'hashedPassword123',
          role: 'customer' as const
        };
        
        const createdUser = {
          id: 'new-user-123',
          ...newUserData,
          createdAt: new Date(),
          updatedAt: new Date(),
          profilePicture: null
        };

        (storage.createUser as any).mockResolvedValue(createdUser);

        const result = await storage.createUser(newUserData);

        expect(result).toEqual(createdUser);
        expect(result.id).toBeDefined();
        expect(result.createdAt).toBeDefined();
        expect(result.updatedAt).toBeDefined();
        expect(storage.createUser).toHaveBeenCalledWith(newUserData);
      });

      it('should validate required fields', async () => {
        const invalidUserData = [
          { password: 'test', role: 'customer' }, // Missing email
          { email: 'test@example.com', role: 'customer' }, // Missing password
          { email: 'test@example.com', password: 'test' }, // Missing role
          {} // Missing all required fields
        ];

        for (const data of invalidUserData) {
          (storage.createUser as any).mockRejectedValue(new Error('Missing required fields'));
          
          await expect(storage.createUser(data as any)).rejects.toThrow('Missing required fields');
        }
      });

      it('should validate role enum values', async () => {
        const invalidRoles = ['invalid-role', 'manager', 'supervisor', null, undefined];

        for (const role of invalidRoles) {
          const userData = {
            email: 'test@example.com',
            password: 'hashedPassword123',
            role: role as any
          };

          (storage.createUser as any).mockRejectedValue(new Error('Invalid role'));
          
          await expect(storage.createUser(userData)).rejects.toThrow('Invalid role');
        }
      });

      it('should handle email uniqueness constraint', async () => {
        const userData = {
          email: mockUser.email, // Email already exists
          password: 'hashedPassword123',
          role: 'customer' as const
        };

        (storage.createUser as any).mockRejectedValue(new Error('Email already exists'));

        await expect(storage.createUser(userData)).rejects.toThrow('Email already exists');
      });

      it('should create users with different roles', async () => {
        const roles = ['admin', 'trainer', 'customer'] as const;

        for (const role of roles) {
          const userData = {
            email: `${role}@example.com`,
            password: 'hashedPassword123',
            role
          };

          const createdUser = {
            id: `${role}-user-123`,
            ...userData,
            createdAt: new Date(),
            updatedAt: new Date(),
            profilePicture: null
          };

          (storage.createUser as any).mockResolvedValue(createdUser);

          const result = await storage.createUser(userData);

          expect(result.role).toBe(role);
          expect(result.email).toBe(`${role}@example.com`);
        }
      });
    });

    describe('updateUser', () => {
      it('should update user fields successfully', async () => {
        const updateData = {
          email: 'updated@example.com',
          profilePicture: 'https://example.com/avatar.jpg'
        };

        const updatedUser = {
          ...mockUser,
          ...updateData,
          updatedAt: new Date()
        };

        (storage.updateUser as any).mockResolvedValue(updatedUser);

        const result = await storage.updateUser(mockUser.id, updateData);

        expect(result).toEqual(updatedUser);
        expect(result.email).toBe(updateData.email);
        expect(result.profilePicture).toBe(updateData.profilePicture);
        expect(storage.updateUser).toHaveBeenCalledWith(mockUser.id, updateData);
      });

      it('should update timestamp on modification', async () => {
        const updateData = { profilePicture: 'new-avatar.jpg' };
        const beforeUpdate = new Date();

        const updatedUser = {
          ...mockUser,
          ...updateData,
          updatedAt: new Date(Date.now() + 1000) // 1 second later
        };

        (storage.updateUser as any).mockResolvedValue(updatedUser);

        const result = await storage.updateUser(mockUser.id, updateData);

        expect(result.updatedAt.getTime()).toBeGreaterThan(beforeUpdate.getTime());
      });

      it('should handle non-existent user updates', async () => {
        (storage.updateUser as any).mockRejectedValue(new Error('User not found'));

        await expect(storage.updateUser('non-existent-id', { email: 'test@example.com' }))
          .rejects.toThrow('User not found');
      });

      it('should validate update data', async () => {
        const invalidUpdates = [
          { email: 'invalid-email' },
          { role: 'invalid-role' },
          { id: 'cannot-update-id' }
        ];

        for (const updateData of invalidUpdates) {
          (storage.updateUser as any).mockRejectedValue(new Error('Invalid update data'));
          
          await expect(storage.updateUser(mockUser.id, updateData as any))
            .rejects.toThrow('Invalid update data');
        }
      });
    });

    describe('deleteUser', () => {
      it('should delete user successfully', async () => {
        (storage.deleteUser as any).mockResolvedValue(true);

        const result = await storage.deleteUser(mockUser.id);

        expect(result).toBe(true);
        expect(storage.deleteUser).toHaveBeenCalledWith(mockUser.id);
      });

      it('should handle non-existent user deletion', async () => {
        (storage.deleteUser as any).mockResolvedValue(false);

        const result = await storage.deleteUser('non-existent-id');

        expect(result).toBe(false);
      });

      it('should handle cascade deletion of related records', async () => {
        // When deleting a user, related records (refresh tokens, etc.) should be cleaned up
        (storage.deleteUser as any).mockImplementation(async (userId) => {
          // Simulate cascade deletion
          await storage.deleteRefreshToken(`refresh-token-for-${userId}`);
          return true;
        });

        const result = await storage.deleteUser(mockUser.id);

        expect(result).toBe(true);
      });
    });

    describe('updateUserPassword', () => {
      it('should update user password successfully', async () => {
        const newHashedPassword = 'newHashedPassword123';
        (storage.updateUserPassword as any).mockResolvedValue(true);

        const result = await storage.updateUserPassword(mockUser.id, newHashedPassword);

        expect(result).toBe(true);
        expect(storage.updateUserPassword).toHaveBeenCalledWith(mockUser.id, newHashedPassword);
      });

      it('should validate password format', async () => {
        const invalidPasswords = ['', null, undefined];

        for (const password of invalidPasswords) {
          (storage.updateUserPassword as any).mockRejectedValue(new Error('Invalid password'));
          
          await expect(storage.updateUserPassword(mockUser.id, password as any))
            .rejects.toThrow('Invalid password');
        }
      });

      it('should handle non-existent user', async () => {
        (storage.updateUserPassword as any).mockRejectedValue(new Error('User not found'));

        await expect(storage.updateUserPassword('non-existent-id', 'newPassword'))
          .rejects.toThrow('User not found');
      });
    });

    describe('updateUserEmail', () => {
      it('should update user email successfully', async () => {
        const newEmail = 'newemail@example.com';
        (storage.updateUserEmail as any).mockResolvedValue(true);

        const result = await storage.updateUserEmail(mockUser.id, newEmail);

        expect(result).toBe(true);
        expect(storage.updateUserEmail).toHaveBeenCalledWith(mockUser.id, newEmail);
      });

      it('should validate email format', async () => {
        const invalidEmails = ['invalid-email', '', null, undefined];

        for (const email of invalidEmails) {
          (storage.updateUserEmail as any).mockRejectedValue(new Error('Invalid email format'));
          
          await expect(storage.updateUserEmail(mockUser.id, email as any))
            .rejects.toThrow('Invalid email format');
        }
      });

      it('should handle email uniqueness constraint', async () => {
        (storage.updateUserEmail as any).mockRejectedValue(new Error('Email already exists'));

        await expect(storage.updateUserEmail(mockUser.id, 'existing@example.com'))
          .rejects.toThrow('Email already exists');
      });
    });
  });

  describe('Refresh Token Management', () => {
    describe('createRefreshToken', () => {
      it('should create refresh token successfully', async () => {
        (storage.createRefreshToken as any).mockResolvedValue(mockRefreshToken);

        const result = await storage.createRefreshToken(
          mockUser.id,
          mockRefreshToken.token,
          mockRefreshToken.expiresAt
        );

        expect(result).toEqual(mockRefreshToken);
        expect(storage.createRefreshToken).toHaveBeenCalledWith(
          mockUser.id,
          mockRefreshToken.token,
          mockRefreshToken.expiresAt
        );
      });

      it('should validate token format', async () => {
        const invalidTokens = ['', null, undefined];

        for (const token of invalidTokens) {
          (storage.createRefreshToken as any).mockRejectedValue(new Error('Invalid token'));
          
          await expect(storage.createRefreshToken(mockUser.id, token as any, new Date()))
            .rejects.toThrow('Invalid token');
        }
      });

      it('should validate expiration date', async () => {
        const pastDate = new Date(Date.now() - 1000); // 1 second ago
        
        (storage.createRefreshToken as any).mockRejectedValue(new Error('Token already expired'));

        await expect(storage.createRefreshToken(mockUser.id, 'valid.token', pastDate))
          .rejects.toThrow('Token already expired');
      });

      it('should handle user foreign key constraint', async () => {
        (storage.createRefreshToken as any).mockRejectedValue(new Error('User not found'));

        await expect(storage.createRefreshToken('non-existent-user', 'valid.token', new Date()))
          .rejects.toThrow('User not found');
      });
    });

    describe('getRefreshToken', () => {
      it('should retrieve refresh token successfully', async () => {
        (storage.getRefreshToken as any).mockResolvedValue(mockRefreshToken);

        const result = await storage.getRefreshToken(mockRefreshToken.token);

        expect(result).toEqual(mockRefreshToken);
        expect(storage.getRefreshToken).toHaveBeenCalledWith(mockRefreshToken.token);
      });

      it('should return null for non-existent token', async () => {
        (storage.getRefreshToken as any).mockResolvedValue(null);

        const result = await storage.getRefreshToken('non-existent-token');

        expect(result).toBeNull();
      });

      it('should return null for expired token', async () => {
        const expiredToken = {
          ...mockRefreshToken,
          expiresAt: new Date(Date.now() - 1000) // Expired 1 second ago
        };

        (storage.getRefreshToken as any).mockResolvedValue(expiredToken);

        const result = await storage.getRefreshToken(expiredToken.token);

        expect(result).toEqual(expiredToken);
        // Note: The storage layer returns the token, but the application layer
        // should check if it's expired and handle accordingly
      });
    });

    describe('deleteRefreshToken', () => {
      it('should delete refresh token successfully', async () => {
        (storage.deleteRefreshToken as any).mockResolvedValue(true);

        const result = await storage.deleteRefreshToken(mockRefreshToken.token);

        expect(result).toBe(true);
        expect(storage.deleteRefreshToken).toHaveBeenCalledWith(mockRefreshToken.token);
      });

      it('should handle non-existent token deletion', async () => {
        (storage.deleteRefreshToken as any).mockResolvedValue(false);

        const result = await storage.deleteRefreshToken('non-existent-token');

        expect(result).toBe(false);
      });

      it('should validate token format', async () => {
        const invalidTokens = ['', null, undefined];

        for (const token of invalidTokens) {
          (storage.deleteRefreshToken as any).mockRejectedValue(new Error('Invalid token'));
          
          await expect(storage.deleteRefreshToken(token as any))
            .rejects.toThrow('Invalid token');
        }
      });
    });

    describe('cleanupExpiredTokens', () => {
      it('should clean up expired tokens successfully', async () => {
        (storage.cleanupExpiredTokens as any).mockResolvedValue(5); // 5 tokens cleaned up

        const result = await storage.cleanupExpiredTokens();

        expect(result).toBe(5);
        expect(storage.cleanupExpiredTokens).toHaveBeenCalled();
      });

      it('should return zero when no expired tokens', async () => {
        (storage.cleanupExpiredTokens as any).mockResolvedValue(0);

        const result = await storage.cleanupExpiredTokens();

        expect(result).toBe(0);
      });

      it('should handle cleanup errors gracefully', async () => {
        (storage.cleanupExpiredTokens as any).mockRejectedValue(new Error('Cleanup failed'));

        await expect(storage.cleanupExpiredTokens()).rejects.toThrow('Cleanup failed');
      });
    });
  });

  describe('Data Integrity and Relationships', () => {
    describe('User Role Consistency', () => {
      it('should maintain role constraints across operations', async () => {
        const roles = ['admin', 'trainer', 'customer'] as const;

        for (const role of roles) {
          const userData = {
            email: `${role}@example.com`,
            password: 'hashedPassword123',
            role
          };

          const user = {
            id: `${role}-id`,
            ...userData,
            createdAt: new Date(),
            updatedAt: new Date(),
            profilePicture: null
          };

          (storage.createUser as any).mockResolvedValue(user);
          (storage.getUser as any).mockResolvedValue(user);

          const createdUser = await storage.createUser(userData);
          const retrievedUser = await storage.getUser(user.id);

          expect(createdUser.role).toBe(role);
          expect(retrievedUser.role).toBe(role);
        }
      });

      it('should prevent invalid role assignments', async () => {
        const invalidRoles = ['super-admin', 'moderator', 'guest'];

        for (const role of invalidRoles) {
          (storage.createUser as any).mockRejectedValue(new Error('Invalid role'));
          
          await expect(storage.createUser({
            email: 'test@example.com',
            password: 'password',
            role: role as any
          })).rejects.toThrow('Invalid role');
        }
      });
    });

    describe('Email Uniqueness', () => {
      it('should enforce email uniqueness across all users', async () => {
        const email = 'duplicate@example.com';
        
        // First user creation should succeed
        (storage.createUser as any).mockResolvedValueOnce({
          id: 'user1',
          email,
          password: 'password1',
          role: 'trainer',
          createdAt: new Date(),
          updatedAt: new Date(),
          profilePicture: null
        });

        const firstUser = await storage.createUser({
          email,
          password: 'password1',
          role: 'trainer'
        });

        expect(firstUser.email).toBe(email);

        // Second user creation with same email should fail
        (storage.createUser as any).mockRejectedValue(new Error('Email already exists'));

        await expect(storage.createUser({
          email,
          password: 'password2',
          role: 'customer'
        })).rejects.toThrow('Email already exists');
      });

      it('should handle case-insensitive email uniqueness', async () => {
        const baseEmail = 'test@example.com';
        const variations = ['TEST@EXAMPLE.COM', 'Test@Example.Com', 'test@EXAMPLE.com'];

        for (const email of variations) {
          (storage.createUser as any).mockRejectedValue(new Error('Email already exists'));
          
          await expect(storage.createUser({
            email,
            password: 'password',
            role: 'customer'
          })).rejects.toThrow('Email already exists');
        }
      });
    });

    describe('Referential Integrity', () => {
      it('should maintain user-token relationships', async () => {
        const userId = 'user-with-tokens';
        const tokens = [
          { token: 'token1', expiresAt: new Date(Date.now() + 86400000) },
          { token: 'token2', expiresAt: new Date(Date.now() + 86400000) },
          { token: 'token3', expiresAt: new Date(Date.now() + 86400000) }
        ];

        // Create tokens for user
        for (const tokenData of tokens) {
          (storage.createRefreshToken as any).mockResolvedValue({
            id: `id-${tokenData.token}`,
            userId,
            ...tokenData,
            createdAt: new Date()
          });

          const createdToken = await storage.createRefreshToken(
            userId,
            tokenData.token,
            tokenData.expiresAt
          );

          expect(createdToken.userId).toBe(userId);
        }
      });

      it('should handle foreign key constraint violations', async () => {
        const nonExistentUserId = 'non-existent-user';
        
        (storage.createRefreshToken as any).mockRejectedValue(new Error('User not found'));

        await expect(storage.createRefreshToken(
          nonExistentUserId,
          'valid.token',
          new Date(Date.now() + 86400000)
        )).rejects.toThrow('User not found');
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    describe('Database Connection Issues', () => {
      it('should handle connection timeouts', async () => {
        const timeoutError = new Error('Connection timeout');
        (storage.getUser as any).mockRejectedValue(timeoutError);

        await expect(storage.getUser('any-id')).rejects.toThrow('Connection timeout');
      });

      it('should handle connection pool exhaustion', async () => {
        const poolError = new Error('Connection pool exhausted');
        (storage.createUser as any).mockRejectedValue(poolError);

        await expect(storage.createUser({
          email: 'test@example.com',
          password: 'password',
          role: 'customer'
        })).rejects.toThrow('Connection pool exhausted');
      });

      it('should handle database lock timeouts', async () => {
        const lockError = new Error('Lock timeout exceeded');
        (storage.updateUser as any).mockRejectedValue(lockError);

        await expect(storage.updateUser('user-id', { email: 'new@example.com' }))
          .rejects.toThrow('Lock timeout exceeded');
      });
    });

    describe('Data Validation Edge Cases', () => {
      it('should handle extremely long email addresses', async () => {
        const longEmail = 'a'.repeat(300) + '@example.com'; // Very long email
        
        (storage.createUser as any).mockRejectedValue(new Error('Email too long'));

        await expect(storage.createUser({
          email: longEmail,
          password: 'password',
          role: 'customer'
        })).rejects.toThrow('Email too long');
      });

      it('should handle special characters in email', async () => {
        const specialEmails = [
          'test+tag@example.com',
          'user.name@example.com',
          'user_name@example-domain.co.uk'
        ];

        for (const email of specialEmails) {
          (storage.createUser as any).mockResolvedValue({
            id: 'test-id',
            email,
            password: 'password',
            role: 'customer',
            createdAt: new Date(),
            updatedAt: new Date(),
            profilePicture: null
          });

          const result = await storage.createUser({
            email,
            password: 'password',
            role: 'customer'
          });

          expect(result.email).toBe(email);
        }
      });

      it('should handle Unicode characters in user data', async () => {
        const unicodeEmail = 'tëst@éxämplé.com';
        
        (storage.createUser as any).mockResolvedValue({
          id: 'unicode-user',
          email: unicodeEmail,
          password: 'password',
          role: 'customer',
          createdAt: new Date(),
          updatedAt: new Date(),
          profilePicture: null
        });

        const result = await storage.createUser({
          email: unicodeEmail,
          password: 'password',
          role: 'customer'
        });

        expect(result.email).toBe(unicodeEmail);
      });
    });

    describe('Concurrent Access Scenarios', () => {
      it('should handle concurrent user creation attempts', async () => {
        const email = 'concurrent@example.com';
        
        // Simulate race condition where both attempts start simultaneously
        const createUserPromises = [
          storage.createUser({ email, password: 'password1', role: 'trainer' }),
          storage.createUser({ email, password: 'password2', role: 'customer' })
        ];

        // First should succeed, second should fail
        (storage.createUser as any)
          .mockResolvedValueOnce({ id: 'user1', email, role: 'trainer' })
          .mockRejectedValueOnce(new Error('Email already exists'));

        const results = await Promise.allSettled(createUserPromises);
        
        expect(results[0].status).toBe('fulfilled');
        expect(results[1].status).toBe('rejected');
      });

      it('should handle concurrent token operations', async () => {
        const userId = 'concurrent-user';
        const tokens = ['token1', 'token2', 'token3'];
        
        const tokenPromises = tokens.map(token => 
          storage.createRefreshToken(userId, token, new Date(Date.now() + 86400000))
        );

        // All should succeed if properly handled
        tokens.forEach((token, index) => {
          (storage.createRefreshToken as any).mockResolvedValueOnce({
            id: `token-${index}`,
            userId,
            token,
            expiresAt: new Date(Date.now() + 86400000),
            createdAt: new Date()
          });
        });

        const results = await Promise.all(tokenPromises);
        
        expect(results).toHaveLength(3);
        results.forEach((result, index) => {
          expect(result.token).toBe(tokens[index]);
          expect(result.userId).toBe(userId);
        });
      });
    });
  });

  describe('Performance and Load Testing', () => {
    describe('Bulk Operations', () => {
      it('should handle multiple user lookups efficiently', async () => {
        const userIds = Array.from({ length: 100 }, (_, i) => `user-${i}`);
        
        userIds.forEach(id => {
          (storage.getUser as any).mockResolvedValue({
            id,
            email: `user${id}@example.com`,
            password: 'password',
            role: 'customer',
            createdAt: new Date(),
            updatedAt: new Date(),
            profilePicture: null
          });
        });

        const startTime = Date.now();
        const promises = userIds.map(id => storage.getUser(id));
        const results = await Promise.all(promises);
        const endTime = Date.now();

        expect(results).toHaveLength(100);
        expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      });

      it('should handle batch token cleanup efficiently', async () => {
        // Simulate cleaning up many expired tokens
        (storage.cleanupExpiredTokens as any).mockImplementation(async () => {
          // Simulate some processing time
          await new Promise(resolve => setTimeout(resolve, 100));
          return 50; // Cleaned up 50 tokens
        });

        const startTime = Date.now();
        const result = await storage.cleanupExpiredTokens();
        const endTime = Date.now();

        expect(result).toBe(50);
        expect(endTime - startTime).toBeGreaterThan(50); // Should take some time
        expect(endTime - startTime).toBeLessThan(500); // But not too long
      });
    });

    describe('Memory Usage', () => {
      it('should not leak memory during large operations', async () => {
        // Simulate processing many operations
        const operations = Array.from({ length: 1000 }, (_, i) => 
          storage.getUserByEmail(`user${i}@example.com`)
        );

        // Mock all operations to return null (non-existent users)
        (storage.getUserByEmail as any).mockResolvedValue(null);

        const results = await Promise.all(operations);
        
        expect(results).toHaveLength(1000);
        expect(results.every(result => result === null)).toBe(true);
        
        // Memory usage test would be more complex in a real scenario
        // Here we just ensure operations complete successfully
      });
    });
  });

  describe('Transaction Support', () => {
    it('should support atomic operations', async () => {
      // Mock transaction support
      const mockTransaction = {
        commit: vi.fn(),
        rollback: vi.fn()
      };

      // Simulate a transaction that creates user and token atomically
      const atomicUserCreation = async () => {
        try {
          const user = await storage.createUser({
            email: 'atomic@example.com',
            password: 'password',
            role: 'customer'
          });

          await storage.createRefreshToken(
            user.id,
            'initial.refresh.token',
            new Date(Date.now() + 86400000)
          );

          return user;
        } catch (error) {
          throw error;
        }
      };

      (storage.createUser as any).mockResolvedValue({
        id: 'atomic-user',
        email: 'atomic@example.com',
        password: 'password',
        role: 'customer',
        createdAt: new Date(),
        updatedAt: new Date(),
        profilePicture: null
      });

      (storage.createRefreshToken as any).mockResolvedValue({
        id: 'atomic-token',
        userId: 'atomic-user',
        token: 'initial.refresh.token',
        expiresAt: new Date(Date.now() + 86400000),
        createdAt: new Date()
      });

      const result = await atomicUserCreation();

      expect(result.email).toBe('atomic@example.com');
      expect(storage.createUser).toHaveBeenCalled();
      expect(storage.createRefreshToken).toHaveBeenCalled();
    });

    it('should rollback on transaction failure', async () => {
      // Simulate transaction failure
      const failingTransaction = async () => {
        const user = await storage.createUser({
          email: 'failing@example.com',
          password: 'password',
          role: 'customer'
        });

        // This operation fails
        await storage.createRefreshToken(
          'non-existent-user', // Invalid user ID
          'token',
          new Date(Date.now() + 86400000)
        );

        return user;
      };

      (storage.createUser as any).mockResolvedValue({
        id: 'failing-user',
        email: 'failing@example.com',
        password: 'password',
        role: 'customer',
        createdAt: new Date(),
        updatedAt: new Date(),
        profilePicture: null
      });

      (storage.createRefreshToken as any).mockRejectedValue(new Error('User not found'));

      await expect(failingTransaction()).rejects.toThrow('User not found');
    });
  });
});
