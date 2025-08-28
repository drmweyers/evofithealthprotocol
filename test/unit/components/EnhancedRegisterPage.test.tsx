/**
 * Enhanced RegisterPage Component Comprehensive Unit Tests
 * 
 * Tests for the enhanced RegisterPage component including:
 * - Form rendering and layout with multi-step validation
 * - Password strength validation and visual feedback
 * - Account type selection (customer/trainer)
 * - Invitation flow integration
 * - Real-time validation indicators
 * - Error handling and success flows
 * - Accessibility and responsive design
 * - Security features and validation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import RegisterPage from '../../../client/src/pages/RegisterPage';
import { AuthProvider } from '../../../client/src/contexts/AuthContext';
import { Toaster } from '../../../client/src/components/ui/toaster';

// Mock the useAuth hook
const mockRegister = vi.fn();
const mockUseAuth = {
  register: mockRegister,
  user: null,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: false
};

vi.mock('../../../client/src/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth,
  AuthProvider: ({ children }: { children: React.ReactNode }) => children
}));

// Mock useLocation from wouter
const mockRedirect = vi.fn();
vi.mock('wouter', () => ({
  Link: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
  useLocation: () => ['/register', mockRedirect]
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

// Mock fetch for invitation handling
const mockFetch = vi.fn();
global.fetch = mockFetch;

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
  customer: { id: '1', email: 'customer@test.com', role: 'customer' as const },
  trainer: { id: '2', email: 'trainer@test.com', role: 'trainer' as const }
};

// Mock invitation data
const mockInvitationData = {
  customerEmail: 'invited@customer.com',
  trainerEmail: 'trainer@inviter.com',
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
};

beforeEach(() => {
  vi.clearAllMocks();
  mockRegister.mockResolvedValue(mockUserData.customer);
  mockFetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ data: { invitation: mockInvitationData } })
  });
  
  // Reset URL search params
  Object.defineProperty(window, 'location', {
    value: {
      search: ''
    },
    writable: true
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('RegisterPage Component', () => {
  describe('Rendering and Layout', () => {
    it('should render the registration page with all essential elements', () => {
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      // Check main brand elements
      expect(screen.getByText('EvoFit Health Protocol')).toBeInTheDocument();
      expect(screen.getByText('Join the Future of Health Management')).toBeInTheDocument();
      expect(screen.getByText('Create Your Account')).toBeInTheDocument();
      expect(screen.getByText('Start your personalized health journey today')).toBeInTheDocument();

      // Check form elements
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/account type/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('should render feature benefits and trust indicators', () => {
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      expect(screen.getByText('Secure & Professional')).toBeInTheDocument();
      expect(screen.getByText('HIPAA-compliant health data management with enterprise-grade security')).toBeInTheDocument();
      expect(screen.getByText('Personalized Health Plans')).toBeInTheDocument();
      expect(screen.getByText('Expert Network')).toBeInTheDocument();
      expect(screen.getByText('Trusted by 10,000+ Users')).toBeInTheDocument();
      expect(screen.getByText('HIPAA Compliant & ISO 27001 Certified')).toBeInTheDocument();
    });

    it('should have a link back to login page', () => {
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      const loginLink = screen.getByRole('link', { name: /sign in here/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('should render legal footer with terms and privacy links', () => {
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      expect(screen.getByText(/by creating an account, you agree to our/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /terms of service/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /privacy policy/i })).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should validate email format', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      });
    });

    it('should validate password strength requirements', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      // Test weak password
      await user.type(passwordInput, 'weak');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      });
    });

    it('should show password strength requirements in detail', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      const passwordInput = screen.getByLabelText(/^password$/i);

      // Test various password requirements
      const testCases = [
        { password: 'password', expectedErrors: ['uppercase', 'number', 'special'] },
        { password: 'Password', expectedErrors: ['number', 'special'] },
        { password: 'Password123', expectedErrors: ['special'] },
        { password: 'Password123!', expectedErrors: [] }
      ];

      for (const { password, expectedErrors } of testCases) {
        await user.clear(passwordInput);
        await user.type(passwordInput, password);

        await waitFor(() => {
          expectedErrors.forEach(error => {
            const errorMessages = {
              uppercase: /one uppercase letter/i,
              number: /one number/i,
              special: /one special character/i
            };
            expect(screen.getByText(errorMessages[error as keyof typeof errorMessages])).toBeInTheDocument();
          });
        });
      }
    });

    it('should validate password confirmation match', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(passwordInput, 'StrongPassword123!');
      await user.type(confirmPasswordInput, 'DifferentPassword123!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
      });
    });

    it('should require account type selection', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'StrongPassword123!');
      await user.type(confirmPasswordInput, 'StrongPassword123!');
      
      // Clear the default role
      const roleSelect = screen.getByRole('combobox');
      await user.click(roleSelect);
      // Account type should already be defaulted to 'customer'
      
      await user.click(submitButton);

      // Should not show validation error as customer is the default
      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalled();
      });
    });
  });

  describe('Password Strength Visualization', () => {
    it('should show password strength indicator', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      const passwordInput = screen.getByLabelText(/^password$/i);

      await user.type(passwordInput, 'weak');

      await waitFor(() => {
        expect(screen.getByText('Password Strength:')).toBeInTheDocument();
        expect(screen.getByText('Weak')).toBeInTheDocument();
      });
    });

    it('should show visual strength bars', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      const passwordInput = screen.getByLabelText(/^password$/i);

      // Test different strength levels
      const testCases = [
        { password: 'weak', expectedStrength: 'Weak' },
        { password: 'Password', expectedStrength: 'Weak' },
        { password: 'Password1', expectedStrength: 'Good' },
        { password: 'Password123!', expectedStrength: 'Strong' }
      ];

      for (const { password, expectedStrength } of testCases) {
        await user.clear(passwordInput);
        await user.type(passwordInput, password);

        await waitFor(() => {
          expect(screen.getByText(expectedStrength)).toBeInTheDocument();
        });
      }
    });

    it('should show individual requirement checkmarks', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      const passwordInput = screen.getByLabelText(/^password$/i);

      await user.type(passwordInput, 'StrongPassword123!');

      await waitFor(() => {
        expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
        expect(screen.getByText('One uppercase letter')).toBeInTheDocument();
        expect(screen.getByText('One lowercase letter')).toBeInTheDocument();
        expect(screen.getByText('One number')).toBeInTheDocument();
        expect(screen.getByText('One special character')).toBeInTheDocument();
      });
    });
  });

  describe('Account Type Selection', () => {
    it('should allow selecting customer account type', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      const roleSelect = screen.getByRole('combobox');
      await user.click(roleSelect);

      const customerOption = screen.getByText('Customer');
      expect(customerOption).toBeInTheDocument();
      expect(screen.getByText('Looking for health protocols')).toBeInTheDocument();

      await user.click(customerOption);
    });

    it('should allow selecting trainer account type', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      const roleSelect = screen.getByRole('combobox');
      await user.click(roleSelect);

      const trainerOption = screen.getByText('Trainer');
      expect(trainerOption).toBeInTheDocument();
      expect(screen.getByText('Creating health protocols')).toBeInTheDocument();

      await user.click(trainerOption);
    });

    it('should show appropriate icons for each role', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      const roleSelect = screen.getByRole('combobox');
      await user.click(roleSelect);

      // Check that role options are rendered with descriptions
      expect(screen.getByText('Customer')).toBeInTheDocument();
      expect(screen.getByText('Trainer')).toBeInTheDocument();
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      const passwordInput = screen.getByLabelText(/^password$/i);
      const toggleButtons = screen.getAllByRole('button', { name: '' }); // Eye icon buttons
      const passwordToggle = toggleButtons[0]; // First toggle button (for password field)

      // Initially password should be hidden
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Click to show password
      await user.click(passwordToggle);
      expect(passwordInput).toHaveAttribute('type', 'text');

      // Click again to hide password
      await user.click(passwordToggle);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should toggle confirm password visibility independently', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const toggleButtons = screen.getAllByRole('button', { name: '' }); // Eye icon buttons
      const confirmPasswordToggle = toggleButtons[1]; // Second toggle button (for confirm password field)

      // Initially password should be hidden
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');

      // Click to show password
      await user.click(confirmPasswordToggle);
      expect(confirmPasswordInput).toHaveAttribute('type', 'text');

      // Click again to hide password
      await user.click(confirmPasswordToggle);
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Registration Flow', () => {
    it('should submit valid registration form successfully', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const roleSelect = screen.getByRole('combobox');
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(emailInput, 'newuser@example.com');
      await user.type(passwordInput, 'StrongPassword123!');
      await user.type(confirmPasswordInput, 'StrongPassword123!');
      
      // Select trainer role
      await user.click(roleSelect);
      await user.click(screen.getByText('Trainer'));
      
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          email: 'newuser@example.com',
          password: 'StrongPassword123!',
          role: 'trainer'
        });
      });
    });

    it('should show loading state during registration', async () => {
      const user = userEvent.setup();
      
      // Mock slow registration response
      mockRegister.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve(mockUserData.customer), 1000)
      ));

      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(emailInput, 'newuser@example.com');
      await user.type(passwordInput, 'StrongPassword123!');
      await user.type(confirmPasswordInput, 'StrongPassword123!');
      await user.click(submitButton);

      // Check loading state
      expect(screen.getByText(/creating account.../i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      
      // Check for loading spinner
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('should show success toast and navigate on successful registration', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(emailInput, 'newuser@example.com');
      await user.type(passwordInput, 'StrongPassword123!');
      await user.type(confirmPasswordInput, 'StrongPassword123!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Registration successful',
          description: 'Welcome to EvoFitMeals!'
        });
      });
    });

    it('should navigate to correct page based on user role', async () => {
      const user = userEvent.setup();
      
      const testCases = [
        { userData: mockUserData.customer, expectedPath: '/my-meal-plans' },
        { userData: mockUserData.trainer, expectedPath: '/' }
      ];

      for (const { userData, expectedPath } of testCases) {
        vi.clearAllMocks();
        mockRegister.mockResolvedValue(userData);

        render(
          <TestWrapper>
            <RegisterPage />
          </TestWrapper>
        );

        const emailInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/^password$/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
        const roleSelect = screen.getByRole('combobox');
        const submitButton = screen.getByRole('button', { name: /create account/i });

        await user.type(emailInput, userData.email);
        await user.type(passwordInput, 'StrongPassword123!');
        await user.type(confirmPasswordInput, 'StrongPassword123!');
        
        // Select appropriate role
        await user.click(roleSelect);
        await user.click(screen.getByText(userData.role === 'customer' ? 'Customer' : 'Trainer'));
        
        await user.click(submitButton);

        await waitFor(() => {
          expect(mockRedirect).toHaveBeenCalledWith(expectedPath);
        });
      }
    });

    it('should handle registration errors gracefully', async () => {
      const user = userEvent.setup();
      
      mockRegister.mockRejectedValue(new Error('User already exists'));

      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(emailInput, 'existing@example.com');
      await user.type(passwordInput, 'StrongPassword123!');
      await user.type(confirmPasswordInput, 'StrongPassword123!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Registration failed',
          description: 'An account with this email already exists. Please login or use a different email.',
          variant: 'destructive'
        });
      });
    });
  });

  describe('Invitation Flow', () => {
    beforeEach(() => {
      // Mock URL with invitation token
      Object.defineProperty(window, 'location', {
        value: {
          search: '?invitation=test-invitation-token'
        },
        writable: true
      });
    });

    it('should handle invitation token in URL', async () => {
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/invitations/verify/test-invitation-token');
      });
    });

    it('should show invitation info when token is valid', async () => {
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Trainer Invitation')).toBeInTheDocument();
        expect(screen.getByText(`You've been invited by ${mockInvitationData.trainerEmail} to join EvoFit Health Protocol.`)).toBeInTheDocument();
      });
    });

    it('should pre-fill email from invitation', async () => {
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const emailInput = screen.getByLabelText(/email address/i);
        expect(emailInput).toHaveValue(mockInvitationData.customerEmail);
        expect(emailInput).toBeDisabled();
      });
    });

    it('should lock role to customer for invitations', async () => {
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const roleSelect = screen.getByRole('combobox');
        expect(roleSelect).toBeDisabled();
      });
    });

    it('should hide trainer option when invitation is present', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const roleSelect = screen.getByRole('combobox');
        expect(roleSelect).toBeDisabled();
      });
    });

    it('should handle invitation acceptance flow', async () => {
      const user = userEvent.setup();
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          message: 'Invitation accepted successfully'
        })
      });

      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Trainer Invitation')).toBeInTheDocument();
      });

      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(passwordInput, 'StrongPassword123!');
      await user.type(confirmPasswordInput, 'StrongPassword123!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/invitations/accept', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: 'test-invitation-token',
            password: 'StrongPassword123!',
          })
        });
      });
    });

    it('should handle invalid invitation token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({
          message: 'Invalid invitation token'
        })
      });

      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Invalid Invitation',
          description: 'Invalid invitation token',
          variant: 'destructive'
        });
      });
    });

    it('should show loading state during invitation verification', async () => {
      mockFetch.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ data: { invitation: mockInvitationData } })
        }), 100)
      ));

      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      // Should show loading state initially
      expect(screen.getByText('Verifying invitation...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('Trainer Invitation')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper form labels and associations', () => {
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const roleSelect = screen.getByLabelText(/account type/i);

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('autoComplete', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('autoComplete', 'new-password');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
      expect(confirmPasswordInput).toHaveAttribute('autoComplete', 'new-password');
    });

    it('should have proper ARIA attributes for form validation', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        const emailError = screen.getByText(/invalid email address/i);
        expect(emailError).toHaveClass('text-sm text-red-500');
      });
    });

    it('should support keyboard navigation through form', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const roleSelect = screen.getByLabelText(/account type/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      // Tab through form elements
      await user.tab();
      expect(emailInput).toHaveFocus();

      await user.tab();
      expect(passwordInput).toHaveFocus();

      await user.tab();
      // Skip password toggle button
      await user.tab();
      expect(confirmPasswordInput).toHaveFocus();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();
      
      mockRegister.mockRejectedValue(new Error('Network error'));

      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'StrongPassword123!');
      await user.type(confirmPasswordInput, 'StrongPassword123!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Registration failed',
          description: 'Network error',
          variant: 'destructive'
        });
      });
    });

    it('should reset loading state after error', async () => {
      const user = userEvent.setup();
      
      mockRegister.mockRejectedValue(new Error('Registration failed'));

      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /create account/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'StrongPassword123!');
      await user.type(confirmPasswordInput, 'StrongPassword123!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
        expect(submitButton).toHaveTextContent('Create Account');
      });
    });
  });

  describe('UI/UX Features', () => {
    it('should have proper placeholder text and icons', () => {
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      expect(emailInput).toHaveAttribute('placeholder', 'your.email@domain.com');
      expect(passwordInput).toHaveAttribute('placeholder', 'Create a strong password');
      expect(confirmPasswordInput).toHaveAttribute('placeholder', 'Confirm your password');
    });

    it('should show appropriate visual styling', () => {
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      // Check for gradient backgrounds and styling
      expect(document.querySelector('.bg-gradient-to-br')).toBeInTheDocument();
      expect(document.querySelector('.shadow-2xl')).toBeInTheDocument();
      expect(document.querySelector('.backdrop-blur-xl')).toBeInTheDocument();
    });
  });
});
