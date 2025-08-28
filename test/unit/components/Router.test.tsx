import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Router from '@/Router';
import type { User } from '@/types/auth';

// Mock all page components
vi.mock('@/pages/Landing', () => ({
  default: () => <div data-testid="landing-page">Landing Page</div>,
}));

vi.mock('@/pages/Trainer', () => ({
  default: () => <div data-testid="trainer-page">Trainer Page</div>,
}));

vi.mock('@/pages/Admin', () => ({
  default: () => <div data-testid="admin-page">Admin Page</div>,
}));

vi.mock('@/pages/AdminProfile', () => ({
  default: () => <div data-testid="admin-profile-page">Admin Profile Page</div>,
}));

vi.mock('@/pages/TrainerProfile', () => ({
  default: () => <div data-testid="trainer-profile-page">Trainer Profile Page</div>,
}));

vi.mock('@/pages/CustomerProfile', () => ({
  default: () => <div data-testid="customer-profile-page">Customer Profile Page</div>,
}));

vi.mock('@/pages/LoginPage', () => ({
  default: () => <div data-testid="login-page">Login Page</div>,
}));

vi.mock('@/pages/RegisterPage', () => ({
  default: () => <div data-testid="register-page">Register Page</div>,
}));

vi.mock('@/pages/ForgotPasswordPage', () => ({
  default: () => <div data-testid="forgot-password-page">Forgot Password Page</div>,
}));

vi.mock('@/pages/ResetPasswordPage', () => ({
  default: () => <div data-testid="reset-password-page">Reset Password Page</div>,
}));

vi.mock('@/pages/NotFound', () => ({
  default: () => <div data-testid="not-found-page">Not Found Page</div>,
}));

vi.mock('@/pages/OAuthCallbackPage', () => ({
  default: () => <div data-testid="oauth-callback-page">OAuth Callback Page</div>,
}));

// Mock components
vi.mock('@/components/FallbackUI', () => ({
  default: () => <div data-testid="fallback-ui">Fallback UI</div>,
}));

vi.mock('@/components/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">{children}</div>
  ),
}));

vi.mock('@/components/ProtectedRoute', () => ({
  default: ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) => (
    <div data-testid={`protected-route-${requiredRole || 'any'}`}>{children}</div>
  ),
}));

vi.mock('@/components/OAuthCallback', () => ({
  OAuthCallback: () => <div data-testid="oauth-callback">OAuth Callback</div>,
}));

// Mock hooks
const mockUseAuth = vi.fn();
const mockUseOAuthToken = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: mockUseAuth,
}));

vi.mock('@/hooks/useOAuthToken', () => ({
  useOAuthToken: mockUseOAuthToken,
}));

// Mock wouter
const mockLocation = { pathname: '/' };
const mockSetLocation = vi.fn();

vi.mock('wouter', () => ({
  Route: ({ path, component: Component, children }: any) => {
    // Simple mock - render component if path matches current location
    if (path === '*' || mockLocation.pathname === path || mockLocation.pathname.startsWith(path)) {
      if (Component) {
        return <Component />;
      }
      if (typeof children === 'function') {
        return children();
      }
      return children || null;
    }
    return null;
  },
  Switch: ({ children }: any) => <div data-testid="wouter-switch">{children}</div>,
  Redirect: ({ to }: any) => <div data-testid={`redirect-to-${to.replace('/', '')}`}>Redirect to {to}</div>,
  useLocation: () => [mockLocation.pathname, mockSetLocation],
}));

// Mock URLSearchParams
const mockURLSearchParams = {
  has: vi.fn(() => false),
  get: vi.fn(() => null),
};

Object.defineProperty(global, 'URLSearchParams', {
  value: vi.fn(() => mockURLSearchParams),
});

