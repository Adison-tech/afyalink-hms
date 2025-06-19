import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PatientsPage from './pages/PatientsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import ClinicalNotesPage from './pages/ClinicalNotesPage';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading authentication...</div>;
  }

  return (
    <div className="App">
      {isAuthenticated && <Navbar />} {/* Show navbar only if authenticated */}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* Protected */}
        <Route element={<PrivateRoute />}>
          <Route path='/' element={<DashboardPage />} />
          <Route path='/dashboard' element={<DashboardPage />} />
          <Route path='/patients' element={<PatientsPage />} />
          <Route path='/appointments' element={<AppointmentsPage />} />
          <Route path='/patients/:patientId/notes' element={<ClinicalNotesPage />} />
        </Route>

        {/* Fallback for unmatched routes */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </div>
  );
}

export default App;