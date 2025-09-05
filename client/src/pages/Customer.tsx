import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import { ResponsiveHeader } from "../components/ResponsiveHeader";
import { 
  Heart, 
  Target, 
  TrendingUp, 
  Calendar,
  ChefHat,
  Dumbbell,
  User,
  FileText
} from 'lucide-react';

export default function Customer() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: customerData } = useQuery({
    queryKey: ['customerDashboard'],
    queryFn: async () => {
      const response = await fetch('/api/customer/dashboard', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch customer data');
      return response.json();
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <ResponsiveHeader title="Customer Dashboard" showAdminButton={false} />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
            Welcome, {user?.email?.split('@')[0] || 'Customer'}
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Track your health journey and manage your fitness protocols.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/customer/profile')}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">My Profile</p>
                  <p className="text-lg font-bold text-slate-900">View & Edit</p>
                </div>
                <User className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Health Protocols</p>
                  <p className="text-lg font-bold text-green-600">
                    {customerData?.activeProtocols || 0} Active
                  </p>
                </div>
                <Heart className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Meal Plans</p>
                  <p className="text-lg font-bold text-purple-600">
                    {customerData?.mealPlans || 0} Plans
                  </p>
                </div>
                <ChefHat className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Progress</p>
                  <p className="text-lg font-bold text-orange-600">Track</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Protocols */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Dumbbell className="w-5 h-5" />
                  <span>My Health Protocols</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {customerData?.protocols && customerData.protocols.length > 0 ? (
                  <div className="space-y-4">
                    {customerData.protocols.map((protocol: any) => (
                      <div key={protocol.id} className="p-4 border rounded-lg">
                        <h3 className="font-medium text-lg">{protocol.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{protocol.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Active
                          </span>
                          <span className="text-xs text-gray-500">
                            Started: {new Date(protocol.startDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Heart className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No active health protocols yet</p>
                    <p className="text-sm mt-1">Your trainer will assign protocols soon!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Trainer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your Trainer</CardTitle>
              </CardHeader>
              <CardContent>
                {customerData?.trainer ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{customerData.trainer.name}</p>
                        <p className="text-sm text-gray-600">{customerData.trainer.email}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {/* TODO: Implement messaging */}}
                    >
                      Message Trainer
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <User className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No trainer assigned yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Compliance Rate</span>
                    <span className="font-bold text-green-600">95%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Days Active</span>
                    <span className="font-bold">42</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Goals Achieved</span>
                    <span className="font-bold text-blue-600">3/5</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Upcoming</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <p className="font-medium">Weekly Check-in</p>
                    <p className="text-xs text-gray-500">Tomorrow at 10:00 AM</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">Progress Photos</p>
                    <p className="text-xs text-gray-500">Friday</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}