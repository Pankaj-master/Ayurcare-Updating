import React from 'react';
import { DoctorDashboard } from './DoctorDashboard';
import { PatientDashboard } from './PatientDashboard';
import { useAuth } from '../contexts/AuthContext';

export function Dashboard() {
  const { user } = useAuth();
  
  // Render different dashboards based on user role
  if (user?.role === 'PATIENT') {
    return <PatientDashboard />;
  }
  
  // Default to doctor dashboard for Doctor role or any other role
  return <DoctorDashboard />;
}