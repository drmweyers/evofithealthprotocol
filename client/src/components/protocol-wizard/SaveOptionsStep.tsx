/**
 * Save Options Step Component
 * 
 * Final step in protocol wizard allowing users to:
 * 1. Assign to Customer - Select customer and assign protocol immediately
 * 2. Save to Database - Save as template for later assignment
 * 3. Finish - Complete without assignment or saving
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import {
  Users,
  Database,
  CheckCircle,
  User,
  Save,
  FileText,
  ArrowRight,
  Info,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface Customer {
  id: string;
  name: string;
  email: string;
  age: number;
  healthConditions?: string[];
  lastProtocolDate?: string;
}

interface SaveOptionsStepProps {
  generatedProtocol: any;
  availableCustomers: Customer[];
  onAssignToCustomer: (customerId: string) => void;
  onSaveAsTemplate: (title: string, description: string) => void;
  onFinish: () => void;
  userRole: 'admin' | 'trainer';
  isLoading?: boolean;
}

export default function SaveOptionsStep({
  generatedProtocol,
  availableCustomers,
  onAssignToCustomer,
  onSaveAsTemplate,
  onFinish,
  userRole,
  isLoading = false
}: SaveOptionsStepProps) {
  const [selectedOption, setSelectedOption] = useState<'assign' | 'save' | 'finish' | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [templateTitle, setTemplateTitle] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch customers if not provided
  const { data: customers, isLoading: loadingCustomers } = useQuery({
    queryKey: ['trainer-customers'],
    queryFn: async () => {
      const response = await fetch('/api/trainer/customers', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.json();
      return data || [];
    },
    enabled: availableCustomers.length === 0 && userRole === 'trainer',
  });

  const customerList = availableCustomers.length > 0 ? availableCustomers : (customers || []);

  const handleAssignToCustomer = async () => {
    if (!selectedCustomerId) return;
    
    setIsProcessing(true);
    try {
      await onAssignToCustomer(selectedCustomerId);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!templateTitle.trim()) return;
    
    setIsProcessing(true);
    try {
      await onSaveAsTemplate(templateTitle.trim(), templateDescription.trim());
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinish = async () => {
    setIsProcessing(true);
    try {
      await onFinish();
    } finally {
      setIsProcessing(false);
    }
  };

  const renderOptionCards = () => (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Assign to Customer Option */}
      <Card
        className={cn(
          "cursor-pointer transition-all hover:shadow-md",
          selectedOption === 'assign' && "border-primary bg-primary/5"
        )}
        onClick={() => setSelectedOption('assign')}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-blue-500" />
            Assign to Customer
          </CardTitle>
          <CardDescription>
            Select a customer and assign this protocol immediately
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4" />
            Ready for immediate use
          </div>
        </CardContent>
      </Card>

      {/* Save as Template Option */}
      <Card
        className={cn(
          "cursor-pointer transition-all hover:shadow-md",
          selectedOption === 'save' && "border-primary bg-primary/5"
        )}
        onClick={() => setSelectedOption('save')}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="w-5 h-5 text-green-500" />
            Save as Template
          </CardTitle>
          <CardDescription>
            Save this protocol for future use and assignment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Save className="w-4 h-4" />
            Reusable for multiple clients
          </div>
        </CardContent>
      </Card>

      {/* Finish Option */}
      <Card
        className={cn(
          "cursor-pointer transition-all hover:shadow-md",
          selectedOption === 'finish' && "border-primary bg-primary/5"
        )}
        onClick={() => setSelectedOption('finish')}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle className="w-5 h-5 text-purple-500" />
            Finish
          </CardTitle>
          <CardDescription>
            Complete the wizard without saving or assigning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="w-4 h-4" />
            View protocol details only
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAssignmentForm = () => (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Select Customer</CardTitle>
        <CardDescription>
          Choose which customer should receive this protocol
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loadingCustomers ? (
          <div className="text-center py-4">Loading customers...</div>
        ) : customerList.length > 0 ? (
          <div>
            <Label htmlFor="customer-select">Customer</Label>
            <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select a customer..." />
              </SelectTrigger>
              <SelectContent>
                {customerList.map((customer: Customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <span className="font-medium">{customer.name}</span>
                        <span className="text-muted-foreground ml-2">({customer.email})</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Age: {customer.age}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No Customers Available</AlertTitle>
            <AlertDescription>
              You don't have any customers to assign this protocol to. You can save it as a template instead.
            </AlertDescription>
          </Alert>
        )}
        
        <Button 
          onClick={handleAssignToCustomer}
          disabled={!selectedCustomerId || isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            'Assigning Protocol...'
          ) : (
            <>
              <User className="w-4 h-4 mr-2" />
              Assign Protocol to Customer
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );

  const renderTemplateForm = () => (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Save as Template</CardTitle>
        <CardDescription>
          Provide a title and description for this protocol template
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="template-title">Template Title *</Label>
          <Input
            id="template-title"
            value={templateTitle}
            onChange={(e) => setTemplateTitle(e.target.value)}
            placeholder="e.g., Advanced Weight Loss Protocol"
            className="mt-2"
          />
        </div>
        
        <div>
          <Label htmlFor="template-description">Description</Label>
          <Textarea
            id="template-description"
            value={templateDescription}
            onChange={(e) => setTemplateDescription(e.target.value)}
            placeholder="Brief description of when to use this protocol..."
            className="mt-2"
            rows={3}
          />
        </div>
        
        <Button 
          onClick={handleSaveAsTemplate}
          disabled={!templateTitle.trim() || isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            'Saving Template...'
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save as Template
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );

  const renderFinishConfirmation = () => (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Complete Protocol Creation</CardTitle>
        <CardDescription>
          Your protocol has been generated successfully. You can view the details and decide what to do with it later.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Protocol Generated</AlertTitle>
          <AlertDescription>
            The protocol will be displayed for your review. You can always save or assign it later from the protocols page.
          </AlertDescription>
        </Alert>
        
        <Button onClick={handleFinish} disabled={isProcessing} className="w-full mt-4">
          {isProcessing ? (
            'Finishing...'
          ) : (
            <>
              <ArrowRight className="w-4 h-4 mr-2" />
              Complete & View Protocol
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Alert>
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertTitle>Protocol Generated Successfully!</AlertTitle>
        <AlertDescription>
          Your personalized health protocol is ready. Choose how you'd like to proceed:
        </AlertDescription>
      </Alert>

      {renderOptionCards()}

      {selectedOption === 'assign' && renderAssignmentForm()}
      {selectedOption === 'save' && renderTemplateForm()}
      {selectedOption === 'finish' && renderFinishConfirmation()}
    </div>
  );
}