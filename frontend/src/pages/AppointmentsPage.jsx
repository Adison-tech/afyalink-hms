import React from 'react';
import { useAuth } from '../context/AuthContext';

function AppointmentsPage() {
  const { user } = useAuth();

  return (
    <div>
      <h2>Welcome, {user ? user.username : 'Guest'}!</h2>
      <p>This is your AfyaCare Lite Dashboard.</p>
      {user && <p>Your role: {user.role}</p>}
      {/* Add dashboard widgets here */}
    </div>
  );
}

export default AppointmentsPage;