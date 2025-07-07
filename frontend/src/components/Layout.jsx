// frontend/src/components/Layout.jsx

import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom'; // Import Link and useLocation
import Navbar from './Navbar';
import Header from './Header';
import { motion } from 'framer-motion'; // <--- ADD THIS IMPORT

// Import Lucide Icons for mobile menu
import { X, Menu, LayoutDashboard, Users, HeartPulse, Calendar, ClipboardList, Building2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import afyalinkLogo from '../assets/afyalink-logo.svg';

// Helper function to capitalize the first letter of a string
const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation(); // Use useLocation here
  // State for desktop sidebar expansion
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  // State for mobile menu overlay
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Define navigation links for mobile menu as well
  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "doctor", "receptionist", "nurse"] },
    { to: "/patients", label: "Patients", icon: HeartPulse, roles: ["admin", "doctor", "receptionist", "nurse"] },
    { to: "/appointments", label: "Appointments", icon: Calendar, roles: ["admin", "doctor", "receptionist", "nurse"] },
    { to: "/clinical-notes", label: "Clinical Notes", icon: ClipboardList, roles: ["admin", "doctor", "nurse"] },
    { to: "/users", label: "User Management", icon: Users, roles: ["admin"] },
    { to: "/departments", label: "Department Management", icon: Building2, roles: ["admin"] },
  ];

  // Set initial sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarExpanded(false);
        setIsMobileMenuOpen(false);
      } else {
        setIsSidebarExpanded(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Unified toggle function for both desktop sidebar and mobile menu
  const toggleUnifiedMenu = () => {
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(prev => !prev);
    } else {
      setIsSidebarExpanded(prev => !prev);
    }
  };

  const mainContentMarginClass = isSidebarExpanded ? 'md:ml-64' : 'md:ml-20';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Navbar
        isSidebarExpanded={isSidebarExpanded}
      />

      <div className={`flex flex-col flex-grow overflow-y-auto ${mainContentMarginClass} transition-all duration-300`}>
        <Header toggleSidebar={toggleUnifiedMenu} />

        <main className="flex-grow p-4">
          <Outlet />
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      <motion.div
        initial={{ x: '100vw' }}
        animate={{ x: isMobileMenuOpen ? 0 : '100vw' }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 w-full h-full bg-white z-50 flex flex-col md:hidden
          ${isMobileMenuOpen ? 'block' : 'hidden'}
        `}
      >
        <div className="flex justify-between items-center h-16 px-4 shadow-md">
          <Link to="/dashboard" className="flex-shrink-0 flex items-center">
            <img className="h-8 w-auto" src={afyalinkLogo} alt="AfyaLink HMS Logo" />
            <span className="ml-2 text-xl font-bold text-forest-green whitespace-nowrap">AfyaLink HMS</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className='inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500'
          >
            <X className='block h-6 w-6' />
            <span className='sr-only'>Close main menu</span>
          </button>
        </div>

        <div className='flex flex-col flex-grow p-4 space-y-2 overflow-y-auto'>
          {user && navLinks.map((link) => {
            return user && link.roles.includes(user.role) && (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center space-x-3 px-4 py-2 rounded-md text-base font-medium w-full text-left
                  transition-colors duration-300
                  ${location.pathname === link.to
                    ? 'bg-blue-100 text-blue-700 hover:text-blue-800'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
                  }
                `}
              >
                {link.icon && <link.icon size={20} />}
                <span>{link.label}</span>
              </Link>
            );
          })}

          {user && (
            <div className="mt-auto pt-4 border-t border-gray-200">
              <span className="text-gray-600 font-medium text-sm block mb-2">
                Hello, {user.first_name || user.username} ({capitalize(user.role)})
              </span>
              <button
                onClick={() => {
                  logout();
                  // Optionally navigate to login after logout from mobile menu
                  // navigate('/login'); // You'd need to import useNavigate here if you uncomment this
                  setIsMobileMenuOpen(false); // Close menu after logout
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm hover:shadow-md transition duration-200 ease-in-out text-sm flex items-center gap-x-2 w-full justify-center"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default Layout;