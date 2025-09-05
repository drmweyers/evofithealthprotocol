/**
 * Guided Protocol Creation Wizard Component
 * 
 * A step-by-step wizard that guides trainers through creating optimized health protocols
 * using templates, safety validation, and AI-powered customization.
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { ScrollArea } from './ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Shield,
  Sparkles,
  Target,
  Clock,
  Users,
  Heart,
  Brain,
  Zap,
  Leaf,
  Star,
  Info,
  Lightbulb,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Save } from 'lucide-react';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  isOptional?: boolean;
  validationRules?: (data: any) => string[];
}

interface ProtocolTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  templateType: string;
  defaultDuration: number;
  defaultIntensity: string;
  baseConfig: any;
  targetAudience: string[];
  healthFocus: string[];
  tags: string[];
  usageCount: number;
}

interface WizardData {
  // Step 1: Protocol Type & Template
  protocolType: 'longevity' | 'parasite_cleanse' | 'ailments_based' | 'general';
  selectedTemplate?: ProtocolTemplate;
  useTemplate: boolean;
  
  // Step 2: Basic Information
  name: string;
  description: string;
  duration: number;
  intensity: 'gentle' | 'moderate' | 'intensive';
  category: string;
  
  // Step 3: Target Audience & Health Focus
  targetAudience: string[];
  healthFocus: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  
  // Step 4: Personalization
  personalizations: {
    ageRange?: { min: number; max: number };
    healthConditions?: string[];
    dietaryRestrictions?: string[];
    culturalPreferences?: string[];
    specificGoals?: string[];
  };
  
  // Step 5: Safety & Medical Considerations
  safetyValidation: {
    requiresHealthcareApproval: boolean;
    contraindications: string[];
    drugInteractions: string[];
    pregnancySafe: boolean;
    intensityWarnings: string[];
  };
  
  // Step 6: Advanced Options
  advancedOptions: {
    enableVersioning: boolean;
    enableEffectivenessTracking: boolean;
    allowCustomerModifications: boolean;
    includeProgressMilestones: boolean;
  };
  
  // Step 7: Preview & Validation
  generatedPreview?: any;
  validationResults?: any;
}

const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'type-template',
    title: 'Protocol Type & Template',
    description: 'Choose your protocol type and optionally start with a template',
    component: TypeTemplateStep,
  },
  {
    id: 'basic-info',
    title: 'Basic Information',
    description: 'Define the core details of your protocol',
    component: BasicInfoStep,
    validationRules: (data) => {
      const errors: string[] = [];
      if (!data.name?.trim()) errors.push('Protocol name is required');
      if (!data.duration || data.duration < 7 || data.duration > 365) {
        errors.push('Duration must be between 7 and 365 days');
      }
      return errors;
    },
  },
  {
    id: 'audience-focus',
    title: 'Target Audience & Health Focus',
    description: 'Define who this protocol is for and what health areas it targets',
    component: AudienceFocusStep,
    validationRules: (data) => {
      const errors: string[] = [];
      if (!data.targetAudience?.length) errors.push('At least one target audience must be selected');
      if (!data.healthFocus?.length) errors.push('At least one health focus area must be selected');
      return errors;
    },
  },
  {
    id: 'personalization',
    title: 'Personalization Options',
    description: 'Add personalization features for different client needs',
    component: PersonalizationStep,
    isOptional: true,
  },
  {
    id: 'safety-validation',
    title: 'Safety & Medical Considerations',
    description: 'Configure safety validations and medical warnings',
    component: SafetyValidationStep,
  },
  {
    id: 'advanced-options',
    title: 'Advanced Features',
    description: 'Enable advanced features like versioning and effectiveness tracking',
    component: AdvancedOptionsStep,
    isOptional: true,
  },
  {
    id: 'preview-generate',
    title: 'Preview & Generate',
    description: 'Review your configuration and generate the protocol',
    component: PreviewGenerateStep,
  },
];

export default function ProtocolCreationWizard({ 
  onComplete, 
  onCancel 
}: {
  onComplete: (protocol: any) => void;
  onCancel: () => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<WizardData>({
    protocolType: 'general',
    useTemplate: false,
    name: '',
    description: '',
    duration: 30,
    intensity: 'moderate',
    category: 'general',
    targetAudience: [],
    healthFocus: [],
    experienceLevel: 'beginner',
    personalizations: {},
    safetyValidation: {
      requiresHealthcareApproval: false,
      contraindications: [],
      drugInteractions: [],
      pregnancySafe: true,
      intensityWarnings: [],
    },
    advancedOptions: {
      enableVersioning: true,
      enableEffectivenessTracking: true,
      allowCustomerModifications: false,
      includeProgressMilestones: true,
    },
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const currentStepData = WIZARD_STEPS[currentStep];
  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  const updateWizardData = (updates: Partial<WizardData>) => {
    setWizardData(prev => ({ ...prev, ...updates }));
    setValidationErrors([]);
  };

  const validateCurrentStep = (): boolean => {
    if (!currentStepData.validationRules) return true;
    
    const errors = currentStepData.validationRules(wizardData);
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const canProceedToNext = (): boolean => {
    return validateCurrentStep();
  };

  const handleNext = () => {
    if (canProceedToNext()) {
      setCurrentStep(prev => Math.min(prev + 1, WIZARD_STEPS.length - 1));
    } else {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before proceeding.',
        variant: 'destructive',
      });
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    setValidationErrors([]);
  };

  const handleStepClick = (stepIndex: number) => {
    // Only allow clicking on completed steps or the next step
    if (stepIndex <= currentStep + 1) {
      setCurrentStep(stepIndex);
      setValidationErrors([]);
    }
  };

  const CurrentStepComponent = currentStepData.component;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Protocol Creation Wizard
        </h1>
        <p className="text-gray-600">
          Create optimized health protocols with AI-powered guidance and safety validation
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Step {currentStep + 1} of {WIZARD_STEPS.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Navigation */}
      <div className="flex flex-wrap gap-2 justify-center">
        {WIZARD_STEPS.map((step, index) => (
          <button
            key={step.id}
            onClick={() => handleStepClick(index)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              index === currentStep
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                : index < currentStep
                ? 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer'
                : index === currentStep + 1
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer'
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
            disabled={index > currentStep + 1}
          >
            {index < currentStep ? (
              <CheckCircle className="h-4 w-4" />
            ) : index === currentStep ? (
              <div className="h-4 w-4 rounded-full bg-blue-600" />
            ) : (
              <div className="h-4 w-4 rounded-full bg-gray-300" />
            )}
            <span className="hidden sm:inline">{step.title}</span>
          </button>
        ))}
      </div>

      {/* Current Step Content */}
      <Card className="min-h-[500px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentStepData.title}
            {currentStepData.isOptional && (
              <Badge variant="outline">Optional</Badge>
            )}
          </CardTitle>
          <CardDescription>{currentStepData.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Please fix the following errors:</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Step Content */}
          <CurrentStepComponent
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            onComplete={onComplete}
          />
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={handlePrevious}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          {currentStep < WIZARD_STEPS.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceedToNext()}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  const step = currentStepData.component as any;
                  if (step === PreviewGenerateStep) {
                    // This is handled inside the PreviewGenerateStep component
                    return;
                  }
                }}
                variant="outline"
                className="hidden"
              >
                Save as Plan
              </Button>
              <Button
                onClick={() => {
                  if (validateCurrentStep()) {
                    // Generate and complete the protocol
                    onComplete(wizardData);
                  }
                }}
                disabled={!canProceedToNext()}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Create Protocol
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Step Components
function TypeTemplateStep({ wizardData, updateWizardData }: any) {
  const { data: templates, isLoading } = useQuery({
    queryKey: ['/api/protocol-templates'],
    queryFn: async () => {
      const response = await fetch('/api/protocol-templates', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    },
  });

  const protocolTypes = [
    { 
      value: 'general', 
      label: 'General Wellness',
      icon: Heart,
      description: 'Balanced protocols for overall health and wellness'
    },
    { 
      value: 'longevity', 
      label: 'Longevity & Anti-Aging',
      icon: Sparkles,
      description: 'Protocols focused on cellular health and longevity'
    },
    { 
      value: 'parasite_cleanse', 
      label: 'Parasite Cleanse',
      icon: Shield,
      description: 'Specialized cleansing protocols for parasite elimination'
    },
    { 
      value: 'ailments_based', 
      label: 'Condition-Specific',
      icon: Target,
      description: 'Therapeutic protocols for specific health conditions'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Protocol Type Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Choose Protocol Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {protocolTypes.map((type) => {
            const Icon = type.icon;
            return (
              <Card
                key={type.value}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  wizardData.protocolType === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
                onClick={() => updateWizardData({ protocolType: type.value })}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Icon className={`h-6 w-6 mt-1 ${
                      wizardData.protocolType === type.value
                        ? 'text-blue-600'
                        : 'text-gray-400'
                    }`} />
                    <div>
                      <h4 className="font-medium">{type.label}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {type.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Template Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Start with a Template (Optional)</h3>
          <Checkbox
            id="use-template"
            checked={wizardData.useTemplate}
            onCheckedChange={(checked) => updateWizardData({ useTemplate: checked })}
          />
        </div>

        {wizardData.useTemplate && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading templates...</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {templates?.data
                  ?.filter((template: ProtocolTemplate) => 
                    template.templateType === wizardData.protocolType
                  )
                  ?.map((template: ProtocolTemplate) => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        wizardData.selectedTemplate?.id === template.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200'
                      }`}
                      onClick={() => updateWizardData({ selectedTemplate: template })}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{template.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {template.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>{template.defaultDuration} days</span>
                              <span className="capitalize">{template.defaultIntensity}</span>
                              <span>Used {template.usageCount} times</span>
                            </div>
                          </div>
                          <Badge variant="outline">{template.category}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BasicInfoStep({ wizardData, updateWizardData }: any) {
  const intensityOptions = [
    { 
      value: 'gentle', 
      label: 'Gentle',
      description: 'Mild intensity, suitable for beginners or sensitive individuals',
      icon: Leaf
    },
    { 
      value: 'moderate', 
      label: 'Moderate',
      description: 'Balanced intensity for most people',
      icon: Zap
    },
    { 
      value: 'intensive', 
      label: 'Intensive',
      description: 'High intensity for experienced individuals',
      icon: Star
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Protocol Name */}
        <div className="space-y-2">
          <Label htmlFor="protocol-name">Protocol Name *</Label>
          <Input
            id="protocol-name"
            placeholder="e.g., 30-Day Wellness Reset"
            value={wizardData.name}
            onChange={(e) => updateWizardData({ name: e.target.value })}
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={wizardData.category}
            onValueChange={(value) => updateWizardData({ category: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General Wellness</SelectItem>
              <SelectItem value="weight_loss">Weight Management</SelectItem>
              <SelectItem value="muscle_gain">Muscle Building</SelectItem>
              <SelectItem value="detox">Detoxification</SelectItem>
              <SelectItem value="energy">Energy & Vitality</SelectItem>
              <SelectItem value="longevity">Longevity</SelectItem>
              <SelectItem value="therapeutic">Therapeutic</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe the goals and benefits of this protocol..."
          value={wizardData.description}
          onChange={(e) => updateWizardData({ description: e.target.value })}
          className="min-h-[100px]"
        />
      </div>

      {/* Duration */}
      <div className="space-y-2">
        <Label htmlFor="duration">Duration (days) *</Label>
        <div className="flex items-center gap-4">
          <Input
            id="duration"
            type="number"
            min="7"
            max="365"
            value={wizardData.duration}
            onChange={(e) => updateWizardData({ duration: parseInt(e.target.value) || 30 })}
            className="w-32"
          />
          <span className="text-sm text-gray-500">
            Recommended: 14-90 days for most protocols
          </span>
        </div>
      </div>

      {/* Intensity */}
      <div className="space-y-4">
        <Label>Protocol Intensity *</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {intensityOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Card
                key={option.value}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  wizardData.intensity === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
                onClick={() => updateWizardData({ intensity: option.value })}
              >
                <CardContent className="p-4 text-center">
                  <Icon className={`h-8 w-8 mx-auto mb-2 ${
                    wizardData.intensity === option.value
                      ? 'text-blue-600'
                      : 'text-gray-400'
                  }`} />
                  <h4 className="font-medium">{option.label}</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    {option.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AudienceFocusStep({ wizardData, updateWizardData }: any) {
  const audienceOptions = [
    { value: 'beginner', label: 'Beginners', description: 'New to health protocols' },
    { value: 'intermediate', label: 'Intermediate', description: 'Some experience with health protocols' },
    { value: 'advanced', label: 'Advanced', description: 'Experienced with complex protocols' },
    { value: 'athletes', label: 'Athletes', description: 'Sports performance focused' },
    { value: 'seniors', label: 'Seniors (65+)', description: 'Age-specific considerations' },
    { value: 'women', label: 'Women', description: 'Female-specific health needs' },
    { value: 'men', label: 'Men', description: 'Male-specific health needs' },
  ];

  const healthFocusOptions = [
    { value: 'digestive_health', label: 'Digestive Health', icon: '🦋' },
    { value: 'immune_support', label: 'Immune Support', icon: '🛡️' },
    { value: 'energy_vitality', label: 'Energy & Vitality', icon: '⚡' },
    { value: 'weight_management', label: 'Weight Management', icon: '⚖️' },
    { value: 'cardiovascular', label: 'Heart Health', icon: '❤️' },
    { value: 'brain_cognitive', label: 'Brain & Cognitive', icon: '🧠' },
    { value: 'hormonal_balance', label: 'Hormonal Balance', icon: '⚖️' },
    { value: 'detoxification', label: 'Detoxification', icon: '🌿' },
    { value: 'anti_aging', label: 'Anti-Aging', icon: '✨' },
    { value: 'sleep_recovery', label: 'Sleep & Recovery', icon: '😴' },
    { value: 'stress_management', label: 'Stress Management', icon: '🧘' },
    { value: 'athletic_performance', label: 'Athletic Performance', icon: '🏃' },
  ];

  const toggleArrayValue = (array: string[], value: string, updater: (newArray: string[]) => void) => {
    if (array.includes(value)) {
      updater(array.filter(item => item !== value));
    } else {
      updater([...array, value]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Target Audience */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Target Audience *</h3>
        <p className="text-sm text-gray-600">
          Select who this protocol is designed for (select multiple if applicable)
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {audienceOptions.map((option) => (
            <div
              key={option.value}
              className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                wizardData.targetAudience.includes(option.value)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleArrayValue(
                wizardData.targetAudience,
                option.value,
                (newArray) => updateWizardData({ targetAudience: newArray })
              )}
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={wizardData.targetAudience.includes(option.value)}
                  onChange={() => {}}
                />
                <div>
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Health Focus Areas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Health Focus Areas *</h3>
        <p className="text-sm text-gray-600">
          Select the primary health areas this protocol will address
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {healthFocusOptions.map((option) => (
            <div
              key={option.value}
              className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                wizardData.healthFocus.includes(option.value)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleArrayValue(
                wizardData.healthFocus,
                option.value,
                (newArray) => updateWizardData({ healthFocus: newArray })
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{option.icon}</span>
                <div>
                  <div className="font-medium text-sm">{option.label}</div>
                </div>
                {wizardData.healthFocus.includes(option.value) && (
                  <CheckCircle className="h-4 w-4 text-green-600 ml-auto" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Experience Level */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recommended Experience Level</h3>
        <RadioGroup
          value={wizardData.experienceLevel}
          onValueChange={(value) => updateWizardData({ experienceLevel: value })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="beginner" id="beginner" />
            <Label htmlFor="beginner">Beginner - New to health protocols</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="intermediate" id="intermediate" />
            <Label htmlFor="intermediate">Intermediate - Some experience</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="advanced" id="advanced" />
            <Label htmlFor="advanced">Advanced - Experienced with complex protocols</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}

function PersonalizationStep({ wizardData, updateWizardData }: any) {
  const commonConditions = [
    'diabetes', 'hypertension', 'heart_disease', 'arthritis', 'depression',
    'anxiety', 'insomnia', 'digestive_issues', 'obesity', 'osteoporosis',
    'autoimmune_conditions', 'chronic_fatigue', 'thyroid_disorders'
  ];

  const dietaryRestrictions = [
    'vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'keto',
    'paleo', 'low_carb', 'low_sodium', 'nut_free', 'shellfish_free'
  ];

  const culturalPreferences = [
    'mediterranean', 'asian', 'indian', 'middle_eastern', 'latin_american',
    'african', 'european', 'kosher', 'halal'
  ];

  const updatePersonalizations = (key: string, value: any) => {
    updateWizardData({
      personalizations: {
        ...wizardData.personalizations,
        [key]: value
      }
    });
  };

  const toggleArrayInPersonalizations = (key: string, value: string) => {
    const currentArray = wizardData.personalizations[key] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item: string) => item !== value)
      : [...currentArray, value];
    updatePersonalizations(key, newArray);
  };

  return (
    <div className="space-y-8">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Optional Personalization</AlertTitle>
        <AlertDescription>
          These settings allow clients to customize the protocol based on their individual needs.
          All personalization options can be configured per client when assigning the protocol.
        </AlertDescription>
      </Alert>

      {/* Age Range */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Age Range Targeting</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="min-age">Minimum Age</Label>
            <Input
              id="min-age"
              type="number"
              min="18"
              max="100"
              value={wizardData.personalizations.ageRange?.min || ''}
              onChange={(e) => updatePersonalizations('ageRange', {
                ...wizardData.personalizations.ageRange,
                min: parseInt(e.target.value) || undefined
              })}
              placeholder="18"
            />
          </div>
          <div>
            <Label htmlFor="max-age">Maximum Age</Label>
            <Input
              id="max-age"
              type="number"
              min="18"
              max="120"
              value={wizardData.personalizations.ageRange?.max || ''}
              onChange={(e) => updatePersonalizations('ageRange', {
                ...wizardData.personalizations.ageRange,
                max: parseInt(e.target.value) || undefined
              })}
              placeholder="65"
            />
          </div>
        </div>
      </div>

      {/* Health Conditions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Common Health Conditions</h3>
        <p className="text-sm text-gray-600">
          Select conditions this protocol can help address or accommodate
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {commonConditions.map((condition) => (
            <div
              key={condition}
              className={`p-2 rounded border cursor-pointer text-sm transition-all ${
                wizardData.personalizations.healthConditions?.includes(condition)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleArrayInPersonalizations('healthConditions', condition)}
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={wizardData.personalizations.healthConditions?.includes(condition)}
                  onChange={() => {}}
                />
                <span className="capitalize">{condition.replace('_', ' ')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dietary Restrictions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Dietary Accommodations</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {dietaryRestrictions.map((restriction) => (
            <div
              key={restriction}
              className={`p-2 rounded border cursor-pointer text-sm transition-all ${
                wizardData.personalizations.dietaryRestrictions?.includes(restriction)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleArrayInPersonalizations('dietaryRestrictions', restriction)}
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={wizardData.personalizations.dietaryRestrictions?.includes(restriction)}
                  onChange={() => {}}
                />
                <span className="capitalize">{restriction.replace('_', ' ')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cultural Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Cultural Food Preferences</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {culturalPreferences.map((preference) => (
            <div
              key={preference}
              className={`p-2 rounded border cursor-pointer text-sm transition-all ${
                wizardData.personalizations.culturalPreferences?.includes(preference)
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleArrayInPersonalizations('culturalPreferences', preference)}
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={wizardData.personalizations.culturalPreferences?.includes(preference)}
                  onChange={() => {}}
                />
                <span className="capitalize">{preference.replace('_', ' ')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SafetyValidationStep({ wizardData, updateWizardData }: any) {
  const updateSafetyValidation = (key: string, value: any) => {
    updateWizardData({
      safetyValidation: {
        ...wizardData.safetyValidation,
        [key]: value
      }
    });
  };

  const addToArray = (key: string, value: string) => {
    if (!value.trim()) return;
    const currentArray = wizardData.safetyValidation[key] || [];
    if (!currentArray.includes(value)) {
      updateSafetyValidation(key, [...currentArray, value]);
    }
  };

  const removeFromArray = (key: string, value: string) => {
    const currentArray = wizardData.safetyValidation[key] || [];
    updateSafetyValidation(key, currentArray.filter((item: string) => item !== value));
  };

  return (
    <div className="space-y-8">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Safety Configuration</AlertTitle>
        <AlertDescription>
          Configure safety validations and medical warnings for this protocol.
          These settings help ensure client safety and proper medical oversight.
        </AlertDescription>
      </Alert>

      {/* Healthcare Approval Requirement */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Require Healthcare Provider Approval</h3>
            <p className="text-sm text-gray-600">
              Should clients get medical approval before starting this protocol?
            </p>
          </div>
          <Checkbox
            checked={wizardData.safetyValidation.requiresHealthcareApproval}
            onCheckedChange={(checked) => updateSafetyValidation('requiresHealthcareApproval', checked)}
          />
        </div>
      </div>

      {/* Pregnancy Safety */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Safe During Pregnancy</h3>
            <p className="text-sm text-gray-600">
              Is this protocol safe for pregnant or breastfeeding women?
            </p>
          </div>
          <Checkbox
            checked={wizardData.safetyValidation.pregnancySafe}
            onCheckedChange={(checked) => updateSafetyValidation('pregnancySafe', checked)}
          />
        </div>
      </div>

      {/* Contraindications */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Medical Contraindications</h3>
        <p className="text-sm text-gray-600">
          Conditions or situations where this protocol should not be used
        </p>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Enter a contraindication..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addToArray('contraindications', (e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
            <Button
              variant="outline"
              onClick={(e) => {
                const input = (e.target as HTMLElement).parentNode?.querySelector('input');
                if (input) {
                  addToArray('contraindications', input.value);
                  input.value = '';
                }
              }}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {wizardData.safetyValidation.contraindications?.map((item: string, index: number) => (
              <Badge
                key={index}
                variant="destructive"
                className="cursor-pointer"
                onClick={() => removeFromArray('contraindications', item)}
              >
                {item} ×
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Drug Interactions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Known Drug Interactions</h3>
        <p className="text-sm text-gray-600">
          Medications that may interact with this protocol
        </p>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Enter a medication..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addToArray('drugInteractions', (e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
            <Button
              variant="outline"
              onClick={(e) => {
                const input = (e.target as HTMLElement).parentNode?.querySelector('input');
                if (input) {
                  addToArray('drugInteractions', input.value);
                  input.value = '';
                }
              }}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {wizardData.safetyValidation.drugInteractions?.map((item: string, index: number) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => removeFromArray('drugInteractions', item)}
              >
                {item} ×
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Intensity Warnings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Intensity-Specific Warnings</h3>
        <p className="text-sm text-gray-600">
          Special warnings related to the protocol's intensity level
        </p>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Enter a warning..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addToArray('intensityWarnings', (e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
            <Button
              variant="outline"
              onClick={(e) => {
                const input = (e.target as HTMLElement).parentNode?.querySelector('input');
                if (input) {
                  addToArray('intensityWarnings', input.value);
                  input.value = '';
                }
              }}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {wizardData.safetyValidation.intensityWarnings?.map((item: string, index: number) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer"
                onClick={() => removeFromArray('intensityWarnings', item)}
              >
                {item} ×
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdvancedOptionsStep({ wizardData, updateWizardData }: any) {
  const updateAdvancedOptions = (key: string, value: any) => {
    updateWizardData({
      advancedOptions: {
        ...wizardData.advancedOptions,
        [key]: value
      }
    });
  };

  const advancedFeatures = [
    {
      key: 'enableVersioning',
      title: 'Protocol Versioning',
      description: 'Track changes and maintain version history for this protocol',
      icon: Clock,
      recommended: true,
    },
    {
      key: 'enableEffectivenessTracking',
      title: 'Effectiveness Tracking',
      description: 'Monitor client progress and protocol effectiveness over time',
      icon: Target,
      recommended: true,
    },
    {
      key: 'allowCustomerModifications',
      title: 'Allow Client Customizations',
      description: 'Let clients make minor adjustments to their assigned protocol',
      icon: Users,
      recommended: false,
    },
    {
      key: 'includeProgressMilestones',
      title: 'Progress Milestones',
      description: 'Include weekly/monthly milestones and check-in points',
      icon: CheckCircle,
      recommended: true,
    },
  ];

  return (
    <div className="space-y-6">
      <Alert>
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>Advanced Protocol Features</AlertTitle>
        <AlertDescription>
          Enable advanced features to enhance protocol management and client engagement.
          These features can be modified later in protocol settings.
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        {advancedFeatures.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.key} className="relative">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Icon className="h-6 w-6 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{feature.title}</h3>
                      {feature.recommended && (
                        <Badge variant="outline" className="text-xs">
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={feature.key}
                        checked={wizardData.advancedOptions[feature.key]}
                        onCheckedChange={(checked) => updateAdvancedOptions(feature.key, checked)}
                      />
                      <Label
                        htmlFor={feature.key}
                        className="text-sm font-medium cursor-pointer"
                      >
                        Enable {feature.title}
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Auto-save frequency */}
          <div className="space-y-2">
            <Label>Progress Auto-save Frequency</Label>
            <Select defaultValue="weekly">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly (Recommended)</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reminder notifications */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Send Progress Reminders</Label>
              <p className="text-xs text-gray-500">
                Automatically remind clients to log their progress
              </p>
            </div>
            <Checkbox defaultChecked />
          </div>

          {/* Completion certificates */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Generate Completion Certificates</Label>
              <p className="text-xs text-gray-500">
                Create certificates when clients complete the protocol
              </p>
            </div>
            <Checkbox defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PreviewGenerateStep({ wizardData, updateWizardData, onComplete }: any) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProtocol, setGeneratedProtocol] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  const generatePreview = async () => {
    setIsGenerating(true);
    try {
      // Simulate API call to generate protocol preview
      const response = await fetch('/api/protocol-templates/generate-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(wizardData),
      });

      if (!response.ok) throw new Error('Failed to generate preview');
      
      const result = await response.json();
      setGeneratedProtocol(result.data);
      updateWizardData({ generatedPreview: result.data });

      toast({
        title: 'Preview Generated',
        description: 'Your protocol preview has been generated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate protocol preview. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveAsProtocolPlan = async () => {
    setIsSavingPlan(true);
    try {
      const response = await fetch('/api/protocol-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          planName,
          planDescription,
          wizardConfiguration: wizardData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save protocol plan');
      }
      
      const result = await response.json();
      
      toast({
        title: 'Protocol Plan Saved',
        description: `"${planName}" has been saved to your protocol library.`,
      });

      setShowPlanModal(false);
      // Optionally navigate to the plans library or complete
      if (onComplete) {
        onComplete({ type: 'plan', data: result.data });
      }
    } catch (error: any) {
      toast({
        title: 'Save Failed',
        description: error.message || 'Failed to save protocol plan. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingPlan(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Protocol Configuration Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Name:</span>
              <p className="text-gray-600">{wizardData.name || 'Untitled Protocol'}</p>
            </div>
            <div>
              <span className="font-medium">Type:</span>
              <p className="text-gray-600 capitalize">{wizardData.protocolType.replace('_', ' ')}</p>
            </div>
            <div>
              <span className="font-medium">Duration:</span>
              <p className="text-gray-600">{wizardData.duration} days</p>
            </div>
            <div>
              <span className="font-medium">Intensity:</span>
              <p className="text-gray-600 capitalize">{wizardData.intensity}</p>
            </div>
            <div>
              <span className="font-medium">Target Audience:</span>
              <p className="text-gray-600">{wizardData.targetAudience.length} groups</p>
            </div>
            <div>
              <span className="font-medium">Health Focus:</span>
              <p className="text-gray-600">{wizardData.healthFocus.length} areas</p>
            </div>
          </div>

          {wizardData.selectedTemplate && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900">Using Template:</h4>
              <p className="text-blue-700">{wizardData.selectedTemplate.name}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate Preview Button or Action Buttons */}
      {!generatedProtocol ? (
        <div className="text-center">
          <Button
            onClick={generatePreview}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating Preview...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Protocol Preview
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="flex justify-center gap-4">
          <Button
            onClick={() => setShowPlanModal(true)}
            size="lg"
            variant="outline"
            className="min-w-[200px]"
          >
            <Save className="h-4 w-4 mr-2" />
            Save as Protocol Plan
          </Button>
          <Button
            onClick={() => {
              if (onComplete) {
                onComplete({ type: 'immediate', data: wizardData });
              }
            }}
            size="lg"
            className="bg-green-600 hover:bg-green-700 min-w-[200px]"
          >
            <Check className="h-4 w-4 mr-2" />
            Create & Assign Now
          </Button>
        </div>
      )}

      {/* Generated Preview */}
      {generatedProtocol && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Generated Protocol Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <pre className="text-sm whitespace-pre-wrap">
                {JSON.stringify(generatedProtocol, null, 2)}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Ready to Create */}
      {generatedProtocol && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Ready to Create Protocol</AlertTitle>
          <AlertDescription>
            Your protocol has been generated and validated. You can now save it as a reusable plan or create it immediately.
          </AlertDescription>
        </Alert>
      )}

      {/* Save as Plan Modal */}
      <Dialog open={showPlanModal} onOpenChange={setShowPlanModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Protocol Plan</DialogTitle>
            <DialogDescription>
              Give your protocol plan a name and description for future use.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="plan-name">Plan Name *</Label>
              <Input
                id="plan-name"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="e.g., 30-Day Beginner Wellness"
              />
            </div>
            <div>
              <Label htmlFor="plan-description">Description</Label>
              <Textarea
                id="plan-description"
                value={planDescription}
                onChange={(e) => setPlanDescription(e.target.value)}
                placeholder="Describe when to use this protocol plan..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPlanModal(false)}
              disabled={isSavingPlan}
            >
              Cancel
            </Button>
            <Button
              onClick={saveAsProtocolPlan}
              disabled={!planName.trim() || isSavingPlan}
            >
              {isSavingPlan ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Plan'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}