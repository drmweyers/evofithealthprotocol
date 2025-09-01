/**
 * Test utilities and mock data for Protocol Wizard components
 * 
 * This file provides:
 * - Mock data for all wizard steps
 * - Mock API responses
 * - Common test helper functions
 * - Reusable assertions
 */

import { vi } from 'vitest';

// Mock data for clients
export const mockClients = [
  {
    id: 'client-1',
    name: 'John Doe',
    email: 'john@example.com',
    age: 35,
    healthConditions: ['hypertension', 'diabetes'],
    medications: ['metformin', 'lisinopril'],
    goals: ['weight loss', 'better energy'],
    lastProtocolDate: '2025-01-15',
  },
  {
    id: 'client-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    age: 28,
    healthConditions: ['anxiety'],
    medications: [],
    goals: ['stress management', 'better sleep'],
    lastProtocolDate: null,
  },
  {
    id: 'client-3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    age: 42,
    healthConditions: [],
    medications: [],
    goals: ['muscle gain', 'heart health'],
    lastProtocolDate: '2025-01-10',
  },
];

// Mock data for protocol templates
export const mockTemplates = [
  {
    id: 'template-1',
    name: 'Longevity Optimization Protocol',
    description: 'Comprehensive protocol focused on longevity and anti-aging',
    category: 'Longevity',
    content: {
      phases: ['detox', 'optimization', 'maintenance'],
      duration: 30,
      intensity: 'moderate',
    },
    popularity: 150,
    effectivenessScore: 85,
    tags: ['longevity', 'anti-aging', 'optimization'],
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'template-2',
    name: 'Weight Loss Protocol',
    description: 'Structured approach to healthy weight management',
    category: 'Weight Management',
    content: {
      phases: ['preparation', 'active', 'maintenance'],
      duration: 12,
      intensity: 'high',
    },
    popularity: 200,
    effectivenessScore: 90,
    tags: ['weight loss', 'metabolism', 'nutrition'],
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'template-3',
    name: 'Detox & Cleanse Protocol',
    description: 'Gentle detoxification and system cleansing protocol',
    category: 'Detox',
    content: {
      phases: ['preparation', 'cleanse', 'recovery'],
      duration: 7,
      intensity: 'low',
    },
    popularity: 100,
    effectivenessScore: 78,
    tags: ['detox', 'cleanse', 'gentle'],
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'template-4',
    name: 'Energy Boost Protocol',
    description: 'Protocol designed to enhance energy levels and vitality',
    category: 'Energy',
    content: {
      phases: ['assessment', 'boost', 'sustain'],
      duration: 21,
      intensity: 'moderate',
    },
    popularity: 75,
    effectivenessScore: 82,
    tags: ['energy', 'vitality', 'performance'],
    createdAt: '2025-01-01T00:00:00Z',
  },
];

// Mock generated protocol
export const mockGeneratedProtocol = {
  id: 'protocol-1',
  name: 'Personalized Longevity Protocol - John Doe',
  description: 'AI-generated protocol based on client needs and template',
  content: {
    phases: [
      {
        name: 'Preparation Phase',
        duration: 7,
        instructions: [
          'Eliminate processed foods',
          'Increase water intake to 2L daily',
          'Begin gentle morning routine',
        ],
        supplements: [
          { name: 'Omega-3', dosage: '1000mg', timing: 'with meals' },
          { name: 'Vitamin D3', dosage: '2000IU', timing: 'morning' },
        ],
      },
      {
        name: 'Optimization Phase',
        duration: 14,
        instructions: [
          'Implement intermittent fasting (16:8)',
          'Add resistance training 3x/week',
          'Practice stress reduction techniques',
        ],
        supplements: [
          { name: 'Omega-3', dosage: '1000mg', timing: 'with meals' },
          { name: 'Vitamin D3', dosage: '2000IU', timing: 'morning' },
          { name: 'Magnesium', dosage: '400mg', timing: 'evening' },
        ],
      },
      {
        name: 'Maintenance Phase',
        duration: 9,
        instructions: [
          'Continue optimized nutrition plan',
          'Maintain exercise routine',
          'Regular health monitoring',
        ],
        supplements: [
          { name: 'Multivitamin', dosage: '1 capsule', timing: 'morning' },
          { name: 'Omega-3', dosage: '500mg', timing: 'with meals' },
        ],
      },
    ],
    totalDuration: 30,
    estimatedResults: 'Improved energy, better sleep, optimized biomarkers',
  },
  customizations: {
    goals: ['improve energy', 'better sleep', 'longevity'],
    conditions: ['hypertension'],
    medications: ['lisinopril'],
    allergies: [],
    preferences: ['morning workouts'],
    intensity: 'moderate',
    duration: 30,
    frequency: 5,
  },
  aiGenerated: true,
  createdAt: '2025-01-20T10:00:00Z',
};

