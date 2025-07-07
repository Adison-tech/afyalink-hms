// frontend/src/components/Navbar.jsx

import React, { useRef } from 'react'; // Removed useState, useEffect, useNavigate
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import afyalinkLogo from '../assets/afyalink-logo.svg';
import { motion } from 'framer-motion'; // Removed AnimatePresence

// Import Lucide Icons (Removed Menu, X, LogOut)
import {
  LayoutDashboard, Users, HeartPulse, Calendar, ClipboardList, Building2, ChevronLeft
} from 'lucide-react'; // Removed LogOut, Menu, X

// The capitalize helper function is now exclusively in Header.jsx or a separate utility file.
// If you use it elsewhere, you should create a utils/helpers.js file for it.

// Receive isSidebarExpanded as prop
function Navbar({ isSidebarExpanded }) { // Removed toggleSidebar as prop
  const { user } = useAuth();
  const location = useLocation();

  const navRef = useRef(null);

  // Removed handleLogout function and mobile menu states (isMobileMenuOpen, setIsMobileMenuOpen)

  // Define navigation links with associated roles and icons
  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "doctor", "receptionist", "nurse"] },
    { to: "/patients", label: "Patients", icon: HeartPulse, roles: ["admin", "doctor", "receptionist", "nurse"] },
    { to: "/appointments", label: "Appointments", icon: Calendar, roles: ["admin", "doctor", "receptionist", "nurse"] },
    { to: "/clinical-notes", label: "Clinical Notes", icon: ClipboardList, roles: ["admin", "doctor", "nurse"] },
    { to: "/users", label: "User Management", icon: Users, roles: ["admin"] },
    { to: "/departments", label: "Department Management", icon: Building2, roles: ["admin"] },
  ];

  return (
    <>
      {/* Desktop Collapsible Vertical Navbar (hidden on screens smaller than md) */}
      <nav
        ref={navRef}
        className={`
          hidden md:flex flex-col
          fixed top-0 left-0 h-screen
          ${isSidebarExpanded ? 'w-64' : 'w-20'} {/* Dynamic width */}
          bg-white shadow-lg border-r border-gray-200
          transition-all duration-300 ease-in-out z-40
          py-6 px-4 overflow-hidden
        `}
      >
        <div className='flex flex-col h-full relative'>
          {/* Logo Section */}
          <div className='flex items-center flex-none mb-8'>
            <Link to="/dashboard" className="flex-shrink-0 flex items-center">
              <img className="h-8 w-auto" src={afyalinkLogo} alt="AfyaLink HMS Logo" />
              {isSidebarExpanded && ( // Show text only when expanded
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-2 text-xl font-bold text-forest-green whitespace-nowrap"
                >
                  AfyaLink HMS
                </motion.span>
              )}
            </Link>
          </div>

          {/* Removed the ChevronLeft toggle button from here */}

          {/* Navigation Links Group */}
          <div className='flex flex-col flex-grow justify-between'>
            <div className='flex flex-col space-y-2'>
              {user && navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return link.roles.includes(user.role) && (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`
                      flex items-center gap-x-3 px-3 py-2 rounded-md text-base font-medium w-full
                      transition-colors duration-300
                      ${isActive
                        ? 'bg-blue-100 text-blue-700 hover:text-blue-800'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
                      }
                      ${isSidebarExpanded ? 'justify-start' : 'justify-center'} {/* Center icon when collapsed */}
                    `}
                  >
                    {link.icon && <link.icon size={20} />}
                    {isSidebarExpanded && ( // Show label only when expanded
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="whitespace-nowrap"
                      >
                        {link.label}
                      </motion.span>
                    )}
                  </Link>
                );
              })}
            </div>
            {/* Removed User Info and Logout Button from here */}
          </div>
        </div>
      </nav>

      {/* Mobile Header and Menu functionality has been moved to Layout.jsx */}
      {/* This section is intentionally left empty or removed from Navbar.jsx */}
    </>
  );
}

export default Navbar;