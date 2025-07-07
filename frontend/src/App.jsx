// frontend/src/App.jsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; // Make sure this path is correct

// Import your page components
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PatientsPage from './pages/PatientsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import ClinicalNotesPage from './pages/ClinicalNotesPage';
import UsersManagementPage from './pages/UsersManagementPage';
import DepartmentsManagementPage from './pages/DepartmentsManagementPage';
import HomePage from './pages/HomePage'; // If you have a homepage
import RegisterPage from './pages/RegisterPage';

// Import the new Layout component and PrivateRoute
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute'; // Assuming you have this for auth protection


function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  console.log('AppContent: AuthContext loading =', loading, 'isAuthenticated =', isAuthenticated);

  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen bg-gray-100'>
        <div className='text-xl text-gray-700'>Loading authentication...</div>
      </div>
    );
  }

  return (
    <div className='flex flex-col min-h-screen'> {/* Removed Navbar from here */}
      <Routes>
        {/* Public Routes (e.g., Login, Register) - these routes do NOT use the Layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <HomePage />}
        />

        {/* Protected Routes Group - All routes nested here will use the Layout and PrivateRoute */}
        <Route element={<Layout />}> {/* Layout wraps authenticated routes */}
          <Route element={<PrivateRoute allowedRoles={['admin', 'doctor', 'nurse', 'receptionist']}/>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/clinical-notes" element={<ClinicalNotesPage />} />
            <Route path="/clinical-notes/:patientId" element={<ClinicalNotesPage />} />
            {/* Admin Specific Routes */}
            <Route element={<PrivateRoute allowedRoles={['admin']}/>}>
                <Route path="/users" element={<UsersManagementPage />} />
                <Route path="/departments" element={<DepartmentsManagementPage />} />
            </Route>
            {/* Add more protected routes here */}
          </Route>
        </Route>

        {/* Fallback for unknown routes: Redirects to the login page if not authenticated, or dashboard if authenticated */}
        <Route
          path="*"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AppContent />
  );
}

export default App;