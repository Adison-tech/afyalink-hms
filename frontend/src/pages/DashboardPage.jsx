import React from 'react';
import { useAuth } from '../context/AuthContext';

function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h2>Welcome, {user ? user.username: 'Guest'}!</h2>
      <p>This is your AfyaLink Dashboard.</p>
      {user && <p>Your role: {user.role}</p>}
    </div>
  );
}

export default DashboardPage;