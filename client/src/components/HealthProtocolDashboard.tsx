import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TrainerHealthProtocols from './TrainerHealthProtocols';
import { FileText, Shield } from 'lucide-react';
import { ResponsiveHeader } from './ResponsiveHeader';

const HealthProtocolDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('protocols');

  return (
    <div className="min-h-screen bg-gray-50">
      <ResponsiveHeader title="Health Protocol Management System" showAdminButton={true} />

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