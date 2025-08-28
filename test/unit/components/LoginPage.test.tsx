import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import LoginPage from '@/pages/LoginPage';
import type { User } from '@/types/auth';

// Mock dependencies
const mockLogin = vi.fn();
const mockNavigate = vi.fn();
const mockToast = vi.fn();

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }: any) => 
    <a href={to} {...props}>{children}</a>,
  useNavigate: () => mockNavigate,
}));

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null,
    isLoading: false,
    isAuthenticated: false,
  }),
}));

// Mock toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock form validation
vi.mock('react-hook-form', () => ({
  useForm: () => ({
    control: {},
    handleSubmit: vi.fn((onValid) => (e?: any) => {
      e?.preventDefault?.();
      return onValid({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      });
    }),
    setValue: vi.fn(),
    reset: vi.fn(),
    formState: {
      errors: {},
      isSubmitting: false,
    },
  }),
}));

// Mock form components
vi.mock('@/components/ui/form', () => ({
  Form: ({ children }: any) => <form>{children}</form>,
  FormControl: ({ children }: any) => <div data-testid="form-control">{children}</div>,
  FormField: ({ render }: any) => {
    const mockField = {
      onChange: vi.fn(),
      onBlur: vi.fn(),
      value: '',
      name: 'test-field',
    };
    return render({ field: mockField });
  },
  FormItem: ({ children }: any) => <div data-testid="form-item">{children}</div>,
  FormLabel: ({ children, ...props }: any) => <label {...props}>{children}</label>,
  FormMessage: ({ children }: any) => <span data-testid="form-message">{children}</span>,
}));

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type, ...props }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      type={type}
      data-testid="button"
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: ({ type, placeholder, onChange, ...props }: any) => (
    <input 
      type={type}
      placeholder={placeholder}
      onChange={onChange}
      data-testid="input"
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange, ...props }: any) => (
    <input 
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      data-testid="checkbox"
      {...props}
    />
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className} data-testid="card">{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className} data-testid="card-content">{children}</div>,
  CardDescription: ({ children, className }: any) => <div className={className} data-testid="card-description">{children}</div>,
  CardHeader: ({ children, className }: any) => <div className={className} data-testid="card-header">{children}</div>,
  CardTitle: ({ children, className }: any) => <h2 className={className} data-testid="card-title">{children}</h2>,
}));

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, initial, animate, transition, className, ...props }: any) => (
      <div className={className} data-testid="motion-div" {...props}>
        {children}
      </div>
    ),
    footer: ({ children, initial, animate, transition, className, ...props }: any) => (
      <footer className={className} data-testid="motion-footer" {...props}>
        {children}
      </footer>
    ),
  },
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Activity: ({ className, ...props }: any) => (
    <span className={className} data-testid="activity-icon" {...props}>Activity</span>
  ),
  Eye: ({ className, ...props }: any) => (
    <span className={className} data-testid="eye-icon" {...props}>Eye</span>
  ),
  EyeOff: ({ className, ...props }: any) => (
    <span className={className} data-testid="eye-off-icon" {...props}>EyeOff</span>
  ),
  Shield: ({ className, ...props }: any) => (
    <span className={className} data-testid="shield-icon" {...props}>Shield</span>
  ),
  Heart: ({ className, ...props }: any) => (
    <span className={className} data-testid="heart-icon" {...props}>Heart</span>
  ),
  Users: ({ className, ...props }: any) => (
    <span className={className} data-testid="users-icon" {...props}>Users</span>
  ),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockLogin.mockClear();
    mockToast.mockClear();
  });

  it('should render the login page with all elements', () => {
    render(<LoginPage />);

    // Check for main brand elements
    expect(screen.getByText('EvoFit Health Protocol')).toBeInTheDocument();
    expect(screen.getByText('Professional Health Management System')).toBeInTheDocument();

    // Check for form elements
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to access your health dashboard')).toBeInTheDocument();
    expect(screen.getByText('Email Address')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByText('Remember me')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();

    // Check for navigation links
    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
    expect(screen.getByText('Create your account')).toBeInTheDocument();

    // Check for feature highlights
    expect(screen.getByText('Secure & Professional')).toBeInTheDocument();
    expect(screen.getByText('Personalized Care')).toBeInTheDocument();
    expect(screen.getByText('Expert Network')).toBeInTheDocument();
  });

  it('should render all brand icons', () => {
    render(<LoginPage />);

    expect(screen.getAllByTestId('activity-icon')).toHaveLength(2); // Main logo and mobile logo
    expect(screen.getByTestId('shield-icon')).toBeInTheDocument();
    expect(screen.getByTestId('heart-icon')).toBeInTheDocument();
    expect(screen.getByTestId('users-icon')).toBeInTheDocument();
  });

  it('should handle successful login for trainer', async () => {
    const user = userEvent.setup();
    
    const mockUser: User = {
      id: '1',
      email: 'trainer@example.com',
      role: 'trainer',
      profilePicture: null,
    };

    mockLogin.mockResolvedValueOnce(mockUser);

    render(<LoginPage />);

    const submitButton = screen.getByText('Sign In');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      });
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Login successful',
      description: 'Welcome back, trainer@example.com!',
    });

    expect(mockNavigate).toHaveBeenCalledWith('/protocols');
  });

  it('should handle successful login for admin', async () => {
    const user = userEvent.setup();
    
    const mockUser: User = {
      id: '1',
      email: 'admin@example.com',
      role: 'admin',
      profilePicture: null,
    };

    mockLogin.mockResolvedValueOnce(mockUser);

    render(<LoginPage />);

    const submitButton = screen.getByText('Sign In');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/admin');
  });

  it('should handle successful login for customer', async () => {
    const user = userEvent.setup();
    
    const mockUser: User = {
      id: '1',
      email: 'customer@example.com',
      role: 'customer',
      profilePicture: null,
    };

    mockLogin.mockResolvedValueOnce(mockUser);

    render(<LoginPage />);

    const submitButton = screen.getByText('Sign In');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/protocols');
  });

  it('should handle login failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Invalid credentials';
    
    mockLogin.mockRejectedValueOnce(new Error(errorMessage));

    // Mock console.error to prevent test output pollution
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<LoginPage />);

    const submitButton = screen.getByText('Sign In');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Login failed',
      description: errorMessage,
      variant: 'destructive',
    });

    // Should not navigate on error
    expect(mockNavigate).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it('should show loading state during login', async () => {
    const user = userEvent.setup();
    
    // Create a promise that we can control
    let resolveLogin: (value: any) => void;
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });
    
    mockLogin.mockReturnValueOnce(loginPromise);

    render(<LoginPage />);

    const submitButton = screen.getByText('Sign In');
    await user.click(submitButton);

    // Should show loading state
    expect(screen.getByText('Signing in...')).toBeInTheDocument();

    // Resolve the promise
    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      role: 'trainer',
      profilePicture: null,
    };
    
    resolveLogin!(mockUser);
    
    await waitFor(() => {
      expect(screen.queryByText('Signing in...')).not.toBeInTheDocument();
    });
  });

  it('should toggle password visibility', async () => {
    const user = userEvent.setup();

    render(<LoginPage />);

    // Initially should show EyeOff icon (password hidden)
    expect(screen.getByTestId('eye-off-icon')).toBeInTheDocument();
    
    // Click the toggle button
    const toggleButton = screen.getByTestId('eye-off-icon').closest('button');
    expect(toggleButton).toBeInTheDocument();
    
    await user.click(toggleButton!);

    // Should now show Eye icon (password visible)
    expect(screen.getByTestId('eye-icon')).toBeInTheDocument();
  });

  it('should render test credentials in development environment', () => {
    // Mock development environment
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(<LoginPage />);

    expect(screen.getByText('Test Credentials:')).toBeInTheDocument();
    expect(screen.getByText(/Admin:/)).toBeInTheDocument();
    expect(screen.getByText(/Trainer:/)).toBeInTheDocument();
    expect(screen.getByText(/Customer:/)).toBeInTheDocument();

    // Restore original environment
    process.env.NODE_ENV = originalEnv;
  });

  it('should not render test credentials in production environment', () => {
    // Mock production environment
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(<LoginPage />);

    expect(screen.queryByText('Test Credentials:')).not.toBeInTheDocument();

    // Restore original environment
    process.env.NODE_ENV = originalEnv;
  });

  it('should render navigation links correctly', () => {
    render(<LoginPage />);

    const forgotPasswordLink = screen.getByText('Forgot password?');
    expect(forgotPasswordLink.closest('a')).toHaveAttribute('href', '/forgot-password');

    const registerLink = screen.getByText('Create your account');
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register');

    const termsLink = screen.getByText('Terms of Service');
    expect(termsLink.closest('a')).toHaveAttribute('href', '/terms');

    const privacyLink = screen.getByText('Privacy Policy');
    expect(privacyLink.closest('a')).toHaveAttribute('href', '/privacy');
  });

  it('should handle login with user that has no email', async () => {
    const user = userEvent.setup();
    
    const mockUser: User = {
      id: '1',
      email: '', // Empty email
      role: 'trainer',
      profilePicture: null,
    };

    mockLogin.mockResolvedValueOnce(mockUser);

    render(<LoginPage />);

    const submitButton = screen.getByText('Sign In');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Login successful',
      description: 'Welcome back!', // Should handle missing email gracefully
    });
  });

  it('should handle navigation for unknown user role', async () => {
    const user = userEvent.setup();
    
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      role: 'unknown' as any, // Invalid role
      profilePicture: null,
    };

    mockLogin.mockResolvedValueOnce(mockUser);

    render(<LoginPage />);

    const submitButton = screen.getByText('Sign In');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });

    // Should navigate to default route for unknown role
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should handle form reset on successful login', async () => {
    const user = userEvent.setup();
    
    const mockReset = vi.fn();
    
    // Update the useForm mock to return our reset function
    const originalUseForm = vi.mocked(require('react-hook-form').useForm);
    vi.mocked(require('react-hook-form').useForm).mockReturnValueOnce({
      ...originalUseForm(),
      reset: mockReset,
    });

    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      role: 'trainer',
      profilePicture: null,
    };

    mockLogin.mockResolvedValueOnce(mockUser);

    render(<LoginPage />);

    const submitButton = screen.getByText('Sign In');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockReset).toHaveBeenCalled();
    });
  });

  it('should have proper accessibility attributes', () => {
    render(<LoginPage />);

    // Check for form labels
    expect(screen.getByText('Email Address')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
    
    // Check for button accessibility
    const submitButton = screen.getByText('Sign In');
    expect(submitButton).toHaveAttribute('type', 'submit');
    
    // Check for proper form structure
    expect(screen.getByTestId('card')).toBeInTheDocument();
  });

  it('should render mobile header only on small screens', () => {
    render(<LoginPage />);

    // The mobile header should be present but hidden on large screens
    const mobileHeaders = screen.getAllByText('EvoFit Health Protocol');
    expect(mobileHeaders.length).toBeGreaterThan(0);
  });
});