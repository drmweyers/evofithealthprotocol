/**
 * Specialized Protocols Panel Component
 * 
 * This component integrates both Longevity Mode and Parasite Cleanse Protocol
 * features into the meal plan generation workflow, providing a unified interface
 * for specialized health protocols.
 */

import React, { useState, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import {
  Sparkles,
  Shield,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Settings,
  Activity,
  Clock,
  Bug,
  Leaf,
  Info,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';

// Import our new components
import LongevityModeToggle from './LongevityModeToggle';
import ParasiteCleanseProtocol from './ParasiteCleanseProtocol';
import MedicalDisclaimerModal from './MedicalDisclaimerModal';
import ProtocolDashboard from './ProtocolDashboard';
import SpecializedIngredientSelector from './SpecializedIngredientSelector';
import ClientAilmentsSelector from './ClientAilmentsSelector';

import type {
  LongevityModeConfig,
  ParasiteCleanseConfig,
  MedicalDisclaimer,
  ProtocolProgress,
  SpecializedProtocolConfig,
  SymptomLog,
  ProgressMeasurement,
  ClientAilmentsConfig,
} from '../types/specializedProtocols';

import { getAilmentNutritionalFocus } from '../data/clientAilments';

// Local interfaces for better type safety
interface ProtocolActivity {
  time: string;
  purpose: string;
  activity: string;
  details: string;
}

interface DailySchedule {
  day: number;
  wakeUpTime: string;
  schedule: ProtocolActivity[];
}

interface SpecializedProtocolsPanelProps {
  onConfigChange: (config: SpecializedProtocolConfig) => void;
  initialConfig?: Partial<SpecializedProtocolConfig>;
  disabled?: boolean;
  showDashboard?: boolean;
}

// Default configurations
const DEFAULT_LONGEVITY_CONFIG: LongevityModeConfig = {
  isEnabled: false,
  fastingStrategy: 'none',
  calorieRestriction: 'none',
  antioxidantFocus: [],
  includeAntiInflammatory: false,
  includeBrainHealth: false,
  includeHeartHealth: false,
  targetServings: {
    vegetables: 5,
    antioxidantFoods: 3,
    omega3Sources: 2,
  },
};

const DEFAULT_PARASITE_CLEANSE_CONFIG: ParasiteCleanseConfig = {
  isEnabled: false,
  duration: 14,
  intensity: 'gentle',
  currentPhase: 'preparation',
  includeHerbalSupplements: false,
  dietOnlyCleanse: true,
  startDate: null,
  endDate: null,
  targetFoods: {
    antiParasitic: [],
    probiotics: [],
    fiberRich: [],
    excludeFoods: [],
  },
};

const DEFAULT_MEDICAL_DISCLAIMER: MedicalDisclaimer = {
  hasReadDisclaimer: false,
  hasConsented: false,
  consentTimestamp: null,
  acknowledgedRisks: false,
  hasHealthcareProviderApproval: false,
  pregnancyScreeningComplete: false,
  medicalConditionsScreened: false,
};

const DEFAULT_PROGRESS: ProtocolProgress = {
  startDate: new Date(),
  currentDay: 1,
  totalDays: 14,
  completionPercentage: 0,
  symptomsLogged: [],
  measurements: [],
  notes: [],
};

const DEFAULT_CLIENT_AILMENTS_CONFIG: ClientAilmentsConfig = {
  selectedAilments: [],
  nutritionalFocus: null,
  includeInMealPlanning: false,
  priorityLevel: 'medium',
};

const SpecializedProtocolsPanel: React.FC<SpecializedProtocolsPanelProps> = ({
  onConfigChange,
  initialConfig,
  disabled = false,
  showDashboard = false,
}) => {
  // State management
  const [longevityConfig, setLongevityConfig] = useState<LongevityModeConfig>(
    initialConfig?.longevity || DEFAULT_LONGEVITY_CONFIG
  );
  
  const [parasiteConfig, setParasiteConfig] = useState<ParasiteCleanseConfig>(
    initialConfig?.parasiteCleanse || DEFAULT_PARASITE_CLEANSE_CONFIG
  );
  
  const [medicalDisclaimer, setMedicalDisclaimer] = useState<MedicalDisclaimer>(
    initialConfig?.medical || DEFAULT_MEDICAL_DISCLAIMER
  );
  
  const [progress, setProgress] = useState<ProtocolProgress>(
    initialConfig?.progress || DEFAULT_PROGRESS
  );

  const [clientAilmentsConfig, setClientAilmentsConfig] = useState<ClientAilmentsConfig>(
    initialConfig?.clientAilments || DEFAULT_CLIENT_AILMENTS_CONFIG
  );

  // Modal states
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [disclaimerProtocolType, setDisclaimerProtocolType] = useState<'longevity' | 'parasite-cleanse'>('longevity');
  
  // UI states
  const [isExpanded, setIsExpanded] = useState(true); // Default to expanded for better UX
  const [activeTab, setActiveTab] = useState('ailments'); // Default to ailments tab for primary use case
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  
  // Generation states
  const [isGeneratingLongevity, setIsGeneratingLongevity] = useState(false);
  const [isGeneratingParasite, setIsGeneratingParasite] = useState(false);
  const [isGeneratingAilments, setIsGeneratingAilments] = useState(false);
  const [generatedMealPlan, setGeneratedMealPlan] = useState<any>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Update parent component when configurations change
  useEffect(() => {
    const fullConfig: SpecializedProtocolConfig = {
      longevity: longevityConfig,
      parasiteCleanse: parasiteConfig,
      clientAilments: clientAilmentsConfig,
      medical: medicalDisclaimer,
      progress: progress,
    };
    onConfigChange(fullConfig);
  }, [longevityConfig, parasiteConfig, clientAilmentsConfig, medicalDisclaimer, progress, onConfigChange]);

  // Helper functions
  const getActiveProtocols = (): string[] => {
    const protocols = [];
    if (longevityConfig.isEnabled) protocols.push('Longevity Mode');
    if (parasiteConfig.isEnabled) protocols.push('Parasite Cleanse');
    if (clientAilmentsConfig.includeInMealPlanning && clientAilmentsConfig.selectedAilments.length > 0) {
      protocols.push(`Health Issues (${clientAilmentsConfig.selectedAilments.length})`);
    }
    return protocols;
  };

  const hasActiveProtocols = (): boolean => {
    return longevityConfig.isEnabled || 
           parasiteConfig.isEnabled || 
           (clientAilmentsConfig.includeInMealPlanning && clientAilmentsConfig.selectedAilments.length > 0);
  };

  const requiresMedicalConsent = (): boolean => {
    return (
      (longevityConfig.isEnabled && longevityConfig.calorieRestriction !== 'none') ||
      (parasiteConfig.isEnabled && parasiteConfig.intensity !== 'gentle')
    );
  };

  const hasValidMedicalConsent = (): boolean => {
    if (!requiresMedicalConsent()) return true;
    return medicalDisclaimer.hasConsented && medicalDisclaimer.hasHealthcareProviderApproval;
  };

  // Event handlers
  const handleLongevityToggle = (enabled: boolean) => {
    if (enabled && !medicalDisclaimer.hasConsented) {
      setDisclaimerProtocolType('longevity');
      setShowDisclaimerModal(true);
      return;
    }
    
    setLongevityConfig(prev => ({ ...prev, isEnabled: enabled }));
  };

  const handleParasiteCleanseToggle = (enabled: boolean) => {
    if (enabled && !medicalDisclaimer.hasConsented) {
      setDisclaimerProtocolType('parasite-cleanse');
      setShowDisclaimerModal(true);
      return;
    }
    
    setParasiteConfig(prev => ({ ...prev, isEnabled: enabled }));
  };

  const handleMedicalConsentAccept = (disclaimer: MedicalDisclaimer) => {
    setMedicalDisclaimer(disclaimer);
    
    // Enable the protocol that triggered the disclaimer
    if (disclaimerProtocolType === 'longevity') {
      setLongevityConfig(prev => ({ ...prev, isEnabled: true }));
    } else {
      setParasiteConfig(prev => ({ ...prev, isEnabled: true }));
    }
  };

  const handleLogSymptom = (symptom: Omit<SymptomLog, 'id'>) => {
    const newSymptom: SymptomLog = {
      ...symptom,
      id: Math.random().toString(36).substr(2, 9),
    };
    
    setProgress(prev => ({
      ...prev,
      symptomsLogged: [...prev.symptomsLogged, newSymptom],
    }));
  };

  const handleAddMeasurement = (measurement: Omit<ProgressMeasurement, 'id'>) => {
    const newMeasurement: ProgressMeasurement = {
      ...measurement,
      id: Math.random().toString(36).substr(2, 9),
    };
    
    setProgress(prev => ({
      ...prev,
      measurements: [...prev.measurements, newMeasurement],
    }));
  };

  const handleUpdateProgress = (progressUpdate: Partial<ProtocolProgress>) => {
    setProgress(prev => ({ ...prev, ...progressUpdate }));
  };

  const handleAilmentsSelectionChange = (ailmentIds: string[]) => {
    const nutritionalFocus = ailmentIds.length > 0 ? getAilmentNutritionalFocus(ailmentIds) : null;
    
    setClientAilmentsConfig(prev => ({
      ...prev,
      selectedAilments: ailmentIds,
      nutritionalFocus,
      includeInMealPlanning: ailmentIds.length > 0
    }));
  };

  const handleAilmentsPriorityChange = (priorityLevel: 'low' | 'medium' | 'high') => {
    setClientAilmentsConfig(prev => ({
      ...prev,
      priorityLevel
    }));
  };

  const toggleAilmentsInMealPlanning = (include: boolean) => {
    setClientAilmentsConfig(prev => ({
      ...prev,
      includeInMealPlanning: include
    }));
  };

  // Save generated protocol to database
  const saveProtocolToDatabase = async (type: string, generatedData: any, requestData: any) => {
    console.log('🔍 DEBUG: Starting saveProtocolToDatabase', { type, hasGeneratedData: !!generatedData, hasRequestData: !!requestData });
    
    try {
      // Validate required data before attempting save
      if (!generatedData || !requestData) {
        console.warn('⚠️ Skipping database save: missing required data');
        return false;
      }

      const protocolData = {
        name: requestData.planName || `${type} Protocol - ${new Date().toLocaleDateString()}`,
        description: `Generated ${type} protocol with ${generatedData.mealPlan?.meals?.length || 0} meals`,
        type: type === 'ailments-based' ? 'longevity' : type, // Map ailments-based to longevity type in DB
        duration: generatedData.mealPlan?.duration || requestData.duration || 30,
        intensity: type === 'parasite_cleanse' ? requestData.intensity : 'moderate',
        config: {
          originalRequest: requestData,
          generatedPlan: generatedData,
          mealPlan: generatedData.mealPlan,
          ...generatedData
        },
        tags: type === 'ailments-based' && requestData.selectedAilments ? requestData.selectedAilments : [type]
      };

      console.log('📝 DEBUG: Protocol data prepared:', { 
        name: protocolData.name, 
        type: protocolData.type, 
        duration: protocolData.duration,
        intensity: protocolData.intensity,
        configSize: JSON.stringify(protocolData.config).length,
        tags: protocolData.tags
      });
      console.log('🔧 DEBUG: Full protocol data:', protocolData);

      const response = await fetch('/api/trainer/protocols', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(protocolData),
      });

      console.log('🌐 DEBUG: Save response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ CRITICAL ERROR: Failed to save protocol to database:', response.status, errorText);
        console.error('❌ SENT DATA:', protocolData);
        alert(`Database save failed: ${response.status} - ${errorText}`);
        // Don't throw error - generation succeeded, saving is just for persistence
        return false;
      } else {
        const responseData = await response.json();
        console.log('✅ Protocol successfully saved to database:', responseData);
        return true;
      }
    } catch (error) {
      console.error('💥 Error saving protocol to database:', error);
      // Don't throw error - generation succeeded, saving is just for persistence
      return false;
    }
  };

  // Generate meal plan functions
  const handleGenerateLongevityPlan = async () => {
    if (!longevityConfig.isEnabled) {
      setGenerationError('Please enable and configure Longevity Mode first.');
      return;
    }

    setIsGeneratingLongevity(true);
    setGenerationError(null);
    
    try {
      // Prepare request data based on current longevity configuration
      const requestData = {
        planName: `Longevity Protocol - ${new Date().toLocaleDateString()}`,
        duration: 30, // Default 30 days
        fastingProtocol: longevityConfig.fastingStrategy === 'none' ? '16:8' : longevityConfig.fastingStrategy,
        experienceLevel: 'beginner', // Could be made configurable
        primaryGoals: [
          longevityConfig.includeAntiInflammatory ? 'inflammation_reduction' : null,
          longevityConfig.includeBrainHealth ? 'cognitive_function' : null,
          longevityConfig.includeHeartHealth ? 'metabolic_health' : null,
          'anti_aging',
          'cellular_health'
        ].filter(Boolean),
        culturalPreferences: [], // Could be made configurable
        currentAge: 35, // Could be made configurable
        dailyCalorieTarget: longevityConfig.calorieRestriction === 'strict' ? 1400 : 
                           longevityConfig.calorieRestriction === 'moderate' ? 1600 :
                           longevityConfig.calorieRestriction === 'mild' ? 1800 : 2000,
        clientName: 'Current User'
      };

      const response = await fetch('/api/specialized/longevity/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate longevity meal plan');
      }

      const result = await response.json();
      
      // Save the generated protocol to database
      const saveSuccess = await saveProtocolToDatabase('longevity', result, requestData);
      
      setGeneratedMealPlan({
        type: 'longevity',
        data: result
      });
      setActiveTab('dashboard'); // Switch to dashboard to show results
      
      // Trigger parent config change if save was successful to refresh protocol lists
      if (saveSuccess) {
        // Force a config change callback to trigger parent refresh
        onConfigChange({
          longevity: { ...longevityConfig, isEnabled: true, _protocolGenerated: true },
          parasiteCleanse: parasiteConfig,
          clientAilments: clientAilmentsConfig,
          medical: medicalDisclaimer,
          progress: progress,
        });
      }
    } catch (error) {
      console.error('Error generating longevity plan:', error);
      setGenerationError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsGeneratingLongevity(false);
    }
  };

  const handleGenerateParasiteCleansePlan = async () => {
    if (!parasiteConfig.isEnabled) {
      setGenerationError('Please enable and configure Parasite Cleanse Protocol first.');
      return;
    }

    // Safety check for medical consent
    if (!hasValidMedicalConsent()) {
      setGenerationError('Medical consent and healthcare provider approval required for parasite cleanse protocol.');
      return;
    }

    setIsGeneratingParasite(true);
    setGenerationError(null);
    
    try {
      // Prepare request data based on current parasite cleanse configuration
      const requestData = {
        planName: `Parasite Cleanse Protocol - ${new Date().toLocaleDateString()}`,
        duration: parasiteConfig.duration.toString(),
        intensity: parasiteConfig.intensity,
        experienceLevel: 'first_time', // Could be made configurable
        culturalPreferences: [], // Could be made configurable
        supplementTolerance: 'moderate', // Could be made configurable
        currentSymptoms: [], // Could be made configurable
        medicalConditions: [], // Could be made configurable
        pregnancyOrBreastfeeding: false, // Should be checked in medical disclaimer
        healthcareProviderConsent: medicalDisclaimer.hasHealthcareProviderApproval,
        clientName: 'Current User'
      };

      const response = await fetch('/api/specialized/parasite-cleanse/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate parasite cleanse protocol');
      }

      const result = await response.json();
      
      // Save the generated protocol to database
      const saveSuccess = await saveProtocolToDatabase('parasite_cleanse', result, requestData);
      
      setGeneratedMealPlan({
        type: 'parasite-cleanse',
        data: result
      });
      setActiveTab('dashboard'); // Switch to dashboard to show results
      
      // Trigger parent config change if save was successful to refresh protocol lists
      if (saveSuccess) {
        // Force a config change callback to trigger parent refresh
        onConfigChange({
          longevity: longevityConfig,
          parasiteCleanse: { ...parasiteConfig, isEnabled: true, _protocolGenerated: true },
          clientAilments: clientAilmentsConfig,
          medical: medicalDisclaimer,
          progress: progress,
        });
      }
    } catch (error) {
      console.error('Error generating parasite cleanse plan:', error);
      setGenerationError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsGeneratingParasite(false);
    }
  };

  const handleGenerateAilmentsBasedPlan = async () => {
    console.log('🚀 DEBUG: Starting ailments-based plan generation');
    
    if (!clientAilmentsConfig.includeInMealPlanning || clientAilmentsConfig.selectedAilments.length === 0) {
      console.warn('⚠️ DEBUG: Missing ailments config or meal planning not enabled');
      setGenerationError('Please select health issues and enable meal planning integration first.');
      return;
    }

    setIsGeneratingAilments(true);
    setGenerationError(null);
    
    try {
      // Prepare request data based on current ailments configuration
      const requestData = {
        planName: `Health-Targeted Plan - ${new Date().toLocaleDateString()}`,
        duration: 30, // Default 30 days
        selectedAilments: clientAilmentsConfig.selectedAilments,
        nutritionalFocus: clientAilmentsConfig.nutritionalFocus,
        priorityLevel: clientAilmentsConfig.priorityLevel,
        dailyCalorieTarget: 2000, // Could be made configurable
        clientName: 'Current User'
      };

      console.log('📋 DEBUG: Request data prepared:', { 
        planName: requestData.planName, 
        ailments: requestData.selectedAilments,
        focus: requestData.nutritionalFocus 
      });

      const response = await fetch('/api/specialized/ailments-based/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('🌐 DEBUG: Generation API response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ DEBUG: Generation failed:', errorData);
        throw new Error(errorData.error || 'Failed to generate health-targeted meal plan');
      }

      const result = await response.json();
      console.log('✅ DEBUG: Generation successful, result received:', { 
        hasResult: !!result, 
        hasMealPlan: !!result?.mealPlan,
        mealsCount: result?.mealPlan?.meals?.length
      });
      
      // Save the generated protocol to database  
      console.log('💾 DEBUG: About to save protocol to database...');
      const saveSuccess = await saveProtocolToDatabase('ailments-based', result, requestData);
      console.log('💾 DEBUG: Save protocol call completed, success:', saveSuccess);
      
      setGeneratedMealPlan({
        type: 'ailments-based',
        data: result
      });
      setActiveTab('dashboard'); // Switch to dashboard to show results
      console.log('🎯 DEBUG: UI updated - switched to dashboard tab');
      
      // Trigger parent config change if save was successful to refresh protocol lists
      if (saveSuccess) {
        console.log('🔄 DEBUG: Triggering parent config change to refresh protocol lists...');
        // Force a config change callback to trigger parent refresh
        onConfigChange({
          longevity: longevityConfig,
          parasiteCleanse: parasiteConfig,
          clientAilments: { ...clientAilmentsConfig, includeInMealPlanning: true, _protocolGenerated: true },
          medical: medicalDisclaimer,
          progress: progress,
        });
      }
    } catch (error) {
      console.error('💥 Error generating ailments-based plan:', error);
      setGenerationError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsGeneratingAilments(false);
      console.log('🏁 DEBUG: Generation process finished');
    }
  };

  // Render protocol status summary
  const renderProtocolSummary = () => {
    if (!hasActiveProtocols()) {
      return (
        <div className="text-center py-4 text-muted-foreground">
          No specialized protocols active
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {longevityConfig.isEnabled && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <div>
                <span className="font-medium text-blue-900">Longevity Mode Active</span>
                <div className="text-xs text-blue-700">
                  {longevityConfig.fastingStrategy !== 'none' && `${longevityConfig.fastingStrategy} fasting`}
                  {longevityConfig.calorieRestriction !== 'none' && ` • ${longevityConfig.calorieRestriction} calorie restriction`}
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {longevityConfig.antioxidantFocus.length} antioxidant focuses
            </Badge>
          </div>
        )}

        {parasiteConfig.isEnabled && (
          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Bug className="w-4 h-4 text-orange-600" />
              <div>
                <span className="font-medium text-orange-900">Parasite Cleanse Active</span>
                <div className="text-xs text-orange-700">
                  {parasiteConfig.duration} days • {parasiteConfig.intensity} intensity
                  {parasiteConfig.startDate && ` • Started ${parasiteConfig.startDate.toLocaleDateString()}`}
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              {parasiteConfig.currentPhase}
            </Badge>
          </div>
        )}

        {clientAilmentsConfig.includeInMealPlanning && clientAilmentsConfig.selectedAilments.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600" />
              <div>
                <span className="font-medium text-purple-900">Health Issues Targeting Active</span>
                <div className="text-xs text-purple-700">
                  {clientAilmentsConfig.selectedAilments.length} conditions • {clientAilmentsConfig.priorityLevel} priority
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              {clientAilmentsConfig.nutritionalFocus?.mealPlanFocus.length || 0} focus areas
            </Badge>
          </div>
        )}

        {/* Medical consent status */}
        {requiresMedicalConsent() && (
          <Alert className={hasValidMedicalConsent() ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}>
            <Shield className="h-4 w-4" />
            <AlertTitle>Medical Supervision Status</AlertTitle>
            <AlertDescription>
              {hasValidMedicalConsent() 
                ? 'Medical consent obtained and healthcare provider approval confirmed.'
                : 'Healthcare provider consultation required for selected protocol intensity.'}
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Specialized Health Protocols
            </CardTitle>
            <CardDescription>
              Advanced longevity and cleansing protocols with medical safety features
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getActiveProtocols().map((protocol) => (
              <Badge key={protocol} variant="secondary">
                {protocol}
              </Badge>
            ))}
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Always show summary */}
        {renderProtocolSummary()}

        {/* Expandable detailed configuration */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent>
            <div className="mt-6 space-y-6">
              <Separator />

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="protocols">
                    <Settings className="w-4 h-4 mr-1" />
                    Protocols
                  </TabsTrigger>
                  <TabsTrigger value="ailments">
                    <Activity className="w-4 h-4 mr-1" />
                    Health Issues
                  </TabsTrigger>
                  <TabsTrigger value="ingredients">
                    <Leaf className="w-4 h-4 mr-1" />
                    Ingredients
                  </TabsTrigger>
                  <TabsTrigger value="dashboard">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger value="info">
                    <Info className="w-4 h-4 mr-1" />
                    Info
                  </TabsTrigger>
                </TabsList>

                {/* Protocols Tab */}
                <TabsContent value="protocols" className="space-y-6 mt-6">
                  {/* Error display */}
                  {generationError && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Generation Error</AlertTitle>
                      <AlertDescription>{generationError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <LongevityModeToggle
                    config={longevityConfig}
                    onChange={setLongevityConfig}
                    disabled={disabled}
                    showTooltips={true}
                  />
                  
                  {/* Longevity Generate Button */}
                  {longevityConfig.isEnabled && (
                    <div className="flex justify-center py-4">
                      <Button
                        onClick={handleGenerateLongevityPlan}
                        disabled={disabled || isGeneratingLongevity || !hasValidMedicalConsent()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg flex items-center gap-2"
                        size="lg"
                      >
                        {isGeneratingLongevity ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Generating Longevity Plan...
                          </>
                        ) : (
                          <>
                            <Clock className="w-5 h-5" />
                            Generate Longevity Meal Plan
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  <ParasiteCleanseProtocol
                    config={parasiteConfig}
                    onChange={setParasiteConfig}
                    disabled={disabled}
                  />
                  
                  {/* Parasite Cleanse Generate Button */}
                  {parasiteConfig.isEnabled && (
                    <div className="flex justify-center py-4">
                      <Button
                        onClick={handleGenerateParasiteCleansePlan}
                        disabled={disabled || isGeneratingParasite || !hasValidMedicalConsent()}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 text-lg flex items-center gap-2"
                        size="lg"
                      >
                        {isGeneratingParasite ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Generating Cleanse Protocol...
                          </>
                        ) : (
                          <>
                            <Bug className="w-5 h-5" />
                            Generate Parasite Cleanse Protocol
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </TabsContent>

                {/* Client Ailments Tab */}
                <TabsContent value="ailments" className="space-y-6 mt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Client Health Issues</h3>
                        <p className="text-sm text-gray-600">
                          Select health conditions for targeted nutritional support in meal planning
                        </p>
                      </div>
                      {clientAilmentsConfig.selectedAilments.length > 0 && (
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium">Priority:</label>
                            <select
                              value={clientAilmentsConfig.priorityLevel}
                              onChange={(e) => handleAilmentsPriorityChange(e.target.value as 'low' | 'medium' | 'high')}
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                              disabled={disabled}
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="include-ailments"
                              checked={clientAilmentsConfig.includeInMealPlanning}
                              onChange={(e) => toggleAilmentsInMealPlanning(e.target.checked)}
                              disabled={disabled}
                            />
                            <label htmlFor="include-ailments" className="text-sm font-medium">
                              Include in Meal Planning
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <ClientAilmentsSelector
                      selectedAilments={clientAilmentsConfig.selectedAilments}
                      onSelectionChange={handleAilmentsSelectionChange}
                      maxSelections={15}
                      disabled={disabled}
                      showNutritionalSummary={true}
                      showCategoryCount={true}
                    />

                    {/* Ailments Generate Button */}
                    {clientAilmentsConfig.includeInMealPlanning && clientAilmentsConfig.selectedAilments.length > 0 && (
                      <div className="flex justify-center py-4">
                        <Button
                          onClick={() => handleGenerateAilmentsBasedPlan()}
                          disabled={disabled || isGeneratingAilments}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg flex items-center gap-2"
                          size="lg"
                        >
                          {isGeneratingAilments ? (
                            <>
                              <RefreshCw className="w-5 h-5 animate-spin" />
                              Generating Health-Focused Plan...
                            </>
                          ) : (
                            <>
                              <Activity className="w-5 h-5" />
                              Generate Health-Targeted Meal Plan
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Ingredients Tab */}
                <TabsContent value="ingredients" className="mt-6">
                  <SpecializedIngredientSelector
                    selectedIngredients={selectedIngredients}
                    onSelectionChange={setSelectedIngredients}
                    protocolType={
                      longevityConfig.isEnabled && parasiteConfig.isEnabled
                        ? 'both'
                        : longevityConfig.isEnabled
                        ? 'longevity'
                        : 'parasite-cleanse'
                    }
                    maxSelections={20}
                    showCategories={true}
                    disabled={disabled || !hasActiveProtocols()}
                  />
                </TabsContent>

                {/* Dashboard Tab */}
                <TabsContent value="dashboard" className="mt-6">
                  {generatedMealPlan ? (
                    <div className="space-y-6">
                      {/* Generated Meal Plan Display */}
                      <Card className="border-2 border-green-200 bg-green-50">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-green-800">
                            <CheckCircle className="w-5 h-5" />
                            {generatedMealPlan.type === 'longevity' ? 'Longevity Meal Plan Generated!' : 'Parasite Cleanse Protocol Generated!'}
                          </CardTitle>
                          <CardDescription className="text-green-700">
                            Your specialized meal plan has been successfully created based on your configuration.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Meal Plan Summary */}
                          {generatedMealPlan.data.mealPlan && (
                            <div>
                              <h4 className="font-semibold mb-2 text-green-800">Meal Plan Details:</h4>
                              <div className="bg-white rounded-lg p-4 space-y-2">
                                <p><strong>Duration:</strong> {generatedMealPlan.data.mealPlan.duration || 'N/A'} days</p>
                                <p><strong>Total Meals:</strong> {generatedMealPlan.data.mealPlan.meals?.length || 'N/A'}</p>
                                <p><strong>Protocol Type:</strong> {generatedMealPlan.type === 'longevity' ? 'Anti-Aging & Longevity' : 'Parasite Cleanse'}</p>
                              </div>
                            </div>
                          )}
                          
                          {/* Fasting Schedule (Longevity) */}
                          {generatedMealPlan.type === 'longevity' && generatedMealPlan.data.fastingSchedule && (
                            <div>
                              <h4 className="font-semibold mb-2 text-green-800">Fasting Schedule:</h4>
                              <div className="bg-white rounded-lg p-4">
                                {(() => {
                                  // Parse fastingSchedule if it's a string
                                  let schedule = generatedMealPlan.data.fastingSchedule;
                                  if (typeof schedule === 'string') {
                                    try {
                                      schedule = JSON.parse(schedule);
                                    } catch (e) {
                                      console.error('Failed to parse fasting schedule:', e);
                                      return (
                                        <div className="bg-green-50 p-3 rounded">
                                          <pre className="text-sm whitespace-pre-wrap text-gray-700">
                                            {schedule}
                                          </pre>
                                        </div>
                                      );
                                    }
                                  }
                                  
                                  return Array.isArray(schedule) ? (
                                  <div className="space-y-4">
                                    {schedule.map((item, index) => (
                                      <div key={index} className="border-l-4 border-green-400 pl-4 bg-green-50 p-3 rounded">
                                        <h5 className="font-semibold text-green-800 mb-2">
                                          {item.type || `Schedule ${index + 1}`}
                                        </h5>
                                        {item.fastingWindow && (
                                          <p className="text-sm mb-1">
                                            <strong>Fasting Window:</strong> {item.fastingWindow}
                                          </p>
                                        )}
                                        {item.eatingWindow && (
                                          <p className="text-sm mb-1">
                                            <strong>Eating Window:</strong> {item.eatingWindow}
                                          </p>
                                        )}
                                        {item.description && (
                                          <p className="text-sm text-gray-700 mt-2">{item.description}</p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                  ) : (
                                    <div className="bg-green-50 p-3 rounded">
                                      <pre className="text-sm whitespace-pre-wrap text-gray-700">
                                        {typeof schedule === 'string' 
                                          ? schedule 
                                          : JSON.stringify(schedule, null, 2)}
                                      </pre>
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          )}
                          
                          {/* Daily Schedules (Parasite Cleanse) */}
                          {generatedMealPlan.type === 'parasite-cleanse' && generatedMealPlan.data.dailySchedules && (
                            <div>
                              <h4 className="font-semibold mb-2 text-green-800">Daily Protocol Schedule:</h4>
                              <div className="bg-white rounded-lg p-4 space-y-6">
                                {(() => {
                                  // Parse dailySchedules if it's a string
                                  let schedules = generatedMealPlan.data.dailySchedules;
                                  if (typeof schedules === 'string') {
                                    try {
                                      schedules = JSON.parse(schedules);
                                    } catch (e) {
                                      console.error('Failed to parse daily schedules:', e);
                                      return null;
                                    }
                                  }
                                  
                                  return Array.isArray(schedules) ? 
                                    schedules.slice(0, 3).map((day, index) => (
                                    <div key={index} className="border-l-4 border-purple-400 pl-4">
                                      <h5 className="font-semibold text-purple-800 mb-3">
                                        Day {day.day} - Wake up: {day.wakeUpTime}
                                      </h5>
                                      <div className="space-y-3">
                                        {day.schedule?.slice(0, 4).map((activity: ProtocolActivity, actIndex: number) => (
                                          <div key={actIndex} className="bg-gray-50 p-3 rounded">
                                            <div className="flex justify-between items-start mb-1">
                                              <span className="font-medium text-purple-700">{activity.time}</span>
                                              <span className="text-xs text-gray-500 px-2 py-1 bg-white rounded">
                                                {activity.purpose}
                                              </span>
                                            </div>
                                            <p className="font-medium text-gray-800">{activity.activity}</p>
                                            <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                                          </div>
                                        ))}
                                        {day.schedule?.length > 4 && (
                                          <p className="text-sm text-gray-500 text-center py-2">
                                            ... and {day.schedule.length - 4} more activities
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  )) : (
                                    <div className="text-gray-600">
                                      <p className="font-medium mb-2">Protocol Schedule:</p>
                                      <div className="bg-gray-50 p-3 rounded">
                                        <pre className="text-sm whitespace-pre-wrap text-gray-700">
                                          {typeof generatedMealPlan.data.dailySchedules === 'string' 
                                            ? generatedMealPlan.data.dailySchedules 
                                            : JSON.stringify(generatedMealPlan.data.dailySchedules, null, 2)}
                                        </pre>
                                      </div>
                                    </div>
                                  )
                                })()}
                                {(() => {
                                  let schedules = generatedMealPlan.data.dailySchedules;
                                  if (typeof schedules === 'string') {
                                    try {
                                      schedules = JSON.parse(schedules);
                                    } catch (e) {
                                      return null;
                                    }
                                  }
                                  return Array.isArray(schedules) && schedules.length > 3 ? (
                                  <div className="text-center pt-4 border-t">
                                    <p className="text-sm text-gray-600">
                                      Showing first 3 days of {schedules.length}-day protocol
                                    </p>
                                    <Button variant="outline" size="sm" className="mt-2" onClick={() => {
                                      // Could expand to show all days or open a modal
                                      console.log('Full schedule:', schedules);
                                    }}>
                                      View Complete Schedule
                                    </Button>
                                  </div>
                                  ) : null;
                                })()}
                              </div>
                            </div>
                          )}
                          
                          {/* Safety Disclaimer */}
                          {generatedMealPlan.data.safetyDisclaimer && (
                            <Alert className="border-amber-200 bg-amber-50">
                              <Shield className="h-4 w-4" />
                              <AlertTitle>{generatedMealPlan.data.safetyDisclaimer.title}</AlertTitle>
                              <AlertDescription className="whitespace-pre-wrap">
                                {generatedMealPlan.data.safetyDisclaimer.content}
                              </AlertDescription>
                            </Alert>
                          )}
                          
                          {/* Action Buttons */}
                          <div className="flex gap-3 pt-4">
                            <Button 
                              onClick={() => setGeneratedMealPlan(null)}
                              variant="outline"
                              className="flex items-center gap-2"
                            >
                              <RefreshCw className="w-4 h-4" />
                              Generate New Plan
                            </Button>
                            <Button 
                              onClick={() => setActiveTab('protocols')}
                              variant="outline"
                              className="flex items-center gap-2"
                            >
                              <Settings className="w-4 h-4" />
                              Modify Settings
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : hasActiveProtocols() ? (
                    <div className="space-y-6">
                      <div className="text-center py-8">
                        <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Ready to Generate Your Meal Plan</h3>
                        <p className="text-muted-foreground mb-6">
                          Your protocols are configured. Generate your specialized meal plan to see detailed results here.
                        </p>
                        <Button 
                          onClick={() => setActiveTab('protocols')}
                          className="flex items-center gap-2"
                        >
                          <Settings className="w-4 h-4" />
                          Go to Protocols Tab to Generate
                        </Button>
                      </div>
                      
                      {/* Standard Protocol Dashboard */}
                      <ProtocolDashboard
                        longevityConfig={longevityConfig}
                        parasiteConfig={parasiteConfig}
                        progress={progress}
                        onUpdateProgress={handleUpdateProgress}
                        onLogSymptom={handleLogSymptom}
                        onAddMeasurement={handleAddMeasurement}
                      />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="text-center py-8">
                        <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Protocol Dashboard</h3>
                        <p className="text-muted-foreground mb-6">
                          Activate a health protocol to unlock advanced tracking and monitoring features.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button 
                            variant="outline" 
                            onClick={() => setActiveTab('protocols')}
                            className="flex items-center gap-2"
                          >
                            <Settings className="w-4 h-4" />
                            Configure Protocols
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setActiveTab('info')}
                            className="flex items-center gap-2"
                          >
                            <Info className="w-4 h-4" />
                            Learn More
                          </Button>
                        </div>
                      </div>
                      
                      <Alert>
                        <Sparkles className="h-4 w-4" />
                        <AlertTitle>Dashboard Features</AlertTitle>
                        <AlertDescription>
                          Once you enable a protocol, you'll have access to:
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Real-time progress tracking</li>
                            <li>Symptom and wellness logging</li>
                            <li>Measurement recording</li>
                            <li>Protocol phase management</li>
                            <li>Visual progress charts</li>
                          </ul>
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </TabsContent>

                {/* Info Tab */}
                <TabsContent value="info" className="mt-6">
                  <div className="space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>About Specialized Protocols</AlertTitle>
                      <AlertDescription>
                        These protocols are designed to support specific health goals through targeted nutrition.
                        All protocols include comprehensive safety measures and medical supervision requirements.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-base">
                            <Clock className="w-4 h-4 text-blue-600" />
                            Longevity Mode
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                          <ul className="space-y-1">
                            <li>• Intermittent fasting protocols</li>
                            <li>• Calorie restriction options</li>
                            <li>• High-antioxidant food focus</li>
                            <li>• Anti-inflammatory nutrients</li>
                            <li>• Brain and heart health support</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-base">
                            <Bug className="w-4 h-4 text-orange-600" />
                            Parasite Cleanse
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                          <ul className="space-y-1">
                            <li>• Phased cleansing approach</li>
                            <li>• Anti-parasitic foods</li>
                            <li>• Gut microbiome support</li>
                            <li>• Elimination diet principles</li>
                            <li>• Progress tracking tools</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>

                    <Alert className="border-amber-200 bg-amber-50">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Safety First</AlertTitle>
                      <AlertDescription>
                        These protocols require medical supervision, especially for individuals with existing
                        health conditions. Always consult with a healthcare provider before beginning any protocol.
                      </AlertDescription>
                    </Alert>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>

      {/* Medical Disclaimer Modal */}
      <MedicalDisclaimerModal
        isOpen={showDisclaimerModal}
        onClose={() => setShowDisclaimerModal(false)}
        onAccept={handleMedicalConsentAccept}
        protocolType={disclaimerProtocolType}
        requiredScreenings={[]}
      />
    </Card>
  );
};

export default SpecializedProtocolsPanel;