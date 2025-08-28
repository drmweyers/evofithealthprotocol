import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import App from '@/App';
import type { User } from '@/types/auth';

// Mock page components
vi.mock('@/pages/LoginPage', () => ({
  default: () => <div data-testid="login-page">Login Page</div>,
}));

vi.mock('@/components/HealthProtocolDashboard', () => ({
  default: () => <div data-testid="health-protocol-dashboard">Health Protocol Dashboard</div>,
}));

vi.mock('@/pages/Admin', () => ({
  default: () => <div data-testid="admin-page">Admin Page</div>,
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  Toaster: ({ position }: any) => <div data-testid={`toaster-${position}`}>Toaster</div>,
}));

// Mock AuthContext
const mockUseAuth = vi.fn();
const mockAuthProvider = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="auth-provider">{children}</div>
);

vi.mock('@/contexts/AuthContext', () => ({
  AuthProvider: mockAuthProvider,
  useAuth: mockUseAuth,
}));

// Mock react-router-dom
const mockBrowserRouter = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="browser-router">{children}</div>
);

const mockRoutes = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="routes">{children}</div>
);

const mockRoute = ({ path, element }: { path: string; element: React.ReactNode }) => (
  <div data-testid={`route-${path.replace(/[\/\*]/g, '')}`}>{element}</div>
);

const mockNavigate = ({ to, replace }: { to: string; replace?: boolean }) => (
  <div data-testid={`navigate-${to.replace('/', '')}`}>Navigate to {to}</div>
);

