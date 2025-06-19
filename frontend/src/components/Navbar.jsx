import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ padding: '10px 20px', background: '#333', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontSize: '1.2em', fontWeight: 'bold' }}>

      </div>
      <div>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex' }}>
          <li style={{ marginLeft: '20px' }}><Link to="/patients" style={{ color: 'white', textDecoration: 'none' }}>Patients</Link></li>
          <li style={{ marginLeft: '20px' }}><Link to="/appointments" style={{ color: 'white', textDecoration: 'none' }}>appointments</Link></li>
          {/* Conditionaly render EMR link if user is doctor/admin/nurse */}
          {user && (user.role === 'admin' || user.role === 'doctor' || user.role === 'nurse') && (
            <li style={{ marginLeft: '20px' }}>
              <Link to="/patients/1/notes" style={{ color: 'white', textDecoration: 'none' }}>EMR (Demo)</Link>
              {/* This EMR link is a placeholder, will need dynamic patientId later */}
            </li>
          )}
          <li style={{ marginLeft: '20px' }}>Hello, {user?.username} ({user.role})</li>
          <li style={{ marginLeft: '20px' }}>
            <button onClick={handleLogout} style={{ background: 'none', border: '1px solid white', color: 'white', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>
              logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
