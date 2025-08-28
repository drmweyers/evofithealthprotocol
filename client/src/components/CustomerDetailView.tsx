import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from './ui/dialog';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from '../lib/queryClient';
import { SimplePDFExportButton } from './PDFExportButton';
import { 
  User, 
  Target, 
  Calendar, 
  Heart,
  TrendingUp,
  Scale,
  Activity,
  Camera,
  Plus,
  ArrowLeft,
  FileText,
  Zap
} from 'lucide-react';

interface Customer {
  id: string;
  email: string;
  firstAssignedAt: string;
}

interface ProgressMeasurement {
  id: string;
  customerId: string;
  measurementDate: string;
  weightKg?: string;
  weightLbs?: string;
  bodyFatPercentage?: string;
  waistCm?: string;
  chestCm?: string;
  hipsCm?: string;
  notes?: string;
  createdAt: string;
}

interface CustomerGoal {
  id: string;
  customerId: string;
  goalType: string;
  goalName: string;
  description?: string;
  targetValue: string;
  currentValue?: string;
  targetUnit: string;
  progressPercentage: number;
  status: 'active' | 'achieved' | 'paused';
  startDate: string;
  targetDate?: string;
  achievedDate?: string;
}

interface HealthProtocolAssignment {
  id: string;
  customerId: string;
  trainerId: string;
  protocolData: any;
  assignedAt: string;
  status: string;
}

interface CustomerDetailViewProps {
  customer: Customer;
  onBack: () => void;
}

