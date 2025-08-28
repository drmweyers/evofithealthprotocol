import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from './ui/dialog';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from '../lib/queryClient';
import { SimplePDFExportButton } from './PDFExportButton';
import CustomerDetailView from './CustomerDetailView';
import { 
  Users, 
  Plus, 
  Calendar, 
  Target, 
  Zap, 
  Search,
  MoreVertical,
  Trash2,
  User,
  Mail,
  Clock,
  Download
} from 'lucide-react';

interface Customer {
  id: string;
  email: string;
  firstAssignedAt: string;
}

interface HealthProtocolAssignment {
  id: string;
  customerId: string;
  trainerId: string;
  protocolData: any;
  assignedAt: string;
  status: string;
}

interface ProtocolAssignmentDialogProps {
  customerId: string;
  customerEmail: string;
  onSuccess: () => void;
}

function ProtocolAssignmentDialog({ customerId, customerEmail, onSuccess }: ProtocolAssignmentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get available health protocols
  const { data: availableProtocols } = useQuery<any[]>({
    queryKey: ['availableProtocols'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/trainer/protocols');
      return res.json();
    },
    enabled: isOpen
  });

  const assignProtocolMutation = useMutation({
    mutationFn: async (protocolData: any) => {
      const res = await apiRequest('POST', `/api/trainer/customers/${customerId}/protocols`, {
        protocolData
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Protocol Assigned",
        description: `Successfully assigned health protocol to ${customerEmail}`,
      });
      setIsOpen(false);
      setSelectedProtocol(null);
      queryClient.invalidateQueries({ queryKey: ['trainerCustomers'] });
      queryClient.invalidateQueries({ queryKey: ['customerProtocols', customerId] });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Assignment Failed",
        description: error.message || "Failed to assign health protocol",
        variant: "destructive",
      });
    }
  });

  const handleAssign = () => {
    if (!selectedProtocol) {
      toast({
        title: "No Protocol Selected",
        description: "Please select a health protocol to assign",
        variant: "destructive",
      });
      return;
    }
    assignProtocolMutation.mutate(selectedProtocol);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Zap className="h-4 w-4 mr-2" />
          Assign Protocol
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Health Protocol</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Customer</Label>
            <p className="text-sm text-muted-foreground">{customerEmail}</p>
          </div>
          
          <div className="space-y-3">
            <Label>Available Health Protocols</Label>
            {availableProtocols && availableProtocols.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableProtocols.map((protocol) => (
                  <div
                    key={protocol.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedProtocol?.id === protocol.id 
                        ? 'border-primary bg-primary/10' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedProtocol(protocol)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{protocol.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {protocol.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary">{protocol.type}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {protocol.duration} days
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No health protocols available</p>
                <p className="text-sm text-muted-foreground">Create some protocols first</p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={!selectedProtocol || assignProtocolMutation.isPending}
            >
              {assignProtocolMutation.isPending ? 'Assigning...' : 'Assign Protocol'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CustomerManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch customers assigned to this trainer
  const { data: customersData, isLoading: customersLoading, error } = useQuery<{customers: Customer[]}>({
    queryKey: ['trainerCustomers'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/trainer/customers');
      return res.json();
    }
  });

  // Fetch customer protocol assignments
  const { data: protocolAssignments } = useQuery<HealthProtocolAssignment[]>({
    queryKey: ['customerProtocolAssignments'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/trainer/customer-protocol-assignments');
      return res.json();
    }
  });

  const customers = customersData?.customers || [];
  const assignments = protocolAssignments || [];

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer =>
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get protocol count for a customer
  const getCustomerProtocolCount = (customerId: string) => {
    return assignments.filter(assignment => 
      assignment.customerId === customerId && 
      assignment.status === 'active'
    ).length;
  };

  if (selectedCustomer) {
    return (
      <CustomerDetailView 
        customer={selectedCustomer} 
        onBack={() => setSelectedCustomer(null)} 
      />
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-red-600">Error loading customers: {error.message}</p>
            <Button className="mt-4" onClick={() => queryClient.invalidateQueries({ queryKey: ['trainerCustomers'] })}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Users className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">Customer Management</h1>
            <p className="text-muted-foreground">
              Manage your {customers.length} assigned customers
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">
              Active customer relationships
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Protocols</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignments.filter(a => a.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently assigned protocols
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.filter(c => {
                const assignedDate = new Date(c.firstAssignedAt);
                const now = new Date();
                return assignedDate.getMonth() === now.getMonth() && 
                       assignedDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              New customers this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Protocols</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.length > 0 ? (assignments.length / customers.length).toFixed(1) : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Protocols per customer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Customer List */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Customers</CardTitle>
        </CardHeader>
        <CardContent>
          {customersLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No customers found matching your search' : 'No customers assigned yet'}
              </p>
              {!searchTerm && (
                <p className="text-sm text-muted-foreground mt-2">
                  Customers will appear here when they accept your invitations
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCustomers.map((customer) => {
                const protocolCount = getCustomerProtocolCount(customer.id);
                const lastAssignment = assignments
                  .filter(a => a.customerId === customer.id)
                  .sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime())[0];

                return (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{customer.email}</p>
                          {protocolCount > 0 && (
                            <Badge variant="secondary">
                              {protocolCount} protocol{protocolCount !== 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>Joined {new Date(customer.firstAssignedAt).toLocaleDateString()}</span>
                          </span>
                          
                          {lastAssignment && (
                            <span className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>Last protocol {new Date(lastAssignment.assignedAt).toLocaleDateString()}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <ProtocolAssignmentDialog 
                        customerId={customer.id}
                        customerEmail={customer.email}
                        onSuccess={() => {
                          queryClient.invalidateQueries({ queryKey: ['customerProtocolAssignments'] });
                        }}
                      />
                      
                      <SimplePDFExportButton 
                        customerId={customer.id}
                        customerEmail={customer.email}
                        data={{
                          protocols: assignments.filter(a => a.customerId === customer.id),
                          protocolCount
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}