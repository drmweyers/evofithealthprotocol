/**
 * Enhanced Parasite Cleanse Protocol Component
 * 
 * This component provides comprehensive parasite cleanse protocol selection and configuration
 * with evidence-based protocols, ailment-specific targeting, and detailed herb information.
 * 
 * Features:
 * - 20+ evidence-based protocols from traditional, Ayurvedic, and modern sources
 * - Ailment-specific protocol recommendations
 * - Detailed herb information with dosages and contraindications
 * - Regional availability checking
 * - Safety monitoring and medical disclaimers
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import {
  Bug,
  Calendar,
  Zap,
  Shield,
  AlertTriangle,
  Info,
  Clock,
  Target,
  Leaf,
  Pill,
  Apple,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  Heart,
} from 'lucide-react';
import type {
  ParasiteCleanseConfig,
  ParasiteCleanseProtocolProps,
  CleanseDuration,
  CleanseIntensity,
  CleansePhase,
  ParasiteCleanseFormData,
} from '../types/specializedProtocols';

// Import comprehensive protocols database
import {
  PARASITE_CLEANSE_PROTOCOLS,
  getRecommendedProtocols,
  getProtocolsByIntensity,
  getProtocolsByType,
  getProtocolsForRegion,
  AILMENT_TO_PROTOCOL_MAPPING,
  type ParasiteCleanseProtocol,
} from '../data/parasiteCleanseProtocols';

// Enhanced validation schema
const parasiteCleanseSchema = z.object({
  duration: z.union([z.literal(7), z.literal(14), z.literal(30), z.literal(60), z.literal(90)]),
  intensity: z.enum(['gentle', 'moderate', 'intensive']),
  includeHerbalSupplements: z.boolean(),
  dietOnlyCleanse: z.boolean(),
  startDate: z.string().optional(),
  antiParasiticFoods: z.array(z.string()),
  probioticFoods: z.array(z.string()),
  fiberRichFoods: z.array(z.string()),
  excludeFoods: z.array(z.string()),
  selectedProtocol: z.string().optional(),
  targetAilments: z.array(z.string()).optional(),
  userRegion: z.enum(['northAmerica', 'europe', 'asia', 'latinAmerica', 'africa']).optional(),
}) satisfies z.ZodType<ParasiteCleanseFormData & {
  selectedProtocol?: string;
  targetAilments?: string[];
  userRegion?: 'northAmerica' | 'europe' | 'asia' | 'latinAmerica' | 'africa';
}>;

// Configuration constants
const CLEANSE_DURATIONS: { value: CleanseDuration; label: string; description: string; recommendation: string }[] = [
  {
    value: 7,
    label: '7 Days (Gentle Start)',
    description: 'Short introduction to cleansing',
    recommendation: 'Best for beginners or sensitive systems',
  },
  {
    value: 14,
    label: '14 Days (Standard)',
    description: 'Typical cleanse duration',
    recommendation: 'Good balance of effectiveness and manageability',
  },
  {
    value: 30,
    label: '30 Days (Comprehensive)',
    description: 'Thorough cleansing protocol',
    recommendation: 'For more established cleansers',
  },
  {
    value: 60,
    label: '60 Days (Extended)',
    description: 'Deep cleansing approach',
    recommendation: 'Requires experience and medical consultation',
  },
  {
    value: 90,
    label: '90 Days (Maximum)',
    description: 'Complete lifecycle approach',
    recommendation: 'Only with healthcare provider supervision',
  },
];

const CLEANSE_INTENSITIES: { value: CleanseIntensity; label: string; description: string; warning?: string }[] = [
  {
    value: 'gentle',
    label: 'Gentle',
    description: 'Mild approach with food-based methods',
  },
  {
    value: 'moderate',
    label: 'Moderate',
    description: 'Standard protocol with some herbal support',
  },
  {
    value: 'intensive',
    label: 'Intensive',
    description: 'Strong protocol with full herbal support',
    warning: 'Requires healthcare provider supervision',
  },
];

const CLEANSE_PHASES: { value: CleansePhase; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'preparation',
    label: 'Preparation',
    description: 'Pre-cleanse preparation and diet adjustment',
    icon: <Target className="w-4 h-4" />,
  },
  {
    value: 'elimination',
    label: 'Active Elimination',
    description: 'Active parasite elimination phase',
    icon: <Zap className="w-4 h-4" />,
  },
  {
    value: 'rebuilding',
    label: 'Gut Rebuilding',
    description: 'Restore and rebuild gut health',
    icon: <RefreshCw className="w-4 h-4" />,
  },
  {
    value: 'maintenance',
    label: 'Maintenance',
    description: 'Post-cleanse maintenance protocol',
    icon: <CheckCircle className="w-4 h-4" />,
  },
];

const ANTI_PARASITIC_FOODS = [
  { value: 'garlic', label: 'Garlic', category: 'Strong antimicrobial' },
  { value: 'oregano', label: 'Oregano', category: 'Antifungal & antiparasitic' },
  { value: 'pumpkin-seeds', label: 'Pumpkin Seeds', category: 'Traditional remedy' },
  { value: 'coconut', label: 'Coconut Oil', category: 'Medium-chain fatty acids' },
  { value: 'papaya-seeds', label: 'Papaya Seeds', category: 'Enzyme-rich' },
  { value: 'wormwood', label: 'Wormwood Tea', category: 'Traditional bitter herb' },
  { value: 'cloves', label: 'Cloves', category: 'Antimicrobial spice' },
  { value: 'ginger', label: 'Ginger', category: 'Digestive support' },
];

const PROBIOTIC_FOODS = [
  { value: 'kefir', label: 'Kefir', category: 'Fermented dairy' },
  { value: 'sauerkraut', label: 'Sauerkraut', category: 'Fermented vegetables' },
  { value: 'kimchi', label: 'Kimchi', category: 'Fermented vegetables' },
  { value: 'kombucha', label: 'Kombucha', category: 'Fermented tea' },
  { value: 'miso', label: 'Miso', category: 'Fermented soy' },
  { value: 'tempeh', label: 'Tempeh', category: 'Fermented soy' },
];

const FIBER_RICH_FOODS = [
  { value: 'chia-seeds', label: 'Chia Seeds', category: 'Soluble fiber' },
  { value: 'flax-seeds', label: 'Flax Seeds', category: 'Binding fiber' },
  { value: 'psyllium', label: 'Psyllium Husk', category: 'Bulking fiber' },
  { value: 'berries', label: 'Berries', category: 'Natural fiber' },
  { value: 'vegetables', label: 'Cruciferous Vegetables', category: 'Detox support' },
];

const EXCLUDE_FOODS = [
  { value: 'sugar', label: 'Sugar & Sweeteners', category: 'Feeds parasites' },
  { value: 'refined-carbs', label: 'Refined Carbohydrates', category: 'Promotes growth' },
  { value: 'alcohol', label: 'Alcohol', category: 'Weakens immune system' },
  { value: 'processed-foods', label: 'Processed Foods', category: 'Hard to digest' },
  { value: 'dairy', label: 'Dairy Products', category: 'Can be inflammatory' },
];

const ParasiteCleanseProtocol: React.FC<ParasiteCleanseProtocolProps> = ({
  config,
  onChange,
  disabled = false,
  onPhaseChange,
}) => {
  // Enhanced state management
  const [selectedProtocol, setSelectedProtocol] = useState<ParasiteCleanseProtocol | null>(null);
  const [showProtocolDetails, setShowProtocolDetails] = useState(false);
  const [targetAilments, setTargetAilments] = useState<string[]>([]);
  const [userRegion, setUserRegion] = useState<'northAmerica' | 'europe' | 'asia' | 'latinAmerica' | 'africa'>('northAmerica');
  const [showRecommendations, setShowRecommendations] = useState(false);
  // Computed values using comprehensive protocols database
  const availableProtocols = useMemo(() => {
    return getProtocolsForRegion(userRegion).filter(protocol => 
      protocol.intensity === config.intensity || !config.isEnabled
    );
  }, [userRegion, config.intensity, config.isEnabled]);

  const recommendedProtocols = useMemo(() => {
    if (targetAilments.length === 0) return [];
    return getRecommendedProtocols(targetAilments);
  }, [targetAilments]);

  const protocolsByType = useMemo(() => {
    return {
      traditional: getProtocolsByType('traditional').filter(p => availableProtocols.includes(p)),
      ayurvedic: getProtocolsByType('ayurvedic').filter(p => availableProtocols.includes(p)),
      modern: getProtocolsByType('modern').filter(p => availableProtocols.includes(p)),
      combination: getProtocolsByType('combination').filter(p => availableProtocols.includes(p))
    };
  }, [availableProtocols]);

  const form = useForm<ParasiteCleanseFormData>({
    resolver: zodResolver(parasiteCleanseSchema),
    defaultValues: {
      duration: config.duration,
      intensity: config.intensity,
      includeHerbalSupplements: config.includeHerbalSupplements,
      dietOnlyCleanse: config.dietOnlyCleanse,
      startDate: config.startDate?.toISOString().split('T')[0] || '',
      antiParasiticFoods: config.targetFoods.antiParasitic,
      probioticFoods: config.targetFoods.probiotics,
      fiberRichFoods: config.targetFoods.fiberRich,
      excludeFoods: config.targetFoods.excludeFoods,
      selectedProtocol: selectedProtocol?.id || '',
      targetAilments,
      userRegion,
    },
  });

  // Protocol selection handler
  const handleProtocolSelection = (protocolId: string) => {
    const protocol = PARASITE_CLEANSE_PROTOCOLS.find(p => p.id === protocolId);
    if (protocol) {
      setSelectedProtocol(protocol);
      // Update form values based on selected protocol
      form.setValue('duration', protocol.duration.recommended as CleanseDuration);
      form.setValue('intensity', protocol.intensity);
      
      // Auto-configure based on protocol
      const herbsIncluded = protocol.herbs.filter(h => h.priority === 'primary').length > 0;
      form.setValue('includeHerbalSupplements', herbsIncluded);
      form.setValue('dietOnlyCleanse', !herbsIncluded);
      
      setShowProtocolDetails(true);
    }
  };

  const handleToggleCleanse = (enabled: boolean) => {
    onChange({
      ...config,
      isEnabled: enabled,
    });
  };

  const handleFormChange = (data: ParasiteCleanseFormData) => {
    onChange({
      ...config,
      duration: data.duration as CleanseDuration,
      intensity: data.intensity,
      includeHerbalSupplements: data.includeHerbalSupplements,
      dietOnlyCleanse: data.dietOnlyCleanse,
      startDate: data.startDate ? new Date(data.startDate) : null,
      targetFoods: {
        antiParasitic: data.antiParasiticFoods,
        probiotics: data.probioticFoods,
        fiberRich: data.fiberRichFoods,
        excludeFoods: data.excludeFoods,
      },
    });
  };

  const calculateProgress = (): number => {
    if (!config.startDate || !config.endDate) return 0;
    const now = new Date();
    const start = new Date(config.startDate);
    const end = new Date(config.endDate);
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.max(0, Math.min(100, (elapsed / total) * 100));
  };

  const getDaysRemaining = (): number => {
    if (!config.endDate) return config.duration;
    const now = new Date();
    const end = new Date(config.endDate);
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const getCurrentPhase = (): CleansePhase => {
    const progress = calculateProgress();
    if (progress < 15) return 'preparation';
    if (progress < 75) return 'elimination';
    if (progress < 90) return 'rebuilding';
    return 'maintenance';
  };

  const TooltipWrapper: React.FC<{ children: React.ReactNode; content: string }> = ({ 
    children, 
    content 
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs">{content}</p>
      </TooltipContent>
    </Tooltip>
  );

  return (
    <TooltipProvider>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Bug className="w-5 h-5 text-orange-600" />
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>🪱 Parasite Cleanse Protocol</CardTitle>
                <CardDescription>
                  Comprehensive parasite elimination and gut health restoration
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={config.isEnabled}
              onCheckedChange={handleToggleCleanse}
              disabled={disabled}
              aria-label="Enable Parasite Cleanse Protocol"
            />
          </div>
        </CardHeader>

        {config.isEnabled && (
          <CardContent>
            {/* Safety Warning */}
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Important Medical Disclaimer</AlertTitle>
              <AlertDescription>
                This protocol is for educational purposes only and should not replace professional medical advice. 
                Consult with a healthcare provider before beginning any cleanse, especially if you have medical conditions, 
                are pregnant, or are taking medications.
              </AlertDescription>
            </Alert>

            {/* Enhanced Protocol Selection Section */}
            <div className="mb-6 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">🧬 Evidence-Based Protocol Selection</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRecommendations(!showRecommendations)}
                  className="flex items-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  {showRecommendations ? 'Hide' : 'Show'} Recommendations
                </Button>
              </div>
              
              {/* Region Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Your Region (for herb availability)</Label>
                  <Select value={userRegion} onValueChange={(value) => setUserRegion(value as typeof userRegion)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="northAmerica">🇺🇸 North America</SelectItem>
                      <SelectItem value="europe">🇪🇺 Europe</SelectItem>
                      <SelectItem value="asia">🌏 Asia</SelectItem>
                      <SelectItem value="latinAmerica">🌎 Latin America</SelectItem>
                      <SelectItem value="africa">🌍 Africa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Available Protocols: {availableProtocols.length}</Label>
                  <div className="text-xs text-muted-foreground">
                    Filtered by region and intensity
                  </div>
                </div>
              </div>

              {/* Recommended Protocols */}
              {showRecommendations && recommendedProtocols.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-green-600">✨ Recommended for Your Conditions</Label>
                  <div className="space-y-2">
                    {recommendedProtocols.slice(0, 3).map(({ protocol, matchScore, reasoning }) => (
                      <div
                        key={protocol.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleProtocolSelection(protocol.id)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{protocol.name}</span>
                          <Badge variant="secondary">{matchScore}% match</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mb-1">{protocol.description}</div>
                        <div className="text-xs text-blue-600">{reasoning}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {protocol.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {protocol.duration.recommended} days
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {protocol.intensity}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Protocol Categories */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">🏛️ Browse by Protocol Type</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Traditional Protocols */}
                  {protocolsByType.traditional.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-amber-600">Traditional Herbal</Label>
                      {protocolsByType.traditional.slice(0, 2).map((protocol) => (
                        <Button
                          key={protocol.id}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-xs"
                          onClick={() => handleProtocolSelection(protocol.id)}
                        >
                          <Leaf className="w-3 h-3 mr-2" />
                          {protocol.name}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Ayurvedic Protocols */}
                  {protocolsByType.ayurvedic.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-purple-600">Ayurvedic</Label>
                      {protocolsByType.ayurvedic.slice(0, 2).map((protocol) => (
                        <Button
                          key={protocol.id}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-xs"
                          onClick={() => handleProtocolSelection(protocol.id)}
                        >
                          <Heart className="w-3 h-3 mr-2" />
                          {protocol.name}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Modern Protocols */}
                  {protocolsByType.modern.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-blue-600">Modern Clinical</Label>
                      {protocolsByType.modern.slice(0, 2).map((protocol) => (
                        <Button
                          key={protocol.id}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-xs"
                          onClick={() => handleProtocolSelection(protocol.id)}
                        >
                          <Zap className="w-3 h-3 mr-2" />
                          {protocol.name}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Combination Protocols */}
                  {protocolsByType.combination.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-green-600">Gentle/Combination</Label>
                      {protocolsByType.combination.slice(0, 2).map((protocol) => (
                        <Button
                          key={protocol.id}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-xs"
                          onClick={() => handleProtocolSelection(protocol.id)}
                        >
                          <RefreshCw className="w-3 h-3 mr-2" />
                          {protocol.name}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Selected Protocol Details */}
            {selectedProtocol && showProtocolDetails && (
              <div className="mb-6 p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">{selectedProtocol.type}</Badge>
                    <Badge variant="outline">{selectedProtocol.evidenceLevel}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowProtocolDetails(false)}
                  >
                    ✕
                  </Button>
                </div>
                
                <h4 className="font-semibold mb-2">{selectedProtocol.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">{selectedProtocol.description}</p>
                
                {/* Protocol phases */}
                <div className="space-y-2 mb-3">
                  <Label className="text-xs font-medium">Protocol Phases:</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedProtocol.phases.map((phase, index) => (
                      <div key={index} className="p-2 bg-background rounded border text-xs">
                        <div className="font-medium">{phase.name} ({phase.duration} days)</div>
                        <div className="text-muted-foreground">{phase.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key herbs */}
                {selectedProtocol.herbs.length > 0 && (
                  <div className="space-y-2 mb-3">
                    <Label className="text-xs font-medium">Primary Herbs:</Label>
                    <div className="flex flex-wrap gap-1">
                      {selectedProtocol.herbs
                        .filter(h => h.priority === 'primary')
                        .map((herb, index) => (
                          <TooltipWrapper
                            key={index}
                            content={`${herb.latinName} - ${herb.mechanism}. Dosage: ${herb.dosage.amount} ${herb.dosage.frequency}`}
                          >
                            <Badge variant="secondary" className="text-xs cursor-help">
                              {herb.name}
                            </Badge>
                          </TooltipWrapper>
                        ))}
                    </div>
                  </div>
                )}

                {/* Contraindications warning */}
                {selectedProtocol.contraindications.length > 0 && (
                  <Alert className="mt-3">
                    <Shield className="h-3 w-3" />
                    <AlertTitle className="text-sm">Contraindications</AlertTitle>
                    <AlertDescription className="text-xs">
                      {selectedProtocol.contraindications.slice(0, 3).join(', ')}
                      {selectedProtocol.contraindications.length > 3 && '...'}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <Separator className="mb-6" />

            {/* Progress Tracking (if active) */}
            {config.startDate && (
              <div className="mb-6 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-base font-medium">Cleanse Progress</Label>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {CLEANSE_PHASES.find(p => p.value === getCurrentPhase())?.icon}
                    {CLEANSE_PHASES.find(p => p.value === getCurrentPhase())?.label}
                  </Badge>
                </div>
                <Progress value={calculateProgress()} className="mb-2" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Day {config.duration - getDaysRemaining() + 1} of {config.duration}</span>
                  <span>{getDaysRemaining()} days remaining</span>
                </div>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit((data: ParasiteCleanseFormData) => handleFormChange(data))} className="space-y-6">
                {/* Duration Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <Label className="text-base font-medium">Cleanse Duration</Label>
                    <TooltipWrapper content="Longer durations may be more effective but require greater commitment and supervision">
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipWrapper>
                  </div>
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={field.value.toString()}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select cleanse duration" />
                            </SelectTrigger>
                            <SelectContent>
                              {CLEANSE_DURATIONS.map((duration) => (
                                <SelectItem key={duration.value} value={duration.value.toString()}>
                                  <div>
                                    <div className="font-medium">{duration.label}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {duration.description}
                                    </div>
                                    <div className="text-xs text-blue-600">
                                      {duration.recommendation}
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Intensity Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    <Label className="text-base font-medium">Cleanse Intensity</Label>
                    <TooltipWrapper content="Higher intensities may be more effective but can cause stronger detox reactions">
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipWrapper>
                  </div>
                  <FormField
                    control={form.control}
                    name="intensity"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select cleanse intensity" />
                            </SelectTrigger>
                            <SelectContent>
                              {CLEANSE_INTENSITIES.map((intensity) => (
                                <SelectItem key={intensity.value} value={intensity.value}>
                                  <div>
                                    <div className="font-medium">{intensity.label}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {intensity.description}
                                    </div>
                                    {intensity.warning && (
                                      <div className="text-xs text-amber-600 font-medium">
                                        ⚠️ {intensity.warning}
                                      </div>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Protocol Options */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Protocol Options</Label>
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="includeHerbalSupplements"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <Pill className="w-4 h-4 text-green-600" />
                              <FormLabel className="text-base">Include Herbal Supplements</FormLabel>
                            </div>
                            <FormDescription>
                              Add traditional antiparasitic herbs like wormwood, black walnut, and cloves
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dietOnlyCleanse"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <Apple className="w-4 h-4 text-red-600" />
                              <FormLabel className="text-base">Diet-Only Cleanse</FormLabel>
                            </div>
                            <FormDescription>
                              Focus solely on dietary changes without herbal supplements
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Start Date */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Start Date (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </FormControl>
                        <FormDescription>
                          Set a start date to track progress and phases
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Food Categories */}
                <div className="space-y-6">
                  <Label className="text-base font-medium">Food Categories</Label>
                  
                  {/* Anti-Parasitic Foods */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-orange-600">✓ Include: Anti-Parasitic Foods</Label>
                    <FormField
                      control={form.control}
                      name="antiParasiticFoods"
                      render={() => (
                        <FormItem>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {ANTI_PARASITIC_FOODS.map((food) => (
                              <FormField
                                key={food.value}
                                control={form.control}
                                name="antiParasiticFoods"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(food.value)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, food.value])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== food.value
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <div className="grid gap-1.5 leading-none">
                                      <Label className="text-sm font-medium">
                                        {food.label}
                                      </Label>
                                      <p className="text-xs text-muted-foreground">
                                        {food.category}
                                      </p>
                                    </div>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Probiotic Foods */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-blue-600">✓ Include: Probiotic Foods</Label>
                    <FormField
                      control={form.control}
                      name="probioticFoods"
                      render={() => (
                        <FormItem>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {PROBIOTIC_FOODS.map((food) => (
                              <FormField
                                key={food.value}
                                control={form.control}
                                name="probioticFoods"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(food.value)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, food.value])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== food.value
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <div className="grid gap-1.5 leading-none">
                                      <Label className="text-sm font-medium">
                                        {food.label}
                                      </Label>
                                      <p className="text-xs text-muted-foreground">
                                        {food.category}
                                      </p>
                                    </div>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Foods to Exclude */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-red-600">✗ Exclude: Foods to Avoid</Label>
                    <FormField
                      control={form.control}
                      name="excludeFoods"
                      render={() => (
                        <FormItem>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {EXCLUDE_FOODS.map((food) => (
                              <FormField
                                key={food.value}
                                control={form.control}
                                name="excludeFoods"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(food.value)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, food.value])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== food.value
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <div className="grid gap-1.5 leading-none">
                                      <Label className="text-sm font-medium">
                                        {food.label}
                                      </Label>
                                      <p className="text-xs text-muted-foreground">
                                        {food.category}
                                      </p>
                                    </div>
                                  </FormItem>
                                )}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Current Configuration Summary */}
                {config.isEnabled && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Active Protocol Settings</Label>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {config.duration} Days
                        </Badge>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {config.intensity.charAt(0).toUpperCase() + config.intensity.slice(1)} Intensity
                        </Badge>
                        {config.includeHerbalSupplements && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Pill className="w-3 h-3" />
                            Herbal Supplements
                          </Badge>
                        )}
                        {config.dietOnlyCleanse && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Apple className="w-3 h-3" />
                            Diet Only
                          </Badge>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </form>
            </Form>
          </CardContent>
        )}
      </Card>
    </TooltipProvider>
  );
};

export default ParasiteCleanseProtocol;