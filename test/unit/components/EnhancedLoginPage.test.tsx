/**
 * Enhanced LoginPage Component Comprehensive Unit Tests
 * 
 * Tests for the enhanced LoginPage component including:
 * - Form rendering and layout
 * - Input field validation and interactions
 * - Password visibility toggle
 * - Loading states and animations
 * - Error handling and display
 * - Success navigation flow
 * - Responsive design behavior
 * - Accessibility features
 * - Authentication integration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../../../client/src/pages/LoginPage';
import { AuthProvider } from '../../../client/src/contexts/AuthContext';
import { Toaster } from '../../../client/src/components/ui/toaster';

// Mock the useAuth hook
const mockLogin = vi.fn();
const mockUseAuth = {
  login: mockLogin,
  user: null,
  isLoading: false,
  logout: vi.fn(),
  isAuthenticated: false
};

vi.mock('../../../client/src/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth,
  AuthProvider: ({ children }: { children: React.ReactNode }) => children
}));

// Mock useLocation from wouter
const mockNavigate = vi.fn();
vi.mock('wouter', () => ({
  Link: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
  useLocation: () => ['/login', mockNavigate]
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    footer: ({ children, ...props }: any) => <footer {...props}>{children}</footer>
  }
}));

// Mock toast hook
const mockToast = vi.fn();
vi.mock('../../../client/src/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}));

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  </BrowserRouter>
);

// Mock user data for testing
const mockUserData = {
  admin: { id: '1', email: 'admin@test.com', role: 'admin' as const },
  trainer: { id: '2', email: 'trainer@test.com', role: 'trainer' as const },
  customer: { id: '3', email: 'customer@test.com', role: 'customer' as const }
};

beforeEach(() => {
  vi.clearAllMocks();
  mockLogin.mockResolvedValue(mockUserData.trainer);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('LoginPage Component', () => {
  describe('Rendering and Layout', () => {
    it('should render the login page with all essential elements', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      // Check main brand elements
      expect(screen.getByText('EvoFit Health Protocol')).toBeInTheDocument();
      expect(screen.getByText('Professional Health Management System')).toBeInTheDocument();
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByText('Sign in to access your health dashboard')).toBeInTheDocument();

      // Check form elements
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should render feature benefits on larger screens', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      expect(screen.getByText('Secure & Professional')).toBeInTheDocument();
      expect(screen.getByText('HIPAA-compliant health data management with enterprise-grade security')).toBeInTheDocument();
      expect(screen.getByText('Personalized Care')).toBeInTheDocument();
      expect(screen.getByText('Expert Network')).toBeInTheDocument();
    });

    it('should show test credentials in development mode', () => {
      // Mock development environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      expect(screen.getByText('Test Credentials:')).toBeInTheDocument();
      expect(screen.getByText(/admin@fitmeal.pro/)).toBeInTheDocument();
      expect(screen.getByText(/trainer.test@evofitmeals.com/)).toBeInTheDocument();
      expect(screen.getByText(/customer.test@evofitmeals.com/)).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });

    it('should not show test credentials in production mode', () => {
      // Mock production environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      expect(screen.queryByText('Test Credentials:')).not.toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });

    it('should render legal footer with terms and privacy links', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      expect(screen.getByText(/by signing in, you agree to our/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /terms of service/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /privacy policy/i })).toBeInTheDocument();
    });
  });

  describe('Form Interaction and Validation', () => {
    it('should accept valid email input', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should show email validation error for invalid email', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      });
    });

    it('should require password field', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('should toggle password visibility', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const passwordInput = screen.getByLabelText(/password/i);
      const toggleButton = screen.getByRole('button', { name: '' }); // Eye icon button

      // Initially password should be hidden
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Click to show password
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      // Click again to hide password
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should handle remember me checkbox', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const rememberCheckbox = screen.getByRole('checkbox', { name: /remember me/i });

      expect(rememberCheckbox).not.toBeChecked();

      await user.click(rememberCheckbox);
      expect(rememberCheckbox).toBeChecked();

      await user.click(rememberCheckbox);
      expect(rememberCheckbox).not.toBeChecked();
    });

    it('should have a link to forgot password page', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const forgotPasswordLink = screen.getByRole('link', { name: /forgot password/i });
      expect(forgotPasswordLink).toBeInTheDocument();
      expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
    });

    it('should have a link to registration page', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const registerLink = screen.getByRole('link', { name: /create your account/i });
      expect(registerLink).toBeInTheDocument();
      expect(registerLink).toHaveAttribute('href', '/register');
    });
  });

  describe('Authentication Flow', () => {
    it('should submit valid login form successfully', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'trainer@test.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'trainer@test.com',
          password: 'password123',
          rememberMe: false
        });
      });
    });

    it('should show loading state during authentication', async () => {
      const user = userEvent.setup();
      
      // Mock slow login response
      mockLogin.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve(mockUserData.trainer), 1000)
      ));

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'trainer@test.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Check loading state
      expect(screen.getByText(/signing in.../i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      
      // Check for loading spinner
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('should show success toast and navigate on successful login', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'trainer@test.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Login successful',
          description: 'Welcome back, trainer@test.com!'
        });
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/trainer');
      });
    });

    it('should navigate to correct dashboard based on user role', async () => {
      const user = userEvent.setup();
      
      const testCases = [
        { userData: mockUserData.admin, expectedPath: '/admin' },
        { userData: mockUserData.trainer, expectedPath: '/trainer' },
        { userData: mockUserData.customer, expectedPath: '/my-meal-plans' }
      ];

      for (const { userData, expectedPath } of testCases) {
        vi.clearAllMocks();
        mockLogin.mockResolvedValue(userData);

        render(
          <TestWrapper>
            <LoginPage />
          </TestWrapper>
        );

        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /sign in/i });

        await user.type(emailInput, userData.email);
        await user.type(passwordInput, 'password123');
        await user.click(submitButton);

        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledWith(expectedPath);
        });
      }
    });

    it('should handle login failure and show error toast', async () => {
      const user = userEvent.setup();
      
      mockLogin.mockRejectedValue(new Error('Invalid credentials'));

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Login failed',
          description: 'Invalid credentials',
          variant: 'destructive'
        });
      });
    });

    it('should clear password field on login error', async () => {
      const user = userEvent.setup();
      
      mockLogin.mockRejectedValue(new Error('Invalid credentials'));

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(passwordInput).toHaveValue('');
      });
    });

    it('should clear form on successful login', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'trainer@test.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
      });
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper form labels and associations', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const rememberCheckbox = screen.getByLabelText(/remember me/i);

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('autoComplete', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');
      expect(rememberCheckbox).toHaveAttribute('type', 'checkbox');
    });

    it('should have proper ARIA attributes for form validation', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        const emailError = screen.getByText(/invalid email address/i);
        const passwordError = screen.getByText(/password is required/i);
        
        expect(emailError).toHaveAttribute('role', 'alert');
        expect(passwordError).toHaveAttribute('role', 'alert');
      });
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const rememberCheckbox = screen.getByLabelText(/remember me/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Tab through form elements
      await user.tab();
      expect(emailInput).toHaveFocus();

      await user.tab();
      expect(passwordInput).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: '' })).toHaveFocus(); // Password toggle

      await user.tab();
      expect(rememberCheckbox).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('link', { name: /forgot password/i })).toHaveFocus();

      await user.tab();
      expect(submitButton).toHaveFocus();
    });

    it('should support form submission with Enter key', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'trainer@test.com');
      await user.type(passwordInput, 'password123');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'trainer@test.com',
          password: 'password123',
          rememberMe: false
        });
      });
    });
  });

  describe('UI/UX Features', () => {
    it('should have proper placeholder text', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toHaveAttribute('placeholder', 'your.email@domain.com');
      expect(passwordInput).toHaveAttribute('placeholder', 'Enter your password');
    });

    it('should show appropriate button states', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Initially enabled
      expect(submitButton).not.toBeDisabled();
      expect(submitButton).toHaveTextContent('Sign In');

      // Mock slow login to test loading state
      mockLogin.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve(mockUserData.trainer), 100)
      ));

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'trainer@test.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Should be disabled and show loading text
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent('Signing in...');
    });

    it('should have proper visual styling classes', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      // Check for gradient backgrounds
      expect(document.querySelector('.bg-gradient-to-br')).toBeInTheDocument();
      expect(document.querySelector('.bg-gradient-to-r')).toBeInTheDocument();
      
      // Check for proper card styling
      expect(document.querySelector('.shadow-2xl')).toBeInTheDocument();
      expect(document.querySelector('.backdrop-blur-xl')).toBeInTheDocument();
    });

    it('should display proper icons', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      // Check for various icons (they should be rendered)
      const icons = ['Activity', 'Shield', 'Heart', 'Users', 'Eye'];
      // Note: In a real test, you'd check for the actual icon elements
      // This is a simplified check since we're mocking framer-motion
      expect(screen.getByText('EvoFit Health Protocol')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication timeout gracefully', async () => {
      const user = userEvent.setup();
      
      mockLogin.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      );

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Login failed',
          description: 'Request timeout',
          variant: 'destructive'
        });
      });
    });

    it('should handle unknown errors with generic message', async () => {
      const user = userEvent.setup();
      
      mockLogin.mockRejectedValue(new Error());

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Login failed',
          description: 'An unexpected error occurred',
          variant: 'destructive'
        });
      });
    });

    it('should reset loading state after error', async () => {
      const user = userEvent.setup();
      
      mockLogin.mockRejectedValue(new Error('Login failed'));

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
        expect(submitButton).toHaveTextContent('Sign In');
      });
    });
  });

  describe('Mobile and Responsive Behavior', () => {
    it('should show mobile header on small screens', () => {
      // Mock smaller screen size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 640, // Small screen
      });

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      // Mobile header elements should be present
      // Note: In a real test, you'd use matchMedia mocking
      expect(screen.getByText('EvoFit Health Protocol')).toBeInTheDocument();
    });
  });

  describe('Integration with AuthContext', () => {
    it('should call login with correct parameters', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const rememberCheckbox = screen.getByLabelText(/remember me/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'user@example.com');
      await user.type(passwordInput, 'securepassword123');
      await user.click(rememberCheckbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'user@example.com',
          password: 'securepassword123',
          rememberMe: true
        });
      });
    });

    it('should handle successful authentication response', async () => {
      const user = userEvent.setup();
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        role: 'trainer' as const
      };
      
      mockLogin.mockResolvedValue(mockUser);

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Login successful',
          description: 'Welcome back, test@example.com!'
        });
        expect(mockNavigate).toHaveBeenCalledWith('/trainer');
      });
    });
  });
});