export default function CustomerDetailView({ customer, onBack }: CustomerDetailViewProps) {
  const [showProtocolGenerator, setShowProtocolGenerator] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch customer's assigned health protocols
  const { data: protocolsData, isLoading: protocolsLoading } = useQuery<{ protocols: HealthProtocolAssignment[]; total: number }>({
    queryKey: ['customerProtocols', customer.id],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/trainer/customers/${customer.id}/protocols`);
      return res.json();
    }
  });

  // Fetch customer's progress measurements (for trainer view)
  const { data: measurementsData, isLoading: measurementsLoading } = useQuery<{ status: string; data: ProgressMeasurement[] }>({
    queryKey: ['customerMeasurements', customer.id],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/trainer/customers/${customer.id}/measurements`);
      return res.json();
    }
  });

  // Fetch customer's goals (for trainer view)
  const { data: goalsData, isLoading: goalsLoading } = useQuery<{ status: string; data: CustomerGoal[] }>({
    queryKey: ['customerGoals', customer.id],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/trainer/customers/${customer.id}/goals`);
      return res.json();
    }
  });

  const protocols = protocolsData?.protocols || [];
  const measurements = measurementsData?.data || [];
  const goals = goalsData?.data || [];

  const getHealthMetrics = () => {
    if (measurements.length === 0) {
      return {
        weight: 'Not recorded',
        bodyFat: 'Not recorded',
        waist: 'Not recorded',
        lastUpdated: 'No measurements'
      };
    }

    const latestMeasurement = measurements[0]; // Assuming sorted by date
    return {
      weight: latestMeasurement.weightLbs ? `${latestMeasurement.weightLbs} lbs` : 
              latestMeasurement.weightKg ? `${latestMeasurement.weightKg} kg` : 'Not recorded',
      bodyFat: latestMeasurement.bodyFatPercentage ? `${latestMeasurement.bodyFatPercentage}%` : 'Not recorded',
      waist: latestMeasurement.waistCm ? `${latestMeasurement.waistCm} cm` : 'Not recorded',
      lastUpdated: new Date(latestMeasurement.measurementDate).toLocaleDateString()
    };
  };

  const healthMetrics = getHealthMetrics();

  // Handle health protocol creation with customer context
  const handleCreateProtocol = () => {
    // Set customer context for health protocol generator
    const customerContext = {
      customerId: customer.id,
      customerEmail: customer.email,
      healthMetrics,
      goals: goals.filter(g => g.status === 'active'),
      recentMeasurements: measurements.slice(0, 3)
    };
    
    // Store context for protocol generator
    sessionStorage.setItem('customerContext', JSON.stringify(customerContext));
    setShowProtocolGenerator(true);
  };

  const handleProtocolCreated = (protocol: any) => {
    // Auto-assign the new protocol to this customer
    assignProtocolToCustomer(protocol);
    setShowProtocolGenerator(false);
    sessionStorage.removeItem('customerContext');
  };

  // Mutation to assign health protocol to customer
  const assignProtocolMutation = useMutation({
    mutationFn: async (protocolData: any) => {
      const res = await apiRequest('POST', `/api/trainer/customers/${customer.id}/protocols`, {
        protocolData
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Health Protocol Created & Assigned",
        description: `Successfully created and assigned a personalized health protocol to ${customer.email}`,
      });
      queryClient.invalidateQueries({ queryKey: ['customerProtocols', customer.id] });
      queryClient.invalidateQueries({ queryKey: ['trainerCustomers'] });
    },
    onError: (error: any) => {
      toast({
        title: "Assignment Failed",
        description: error.message || "Failed to assign health protocol",
        variant: "destructive",
      });
    }
  });

  const assignProtocolToCustomer = (protocol: any) => {
    assignProtocolMutation.mutate(protocol);
  };

  if (showProtocolGenerator) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => setShowProtocolGenerator(false)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Customer Details</span>
          </Button>
          <h1 className="text-2xl font-bold">Create Health Protocol for {customer.email}</h1>
        </div>
        {/* Protocol generator component would go here */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Health Protocol Generator Coming Soon...</p>
            <Button 
              className="mt-4" 
              onClick={() => setShowProtocolGenerator(false)}
            >
              Back to Customer View
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center space-x-2">
              <User className="h-6 w-6" />
              <span>{customer.email}</span>
            </h1>
            <p className="text-muted-foreground">
              Customer since {new Date(customer.firstAssignedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <SimplePDFExportButton 
            customerId={customer.id}
            customerEmail={customer.email}
            data={{
              protocols,
              healthMetrics,
              goals: goals.filter(g => g.status === 'active'),
              measurements: measurements.slice(0, 5)
            }}
          />
          <Button 
            onClick={handleCreateProtocol}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Health Protocol</span>
          </Button>
        </div>
      </div>

      {/* Customer Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Protocols</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{protocols.length}</div>
            <p className="text-xs text-muted-foreground">
              Active health protocols
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Weight</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthMetrics.weight}</div>
            <p className="text-xs text-muted-foreground">
              Last updated: {healthMetrics.lastUpdated}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Body Fat</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthMetrics.bodyFat}</div>
            <p className="text-xs text-muted-foreground">
              Current measurement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals.filter(g => g.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">
              In progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="protocols" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="protocols">Health Protocols</TabsTrigger>
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="protocols" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Assigned Health Protocols</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {protocolsLoading ? (
                <p>Loading protocols...</p>
              ) : protocols.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No health protocols assigned yet.</p>
                  <Button 
                    className="mt-4" 
                    onClick={handleCreateProtocol}
                  >
                    Create First Protocol
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {protocols.map((protocol) => (
                    <div key={protocol.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{protocol.status}</Badge>
                        <div>
                          <p className="font-medium">Health Protocol</p>
                          <p className="text-sm text-muted-foreground">
                            Assigned {new Date(protocol.assignedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="measurements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Scale className="h-5 w-5" />
                <span>Progress Measurements</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {measurementsLoading ? (
                <p>Loading measurements...</p>
              ) : measurements.length === 0 ? (
                <div className="text-center py-8">
                  <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No measurements recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {measurements.map((measurement) => (
                    <div key={measurement.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">
                          {new Date(measurement.measurementDate).toLocaleDateString()}
                        </p>
                        <div className="text-sm text-muted-foreground space-x-4">
                          {measurement.weightLbs && <span>Weight: {measurement.weightLbs} lbs</span>}
                          {measurement.bodyFatPercentage && <span>Body Fat: {measurement.bodyFatPercentage}%</span>}
                          {measurement.waistCm && <span>Waist: {measurement.waistCm} cm</span>}
                        </div>
                        {measurement.notes && (
                          <p className="text-sm text-muted-foreground">{measurement.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Customer Goals</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {goalsLoading ? (
                <p>Loading goals...</p>
              ) : goals.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No goals set yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {goals.map((goal) => (
                    <div key={goal.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{goal.goalName}</p>
                          <Badge variant={goal.status === 'active' ? 'default' : 'secondary'}>
                            {goal.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Target: {goal.targetValue} {goal.targetUnit}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{width: `${goal.progressPercentage}%`}}
                          ></div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Progress: {goal.progressPercentage}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Overall Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Progress tracking coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}