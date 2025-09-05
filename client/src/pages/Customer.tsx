import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Customer: React.FC = () => {
  const { user } = useAuth();
  
  // Redirect to customer dashboard
  return <Navigate to="/customer/dashboard" replace />;
};

export default Customer;