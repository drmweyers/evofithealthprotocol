import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import CustomerManagement from "../components/CustomerManagement";
import { ResponsiveHeader } from "../components/ResponsiveHeader";
import { FileText, Users, Dumbbell, Heart, Trophy } from "lucide-react";

export default function Trainer() {
  const { user } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gray-50">
      <ResponsiveHeader title="Trainer Dashboard" showAdminButton={false} />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
            Welcome, {user?.email?.split('@')[0] || 'Trainer'}
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Manage your clients and their fitness journeys.
          </p>
        </div>

      {/* Stats Cards - Mobile-first responsive grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">Total Customers</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">{stats.totalCustomers || 0}</p>
                </div>
                <div className="p-2 sm:p-3 bg-green-100 rounded-full flex-shrink-0 ml-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">Active Programs</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">{stats.activePrograms || 0}</p>
                </div>
                <div className="p-2 sm:p-3 bg-purple-100 rounded-full flex-shrink-0 ml-2">
                  <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">Client Satisfaction</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">{stats.clientSatisfaction || '95%'}</p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-100 rounded-full flex-shrink-0 ml-2">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
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
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

        {/* Quick Actions Section */}
        <div className="space-y-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <FileText className="text-white text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Health Protocols</h2>
              <p className="text-slate-600">Create and manage specialized health protocols for your clients</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => navigate('/protocols')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              Health Protocols
            </Button>
          </div>
        </div>

        {/* Customer Management Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Customer Management</h2>
              <p className="text-slate-600">Manage your clients and track their fitness progress</p>
            </div>
          </div>
          <CustomerManagement />
        </div>
      </div>
    </div>
  );
} 