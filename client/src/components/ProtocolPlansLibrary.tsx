/**
 * Protocol Plans Library Component
 * 
 * Displays and manages saved protocol plans that trainers can reuse
 * to create protocols for multiple customers.
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Search,
  Plus,
  MoreVertical,
  Calendar,
  Users,
  Clock,
  Target,
  Edit,
  Trash,
  Send,
  Eye,
  Copy,
  AlertCircle,
  CheckCircle,
  FileText,
  Sparkles,
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface ProtocolPlan {
  id: string;
  planName: string;
  planDescription?: string;
  wizardConfiguration: any;
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
  usageCount: number;
}

interface AssignPlanModalProps {
  plan: ProtocolPlan | null;
  isOpen: boolean;
  onClose: () => void;
}

function AssignPlanModal({ plan, isOpen, onClose }: AssignPlanModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  
  // Fetch customers for assignment
  const { data: customers, isLoading: loadingCustomers } = useQuery({
    queryKey: ['/api/trainer/customers'],
    queryFn: async () => {
      const response = await fetch('/api/trainer/customers', { 
        credentials: 'include' 
      });
      if (!response.ok) throw new Error('Failed to fetch customers');
      return response.json();
    },
    enabled: isOpen,
  });
  
  // Assign plan mutation
  const assignMutation = useMutation({
    mutationFn: async () => {
      if (!plan || !selectedCustomerId) return;
      
      const response = await fetch(`/api/protocol-plans/${plan.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ customerId: selectedCustomerId }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to assign protocol plan');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Protocol Created',
        description: `Protocol has been created and assigned successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/protocol-plans'] });
      onClose();
      setSelectedCustomerId('');
    },
    onError: (error: any) => {
      toast({
        title: 'Assignment Failed',
        description: error.message || 'Failed to assign protocol plan.',
        variant: 'destructive',
      });
    },
  });
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Protocol Plan</DialogTitle>
          <DialogDescription>
            Select a customer to create a protocol from "{plan?.planName}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="customer">Select Customer *</Label>
            <Select
              value={selectedCustomerId}
              onValueChange={setSelectedCustomerId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a customer..." />
              </SelectTrigger>
              <SelectContent>
                {loadingCustomers ? (
                  <SelectItem value="loading" disabled>Loading customers...</SelectItem>
                ) : customers?.data?.length > 0 ? (
                  customers.data.map((customer: any) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name || customer.email}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-customers" disabled>No customers found</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          {plan && (
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="font-medium mb-2">Protocol Details</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Duration: {plan.wizardConfiguration.duration} days</p>
                <p>Intensity: {plan.wizardConfiguration.intensity}</p>
                <p>Type: {plan.wizardConfiguration.protocolType}</p>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => assignMutation.mutate()}
            disabled={!selectedCustomerId || assignMutation.isPending}
          >
            {assignMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Create & Assign
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ProtocolPlansLibrary() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [selectedPlan, setSelectedPlan] = useState<ProtocolPlan | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<ProtocolPlan | null>(null);
  
  // Fetch protocol plans
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/protocol-plans', searchTerm, sortBy],
    queryFn: async () => {
      console.log('🔍 ProtocolPlansLibrary - Starting API call...');
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      params.append('sortBy', sortBy);
      params.append('order', 'desc');
      
      const response = await fetch(`/api/protocol-plans?${params}`, {
        credentials: 'include',
      });
      
      console.log('🔍 ProtocolPlansLibrary - API response status:', response.status);
      
      if (!response.ok) {
        console.log('❌ ProtocolPlansLibrary - API call failed:', response.status, response.statusText);
        throw new Error(`Failed to fetch protocol plans: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ ProtocolPlansLibrary - API call successful, data:', result);
      return result;
    },
    onError: (error) => {
      console.log('❌ ProtocolPlansLibrary - useQuery error:', error);
    },
  });
  
  // Delete plan mutation
  const deleteMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await fetch(`/api/protocol-plans/${planId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete protocol plan');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Plan Deleted',
        description: 'Protocol plan has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/protocol-plans'] });
      setShowDeleteDialog(false);
      setPlanToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Delete Failed',
        description: error.message || 'Failed to delete protocol plan.',
        variant: 'destructive',
      });
    },
  });
  
  const handleAssignPlan = (plan: ProtocolPlan) => {
    setSelectedPlan(plan);
    setShowAssignModal(true);
  };
  
  const handleDeletePlan = (plan: ProtocolPlan) => {
    setPlanToDelete(plan);
    setShowDeleteDialog(true);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  const plans = data?.data || [];
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Protocol Plans Library</h2>
          <p className="text-gray-600">
            Manage and reuse your saved protocol configurations
          </p>
        </div>
        <Button onClick={() => window.location.href = '/trainer/protocols/create'}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Protocol
        </Button>
      </div>
      
      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search protocol plans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Sort by Date Created</SelectItem>
            <SelectItem value="planName">Sort by Name</SelectItem>
            <SelectItem value="usageCount">Sort by Usage</SelectItem>
            <SelectItem value="lastUsedAt">Sort by Last Used</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Plans Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading protocol plans...</p>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load protocol plans. Please try again.</AlertDescription>
        </Alert>
      ) : plans.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Protocol Plans Yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first reusable protocol plan to save time on future protocols.
            </p>
            <Button onClick={() => window.location.href = '/trainer/protocols/create'}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan: ProtocolPlan) => (
            <Card key={plan.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{plan.planName}</CardTitle>
                    {plan.planDescription && (
                      <CardDescription className="mt-1">
                        {plan.planDescription}
                      </CardDescription>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleAssignPlan(plan)}>
                        <Send className="h-4 w-4 mr-2" />
                        Assign to Customer
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Plan
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeletePlan(plan)}
                        className="text-red-600"
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {plan.wizardConfiguration.duration} days
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {plan.wizardConfiguration.intensity}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {plan.wizardConfiguration.healthFocus?.slice(0, 3).map((focus: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {focus.replace('_', ' ')}
                    </Badge>
                  ))}
                  {plan.wizardConfiguration.healthFocus?.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{plan.wizardConfiguration.healthFocus.length - 3} more
                    </Badge>
                  )}
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center text-sm">
                  <div className="text-gray-500">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    Created {formatDate(plan.createdAt)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span className="font-medium">{plan.usageCount}</span>
                    <span className="text-gray-500">uses</span>
                  </div>
                </div>
                
                {plan.lastUsedAt && (
                  <div className="text-xs text-gray-500">
                    Last used {formatDate(plan.lastUsedAt)}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleAssignPlan(plan)}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Assign to Customer
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Assign Plan Modal */}
      <AssignPlanModal
        plan={selectedPlan}
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedPlan(null);
        }}
      />
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Protocol Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{planToDelete?.planName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {planToDelete?.usageCount > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This plan has been used {planToDelete.usageCount} time(s). 
                Existing protocols created from this plan will not be affected.
              </AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setPlanToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (planToDelete) {
                  deleteMutation.mutate(planToDelete.id);
                }
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                'Delete Plan'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}