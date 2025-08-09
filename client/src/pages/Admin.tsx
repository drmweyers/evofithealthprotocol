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
import AdminRecipeGrid from "../components/AdminRecipeGrid";
import SearchFilters from "../components/SearchFilters";
import type { Recipe, RecipeFilter } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import MealPlanGenerator from "../components/MealPlanGenerator";
import RecipeGenerationModal from "../components/RecipeGenerationModal";
import CacheDebugger from "../components/CacheDebugger";
import SpecializedProtocolsPanel from "../components/SpecializedProtocolsPanel";
import TestSpecializedPanel from "../components/TestSpecializedPanel";
import MinimalSpecializedPanel from "../components/MinimalSpecializedPanel";

export default function Admin() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const queryClient = useQueryClient();
  const cacheManager = createCacheManager(queryClient);
  const [filters, setFilters] = useState<RecipeFilter>({
    page: 1,
    limit: 50,
    approved: undefined, // Start with no filter, show management card
  });
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [activeTab, setActiveTab] = useState("admin");
  const [recipesSubTab, setRecipesSubTab] = useState<'recipes' | 'protocols'>('recipes');
  const [showRecipeGenerationModal, setShowRecipeGenerationModal] = useState(false);

  // Periodic cache refresh to keep data fresh
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const cleanup = cacheManager.startPeriodicRefresh(60000); // Every minute
    return cleanup;
  }, [isAuthenticated, cacheManager]);

  const { data: stats, isLoading: statsLoading } = useQuery<{
    total: number;
    approved: number;
    pending: number;
    avgRating: number;
  }>({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/stats');
      return res.json();
    },
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: recipesData, isLoading: recipesLoading } = useQuery({
    queryKey: [`/api/admin/recipes`, filters],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/admin/recipes');
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: healthProtocolsData, isLoading: protocolsLoading } = useQuery<{
    protocols: any[];
    total: number;
  }>({
    queryKey: ['trainerHealthProtocols'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/trainer/health-protocols');
      return res.json();
    },
    enabled: isAuthenticated && recipesSubTab === 'protocols',
    retry: false,
  });

  const displayRecipes = (recipesData as any)?.recipes || [];
  const total = (recipesData as any)?.total || 0;
  const isLoading = recipesLoading;

  const handleFilterChange = (newFilters: Partial<RecipeFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('PATCH', `/api/admin/recipes/${id}/approve`);
      return response.json();
    },
    onSuccess: async () => {
      toast({
        title: "Recipe Approved",
        description: "Recipe has been approved and is now visible to users.",
      });
      // Use centralized cache management
      await cacheManager.invalidateRecipes();
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
        description: "Failed to approve recipe",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/admin/recipes/${id}`);
    },
    onSuccess: async () => {
      toast({
        title: "Recipe Deleted",
        description: "Recipe has been removed from the system.",
      });
      // Use centralized cache management
      await cacheManager.invalidateRecipes();
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
        description: "Failed to delete recipe",
        variant: "destructive",
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await apiRequest('DELETE', '/api/admin/recipes', { ids });
      return response.json();
    },
    onSuccess: async (data) => {
      toast({
        title: "Recipes Deleted",
        description: data.message,
      });
      // Use centralized cache management for bulk operations
      await cacheManager.handleBulkOperation('delete', data.removed || data.count || 1);
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
        description: "Failed to delete selected recipes",
        variant: "destructive",
      });
    },
  });

  const bulkApproveMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await apiRequest('POST', '/api/admin/recipes/bulk-approve', { recipeIds: ids });
      return response.json();
    },
    onSuccess: async (data) => {
      toast({
        title: "Recipes Approved",
        description: data.message || "Selected recipes have been approved.",
      });
      // Use centralized cache management for bulk operations
      await cacheManager.handleBulkOperation('approve', data.succeeded || data.count || 1);
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
        description: "Failed to approve recipes",
        variant: "destructive",
      });
    },
  });

  const unapproveMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('PATCH', `/api/admin/recipes/${id}/unapprove`);
      return response.json();
    },
    onSuccess: async () => {
      toast({
        title: "Recipe Unapproved",
        description: "Recipe has been unapproved and is now pending review.",
      });
      // Use centralized cache management
      await cacheManager.invalidateRecipes();
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
        description: "Failed to unapprove recipe",
        variant: "destructive",
      });
    },
  });

  const bulkUnapproveMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await apiRequest('POST', '/api/admin/recipes/bulk-unapprove', { ids });
      return response.json();
    },
    onSuccess: async (data) => {
      toast({
        title: "Recipes Unapproved",
        description: data.message || "Selected recipes have been unapproved.",
      });
      // Use centralized cache management for bulk operations
      await cacheManager.handleBulkOperation('update', data.succeeded || data.count || 1);
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
        description: "Failed to unapprove recipes",
        variant: "destructive",
      });
    },
  });

  const handleManageAllClick = () => {
    setFilters(prev => ({ ...prev, approved: undefined, page: 1 }));
  };

  const handleViewPendingClick = () => {
    setFilters(prev => ({ ...prev, approved: false, page: 1 }));
  };

  const handleExportClick = () => {
    // This is a placeholder. In a real app, you would trigger a download.
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(displayRecipes));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "recipes.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast({
      title: "Exporting Recipes",
      description: "Your download for recipes.json has started.",
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
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-2 truncate">
            Admin Dashboard
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Manage recipes, generate new content, and monitor system status.
          </p>
        </div>
        <Button onClick={logout} variant="destructive" className="flex-shrink-0 text-sm sm:text-base">
          <i className="fas fa-sign-out-alt mr-2"></i>
          <span className="hidden sm:inline">Logout</span>
          <span className="sm:hidden">Exit</span>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6 sm:mb-8">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1">
          <TabsTrigger value="recipes" className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
            <i className="fas fa-book-open text-sm sm:text-base"></i>
            <span className="hidden sm:inline">Browse Recipes</span>
            <span className="sm:hidden">Recipes</span>
          </TabsTrigger>
          <TabsTrigger value="meal-plan" className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
            <i className="fas fa-utensils text-sm sm:text-base"></i>
            <span className="hidden sm:inline">Meal Plan Generator</span>
            <span className="sm:hidden">Plans</span>
          </TabsTrigger>
          <TabsTrigger value="specialized" className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
            <i className="fas fa-dna text-sm sm:text-base"></i>
            <span className="hidden sm:inline">Health Protocols</span>
            <span className="sm:hidden">Health</span>
          </TabsTrigger>
          <TabsTrigger value="admin" className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm">
            <i className="fas fa-cog text-sm sm:text-base"></i>
            <span className="hidden sm:inline">Admin</span>
            <span className="sm:hidden">Admin</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recipes">
          <div className="space-y-6">
            {/* Sub-tabs for Recipes vs Health Protocols */}
            <Tabs value={recipesSubTab} onValueChange={setRecipesSubTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="recipes" className="flex items-center gap-2">
                  <i className="fas fa-book-open"></i>
                  All Recipes ({stats?.total || 0})
                </TabsTrigger>
                <TabsTrigger value="protocols" className="flex items-center gap-2">
                  <i className="fas fa-dna"></i>
                  Health Protocols ({healthProtocolsData?.total || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="recipes">
                <CacheDebugger />
                
                {/* Stats Cards */}
                {stats && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mt-6 sm:mt-8">
                    <Card>
                      <CardContent className="p-3 sm:p-4 lg:p-6">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">Total Recipes</p>
                            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">{stats.total.toLocaleString()}</p>
                          </div>
                          <div className="p-2 sm:p-3 bg-primary/10 rounded-full flex-shrink-0 ml-2">
                            <i className="fas fa-book text-primary text-sm sm:text-lg lg:text-xl"></i>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-3 sm:p-4 lg:p-6">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">Approved</p>
                            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">{stats.approved.toLocaleString()}</p>
                          </div>
                          <div className="p-2 sm:p-3 bg-green-100 rounded-full flex-shrink-0 ml-2">
                            <i className="fas fa-check-circle text-green-600 text-sm sm:text-lg lg:text-xl"></i>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-3 sm:p-4 lg:p-6">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">Pending Review</p>
                            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-secondary">{stats.pending.toLocaleString()}</p>
                          </div>
                          <div className="p-2 sm:p-3 bg-amber-100 rounded-full flex-shrink-0 ml-2">
                            <i className="fas fa-clock text-secondary text-sm sm:text-lg lg:text-xl"></i>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-3 sm:p-4 lg:p-6">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">Avg Rating</p>
                            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">{stats.avgRating}</p>
                          </div>
                          <div className="p-2 sm:p-3 bg-yellow-100 rounded-full flex-shrink-0 ml-2">
                            <i className="fas fa-star text-yellow-500 text-sm sm:text-lg lg:text-xl"></i>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="protocols">
                {/* Health Protocols Stats */}
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
                          <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">Templates</p>
                          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                            {healthProtocolsData?.protocols?.filter(p => p.isTemplate).length || 0}
                          </p>
                        </div>
                        <div className="p-2 sm:p-3 bg-green-100 rounded-full flex-shrink-0 ml-2">
                          <i className="fas fa-copy text-green-600 text-sm sm:text-lg lg:text-xl"></i>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Health Protocols List */}
                <div className="mt-8">
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
                          Generate health protocols using the Health Protocols tab to see them here.
                        </p>
                        <Button onClick={() => setActiveTab('specialized')} className="bg-purple-600 hover:bg-purple-700">
                          <i className="fas fa-dna mr-2"></i>
                          Create Health Protocols
                        </Button>
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
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>

        <TabsContent value="meal-plan">
          <MealPlanGenerator />
        </TabsContent>

        <TabsContent value="specialized">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <i className="fas fa-dna text-white text-2xl"></i>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Specialized Health Protocols</h2>
                <p className="text-slate-600">Advanced meal planning for longevity and detoxification</p>
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
                  queryClient.invalidateQueries({ queryKey: ['health-protocols', 'admin'] });
                  // Switch to protocols sub-tab to show the newly created protocol
                  setRecipesSubTab('protocols');
                  toast({
                    title: "Protocol Generated",
                    description: "Your health protocol has been generated and saved. Check the 'Health Protocols' tab to view it.",
                  });
                }
              }}
              showDashboard={true}
            />
            {/* <MinimalSpecializedPanel />
            <TestSpecializedPanel /> */}
          </div>
        </TabsContent>

        <TabsContent value="admin">
          {/* Admin Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                    <i className="fas fa-plus-circle text-primary text-lg sm:text-xl"></i>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900">Generate Recipes</h3>
                </div>
                <p className="text-sm sm:text-base text-slate-600 mb-4">Create new recipes using OpenAI integration</p>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90" 
                  onClick={() => setShowRecipeGenerationModal(true)}
                >
                  <span className="flex items-center justify-center">
                    <i className="fas fa-magic mr-2"></i>
                    Generate New Batch
                  </span>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-secondary/10 rounded-lg flex-shrink-0">
                    <i className="fas fa-eye text-secondary text-lg sm:text-xl"></i>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900">Review Queue</h3>
                </div>
                <p className="text-sm sm:text-base text-slate-600 mb-4">Review and approve pending recipes</p>
                <Button 
                  variant="outline" 
                  className="w-full border-secondary text-secondary hover:bg-secondary hover:text-white"
                  onClick={handleViewPendingClick}
                >
                  <span className="flex items-center justify-center">
                    <i className="fas fa-list mr-2"></i>
                    View Pending ({stats?.pending || "0"})
                  </span>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <i className="fas fa-download text-blue-600 text-lg sm:text-xl"></i>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900">Export Data</h3>
                </div>
                <p className="text-sm sm:text-base text-slate-600 mb-4">Download recipe database as JSON</p>
                <Button 
                  variant="outline" 
                  className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                  onClick={handleExportClick}
                  disabled={displayRecipes.length === 0}
                >
                  <span className="flex items-center justify-center">
                    <i className="fas fa-file-download mr-2"></i>
                    Export All Data
                  </span>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recipe Database Management Button */}
          <Card className="mb-6 sm:mb-8 border-2 border-primary/20 bg-primary/5">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="text-center">
                <div className="mb-3 sm:mb-4">
                  <i className="fas fa-database text-primary text-2xl sm:text-3xl mb-2 sm:mb-3"></i>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3">Recipe Database Management</h3>
                <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6 max-w-md mx-auto">
                  Access the complete recipe database with advanced management tools including individual and bulk delete operations
                </p>
                <Button
                  size="lg"
                  onClick={handleManageAllClick}
                  className="bg-primary hover:bg-primary/90 text-sm sm:text-lg px-4 sm:px-8 py-2 sm:py-3 w-full sm:w-auto"
                >
                  <i className="fas fa-database mr-2 sm:mr-3"></i>
                  <span className="hidden sm:inline">Manage All Recipes ({stats?.total || "0"})</span>
                  <span className="sm:hidden">Manage All ({stats?.total || "0"})</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Recipe Management Section - Now outside tabs */}
      <div id="recipe-management-section">

        {/* Quick Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <Button
              variant={filters.approved === undefined ? "default" : "outline"}
              onClick={() => handleFilterChange({ approved: undefined })}
              className="text-sm"
            >
              <i className="fas fa-list-ul mr-2"></i>
              <span className="hidden sm:inline">All Recipes</span>
              <span className="sm:hidden">All</span>
            </Button>
            <Button
              variant={filters.approved === false ? "default" : "outline"}
              onClick={() => handleFilterChange({ approved: false })}
              className="text-yellow-600 text-sm"
            >
              <i className="fas fa-clock mr-2"></i>
              <span className="hidden sm:inline">Pending Approval ({stats?.pending || 0})</span>
              <span className="sm:hidden">Pending ({stats?.pending || 0})</span>
            </Button>
            <Button
              variant={filters.approved === true ? "default" : "outline"}
              onClick={() => handleFilterChange({ approved: true })}
              className="text-green-600 text-sm"
            >
              <i className="fas fa-check mr-2"></i>
              <span className="hidden sm:inline">Approved ({stats?.approved || 0})</span>
              <span className="sm:hidden">Approved ({stats?.approved || 0})</span>
            </Button>
          </div>

          <div className="flex items-center justify-center lg:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
              className="text-sm"
            >
              <i className={`fas fa-${viewMode === 'grid' ? 'table' : 'th'} mr-2`}></i>
              <span className="hidden sm:inline">{viewMode === 'grid' ? 'Table View' : 'Grid View'}</span>
              <span className="sm:hidden">{viewMode === 'grid' ? 'Table' : 'Grid'}</span>
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <SearchFilters filters={filters} onFilterChange={handleFilterChange} />
        </div>

        {/* Recipe Display */}
        {viewMode === 'grid' ? (
          <AdminRecipeGrid
            recipes={displayRecipes}
            isLoading={isLoading}
            onDelete={(id) => deleteMutation.mutate(id)}
            onBulkDelete={(ids) => bulkDeleteMutation.mutate(ids)}
            onApprove={(id) => approveMutation.mutate(id)}
            onUnapprove={(id) => unapproveMutation.mutate(id)}
            onBulkApprove={(ids) => bulkApproveMutation.mutate(ids)}
            onBulkUnapprove={(ids) => bulkUnapproveMutation.mutate(ids)}
            deletePending={deleteMutation.isPending}
            bulkDeletePending={bulkDeleteMutation.isPending}
            approvePending={approveMutation.isPending}
            unapprovePending={unapproveMutation.isPending}
            bulkApprovePending={bulkApproveMutation.isPending}
            bulkUnapprovePending={bulkUnapproveMutation.isPending}
          />
        ) : (
          <AdminTable
            recipes={displayRecipes}
            isLoading={isLoading}
            onApprove={(id) => approveMutation.mutate(id)}
            onUnapprove={(id) => unapproveMutation.mutate(id)}
            onDelete={(id) => deleteMutation.mutate(id)}
            onBulkDelete={(ids) => bulkDeleteMutation.mutate(ids)}
            onBulkApprove={(ids) => bulkApproveMutation.mutate(ids)}
            onBulkUnapprove={(ids) => bulkUnapproveMutation.mutate(ids)}
            approvePending={approveMutation.isPending}
            unapprovePending={unapproveMutation.isPending}
            deletePending={deleteMutation.isPending}
            bulkDeletePending={bulkDeleteMutation.isPending}
            bulkApprovePending={bulkApproveMutation.isPending}
            bulkUnapprovePending={bulkUnapproveMutation.isPending}
          />
        )}

        {/* Pagination */}
        {total > filters.limit && (
          <div className="mt-6 sm:mt-8 flex justify-center">
            <div className="flex flex-wrap gap-1 sm:gap-2 justify-center max-w-full">
              {Array.from({ length: Math.ceil(total / filters.limit) }).map((_, i) => (
                <Button
                  key={i}
                  variant={filters.page === i + 1 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(i + 1)}
                  className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 min-w-[32px] sm:min-w-[40px]"
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recipe Generation Modal */}
      <RecipeGenerationModal
        isOpen={showRecipeGenerationModal}
        onClose={() => setShowRecipeGenerationModal(false)}
      />
    </div>
  );
}
