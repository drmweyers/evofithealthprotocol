import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import TrainerHealthProtocols from './TrainerHealthProtocols';
import { LogOut, FileText, Shield, Home } from 'lucide-react';

const HealthProtocolDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('protocols');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">
                Health Protocol Management System
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.username || user?.email}
              </span>
              {user?.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition"
                >
                  <Home className="h-4 w-4 mr-1" />
                  Admin
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg max-w-md">
          <button
            onClick={() => setActiveTab('protocols')}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === 'protocols'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="h-4 w-4 mr-2" />
            Health Protocols
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === 'assignments'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Assignments
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'protocols' ? (
            <TrainerHealthProtocols />
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Protocol Assignments coming soon...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Health Protocol Management System v1.0</p>
          <p className="mt-1">© 2025 EvoFit Health Solutions</p>
        </div>
      </div>
    </div>
  );
};

export default HealthProtocolDashboard;