// Mock safety validation
export const mockSafetyValidation = {
  safetyRating: 'safe' as const,
  riskLevel: 2,
  interactions: [
    {
      type: 'medication' as const,
      severity: 'low' as const,
      description: 'Omega-3 may enhance effects of blood pressure medication',
      recommendation: 'Monitor blood pressure regularly and consult physician if concerned',
    },
  ],
  contraindications: [],
  requiredMonitoring: ['blood pressure', 'weight'],
  disclaimer: 'This protocol is for informational purposes only. Always consult with a healthcare provider before starting any new health protocol.',
};

// Mock initial wizard data
export const mockInitialWizardData = {
  step: 1,
  customizations: {
    goals: [],
    conditions: [],
    medications: [],
    allergies: [],
    preferences: [],
    intensity: 'moderate' as const,
    duration: 30,
    frequency: 3,
  },
  aiGenerated: false,
};

// Mock completed wizard data
export const mockCompletedWizardData = {
  step: 7,
  client: mockClients[0],
  template: mockTemplates[0],
  customizations: {
    goals: ['improve energy', 'better sleep'],
    conditions: ['hypertension'],
    medications: ['lisinopril'],
    allergies: ['shellfish'],
    preferences: ['morning workouts', 'vegetarian meals'],
    intensity: 'moderate' as const,
    duration: 30,
    frequency: 5,
  },
  aiGenerated: true,
  protocol: mockGeneratedProtocol,
  safetyValidation: mockSafetyValidation,
  notes: 'Client prefers morning workouts and has shown good compliance with previous protocols.',
};

// Mock API responses
export const mockApiResponses = {
  clients: {
    success: () => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockClients),
    }),
    empty: () => Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    }),
    error: () => Promise.resolve({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    }),
    networkError: () => Promise.reject(new Error('Network error')),
  },
  
  templates: {
    success: () => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: mockTemplates }),
    }),
    empty: () => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    }),
    error: () => Promise.resolve({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    }),
  },
  
  generateProtocol: {
    success: () => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: mockGeneratedProtocol }),
    }),
    error: () => Promise.resolve({
      ok: false,
      status: 500,
      statusText: 'Generation failed',
    }),
    slow: () => new Promise(resolve => 
      setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ data: mockGeneratedProtocol }),
      }), 2000)
    ),
  },
  
  validateSafety: {
    success: () => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: mockSafetyValidation }),
    }),
    warning: () => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        data: {
          ...mockSafetyValidation,
          safetyRating: 'caution',
          riskLevel: 5,
          interactions: [
            {
              type: 'medication',
              severity: 'medium',
              description: 'Multiple medication interactions detected',
              recommendation: 'Consult physician before starting protocol',
            },
          ],
        },
      }),
    }),
    error: () => Promise.resolve({
      ok: false,
      status: 500,
      statusText: 'Validation failed',
    }),
  },
  
  createProtocol: {
    success: () => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        id: 'new-protocol-1',
        message: 'Protocol created successfully',
      }),
    }),
    error: () => Promise.resolve({
      ok: false,
      status: 500,
      statusText: 'Creation failed',
    }),
  },
};

// Mock fetch implementation
export const createMockFetch = (scenario: string = 'success') => {
  return vi.fn().mockImplementation((url: string, options?: any) => {
    // Trainer clients endpoint
    if (url.includes('/api/trainer/customers')) {
      switch (scenario) {
        case 'empty': return mockApiResponses.clients.empty();
        case 'error': return mockApiResponses.clients.error();
        case 'network-error': return mockApiResponses.clients.networkError();
        default: return mockApiResponses.clients.success();
      }
    }
    
    // Protocol templates endpoint
    if (url.includes('/api/protocol-templates') && !url.includes('/generate')) {
      switch (scenario) {
        case 'empty': return mockApiResponses.templates.empty();
        case 'error': return mockApiResponses.templates.error();
        default: return mockApiResponses.templates.success();
      }
    }
    
    // Generate protocol endpoint
    if (url.includes('/generate')) {
      switch (scenario) {
        case 'error': return mockApiResponses.generateProtocol.error();
        case 'slow': return mockApiResponses.generateProtocol.slow();
        default: return mockApiResponses.generateProtocol.success();
      }
    }
    
    // Create protocol endpoint
    if (url.includes('/api/trainer/health-protocols') && options?.method === 'POST') {
      switch (scenario) {
        case 'error': return mockApiResponses.createProtocol.error();
        default: return mockApiResponses.createProtocol.success();
      }
    }
    
    // Default fallback
    return Promise.resolve({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });
  });
};

// Mock hooks
export const mockHooks = {
  useToast: () => ({ toast: vi.fn() }),
  useNavigate: () => vi.fn(),
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
};