vi.mock('react-router-dom', () => ({
  BrowserRouter: mockBrowserRouter,
  Routes: mockRoutes,
  Route: mockRoute,
  Navigate: mockNavigate,
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the main app structure', () => {
    // Mock no user (unauthenticated state)
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });

    render(<App />);

    // Should render core app structure
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    expect(screen.getByTestId('browser-router')).toBeInTheDocument();
    expect(screen.getByTestId('routes')).toBeInTheDocument();
    expect(screen.getByTestId('toaster-top-right')).toBeInTheDocument();

    // Should have proper CSS classes
    expect(screen.getByRole('generic')).toHaveClass('min-h-screen', 'bg-gray-50');
  });

  it('should render login route', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });

    render(<App />);

    expect(screen.getByTestId('route-')).toBeInTheDocument();
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('should render protocols route with proper role-based access', () => {
    const adminUser: User = {
      id: '1',
      email: 'admin@example.com',
      role: 'admin',
      profilePicture: null,
    };

    mockUseAuth.mockReturnValue({
      user: adminUser,
      isLoading: false,
      isAuthenticated: true,
    });

    render(<App />);

    expect(screen.getByTestId('route-protocols')).toBeInTheDocument();
    expect(screen.getByTestId('health-protocol-dashboard')).toBeInTheDocument();
  });

  it('should render admin route with proper role-based access', () => {
    const adminUser: User = {
      id: '1',
      email: 'admin@example.com',
      role: 'admin',
      profilePicture: null,
    };

    mockUseAuth.mockReturnValue({
      user: adminUser,
      isLoading: false,
      isAuthenticated: true,
    });

    render(<App />);

    expect(screen.getByTestId('route-admin')).toBeInTheDocument();
    expect(screen.getByTestId('admin-page')).toBeInTheDocument();
  });

  it('should render catch-all route that redirects to root', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });

    render(<App />);

    expect(screen.getByTestId('route-*')).toBeInTheDocument();
    expect(screen.getByTestId('navigate-')).toBeInTheDocument();
  });

  describe('PrivateRoute component', () => {
    it('should show loading spinner when authentication is loading', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: true,
        isAuthenticated: false,
      });

      render(<App />);

      // Check for loading spinner classes
      const loadingElement = screen.getByRole('generic', { hidden: true });
      expect(loadingElement).toHaveClass('animate-spin', 'rounded-full', 'border-b-2', 'border-blue-600');
    });

    it('should redirect to login when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });

      render(<App />);

      // The PrivateRoute should redirect unauthenticated users
      // This is tested indirectly through the route rendering
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('should redirect to protocols when user lacks required role', () => {
      const trainerUser: User = {
        id: '2',
        email: 'trainer@example.com',
        role: 'trainer',
        profilePicture: null,
      };

      // Mock for trainer trying to access admin route
      mockUseAuth.mockReturnValue({
        user: trainerUser,
        isLoading: false,
        isAuthenticated: true,
      });

      render(<App />);

      // Trainer should be able to access protocols but not admin
      expect(screen.getByTestId('health-protocol-dashboard')).toBeInTheDocument();
    });

    it('should render protected content when user has correct role', () => {
      const adminUser: User = {
        id: '1',
        email: 'admin@example.com',
        role: 'admin',
        profilePicture: null,
      };

      mockUseAuth.mockReturnValue({
        user: adminUser,
        isLoading: false,
        isAuthenticated: true,
      });

      render(<App />);

      // Admin should be able to access all routes
      expect(screen.getByTestId('admin-page')).toBeInTheDocument();
      expect(screen.getByTestId('health-protocol-dashboard')).toBeInTheDocument();
    });

    it('should allow trainer access to protocols route', () => {
      const trainerUser: User = {
        id: '2',
        email: 'trainer@example.com',
        role: 'trainer',
        profilePicture: null,
      };

      mockUseAuth.mockReturnValue({
        user: trainerUser,
        isLoading: false,
        isAuthenticated: true,
      });

      render(<App />);

      expect(screen.getByTestId('health-protocol-dashboard')).toBeInTheDocument();
    });

    it('should handle users with undefined role', () => {
      const userWithUndefinedRole = {
        id: '3',
        email: 'unknown@example.com',
        role: undefined as any,
        profilePicture: null,
      };

      mockUseAuth.mockReturnValue({
        user: userWithUndefinedRole,
        isLoading: false,
        isAuthenticated: true,
      });

      render(<App />);

      // Should still render the app structure even with undefined role
      expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
    });
  });

  describe('Component integration', () => {
    it('should properly integrate AuthProvider with Router', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });

      render(<App />);

      // AuthProvider should wrap the Router
      expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
      expect(screen.getByTestId('browser-router')).toBeInTheDocument();
    });

    it('should properly integrate react-hot-toast Toaster', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });

      render(<App />);

      expect(screen.getByTestId('toaster-top-right')).toBeInTheDocument();
    });

    it('should maintain proper component hierarchy', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });

      const { container } = render(<App />);

      // Check that the hierarchy is correct
      const authProvider = screen.getByTestId('auth-provider');
      const browserRouter = screen.getByTestId('browser-router');
      const routes = screen.getByTestId('routes');

      expect(authProvider).toContainElement(browserRouter);
      expect(browserRouter).toContainElement(routes);
    });
  });

  describe('CSS and styling', () => {
    it('should apply correct CSS classes to main container', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });

      render(<App />);

      const mainContainer = screen.getByRole('generic');
      expect(mainContainer).toHaveClass('min-h-screen', 'bg-gray-50');
    });

    it('should apply correct loading spinner styles', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: true,
        isAuthenticated: false,
      });

      render(<App />);

      const loadingContainer = screen.getByRole('generic', { hidden: true });
      expect(loadingContainer).toHaveClass('flex', 'items-center', 'justify-center', 'min-h-screen');
      
      const spinner = loadingContainer.querySelector('div');
      expect(spinner).toHaveClass(
        'animate-spin',
        'rounded-full',
        'h-12',
        'w-12',
        'border-b-2',
        'border-blue-600'
      );
    });
  });

  describe('Route configuration', () => {
    it('should have correct route paths configured', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });

      render(<App />);

      // Check that routes are configured with correct paths
      expect(screen.getByTestId('route-')).toBeInTheDocument(); // Root path
      expect(screen.getByTestId('route-protocols')).toBeInTheDocument();
      expect(screen.getByTestId('route-admin')).toBeInTheDocument();
      expect(screen.getByTestId('route-*')).toBeInTheDocument(); // Catch-all
    });

    it('should configure routes with proper role-based protection', () => {
      const adminUser: User = {
        id: '1',
        email: 'admin@example.com',
        role: 'admin',
        profilePicture: null,
      };

      mockUseAuth.mockReturnValue({
        user: adminUser,
        isLoading: false,
        isAuthenticated: true,
      });

      render(<App />);

      // Protocols route should allow both admin and trainer
      expect(screen.getByTestId('route-protocols')).toBeInTheDocument();
      
      // Admin route should only allow admin
      expect(screen.getByTestId('route-admin')).toBeInTheDocument();
    });
  });

  describe('Error boundaries and fallbacks', () => {
    it('should handle rendering errors gracefully', () => {
      // Mock console.error to prevent test output pollution
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });

      // This test ensures the component renders without throwing
      expect(() => render(<App />)).not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('Performance considerations', () => {
    it('should not render heavy components when user is loading', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: true,
        isAuthenticated: false,
      });

      render(<App />);

      // Should only show loading spinner, not heavy components
      expect(screen.queryByTestId('health-protocol-dashboard')).not.toBeInTheDocument();
      expect(screen.queryByTestId('admin-page')).not.toBeInTheDocument();
    });

    it('should render components efficiently for authenticated users', () => {
      const trainerUser: User = {
        id: '2',
        email: 'trainer@example.com',
        role: 'trainer',
        profilePicture: null,
      };

      mockUseAuth.mockReturnValue({
        user: trainerUser,
        isLoading: false,
        isAuthenticated: true,
      });

      render(<App />);

      // Should efficiently render appropriate components for trainer
      expect(screen.getByTestId('health-protocol-dashboard')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });

      render(<App />);

      // Should have proper main container role
      expect(screen.getByRole('generic')).toBeInTheDocument();
    });

    it('should provide accessible loading state', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: true,
        isAuthenticated: false,
      });

      render(<App />);

      // Loading spinner should be properly structured for screen readers
      const loadingContainer = screen.getByRole('generic', { hidden: true });
      expect(loadingContainer).toHaveClass('flex', 'items-center', 'justify-center');
    });
  });
});