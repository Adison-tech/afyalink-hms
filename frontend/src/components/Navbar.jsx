// frontend/src/components/Navbar.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import afyalinkLogo from '../assets/afyalink-logo.svg'; // Ensure this path is correct

// Helper function to capitalize the first letter of a string
const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        setIsSticky(window.scrollY > 0); // Becomes sticky as soon as you scroll
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  // Define navigation links with associated roles
  const navLinks = [
    // Removed the Dashboard link from here
    { to: "/patients", label: "Patients", roles: ["admin", "doctor", "receptionist"] },
    { to: "/appointments", label: "Appointments", roles: ["admin", "doctor", "receptionist"] },
    { to: "/clinical-notes", label: "Clinical Notes", roles: ["admin", "doctor", "nurse"] },
    { to: "/users", label: "User Management", roles: ["admin"] },
  ];

  return (
    <nav
      ref={navRef}
      className={`w-full h-24 flex items-center z-50 transition-all duration-300 ${
        isSticky ? 'fixed top-0 bg-white shadow-lg' : 'relative bg-white shadow-md'
      }`}
    >
      <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between w-full">
        {/* Logo Container */}
        <div className="flex-shrink-0">
          {/* Changed Link to "/" or another appropriate default for logo click, if Dashboard is truly removed */}
          <Link to={user ? "/patients" : "/login"} className="flex items-center">
              <img src={afyalinkLogo} alt="AfyaLink HMS Logo" className="h-20 w-auto" />
          </Link>
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={toggleMobileMenu}
          className="sm:hidden text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-2 ml-auto"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          )}
        </button>

        {/* Container for ALL Navigation Links and User Info */}
        <div
          className={`
            ${isMobileMenuOpen ? 'flex' : 'hidden'}
            sm:flex
            flex-col sm:flex-row
            sm:ml-auto
            sm:space-x-6 space-y-2 sm:space-y-0
            w-full sm:w-auto
            bg-white sm:bg-transparent shadow-md sm:shadow-none rounded-b-lg
            sm:items-center // Important for overall vertical centering on desktop
          `}
        >
          {navLinks.map((link) => {
            if (user && link.roles.includes(user.role)) {
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  // Ensuring consistent vertical padding (py-1.5) for text links
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-300 font-medium px-3 py-1.5 rounded-md text-sm sm:text-base w-full text-center"
                >
                  {link.label}
                </Link>
              );
            }
            return null;
          })}

          {user && (
            // Flex container specifically for "Hello, Adison" and Logout button
            // This allows us to apply items-center directly to align these two.
            <div className="flex items-center space-x-2">
              <span className="hidden sm:inline-flex text-gray-600 font-medium px-3 py-1.5 text-sm sm:text-base">
                Hello, {user.first_name || user.username} ({capitalize(user.role)})
              </span>
              <button
                onClick={handleLogout}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-4 rounded-md shadow-sm hover:shadow-md transition duration-200 ease-in-out text-sm sm:text-base w-full sm:w-auto text-center"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;