/**
 * Comprehensive Database Mock Utilities
 * 
 * This file provides standardized mocking for Drizzle ORM database operations
 * to resolve the orderBy chaining issues across all tests.
 */

import { vi } from 'vitest';

/**
 * Creates a properly chained database query mock
 * Supports all common Drizzle ORM query patterns
 */
export const createDbQueryMock = (finalResult: any, shouldReject: boolean = false) => {
  const finalMethod = shouldReject
    ? vi.fn().mockRejectedValue(finalResult)
    : vi.fn().mockResolvedValue(finalResult);

  return {
    // Select chain methods
    from: vi.fn().mockReturnValue({
      innerJoin: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          rightJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: finalMethod,
              limit: finalMethod,
              offset: finalMethod,
            })
          }),
          where: vi.fn().mockReturnValue({
            orderBy: finalMethod,
            limit: finalMethod,
            offset: finalMethod,
          })
        }),
        where: vi.fn().mockReturnValue({
          orderBy: finalMethod,
          limit: finalMethod,
          offset: finalMethod,
        })
      }),
      leftJoin: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: finalMethod,
          limit: finalMethod,
          offset: finalMethod,
        })
      }),
      where: vi.fn().mockReturnValue({
        orderBy: finalMethod,
        limit: finalMethod,
        offset: finalMethod,
      }),
      orderBy: finalMethod,
      limit: finalMethod,
      offset: finalMethod,
    }),
    
    // Insert chain methods
    values: vi.fn().mockReturnValue({
      returning: finalMethod,
      onConflictDoNothing: vi.fn().mockReturnValue({
        returning: finalMethod,
      }),
      onConflictDoUpdate: vi.fn().mockReturnValue({
        returning: finalMethod,
      }),
    }),
    
    // Update chain methods
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: finalMethod,
      }),
      returning: finalMethod,
    }),
    
    // Delete chain methods
    where: vi.fn().mockReturnValue({
      returning: finalMethod,
    }),
    
    // Direct methods
    returning: finalMethod,
    orderBy: finalMethod,
    limit: finalMethod,
    offset: finalMethod,
  };
};

/**
 * Creates a complete database mock object
 * with all common operations properly chained
 */
export const createDbMock = () => ({
  select: vi.fn().mockImplementation((fields?: any) => createDbQueryMock([])),
  insert: vi.fn().mockImplementation((table: any) => createDbQueryMock([])),
  update: vi.fn().mockImplementation((table: any) => createDbQueryMock([])),
  delete: vi.fn().mockImplementation((table: any) => createDbQueryMock([])),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  returning: vi.fn().mockResolvedValue([]),
  orderBy: vi.fn().mockResolvedValue([]),
  limit: vi.fn().mockResolvedValue([]),
  and: vi.fn(),
});

/**
 * Sets up database mocks for specific results
 */
export const setupDbMocks = (mockDb: any, mocks: {
  select?: any[];
  insert?: any[];
  update?: any[];
  delete?: any[];
}) => {
  if (mocks.select) {
    mocks.select.forEach((result, index) => {
      if (index === 0) {
        mockDb.select.mockReturnValue(createDbQueryMock(result));
      } else {
        mockDb.select.mockReturnValueOnce(createDbQueryMock(result));
      }
    });
  }
  
  if (mocks.insert) {
    mocks.insert.forEach((result, index) => {
      if (index === 0) {
        mockDb.insert.mockReturnValue(createDbQueryMock(result));
      } else {
        mockDb.insert.mockReturnValueOnce(createDbQueryMock(result));
      }
    });
  }
  
  if (mocks.update) {
    mocks.update.forEach((result, index) => {
      if (index === 0) {
        mockDb.update.mockReturnValue(createDbQueryMock(result));
      } else {
        mockDb.update.mockReturnValueOnce(createDbQueryMock(result));
      }
    });
  }
  
  if (mocks.delete) {
    mocks.delete.forEach((result, index) => {
      if (index === 0) {
        mockDb.delete.mockReturnValue(createDbQueryMock(result));
      } else {
        mockDb.delete.mockReturnValueOnce(createDbQueryMock(result));
      }
    });
  }
};

/**
 * Creates mock for database errors
 */
export const createDbErrorMock = (error: Error) => createDbQueryMock(error, true);

/**
 * Standard mock setup for authentication tests
 */
export const createAuthDbMock = () => {
  return createDbMock();
};

/**
 * Standard mock setup for trainer protocol tests
 */
export const createProtocolDbMock = () => {
  return createDbMock();
};