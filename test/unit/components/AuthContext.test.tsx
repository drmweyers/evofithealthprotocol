import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import type { User, UserRole } from '@/types/auth';

// Test component to use the AuthContext
const TestComponent = () => {
  const { user, isLoading, isAuthenticated, error, login, register, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="user-email">{user?.email || 'No user'}</div>
      <div data-testid="user-role">{user?.role || 'No role'}</div>
      <div data-testid="is-loading">{isLoading.toString()}</div>
      <div data-testid="is-authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="error">{error?.message || 'No error'}</div>
      <button onClick={() => login({ email: 'test@example.com', password: 'password' })}>
        Login
      </button>
      <button onClick={() => register({ 
        email: 'new@example.com', 
        password: 'password', 
        name: 'Test User',
        role: 'trainer' as UserRole
      })}>
        Register
      </button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock @tanstack/react-query
const mockQueryClient = {
  clear: vi.fn(),
  setQueryData: vi.fn(),
  invalidateQueries: vi.fn(),
};

const mockUseQuery = vi.fn();
const mockUseQueryClient = vi.fn(() => mockQueryClient);

vi.mock('@tanstack/react-query', () => ({
  useQuery: mockUseQuery,
  useQueryClient: mockUseQueryClient,
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

// Mock window events
const mockDispatchEvent = vi.fn();
Object.defineProperty(global.window, 'dispatchEvent', {
  value: mockDispatchEvent,
});

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockQueryClient.clear.mockClear();
    mockQueryClient.setQueryData.mockClear();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    mockFetch.mockClear();
    mockDispatchEvent.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should throw error when useAuth is used outside AuthProvider', () => {
    // Mock console.error to prevent test output pollution
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => render(<TestComponent />)).toThrow(
      'useAuth must be used within an AuthProvider'
    );
    
    consoleSpy.mockRestore();
  });

  it('should provide initial auth state when no token is stored', () => {
    // Mock useQuery to return loading state initially
    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user-email')).toHaveTextContent('No user');
    expect(screen.getByTestId('user-role')).toHaveTextContent('No role');
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('error')).toHaveTextContent('No error');
  });

  it('should provide loading state when authentication is loading', () => {
    // Mock useQuery to return loading state
    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('is-loading')).toHaveTextContent('true');
  });

  it('should provide user data when authenticated', () => {
    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      role: 'trainer',
      profilePicture: null,
    };

    // Mock useQuery to return user data
    mockUseQuery.mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    expect(screen.getByTestId('user-role')).toHaveTextContent('trainer');
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
  });

  it('should handle successful login', async () => {
    const user = userEvent.setup();
    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      role: 'trainer',
      profilePicture: null,
    };

    const mockResponse = {
      status: 'success',
      data: {
        accessToken: 'mock-token',
        user: mockUser,
      },
    };

    // Mock successful fetch response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    // Initial state - no user
    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    await user.click(loginButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: 'test@example.com', password: 'password' }),
      });
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'mock-token');
    expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(['/api/auth/me'], mockUser);
    expect(mockDispatchEvent).toHaveBeenCalledWith(expect.any(Event));
  });

  it('should handle login failure', async () => {
    const user = userEvent.setup();

    // Mock failed fetch response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Invalid credentials' }),
    });

    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    await user.click(loginButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    // Token should not be stored on failure
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('should handle successful registration', async () => {
    const user = userEvent.setup();
    const mockUser: User = {
      id: '2',
      email: 'new@example.com',
      role: 'trainer',
      profilePicture: null,
    };

    const mockResponse = {
      status: 'success',
      data: {
        accessToken: 'new-token',
        user: mockUser,
      },
    };

    // Mock successful fetch response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const registerButton = screen.getByText('Register');
    await user.click(registerButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: 'new@example.com',
          password: 'password',
          name: 'Test User',
          role: 'trainer',
        }),
      });
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'new-token');
    expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(['/api/auth/me'], mockUser);
  });

  it('should handle logout', async () => {
    const user = userEvent.setup();

    // Mock successful logout response
    mockFetch.mockResolvedValueOnce({
      ok: true,
    });

    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      role: 'trainer',
      profilePicture: null,
    };

    mockUseQuery.mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const logoutButton = screen.getByText('Logout');
    await user.click(logoutButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(mockQueryClient.clear).toHaveBeenCalled();
    expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(['/api/auth/me'], null);
    expect(mockNavigate).toHaveBeenCalledWith('/');
    expect(mockDispatchEvent).toHaveBeenCalledWith(expect.any(Event));
  });

  it('should handle logout even when logout request fails', async () => {
    const user = userEvent.setup();

    // Mock failed logout response
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      role: 'trainer',
      profilePicture: null,
    };

    mockUseQuery.mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
    });

    // Mock console.error to prevent test output pollution
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const logoutButton = screen.getByText('Logout');
    await user.click(logoutButton);

    await waitFor(() => {
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    });

    expect(mockQueryClient.clear).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/');
    
    consoleSpy.mockRestore();
  });

  it('should initialize with token from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('existing-token');

    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      role: 'trainer',
      profilePicture: null,
    };

    mockUseQuery.mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
  });

  it('should handle storage change events', () => {
    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      role: 'trainer',
      profilePicture: null,
    };

    mockUseQuery.mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Simulate storage change
    act(() => {
      const storageEvent = new Event('storage');
      window.dispatchEvent(storageEvent);
    });

    expect(localStorageMock.getItem).toHaveBeenCalled();
  });

  it('should handle token refresh when user request fails with 401', async () => {
    localStorageMock.getItem.mockReturnValue('expired-token');

    // Mock the fetch calls
    const userRequestError = new Error('HTTP error! status: 401');
    
    // Mock successful refresh token response
    mockFetch
      .mockRejectedValueOnce(userRequestError) // First user request fails
      .mockResolvedValueOnce({ // Refresh token succeeds
        ok: true,
        json: async () => ({
          status: 'success',
          data: { accessToken: 'new-token' }
        })
      })
      .mockResolvedValueOnce({ // Second user request succeeds
        ok: true,
        json: async () => ({
          status: 'success',
          data: {
            user: {
              id: '1',
              email: 'test@example.com',
              role: 'trainer',
              profilePicture: null,
            }
          }
        })
      });

    // Mock useQuery to simulate the actual flow
    let queryCallCount = 0;
    mockUseQuery.mockImplementation((options) => {
      queryCallCount++;
      
      // Simulate the query function being called
      if (options.queryFn && options.enabled) {
        act(() => {
          options.queryFn().catch(() => {}); // Call but ignore promise
        });
      }
      
      return {
        data: null,
        isLoading: false,
        error: null,
      };
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/refresh_token', {
        method: 'POST',
        credentials: 'include',
      });
    });
  });

  it('should handle error state in useQuery', () => {
    const mockError = new Error('Authentication failed');

    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: mockError,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('error')).toHaveTextContent('Authentication failed');
  });

  it('should validate auth response structure', async () => {
    const user = userEvent.setup();

    // Mock invalid response (missing required fields)
    const mockResponse = {
      status: 'success',
      data: {
        accessToken: 'token',
        user: null, // Invalid - user is null
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    // Mock console.error to prevent test output pollution
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    await user.click(loginButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    // Should not store invalid token/user
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
});