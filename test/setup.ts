import '@testing-library/jest-dom';
import { vi, beforeAll, afterEach } from 'vitest';
import React from 'react';

// Set up React before importing any components
globalThis.React = React;

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.OPENAI_API_KEY = 'test-key';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5434/evofithealthprotocol_test';
process.env.JWT_SECRET = 'test-jwt-secret-that-is-definitely-long-enough-for-production-use-32chars';
process.env.SESSION_SECRET = 'test-session-secret';
process.env.S3_BUCKET_NAME = 'test-bucket';
process.env.AWS_REGION = 'us-east-1';
process.env.AWS_ACCESS_KEY_ID = 'test-key';
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});

// Mock OpenAI completely to avoid browser environment issues
vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{ message: { content: '{"recipes": []}' } }]
          })
        }
      },
      images: {
        generate: vi.fn().mockResolvedValue({
          data: [{ url: 'https://example.com/test-image.jpg' }]
        })
      }
    }))
  };
});

// Mock the OpenAI service functions
vi.mock('../server/services/openai', () => ({
  generateRecipes: vi.fn().mockResolvedValue([]),
  generateImageForRecipe: vi.fn().mockResolvedValue('https://example.com/test-image.jpg'),
  generateMealPlan: vi.fn().mockResolvedValue({ meals: [] }),
  generateHealthProtocol: vi.fn().mockResolvedValue({ protocol: 'Test protocol' })
}));

// Mock authentication context with proper React components
vi.mock('../client/src/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { id: '1', email: 'test@example.com', role: 'trainer' },
    login: vi.fn(),
    logout: vi.fn(),
    isLoading: false,
    isAuthenticated: true,
  })),
  AuthProvider: ({ children }: any) => React.createElement('div', { 'data-testid': 'auth-provider' }, children),
}));

// Mock router for navigation with proper React components
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(() => vi.fn()),
  useLocation: vi.fn(() => ({ pathname: '/' })),
  BrowserRouter: ({ children }: any) => React.createElement('div', { 'data-testid': 'browser-router' }, children),
  Link: ({ children, to }: any) => React.createElement('a', { href: to, 'data-testid': 'router-link' }, children),
}));

// Mock window.matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver;

// Mock @tanstack/react-query to avoid React context issues
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(() => ({ data: null, isLoading: false, error: null })),
  useMutation: vi.fn(() => ({ mutate: vi.fn(), isLoading: false })),
  useQueryClient: vi.fn(() => ({ invalidateQueries: vi.fn() })),
  QueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
    setQueryData: vi.fn(),
    getQueryData: vi.fn(),
  })),
  QueryClientProvider: ({ children }: any) => React.createElement('div', { 'data-testid': 'query-client-provider' }, children),
}));

// Mock Zod schema validation properly
vi.mock('zod', () => {
  const mockSchema = {
    parse: vi.fn((data) => data),
    safeParse: vi.fn((data) => ({ success: true, data })),
    optional: vi.fn(() => mockSchema),
    min: vi.fn(() => mockSchema),
    max: vi.fn(() => mockSchema),
    refine: vi.fn(() => mockSchema),
    transform: vi.fn(() => mockSchema),
    default: vi.fn(() => mockSchema),
    nullable: vi.fn(() => mockSchema),
    array: vi.fn(() => mockSchema),
    _def: {
      typeName: 'ZodObject'
    }
  };
  
  return {
    z: {
      object: vi.fn(() => mockSchema),
      enum: vi.fn(() => mockSchema),
      array: vi.fn(() => mockSchema),
      boolean: vi.fn(() => mockSchema),
      number: vi.fn(() => mockSchema),
      string: vi.fn(() => mockSchema),
      literal: vi.fn(() => mockSchema),
      union: vi.fn(() => mockSchema),
      optional: vi.fn(() => mockSchema),
      nullable: vi.fn(() => mockSchema),
    },
  };
});

// Mock @hookform/resolvers/zod properly
vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: vi.fn((schema) => {
    return {
      async: true,
      validate: async (data: any) => ({ values: data, errors: {} }),
      resolver: async (data: any) => ({ values: data, errors: {} }),
    };
  }),
}));

// Mock react-hook-form with proper form methods
vi.mock('react-hook-form', () => ({
  useForm: vi.fn(() => ({
    control: {},
    handleSubmit: vi.fn((fn) => (e?: any) => {
      e?.preventDefault?.();
      return fn({});
    }),
    watch: vi.fn(() => ({})),
    setValue: vi.fn(),
    getValues: vi.fn(() => ({})),
    reset: vi.fn(),
    register: vi.fn(() => ({
      onChange: vi.fn(),
      onBlur: vi.fn(),
      name: 'test',
      ref: vi.fn(),
    })),
    formState: {
      errors: {},
      isSubmitting: false,
      isValid: true,
      isDirty: false,
    },
  })),
  Controller: ({ children, render }: any) => {
    const mockField = {
      onChange: vi.fn(),
      onBlur: vi.fn(),
      value: '',
      name: 'test',
      ref: vi.fn(),
    };
    return render ? render({ field: mockField }) : children;
  },
  useController: vi.fn(() => ({
    field: {
      onChange: vi.fn(),
      onBlur: vi.fn(),
      value: '',
      name: 'test',
      ref: vi.fn(),
    },
    fieldState: {
      error: null,
      isDirty: false,
      isTouched: false,
    },
  })),
}));

// Mock React Testing Library utilities to ensure proper React integration
beforeAll(() => {
  // Ensure React is available globally for all components
  global.React = React;
  
  // Add any additional global setup needed
  Object.defineProperty(window, 'scrollTo', {
    value: vi.fn(),
    writable: true,
  });
});