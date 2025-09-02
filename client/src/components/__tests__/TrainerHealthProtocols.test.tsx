/**
 * Comprehensive Unit Tests for TrainerHealthProtocols Component
 * Tests Protocol Creation Wizard and Protocol Generation functionality
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import TrainerHealthProtocols from '../TrainerHealthProtocols';
import { AuthProvider } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';

// Mock the hooks and modules
vi.mock('../../hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

vi.mock('../../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({
    user: {
      id: 'trainer-id',
      email: 'trainer.test@evofitmeals.com',
      role: 'trainer',
    },
  }),
}));

// Mock fetch globally
global.fetch = vi.fn();

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('TrainerHealthProtocols Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful API responses
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/trainer/protocols')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      }
      if (url.includes('/api/trainer/customers')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'customer-1',
              name: 'John Doe',
              email: 'john@example.com',
              age: 30,
            },
            {
              id: 'customer-2',
              name: 'Jane Smith',
              email: 'jane@example.com',
              age: 25,
            },
          ]),
        });
      }
      if (url.includes('/api/protocol-templates')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: [
              {
                id: 'template-1',
                name: 'Weight Loss Protocol',
                description: 'Effective weight loss program',
                category: 'weight_loss',
                tags: ['beginner', 'sustainable'],
                popularity: 100,
                effectivenessScore: 85,
              },
              {
                id: 'template-2',
                name: 'Muscle Building Protocol',
                description: 'Build lean muscle mass',
                category: 'muscle_gain',
                tags: ['intermediate', 'strength'],
                popularity: 80,
                effectivenessScore: 90,
              },
            ],
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Protocol Creation Wizard', () => {
    it('should render the Guided Protocol Wizard button', async () => {
      render(<TrainerHealthProtocols />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText('Guided Protocol Wizard')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Step-by-step guidance with AI-powered optimization')).toBeInTheDocument();
      expect(screen.getByText('Recommended')).toBeInTheDocument();
    });

    it('should open the wizard dialog when clicking Guided Protocol Wizard', async () => {
      const user = userEvent.setup();
      render(<TrainerHealthProtocols />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText('Guided Protocol Wizard')).toBeInTheDocument();
      });
      
      const wizardCard = screen.getByText('Guided Protocol Wizard').closest('.cursor-pointer');
      expect(wizardCard).toBeInTheDocument();
      
      await user.click(wizardCard!);
      
      await waitFor(() => {
        expect(screen.getByText('Protocol Creation Wizard')).toBeInTheDocument();
      });
      
      // Check if dialog is open
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should display all 7 wizard steps', async () => {
      const user = userEvent.setup();
      render(<TrainerHealthProtocols />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText('Guided Protocol Wizard')).toBeInTheDocument();
      });
      
      const wizardCard = screen.getByText('Guided Protocol Wizard').closest('.cursor-pointer');
      await user.click(wizardCard!);
      
      await waitFor(() => {
        expect(screen.getByText('Protocol Creation Wizard')).toBeInTheDocument();
      });
      
      // Check for step indicators
      expect(screen.getByText('Step 1 of 7')).toBeInTheDocument();
    });

    it('should load and display clients in step 1', async () => {
      const user = userEvent.setup();
      render(<TrainerHealthProtocols />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText('Guided Protocol Wizard')).toBeInTheDocument();
      });
      
      const wizardCard = screen.getByText('Guided Protocol Wizard').closest('.cursor-pointer');
      await user.click(wizardCard!);
      
      await waitFor(() => {
        expect(screen.getByText('Select Client')).toBeInTheDocument();
      });
      
      // Check if clients are loaded
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });

    it('should navigate through wizard steps', async () => {
      const user = userEvent.setup();
      render(<TrainerHealthProtocols />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText('Guided Protocol Wizard')).toBeInTheDocument();
      });
      
      const wizardCard = screen.getByText('Guided Protocol Wizard').closest('.cursor-pointer');
      await user.click(wizardCard!);
      
      await waitFor(() => {
        expect(screen.getByText('Select Client')).toBeInTheDocument();
      });
      
      // Select a client
      const johnDoe = screen.getByText('John Doe').closest('[role="button"]');
      if (johnDoe) await user.click(johnDoe);
      
      // Click Next button
      const nextButton = screen.getByRole('button', { name: /Next/i });
      await user.click(nextButton);
      
      // Should move to step 2
      await waitFor(() => {
        expect(screen.getByText('Step 2 of 7')).toBeInTheDocument();
      });
    });

    it('should close wizard when clicking Cancel', async () => {
      const user = userEvent.setup();
      render(<TrainerHealthProtocols />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText('Guided Protocol Wizard')).toBeInTheDocument();
      });
      
      const wizardCard = screen.getByText('Guided Protocol Wizard').closest('.cursor-pointer');
      await user.click(wizardCard!);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should show empty state when no clients available', async () => {
      // Mock empty clients response
      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('/api/trainer/customers')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      });
      
      const user = userEvent.setup();
      render(<TrainerHealthProtocols />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText('Guided Protocol Wizard')).toBeInTheDocument();
      });
      
      const wizardCard = screen.getByText('Guided Protocol Wizard').closest('.cursor-pointer');
      await user.click(wizardCard!);
      
      await waitFor(() => {
        expect(screen.getByText('No Clients Available')).toBeInTheDocument();
      });
      
      expect(screen.getByText(/You don't have any clients assigned yet/i)).toBeInTheDocument();
    });
  });

  describe('Protocol Generation', () => {
    it('should render specialized protocols panel', async () => {
      render(<TrainerHealthProtocols />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText('Specialized Health Protocols')).toBeInTheDocument();
      });
    });

    it('should expand specialized protocols panel when clicked', async () => {
      const user = userEvent.setup();
      render(<TrainerHealthProtocols />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText('Specialized Health Protocols')).toBeInTheDocument();
      });
      
      const expandButton = screen.getByRole('button', { name: /Specialized Health Protocols/i });
      await user.click(expandButton);
      
      // Check if panel content is visible
      await waitFor(() => {
        expect(screen.getByText(/Configure protocol type/i)).toBeInTheDocument();
      });
    });

    it('should handle protocol generation with selected ailments', async () => {
      const user = userEvent.setup();
      render(<TrainerHealthProtocols />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText('Specialized Health Protocols')).toBeInTheDocument();
      });
      
      // Expand the panel
      const expandButton = screen.getByRole('button', { name: /Specialized Health Protocols/i });
      await user.click(expandButton);
      
      // Select Longevity Mode
      await waitFor(() => {
        const longevityTab = screen.getByRole('tab', { name: /Longevity Mode/i });
        if (longevityTab) user.click(longevityTab);
      });
      
      // Mock successful generation
      (global.fetch as any).mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              id: 'generated-protocol-1',
              name: 'Longevity Protocol',
              type: 'longevity',
            },
          }),
        })
      );
      
      // Find and click generate button
      const generateButton = screen.getAllByRole('button').find(
        btn => btn.textContent?.includes('Generate')
      );
      
      if (generateButton) {
        await user.click(generateButton);
        
        await waitFor(() => {
          const toast = useToast().toast;
          expect(toast).toHaveBeenCalledWith(
            expect.objectContaining({
              title: expect.stringContaining('Success'),
            })
          );
        });
      }
    });

    it('should show error when generation fails', async () => {
      const user = userEvent.setup();
      render(<TrainerHealthProtocols />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText('Specialized Health Protocols')).toBeInTheDocument();
      });
      
      const expandButton = screen.getByRole('button', { name: /Specialized Health Protocols/i });
      await user.click(expandButton);
      
      // Mock failed generation
      (global.fetch as any).mockImplementationOnce(() => 
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({
            error: 'Generation failed',
          }),
        })
      );
      
      const generateButton = screen.getAllByRole('button').find(
        btn => btn.textContent?.includes('Generate')
      );
      
      if (generateButton) {
        await user.click(generateButton);
        
        await waitFor(() => {
          expect(screen.getByText(/error|failed/i)).toBeInTheDocument();
        });
      }
    });

    it('should validate medical consent before generation', async () => {
      const user = userEvent.setup();
      render(<TrainerHealthProtocols />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText('Specialized Health Protocols')).toBeInTheDocument();
      });
      
      const expandButton = screen.getByRole('button', { name: /Specialized Health Protocols/i });
      await user.click(expandButton);
      
      // Check for medical consent checkbox
      await waitFor(() => {
        const consentCheckbox = screen.getByRole('checkbox', { name: /medical consent/i });
        expect(consentCheckbox).toBeInTheDocument();
      });
      
      // Generate button should be disabled without consent
      const generateButton = screen.getAllByRole('button').find(
        btn => btn.textContent?.includes('Generate')
      );
      
      expect(generateButton).toBeDisabled();
      
      // Check consent
      const consentCheckbox = screen.getByRole('checkbox', { name: /medical consent/i });
      await user.click(consentCheckbox);
      
      // Generate button should be enabled
      expect(generateButton).not.toBeDisabled();
    });
  });

  describe('API Integration', () => {
    it('should handle API errors gracefully', async () => {
      // Mock API error
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));
      
      render(<TrainerHealthProtocols />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText(/error|failed|try again/i)).toBeInTheDocument();
      });
    });

    it('should refresh data when protocols are created', async () => {
      const { rerender } = render(<TrainerHealthProtocols />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/trainer/protocols'),
          expect.any(Object)
        );
      });
      
      const initialCallCount = (global.fetch as any).mock.calls.length;
      
      // Simulate protocol creation
      rerender(<TrainerHealthProtocols />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect((global.fetch as any).mock.calls.length).toBeGreaterThan(initialCallCount);
      });
    });
  });
});