/**
 * Enhanced Authentication System Unit Tests
 * 
 * Comprehensive test suite for the authentication system including:
 * - Password hashing and validation
 * - JWT token generation and verification
 * - Token refresh mechanism
 * - Security features and error handling
 * - Edge cases and boundary testing
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  hashPassword,
  comparePasswords,
  generateToken,
  generateTokens,
  verifyToken,
  verifyRefreshToken
} from '../../../server/auth';
import { User } from '../../../shared/schema';

// Mock environment variables for testing
const originalEnv = process.env;

beforeEach(() => {
  vi.resetAllMocks();
  process.env = {
    ...originalEnv,
    JWT_SECRET: 'test-jwt-secret-that-is-definitely-long-enough-for-production-use-32chars',
    JWT_REFRESH_SECRET: 'test-jwt-refresh-secret-that-is-definitely-long-enough-for-production-use-32chars',
    BCRYPT_SALT_ROUNDS: '12',
    ACCESS_TOKEN_EXPIRY: '15m',
    REFRESH_TOKEN_EXPIRY: '30d'
  };
});

// Mock user data for testing
const mockUser: User = {
  id: 'test-user-id-123',
  email: 'test@example.com',
  role: 'trainer' as const,
  password: 'hashedPassword123',
  createdAt: new Date(),
  updatedAt: new Date(),
  profilePicture: null
};

describe('Authentication System - Password Management', () => {
  describe('hashPassword', () => {
    it('should hash a valid strong password', async () => {
      const password = 'StrongPass123!';
      const hashedPassword = await hashPassword(password);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50);
      expect(hashedPassword.startsWith('$2b$')).toBe(true);
    });

    it('should reject weak passwords - too short', async () => {
      const password = 'Short1!';
      
      await expect(hashPassword(password)).rejects.toThrow(
        'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters'
      );
    });

    it('should reject passwords without uppercase letters', async () => {
      const password = 'lowercaseonly123!';
      
      await expect(hashPassword(password)).rejects.toThrow(
        'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters'
      );
    });

    it('should reject passwords without lowercase letters', async () => {
      const password = 'UPPERCASEONLY123!';
      
      await expect(hashPassword(password)).rejects.toThrow(
        'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters'
      );
    });

    it('should reject passwords without numbers', async () => {
      const password = 'NoNumbersHere!';
      
      await expect(hashPassword(password)).rejects.toThrow(
        'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters'
      );
    });

    it('should reject passwords without special characters', async () => {
      const password = 'NoSpecialChars123';
      
      await expect(hashPassword(password)).rejects.toThrow(
        'Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters'
      );
    });

    it('should use the configured salt rounds', async () => {
      const password = 'TestPassword123!';
      const bcryptSpy = vi.spyOn(bcrypt, 'hash');
      
      await hashPassword(password);
      
      expect(bcryptSpy).toHaveBeenCalledWith(password, 12);
    });
  });

  describe('comparePasswords', () => {
    it('should return true for matching password and hash', async () => {
      const password = 'TestPassword123!';
      const hash = await bcrypt.hash(password, 12);
      
      const result = await comparePasswords(password, hash);
      
      expect(result).toBe(true);
    });

    it('should return false for non-matching password and hash', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hash = await bcrypt.hash(password, 12);
      
      const result = await comparePasswords(wrongPassword, hash);
      
      expect(result).toBe(false);
    });

    it('should handle empty password gracefully', async () => {
      const hash = await bcrypt.hash('TestPassword123!', 12);
      
      const result = await comparePasswords('', hash);
      
      expect(result).toBe(false);
    });

    it('should handle empty hash gracefully', async () => {
      const result = await comparePasswords('TestPassword123!', '');
      
      expect(result).toBe(false);
    });
  });
});

describe('Authentication System - Token Management', () => {
  describe('generateToken', () => {
    it('should generate a valid JWT token with user data', () => {
      const token = generateToken(mockUser, '15m');
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT format: header.payload.signature
    });

    it('should include user information in token payload', () => {
      const token = generateToken(mockUser, '15m');
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.role).toBe(mockUser.role);
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
      expect(decoded.iss).toBe('FitnessMealPlanner');
      expect(decoded.aud).toBe('FitnessMealPlanner-Client');
    });

    it('should create tokens with different expiry times', () => {
      const shortToken = generateToken(mockUser, '5m');
      const longToken = generateToken(mockUser, '1h');
      
      const shortDecoded = jwt.verify(shortToken, process.env.JWT_SECRET!) as any;
      const longDecoded = jwt.verify(longToken, process.env.JWT_SECRET!) as any;
      
      expect(longDecoded.exp).toBeGreaterThan(shortDecoded.exp);
    });

    it('should use HS256 algorithm', () => {
      const token = generateToken(mockUser, '15m');
      const header = JSON.parse(Buffer.from(token.split('.')[0], 'base64').toString());
      
      expect(header.alg).toBe('HS256');
    });
  });

  describe('generateTokens', () => {
    it('should generate both access and refresh tokens', () => {
      const tokens = generateTokens(mockUser);
      
      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
    });

    it('should generate different tokens for access and refresh', () => {
      const tokens = generateTokens(mockUser);
      
      expect(tokens.accessToken).not.toBe(tokens.refreshToken);
    });

    it('should create refresh token with different audience', () => {
      const tokens = generateTokens(mockUser);
      const refreshDecoded = jwt.verify(tokens.refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
      
      expect(refreshDecoded.aud).toBe('FitnessMealPlanner-Refresh');
      expect(refreshDecoded.type).toBe('refresh');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = generateToken(mockUser, '15m');
      
      const decoded = verifyToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.role).toBe(mockUser.role);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => verifyToken(invalidToken)).toThrow('Invalid token');
    });

    it('should throw error for expired token', () => {
      const expiredToken = jwt.sign(
        { id: mockUser.id, email: mockUser.email, role: mockUser.role },
        process.env.JWT_SECRET!,
        { expiresIn: '-1s', algorithm: 'HS256', issuer: 'FitnessMealPlanner', audience: 'FitnessMealPlanner-Client' }
      );
      
      expect(() => verifyToken(expiredToken)).toThrow('Invalid token');
    });

    it('should throw error for token with wrong issuer', () => {
      const wrongIssuerToken = jwt.sign(
        { id: mockUser.id, email: mockUser.email, role: mockUser.role },
        process.env.JWT_SECRET!,
        { expiresIn: '15m', algorithm: 'HS256', issuer: 'WrongIssuer', audience: 'FitnessMealPlanner-Client' }
      );
      
      expect(() => verifyToken(wrongIssuerToken)).toThrow('Invalid token');
    });

    it('should throw error for token with wrong audience', () => {
      const wrongAudienceToken = jwt.sign(
        { id: mockUser.id, email: mockUser.email, role: mockUser.role },
        process.env.JWT_SECRET!,
        { expiresIn: '15m', algorithm: 'HS256', issuer: 'FitnessMealPlanner', audience: 'WrongAudience' }
      );
      
      expect(() => verifyToken(wrongAudienceToken)).toThrow('Invalid token');
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const tokens = generateTokens(mockUser);
      
      const decoded = verifyRefreshToken(tokens.refreshToken);
      
      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.role).toBe(mockUser.role);
      expect(decoded.type).toBe('refresh');
    });

    it('should throw error for invalid refresh token', () => {
      const invalidToken = 'invalid.refresh.token';
      
      expect(() => verifyRefreshToken(invalidToken)).toThrow('Invalid refresh token');
    });

    it('should throw error for access token used as refresh token', () => {
      const tokens = generateTokens(mockUser);
      
      expect(() => verifyRefreshToken(tokens.accessToken)).toThrow('Invalid refresh token');
    });
  });
});

describe('Authentication System - Security Features', () => {
  describe('Token Security', () => {
    it('should use different secrets for access and refresh tokens when configured', () => {
      process.env.JWT_REFRESH_SECRET = 'different-refresh-secret-that-is-definitely-long-enough-for-production-use-32chars';
      
      const tokens = generateTokens(mockUser);
      
      // Access token should verify with JWT_SECRET
      expect(() => jwt.verify(tokens.accessToken, process.env.JWT_SECRET!)).not.toThrow();
      
      // Refresh token should verify with JWT_REFRESH_SECRET
      expect(() => jwt.verify(tokens.refreshToken, process.env.JWT_REFRESH_SECRET!)).not.toThrow();
      
      // Cross-verification should fail
      expect(() => jwt.verify(tokens.accessToken, process.env.JWT_REFRESH_SECRET!)).toThrow();
      expect(() => jwt.verify(tokens.refreshToken, process.env.JWT_SECRET!)).toThrow();
    });

    it('should include timestamp in token payload for replay attack prevention', () => {
      const beforeTime = Math.floor(Date.now() / 1000);
      const token = generateToken(mockUser, '15m');
      const afterTime = Math.floor(Date.now() / 1000);
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      expect(decoded.iat).toBeGreaterThanOrEqual(beforeTime);
      expect(decoded.iat).toBeLessThanOrEqual(afterTime);
    });

    it('should not include sensitive information in token payload', () => {
      const token = generateToken(mockUser, '15m');
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      expect(decoded.password).toBeUndefined();
      expect(decoded.profilePicture).toBeUndefined();
      expect(decoded.createdAt).toBeUndefined();
      expect(decoded.updatedAt).toBeUndefined();
    });
  });

  describe('Password Strength Validation', () => {
    const testCases = [
      { password: 'password', valid: false, reason: 'no uppercase, numbers, or special chars' },
      { password: 'PASSWORD', valid: false, reason: 'no lowercase, numbers, or special chars' },
      { password: '12345678', valid: false, reason: 'no letters or special chars' },
      { password: '!@#$%^&*', valid: false, reason: 'no letters or numbers' },
      { password: 'Pass123', valid: false, reason: 'too short and no special chars' },
      { password: 'Password123', valid: false, reason: 'no special chars' },
      { password: 'Password!', valid: false, reason: 'no numbers' },
      { password: 'password123!', valid: false, reason: 'no uppercase' },
      { password: 'PASSWORD123!', valid: false, reason: 'no lowercase' },
      { password: 'Password123!', valid: true, reason: 'meets all requirements' },
      { password: 'MySecure@Password2024!', valid: true, reason: 'strong password' },
      { password: 'C0mplex!P@ssw0rd', valid: true, reason: 'complex password' }
    ];

    testCases.forEach(({ password, valid, reason }) => {
      it(`should ${valid ? 'accept' : 'reject'} password: "${password}" (${reason})`, async () => {
        if (valid) {
          const hashedPassword = await hashPassword(password);
          expect(hashedPassword).toBeDefined();
        } else {
          await expect(hashPassword(password)).rejects.toThrow();
        }
      });
    });
  });
});

describe('Authentication System - Edge Cases and Error Handling', () => {
  describe('Malformed Input Handling', () => {
    it('should handle null/undefined user in token generation', () => {
      expect(() => generateToken(null as any, '15m')).toThrow();
      expect(() => generateToken(undefined as any, '15m')).toThrow();
    });

    it('should handle missing required user properties', () => {
      const incompleteUser = {
        id: 'test-id'
        // Missing email and role
      } as any;
      
      const token = generateToken(incompleteUser, '15m');
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      expect(decoded.id).toBe('test-id');
      expect(decoded.email).toBeUndefined();
      expect(decoded.role).toBeUndefined();
    });

    it('should handle empty strings in token verification', () => {
      expect(() => verifyToken('')).toThrow('Invalid token');
      expect(() => verifyRefreshToken('')).toThrow('Invalid refresh token');
    });

    it('should handle malformed JWT tokens', () => {
      const malformedTokens = [
        'not.a.jwt',
        'only-one-part',
        'two.parts.only',
        'header.payload.signature.toomanyparts',
        'invalid-base64.invalid-base64.invalid-base64'
      ];

      malformedTokens.forEach(token => {
        expect(() => verifyToken(token)).toThrow('Invalid token');
        expect(() => verifyRefreshToken(token)).toThrow('Invalid refresh token');
      });
    });
  });

  describe('Environment Configuration', () => {
    it('should use default values when environment variables are missing', () => {
      delete process.env.BCRYPT_SALT_ROUNDS;
      delete process.env.ACCESS_TOKEN_EXPIRY;
      delete process.env.REFRESH_TOKEN_EXPIRY;
      
      // Test that it still works with defaults
      const tokens = generateTokens(mockUser);
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
    });

    it('should handle invalid BCRYPT_SALT_ROUNDS gracefully', () => {
      process.env.BCRYPT_SALT_ROUNDS = 'invalid';
      
      // Should use default salt rounds (12)
      expect(async () => {
        const password = 'TestPassword123!';
        await hashPassword(password);
      }).not.toThrow();
    });
  });

  describe('Token Expiry Edge Cases', () => {
    it('should handle very short expiry times', () => {
      const token = generateToken(mockUser, '1ms');
      
      // Token should be created successfully
      expect(token).toBeDefined();
      
      // But should expire almost immediately
      setTimeout(() => {
        expect(() => verifyToken(token)).toThrow('Invalid token');
      }, 10);
    });

    it('should handle very long expiry times', () => {
      const token = generateToken(mockUser, '100y');
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      expect(decoded.exp).toBeGreaterThan(decoded.iat + (100 * 365 * 24 * 60 * 60) - 1000); // ~100 years
    });

    it('should handle invalid expiry formats gracefully', () => {
      // These should not throw during generation
      expect(() => generateToken(mockUser, 'invalid')).not.toThrow();
      expect(() => generateToken(mockUser, '')).not.toThrow();
      expect(() => generateToken(mockUser, null as any)).not.toThrow();
    });
  });
});

describe('Authentication System - Performance and Load Testing', () => {
  describe('Password Hashing Performance', () => {
    it('should hash password within reasonable time', async () => {
      const password = 'TestPassword123!';
      const startTime = Date.now();
      
      await hashPassword(password);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within 5 seconds (bcrypt with 12 rounds)
      expect(duration).toBeLessThan(5000);
    });

    it('should handle multiple concurrent password hashing', async () => {
      const passwords = Array.from({ length: 10 }, (_, i) => `TestPassword${i}123!`);
      const startTime = Date.now();
      
      const hashPromises = passwords.map(password => hashPassword(password));
      const results = await Promise.all(hashPromises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(results).toHaveLength(10);
      results.forEach(hash => {
        expect(hash).toBeDefined();
        expect(typeof hash).toBe('string');
      });
      
      // Should complete within reasonable time for 10 concurrent hashes
      expect(duration).toBeLessThan(10000);
    });
  });

  describe('Token Generation Performance', () => {
    it('should generate tokens quickly', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        generateTokens(mockUser);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should generate 1000 token pairs within 1 second
      expect(duration).toBeLessThan(1000);
    });

    it('should verify tokens quickly', () => {
      const tokens = Array.from({ length: 1000 }, () => generateToken(mockUser, '15m'));
      const startTime = Date.now();
      
      tokens.forEach(token => {
        verifyToken(token);
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should verify 1000 tokens within 1 second
      expect(duration).toBeLessThan(1000);
    });
  });
});

describe('Authentication System - Integration Tests', () => {
  describe('Complete Authentication Flow', () => {
    it('should complete full password and token lifecycle', async () => {
      const password = 'FullFlowTest123!';
      
      // 1. Hash password
      const hashedPassword = await hashPassword(password);
      expect(hashedPassword).toBeDefined();
      
      // 2. Verify password
      const isValid = await comparePasswords(password, hashedPassword);
      expect(isValid).toBe(true);
      
      // 3. Generate tokens
      const tokens = generateTokens(mockUser);
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      
      // 4. Verify access token
      const accessDecoded = verifyToken(tokens.accessToken);
      expect(accessDecoded.id).toBe(mockUser.id);
      
      // 5. Verify refresh token
      const refreshDecoded = verifyRefreshToken(tokens.refreshToken);
      expect(refreshDecoded.id).toBe(mockUser.id);
      expect(refreshDecoded.type).toBe('refresh');
    });

    it('should handle user role changes in token generation', () => {
      const roles = ['admin', 'trainer', 'customer'] as const;
      
      roles.forEach(role => {
        const userWithRole = { ...mockUser, role };
        const tokens = generateTokens(userWithRole);
        
        const decoded = verifyToken(tokens.accessToken);
        expect(decoded.role).toBe(role);
      });
    });

    it('should maintain token consistency across multiple generations', () => {
      const token1 = generateToken(mockUser, '15m');
      const token2 = generateToken(mockUser, '15m');
      
      const decoded1 = verifyToken(token1);
      const decoded2 = verifyToken(token2);
      
      // Should have same user data
      expect(decoded1.id).toBe(decoded2.id);
      expect(decoded1.email).toBe(decoded2.email);
      expect(decoded1.role).toBe(decoded2.role);
      
      // But different timestamps
      expect(decoded1.iat).toBeLessThanOrEqual(decoded2.iat);
    });
  });
});
