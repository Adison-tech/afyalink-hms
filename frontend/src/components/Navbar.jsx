// frontend/src/components/Navbar.jsx

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
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center shadow-md">
      {/* Hospital Logo/Name Section */}
      <div className="text-2xl font-bold tracking-wide flex items-center">
        <svg className="h-8 w-8 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10l2 2h10l2-2V7m-2 0H6m0 0V5a2 2 0 012-2h4a2 2 0 012 2v2m-6 0H6m0 0H4m16 0v6c0 1.105-.895 2-2 2H6a2 2 0 01-2-2v-6m16 0V7m-8 4v-2"></path></svg>
        AfyaLink HMS
      </div>

      {/* Navigation Links */}
      <div>
        <ul className="flex items-center space-x-6">
          <li>
            <Link to="/patients" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200">
              Patients
            </Link>
          </li>
          <li>
            <Link to="/appointments" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200">
              Appointments
            </Link>
          </li>
          {/* Conditionaly render EMR link if user is doctor/admin/nurse */}
          {user && (user.role === 'admin' || user.role === 'doctor' || user.role === 'nurse') && (
            <li>
              {/* Updated EMR link to the general clinical notes page */}
              <Link to="/clinical-notes" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200">
                Clinical Notes
              </Link>
            </li>
          )}
        </ul>
      </div>

      {/* User Info and Logout */}
      <div className="flex items-center space-x-4">
        {user && (
          <span className="text-gray-300 text-sm font-medium">
            Hello, {user.first_name || user.username} ({user.role})
          </span>
        )}
        <button
          onClick={handleLogout}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:shadow-md transition duration-200 ease-in-out text-sm"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