// Test helper functions
export const testHelpers = {
  // Fill out step 1 (Client Selection)
  selectClient: async (screen: any, clientName: string = 'John Doe') => {
    const clientCard = screen.getByText(clientName);
    expect(clientCard).toBeInTheDocument();
    clientCard.click();
  },
  
  // Fill out step 2 (Template Selection)
  selectTemplate: async (screen: any, templateName: string = 'Longevity Optimization Protocol') => {
    const templateCard = screen.getByText(templateName);
    expect(templateCard).toBeInTheDocument();
    templateCard.click();
  },
  
  // Fill out step 3 (Health Information)
  fillHealthInformation: async (screen: any, fireEvent: any) => {
    // Add health conditions
    const conditionInput = screen.getByPlaceholderText('e.g., Hypertension, Diabetes');
    fireEvent.change(conditionInput, { target: { value: 'hypertension' } });
    fireEvent.click(screen.getByText('Add'));
    
    // Add medications
    const medicationInput = screen.getByPlaceholderText('e.g., Metformin, Lisinopril');
    fireEvent.change(medicationInput, { target: { value: 'lisinopril' } });
    fireEvent.keyPress(medicationInput, { key: 'Enter' });
    
    // Add allergies
    const allergyInput = screen.getByPlaceholderText('e.g., Latex, Penicillin');
    fireEvent.change(allergyInput, { target: { value: 'shellfish' } });
    fireEvent.keyPress(allergyInput, { key: 'Enter' });
  },
  
  // Fill out step 4 (Customization)
  fillCustomization: async (screen: any, fireEvent: any) => {
    // Select health goals
    const weightLossCheckbox = screen.getByLabelText('Weight Loss');
    const energyCheckbox = screen.getByLabelText('Improve Energy');
    fireEvent.click(weightLossCheckbox);
    fireEvent.click(energyCheckbox);
    
    // Select intensity
    const moderateRadio = screen.getByLabelText(/Moderate - Balanced approach/);
    fireEvent.click(moderateRadio);
    
    // Set duration
    const durationSelect = screen.getByDisplayValue('30 weeks');
    fireEvent.click(durationSelect);
    
    // Set frequency
    const frequencySelect = screen.getByDisplayValue('3 days/week');
    fireEvent.click(frequencySelect);
  },
  
  // Assertions for wizard state
  assertStep: (screen: any, stepNumber: number, stepTitle: string) => {
    expect(screen.getByText(`Step ${stepNumber} of 7`)).toBeInTheDocument();
    expect(screen.getByText(stepTitle)).toBeInTheDocument();
  },
  
  assertProgressBar: (screen: any, stepNumber: number) => {
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', ((stepNumber / 7) * 100).toString());
  },
  
  assertButtonStates: (screen: any, step: number, hasData: boolean = true) => {
    const backButton = screen.getByText('Back');
    const nextButton = screen.queryByText('Next') || screen.queryByText('Create Protocol');
    
    if (step === 1) {
      expect(backButton).toBeDisabled();
    } else {
      expect(backButton).not.toBeDisabled();
    }
    
    if (step === 7) {
      expect(screen.getByText('Create Protocol')).toBeInTheDocument();
    } else {
      expect(screen.getByText('Next')).toBeInTheDocument();
      if ((step === 1 || step === 2) && !hasData) {
        expect(nextButton).toBeDisabled();
      }
    }
  },
  
  // Navigation helpers
  navigateToStep: async (screen: any, fireEvent: any, targetStep: number) => {
    for (let i = 1; i < targetStep; i++) {
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      
      // Wait for step change
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  },
  
  goBack: async (screen: any, fireEvent: any) => {
    const backButton = screen.getByText('Back');
    fireEvent.click(backButton);
  },
  
  goNext: async (screen: any, fireEvent: any) => {
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
  },
  
  cancel: async (screen: any, fireEvent: any) => {
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
  },
  
  finalize: async (screen: any, fireEvent: any) => {
    const finalizeButton = screen.getByText('Create Protocol');
    fireEvent.click(finalizeButton);
  },
};

// Common test scenarios
export const testScenarios = {
  emptyData: {
    clients: [],
    templates: [],
    protocol: null,
    safetyValidation: null,
  },
  
  errorStates: {
    clientsError: 'Failed to load clients',
    templatesError: 'Failed to load templates',
    generationError: 'Failed to generate protocol',
    validationError: 'Failed to validate safety',
    creationError: 'Failed to create protocol',
  },
  
  loadingStates: {
    clients: 'Loading clients...',
    templates: 'Loading templates...',
    generating: 'Generating...',
    creating: 'Creating...',
  },
};

// Export everything needed for tests
export * from '@testing-library/react';
export * from '@testing-library/user-event';