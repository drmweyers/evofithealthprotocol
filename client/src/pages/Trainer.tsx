import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useAuth } from "../contexts/AuthContext";
import CustomerManagement from "../components/CustomerManagement";
import TrainerHealthProtocols from "../components/TrainerHealthProtocols";

export default function Trainer() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();

  // Determine active tab based on URL
  const getActiveTab = () => {
    if (location === '/trainer/customers') return 'customers';
    if (location === '/trainer/health-protocols') return 'health-protocols';
    return 'health-protocols'; // Default to health protocols
  };

  const handleTabChange = (value: string) => {
    switch (value) {
      case 'customers':
        navigate('/trainer/customers');
        break;
      case 'health-protocols':
        navigate('/trainer/health-protocols');
        break;
      default:
        navigate('/trainer/health-protocols');
    }
  };

  const { data: stats } = useQuery({
    queryKey: ['trainerStats'],
    queryFn: async () => {
      const response = await fetch('/api/trainer/stats', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch trainer stats');
      return response.json();
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
          Welcome, {user?.email?.split('@')[0] || 'Trainer'}
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Create and manage health protocols for your clients.
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">Active Protocols</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">{stats.activeProtocols || 0}</p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-100 rounded-full flex-shrink-0 ml-2">
                  <i className="fas fa-dna text-blue-600 text-sm sm:text-lg lg:text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">Total Customers</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">{stats.totalCustomers || 0}</p>
                </div>
                <div className="p-2 sm:p-3 bg-green-100 rounded-full flex-shrink-0 ml-2">
                  <i className="fas fa-users text-green-600 text-sm sm:text-lg lg:text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">Protocol Assignments</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">{stats.protocolAssignments || 0}</p>
                </div>
                <div className="p-2 sm:p-3 bg-purple-100 rounded-full flex-shrink-0 ml-2">
                  <i className="fas fa-user-check text-purple-600 text-sm sm:text-lg lg:text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">Completed Programs</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600">{stats.completedPrograms || 0}</p>
                </div>
                <div className="p-2 sm:p-3 bg-orange-100 rounded-full flex-shrink-0 ml-2">
                  <i className="fas fa-trophy text-orange-600 text-sm sm:text-lg lg:text-xl"></i>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={getActiveTab()} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 sm:mb-8 h-auto p-1 gap-1">
          <TabsTrigger 
            value="health-protocols"
            className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm"
          >
            <i className="fas fa-dna text-sm sm:text-base"></i>
            <span className="hidden lg:inline">Health Protocols</span>
            <span className="lg:hidden">Protocols</span>
          </TabsTrigger>
          <TabsTrigger 
            value="customers"
            className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm"
          >
            <i className="fas fa-users text-sm sm:text-base"></i>
            <span className="hidden lg:inline">Customer Management</span>
            <span className="lg:hidden">Customers</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="health-protocols">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <i className="fas fa-dna text-white text-2xl"></i>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Health Protocol Management</h2>
                <p className="text-slate-600">Create and manage specialized health protocols for your clients</p>
              </div>
            </div>
            <TrainerHealthProtocols />
          </div>
        </TabsContent>

        <TabsContent value="customers">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl shadow-lg">
                <i className="fas fa-users text-white text-2xl"></i>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Customer Management</h2>
                <p className="text-slate-600">Manage your clients and their health protocol assignments</p>
              </div>
            </div>
            <CustomerManagement />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 