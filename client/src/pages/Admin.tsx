import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../contexts/AuthContext";
import { apiRequest } from "../lib/queryClient";
import { isUnauthorizedError } from "../lib/authUtils";
import { createCacheManager } from "../lib/cacheUtils";
import AdminTable from "../components/AdminTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import CacheDebugger from "../components/CacheDebugger";
import SpecializedProtocolsPanel from "../components/SpecializedProtocolsPanel";
import { ResponsiveLayout } from "../components/ResponsiveLayout";
import { useResponsive } from "../hooks/useResponsive";
import { MobileCard, MobileCardContent, MobileCardHeader, MobileCardTitle } from "../components/ui/mobile-card";

export default function Admin() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const queryClient = useQueryClient();
  const cacheManager = createCacheManager(queryClient);
  const [activeTab, setActiveTab] = useState("health-protocols");
  const { isMobile, isTablet } = useResponsive();

  // Periodic cache refresh to keep data fresh
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const cleanup = cacheManager.startPeriodicRefresh(60000); // Every minute
    return cleanup;
  }, [isAuthenticated, cacheManager]);

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalProtocols: number;
    totalUsers: number;
    totalTrainers: number;
    totalCustomers: number;
    protocolAssignments: number;
  }>({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/stats');
      return res.json();
    },
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: healthProtocolsData, isLoading: protocolsLoading } = useQuery<{
    protocols: any[];
    total: number;
  }>({
    queryKey: ['adminHealthProtocols'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/health-protocols');
      return res.json();
    },
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery<{
    users: any[];
    total: number;
  }>({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/users');
      return res.json();
    },
    enabled: isAuthenticated && activeTab === 'customer-management',
    retry: false,
  });

  const deleteProtocolMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/admin/health-protocols/${id}`);
    },
    onSuccess: async () => {
      toast({
        title: "Protocol Deleted",
        description: "Health protocol has been removed from the system.",
      });
      await cacheManager.invalidateProtocols();
      queryClient.invalidateQueries({ queryKey: ['adminHealthProtocols'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete health protocol",
        variant: "destructive",
      });
    },
  });

  const assignProtocolMutation = useMutation({
    mutationFn: async ({ protocolId, customerId }: { protocolId: string; customerId: string }) => {
      const response = await apiRequest('POST', '/api/admin/protocol-assignments', { protocolId, customerId });
      return response.json();
    },
    onSuccess: async () => {
      toast({
        title: "Protocol Assigned",
        description: "Health protocol has been assigned to the customer.",
      });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to assign protocol",
        variant: "destructive",
      });
    },
  });

  const handleExportClick = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(healthProtocolsData?.protocols || []));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "health-protocols.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast({
      title: "Exporting Health Protocols",
      description: "Your download for health-protocols.json has started.",
    });
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-2 truncate">
            EvoFit Health Protocol - Admin Dashboard
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Manage health protocols, users, and monitor system performance.
          </p>
        </div>
        <Button onClick={logout} variant="destructive" className="flex-shrink-0 text-sm sm:text-base">
          <i className="fas fa-sign-out-alt mr-2"></i>
          <span className="hidden sm:inline">Logout</span>
          <span className="sm:hidden">Exit</span>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6 sm:mb-8">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1">
          <TabsTrigger value="health-protocols" className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
            <i className="fas fa-dna text-sm sm:text-base"></i>
            <span className="hidden sm:inline">Health Protocols</span>
            <span className="sm:hidden">Protocols</span>
          </TabsTrigger>
          <TabsTrigger value="customer-management" className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
            <i className="fas fa-users text-sm sm:text-base"></i>
            <span className="hidden sm:inline">User Management</span>
            <span className="sm:hidden">Users</span>
          </TabsTrigger>
          <TabsTrigger value="user-profile" className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
            <i className="fas fa-user text-sm sm:text-base"></i>
            <span className="hidden sm:inline">Profile</span>
            <span className="sm:hidden">Profile</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="health-protocols">
          <div className="space-y-6">
            <CacheDebugger />
            
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mt-6 sm:mt-8">
                <Card>
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">Total Protocols</p>
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">{healthProtocolsData?.total || 0}</p>
                      </div>
                      <div className="p-2 sm:p-3 bg-purple-100 rounded-full flex-shrink-0 ml-2">
                        <i className="fas fa-dna text-purple-600 text-sm sm:text-lg lg:text-xl"></i>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">Longevity Plans</p>
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
                          {healthProtocolsData?.protocols?.filter(p => p.type === 'longevity').length || 0}
                        </p>
                      </div>
                      <div className="p-2 sm:p-3 bg-blue-100 rounded-full flex-shrink-0 ml-2">
                        <i className="fas fa-clock text-blue-600 text-sm sm:text-lg lg:text-xl"></i>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">Parasite Cleanse</p>
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600">
                          {healthProtocolsData?.protocols?.filter(p => p.type === 'parasite_cleanse').length || 0}
                        </p>
                      </div>
                      <div className="p-2 sm:p-3 bg-orange-100 rounded-full flex-shrink-0 ml-2">
                        <i className="fas fa-bug text-orange-600 text-sm sm:text-lg lg:text-xl"></i>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">Assignments</p>
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">{stats.protocolAssignments || 0}</p>
                      </div>
                      <div className="p-2 sm:p-3 bg-green-100 rounded-full flex-shrink-0 ml-2">
                        <i className="fas fa-user-check text-green-600 text-sm sm:text-lg lg:text-xl"></i>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Health Protocols Management */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <i className="fas fa-dna text-white text-2xl"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Health Protocol Management</h2>
                  <p className="text-slate-600">Create and manage specialized health protocols</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <i className="fas fa-exclamation-triangle text-amber-600 text-lg mt-1"></i>
                  <div>
                    <h3 className="font-semibold text-amber-800">Medical Disclaimer</h3>
                    <p className="text-amber-700 text-sm">
                      These specialized protocols are for educational purposes only and require medical consultation. 
                      Always consult healthcare providers before starting any health protocol.
                    </p>
                  </div>
                </div>
              </div>

              <SpecializedProtocolsPanel 
                onConfigChange={(config) => {
                  console.log('Protocol config updated:', config);
                  // Trigger protocol list refresh when protocols are generated/updated
                  if (config.longevity?.isEnabled || config.parasiteCleanse?.isEnabled || 
                      (config.clientAilments?.includeInMealPlanning && config.clientAilments?.selectedAilments?.length > 0)) {
                    // Refresh the health protocols list
                    queryClient.invalidateQueries({ queryKey: ['adminHealthProtocols'] });
                    toast({
                      title: "Protocol Generated",
                      description: "Your health protocol has been generated and saved.",
                    });
                  }
                }}
                showDashboard={true}
              />
            </div>

            {/* Health Protocols List */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Existing Health Protocols</h3>
              {protocolsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (healthProtocolsData?.protocols || []).length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <i className="fas fa-dna text-4xl text-gray-400 mb-4"></i>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Health Protocols Yet</h3>
                    <p className="text-gray-600 mb-4">
                      Use the Health Protocol Generator above to create your first protocol.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {(healthProtocolsData?.protocols || []).map((protocol: any) => (
                    <Card key={protocol.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h5 className="text-lg font-medium text-gray-900">{protocol.name}</h5>
                              <div className="flex gap-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  protocol.type === 'longevity' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-orange-100 text-orange-800'
                                }`}>
                                  <i className={`fas ${protocol.type === 'longevity' ? 'fa-clock' : 'fa-bug'} mr-1`}></i>
                                  {protocol.type === 'longevity' ? 'Longevity' : 'Parasite Cleanse'}
                                </span>
                                {protocol.isTemplate && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <i className="fas fa-copy mr-1"></i>
                                    Template
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-600 mb-4">{protocol.description}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                              <div>
                                <div className="text-gray-600">Duration</div>
                                <div className="font-medium">{protocol.duration} days</div>
                              </div>
                              <div>
                                <div className="text-gray-600">Intensity</div>
                                <div className="font-medium capitalize">{protocol.intensity}</div>
                              </div>
                              <div>
                                <div className="text-gray-600">Created</div>
                                <div className="font-medium">{new Date(protocol.createdAt).toLocaleDateString()}</div>
                              </div>
                              <div>
                                <div className="text-gray-600">Tags</div>
                                <div className="font-medium">{protocol.tags?.length || 0} tags</div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteProtocolMutation.mutate(protocol.id)}
                                disabled={deleteProtocolMutation.isPending}
                                className="text-red-600 hover:text-red-700"
                              >
                                <i className="fas fa-trash mr-1"></i>
                                Delete
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExportClick}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <i className="fas fa-download mr-1"></i>
                                Export
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="customer-management">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
                <i className="fas fa-users text-white text-2xl"></i>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
                <p className="text-slate-600">Manage trainers, customers, and user relationships</p>
              </div>
            </div>

            {/* User Stats */}
            {stats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                <Card>
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">Total Users</p>
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">{stats.totalUsers || 0}</p>
                      </div>
                      <div className="p-2 sm:p-3 bg-blue-100 rounded-full flex-shrink-0 ml-2">
                        <i className="fas fa-users text-blue-600 text-sm sm:text-lg lg:text-xl"></i>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">Trainers</p>
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">{stats.totalTrainers || 0}</p>
                      </div>
                      <div className="p-2 sm:p-3 bg-green-100 rounded-full flex-shrink-0 ml-2">
                        <i className="fas fa-user-tie text-green-600 text-sm sm:text-lg lg:text-xl"></i>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">Customers</p>
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">{stats.totalCustomers || 0}</p>
                      </div>
                      <div className="p-2 sm:p-3 bg-purple-100 rounded-full flex-shrink-0 ml-2">
                        <i className="fas fa-user text-purple-600 text-sm sm:text-lg lg:text-xl"></i>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">Active Protocols</p>
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600">{stats.protocolAssignments || 0}</p>
                      </div>
                      <div className="p-2 sm:p-3 bg-orange-100 rounded-full flex-shrink-0 ml-2">
                        <i className="fas fa-heartbeat text-orange-600 text-sm sm:text-lg lg:text-xl"></i>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* User Management Table */}
            <div className="mt-8">
              <AdminTable
                users={usersData?.users || []}
                isLoading={usersLoading}
                onDeleteUser={(id) => {
                  // Add delete user functionality
                  console.log('Delete user:', id);
                }}
                onAssignProtocol={(userId, protocolId) => {
                  assignProtocolMutation.mutate({ protocolId, customerId: userId });
                }}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="user-profile">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                <i className="fas fa-user text-white text-2xl"></i>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Admin Profile</h2>
                <p className="text-slate-600">Manage your admin account settings</p>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                      <i className="fas fa-download text-blue-600 text-lg sm:text-xl"></i>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900">Export Data</h3>
                  </div>
                  <p className="text-sm sm:text-base text-slate-600 mb-4">Download health protocols database</p>
                  <Button 
                    variant="outline" 
                    className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                    onClick={handleExportClick}
                    disabled={(healthProtocolsData?.protocols || []).length === 0}
                  >
                    <span className="flex items-center justify-center">
                      <i className="fas fa-file-download mr-2"></i>
                      Export Protocols
                    </span>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                      <i className="fas fa-chart-bar text-purple-600 text-lg sm:text-xl"></i>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900">System Stats</h3>
                  </div>
                  <p className="text-sm sm:text-base text-slate-600 mb-4">View comprehensive system analytics</p>
                  <Button 
                    variant="outline" 
                    className="w-full border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
                    onClick={() => {
                      toast({
                        title: "System Analytics",
                        description: "Detailed analytics coming soon!",
                      });
                    }}
                  >
                    <span className="flex items-center justify-center">
                      <i className="fas fa-analytics mr-2"></i>
                      View Analytics
                    </span>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
                      <i className="fas fa-sign-out-alt text-red-600 text-lg sm:text-xl"></i>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900">Account</h3>
                  </div>
                  <p className="text-sm sm:text-base text-slate-600 mb-4">Manage your admin account</p>
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={logout}
                  >
                    <span className="flex items-center justify-center">
                      <i className="fas fa-sign-out-alt mr-2"></i>
                      Logout
                    </span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
    </div>
    </ResponsiveLayout>
  );
}
