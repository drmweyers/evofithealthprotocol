import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { ResponsiveHeader } from '../components/ResponsiveHeader';
import ProgressTracking from '../components/ProgressTracking';
import { 
  Activity, 
  Calendar, 
  Target, 
  TrendingUp,
  FileText,
  CheckCircle,
  Clock,
  User
} from 'lucide-react';

interface CustomerStats {
  activeProtocols: number;
  completedProtocols: number;
  totalMeasurements: number;
  weeklyProgress: number;
}

interface HealthProtocol {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'paused';
  assignedAt: string;
  dueDate?: string;
  progress: number;
}

const Customer: React.FC = () => {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['customerStats'],
    queryFn: async () => {
      const response = await fetch('/api/customer/profile/stats', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch customer stats');
      return response.json() as CustomerStats;
    },
  });

  const { data: protocols } = useQuery({
    queryKey: ['customerProtocols'],
    queryFn: async () => {
      const response = await fetch('/api/customer/protocols', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch protocols');
      return response.json() as HealthProtocol[];
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <ResponsiveHeader title="My Health Journey" showAdminButton={false} />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
            Welcome, {user?.email?.split('@')[0] || 'Customer'}
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Track your progress and follow your personalized health protocols.
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            <Card>
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">Active Protocols</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">{stats.activeProtocols || 0}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-green-100 rounded-full flex-shrink-0 ml-2">
                    <Activity className="text-green-600 h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">Completed</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">{stats.completedProtocols || 0}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-blue-100 rounded-full flex-shrink-0 ml-2">
                    <CheckCircle className="text-blue-600 h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">Measurements</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">{stats.totalMeasurements || 0}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-purple-100 rounded-full flex-shrink-0 ml-2">
                    <Target className="text-purple-600 h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">Weekly Progress</p>
                    <p className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600">{stats.weeklyProgress || 0}%</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-orange-100 rounded-full flex-shrink-0 ml-2">
                    <TrendingUp className="text-orange-600 h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Active Protocols Section */}
        <div className="space-y-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl shadow-lg">
              <FileText className="text-white h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">My Health Protocols</h2>
              <p className="text-slate-600">Your personalized health and wellness plans</p>
            </div>
          </div>

          <div className="grid gap-4">
            {protocols?.length ? (
              protocols.map((protocol) => (
                <Card key={protocol.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{protocol.name}</CardTitle>
                      <Badge 
                        variant={protocol.status === 'active' ? 'default' : protocol.status === 'completed' ? 'secondary' : 'outline'}
                      >
                        {protocol.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Assigned: {new Date(protocol.assignedAt).toLocaleDateString()}</span>
                      </div>
                      {protocol.dueDate && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>Due: {new Date(protocol.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${protocol.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{protocol.progress}% complete</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Protocols Yet</h3>
                  <p className="text-gray-600">
                    Your trainer will assign personalized health protocols to help you reach your goals.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Progress Tracking Section */}
        <ProgressTracking />
      </div>
    </div>
  );
};

export default Customer;