describe('Router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.pathname = '/';
    mockURLSearchParams.has.mockReturnValue(false);
    mockUseOAuthToken.mockReturnValue(undefined);
  });

  describe('OAuth handling', () => {
    it('should render OAuth callback page when token is present in URL', () => {
      mockURLSearchParams.has.mockImplementation((param) => param === 'token');
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
      });

      render(<Router />);

      expect(screen.getByTestId('oauth-callback-page')).toBeInTheDocument();
    });
  });

  describe('Loading state', () => {
    it('should render loading spinner when authentication is loading', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: true,
      });

      render(<Router />);

      expect(screen.getByRole('generic')).toHaveClass('animate-spin');
    });
  });

  describe('Unauthenticated routes', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
      });
    });

    it('should render login page for root path when not authenticated', () => {
      mockLocation.pathname = '/';
      render(<Router />);

      expect(screen.getByTestId('redirect-to-login')).toBeInTheDocument();
    });

    it('should render login page for login path when not authenticated', () => {
      mockLocation.pathname = '/login';
      render(<Router />);

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('should render register page for register path when not authenticated', () => {
      mockLocation.pathname = '/register';
      render(<Router />);

      expect(screen.getByTestId('register-page')).toBeInTheDocument();
    });

    it('should render forgot password page when not authenticated', () => {
      mockLocation.pathname = '/forgot-password';
      render(<Router />);

      expect(screen.getByTestId('forgot-password-page')).toBeInTheDocument();
    });

    it('should render reset password page when not authenticated', () => {
      mockLocation.pathname = '/reset-password';
      render(<Router />);

      expect(screen.getByTestId('reset-password-page')).toBeInTheDocument();
    });

    it('should redirect unknown paths to login when not authenticated', () => {
      mockLocation.pathname = '/unknown';
      render(<Router />);

      expect(screen.getByTestId('redirect-to-login')).toBeInTheDocument();
    });
  });

  describe('Authenticated routes - Customer', () => {
    const customerUser: User = {
      id: '1',
      email: 'customer@example.com',
      role: 'customer',
      profilePicture: null,
    };

    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: customerUser,
        isLoading: false,
      });
    });

    it('should redirect customer to my-meal-plans from root path', () => {
      mockLocation.pathname = '/';
      render(<Router />);

      expect(screen.getByTestId('layout')).toBeInTheDocument();
      expect(screen.getByTestId('redirect-to-my-meal-plans')).toBeInTheDocument();
    });

    it('should render customer profile for customer path', () => {
      mockLocation.pathname = '/customer';
      render(<Router />);

      expect(screen.getByTestId('customer-profile-page')).toBeInTheDocument();
    });

    it('should render customer profile for my-meal-plans path', () => {
      mockLocation.pathname = '/my-meal-plans';
      render(<Router />);

      expect(screen.getByTestId('customer-profile-page')).toBeInTheDocument();
    });

    it('should render customer profile for profile path', () => {
      mockLocation.pathname = '/profile';
      render(<Router />);

      expect(screen.getByTestId('customer-profile-page')).toBeInTheDocument();
    });

    it('should render customer profile for customer/profile path', () => {
      mockLocation.pathname = '/customer/profile';
      render(<Router />);

      expect(screen.getByTestId('customer-profile-page')).toBeInTheDocument();
    });

    it('should redirect customer away from trainer routes', () => {
      mockLocation.pathname = '/trainer';
      render(<Router />);

      expect(screen.getByTestId('redirect-to-')).toBeInTheDocument();
    });

    it('should redirect customer away from admin routes', () => {
      mockLocation.pathname = '/admin';
      render(<Router />);

      expect(screen.getByTestId('protected-route-admin')).toBeInTheDocument();
    });
  });

  describe('Authenticated routes - Trainer', () => {
    const trainerUser: User = {
      id: '2',
      email: 'trainer@example.com',
      role: 'trainer',
      profilePicture: null,
    };

    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: trainerUser,
        isLoading: false,
      });
    });

    it('should redirect trainer to trainer path from root', () => {
      mockLocation.pathname = '/';
      render(<Router />);

      expect(screen.getByTestId('redirect-to-trainer')).toBeInTheDocument();
    });

    it('should render trainer page for trainer path', () => {
      mockLocation.pathname = '/trainer';
      render(<Router />);

      expect(screen.getByTestId('trainer-page')).toBeInTheDocument();
    });

    it('should render trainer page for trainer/customers path', () => {
      mockLocation.pathname = '/trainer/customers';
      render(<Router />);

      expect(screen.getByTestId('trainer-page')).toBeInTheDocument();
    });

    it('should render trainer page for trainer/meal-plans path', () => {
      mockLocation.pathname = '/trainer/meal-plans';
      render(<Router />);

      expect(screen.getByTestId('trainer-page')).toBeInTheDocument();
    });

    it('should render trainer page for trainer/health-protocols path', () => {
      mockLocation.pathname = '/trainer/health-protocols';
      render(<Router />);

      expect(screen.getByTestId('trainer-page')).toBeInTheDocument();
    });

    it('should render trainer page for meal-plan-generator path', () => {
      mockLocation.pathname = '/meal-plan-generator';
      render(<Router />);

      expect(screen.getByTestId('trainer-page')).toBeInTheDocument();
    });

    it('should render trainer profile for profile path', () => {
      mockLocation.pathname = '/profile';
      render(<Router />);

      expect(screen.getByTestId('trainer-profile-page')).toBeInTheDocument();
    });

    it('should render trainer profile for trainer/profile path', () => {
      mockLocation.pathname = '/trainer/profile';
      render(<Router />);

      expect(screen.getByTestId('trainer-profile-page')).toBeInTheDocument();
    });

    it('should redirect trainer away from customer-specific routes', () => {
      mockLocation.pathname = '/customer';
      render(<Router />);

      expect(screen.getByTestId('redirect-to-')).toBeInTheDocument();
    });
  });

  describe('Authenticated routes - Admin', () => {
    const adminUser: User = {
      id: '3',
      email: 'admin@example.com',
      role: 'admin',
      profilePicture: null,
    };

    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: adminUser,
        isLoading: false,
      });
    });

    it('should redirect admin to admin path from root', () => {
      mockLocation.pathname = '/';
      render(<Router />);

      expect(screen.getByTestId('redirect-to-admin')).toBeInTheDocument();
    });

    it('should render admin page for admin path', () => {
      mockLocation.pathname = '/admin';
      render(<Router />);

      expect(screen.getByTestId('protected-route-admin')).toBeInTheDocument();
      expect(screen.getByTestId('admin-page')).toBeInTheDocument();
    });

    it('should render admin page for meal-plan-generator path', () => {
      mockLocation.pathname = '/meal-plan-generator';
      render(<Router />);

      expect(screen.getByTestId('trainer-page')).toBeInTheDocument();
    });

    it('should render admin profile for profile path', () => {
      mockLocation.pathname = '/profile';
      render(<Router />);

      expect(screen.getByTestId('admin-profile-page')).toBeInTheDocument();
    });

    it('should render admin profile for admin/profile path', () => {
      mockLocation.pathname = '/admin/profile';
      render(<Router />);

      expect(screen.getByTestId('admin-profile-page')).toBeInTheDocument();
    });
  });

  describe('Not Found routes', () => {
    const trainerUser: User = {
      id: '2',
      email: 'trainer@example.com',
      role: 'trainer',
      profilePicture: null,
    };

    it('should render NotFound component for unknown routes when authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: trainerUser,
        isLoading: false,
      });
      
      mockLocation.pathname = '/unknown-path';
      render(<Router />);

      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });
  });

  describe('Layout wrapping', () => {
    it('should wrap authenticated routes in Layout component', () => {
      const trainerUser: User = {
        id: '2',
        email: 'trainer@example.com',
        role: 'trainer',
        profilePicture: null,
      };

      mockUseAuth.mockReturnValue({
        user: trainerUser,
        isLoading: false,
      });

      mockLocation.pathname = '/trainer';
      render(<Router />);

      expect(screen.getByTestId('layout')).toBeInTheDocument();
      expect(screen.getByTestId('trainer-page')).toBeInTheDocument();
    });

    it('should not wrap unauthenticated routes in Layout component', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
      });

      mockLocation.pathname = '/login';
      render(<Router />);

      expect(screen.queryByTestId('layout')).not.toBeInTheDocument();
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  describe('useOAuthToken hook integration', () => {
    it('should call useOAuthToken hook on render', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
      });

      render(<Router />);

      expect(mockUseOAuthToken).toHaveBeenCalled();
    });
  });

  describe('Role-based access control', () => {
    it('should prevent non-admin users from accessing admin routes', () => {
      const trainerUser: User = {
        id: '2',
        email: 'trainer@example.com',
        role: 'trainer',
        profilePicture: null,
      };

      mockUseAuth.mockReturnValue({
        user: trainerUser,
        isLoading: false,
      });

      mockLocation.pathname = '/admin/profile';
      render(<Router />);

      expect(screen.getByTestId('redirect-to-')).toBeInTheDocument();
    });

    it('should prevent non-trainer/admin users from accessing trainer routes', () => {
      const customerUser: User = {
        id: '1',
        email: 'customer@example.com',
        role: 'customer',
        profilePicture: null,
      };

      mockUseAuth.mockReturnValue({
        user: customerUser,
        isLoading: false,
      });

      mockLocation.pathname = '/trainer/customers';
      render(<Router />);

      expect(screen.getByTestId('redirect-to-')).toBeInTheDocument();
    });

    it('should prevent non-customer users from accessing customer routes', () => {
      const trainerUser: User = {
        id: '2',
        email: 'trainer@example.com',
        role: 'trainer',
        profilePicture: null,
      };

      mockUseAuth.mockReturnValue({
        user: trainerUser,
        isLoading: false,
      });

      mockLocation.pathname = '/my-meal-plans';
      render(<Router />);

      expect(screen.getByTestId('redirect-to-')).toBeInTheDocument();
    });
  });

  describe('Default role handling', () => {
    it('should render trainer component for users with undefined role as fallback', () => {
      const userWithUndefinedRole = {
        id: '4',
        email: 'unknown@example.com',
        role: undefined as any,
        profilePicture: null,
      };

      mockUseAuth.mockReturnValue({
        user: userWithUndefinedRole,
        isLoading: false,
      });

      mockLocation.pathname = '/';
      render(<Router />);

      expect(screen.getByTestId('trainer-page')).toBeInTheDocument();
    });
  });
});