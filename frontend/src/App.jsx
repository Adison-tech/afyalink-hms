// frontend/src/App.jsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PatientsPage from './pages/PatientsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import ClinicalNotesPage from './pages/ClinicalNotesPage';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  // --- IMPORTANT: CONSOLE LOG FOR APPCONTENT ---\n
  console.log('AppContent: AuthContext loading =', loading, 'isAuthenticated =', isAuthenticated);
  // --- END CONSOLE LOG ---\n

  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen bg-gray-100'>
        <div className='text-xl text-gray-700'>Loading authentication...</div>
      </div>
    );
  }

  return (
    <div className='flex flex-col min-h-screen'>
      {/* Navbar conditionally renders based on authentication */}
      {isAuthenticated && <Navbar />}

      <main className='flex-grow'>
        <Routes>
          {/* Public Routes with conditional redirect if authenticated */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
          />
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <HomePage />}
          />
          <Route
            path="/home"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <HomePage />}
          />

          {/* Protected Routes Group - All routes nested here will use the PrivateRoute */}
          {/* The 'allowedRoles' prop is now passed to the PrivateRoute itself */}
          <Route element={<PrivateRoute allowedRoles={['admin', 'doctor', 'nurse', 'receptionist']}/>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/clinical-notes" element={<ClinicalNotesPage />} />
            <Route path="/clinical-notes/:patientId" element={<ClinicalNotesPage />} />
            {/* Add more protected routes here */}
            {/* Example of a more specific role check for a child route:
            <Route element={<PrivateRoute allowedRoles={['admin']}/>}> // This would override the parent's allowedRoles
                <Route path="/users" element={<UsersPage />} />
            </Route>
            */}
          </Route>

          {/* Fallback for unknown routes: Redirects to the login page if not authenticated, or dashboard if authenticated */}
          <Route
            path="*"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AppContent />
  );
}

export default App;