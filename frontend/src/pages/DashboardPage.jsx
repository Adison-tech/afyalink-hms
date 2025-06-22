// frontend/src/pages/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // --- IMPORTANT: CONSOLE LOGS FOR DEBUGGING ---
  console.log('--- DashboardPage Render Cycle ---');
  console.log('authLoading:', authLoading);
  console.log('isAuthenticated:', isAuthenticated);
  console.log('User object:', user);
  console.log('---------------------------------');
  // --- END CONSOLE LOGS ---

  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    upcomingAppointments: 0,
    recentNotes: 0,
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [todaysAppointments, setTodaysAppointments] = useState([]); // New state for today's appointments

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    if (authLoading || !user) {
      // If authLoading is true or user is null, we return early from useEffect.
      // The loading spinner will be shown by the component's main render logic.
      return;
    }

    // Simulate fetching dashboard stats and recent activities
    const mockFetch = setTimeout(() => {
      setStats({
        totalPatients: 1250,
        totalDoctors: 45,
        upcomingAppointments: 120, // This could be total upcoming, today's appointments is more specific
        recentNotes: 85,
      });
      setRecentActivities([
        { id: 1, type: 'Appointment', description: 'Dr. Smith had an appointment with John Doe.', date: '2025-06-21 10:00 AM' },
        { id: 2, type: 'Patient Update', description: 'Patient Jane Doe\'s record updated.', date: '2025-06-20 03:30 PM' },
        { id: 3, type: 'Note Added', description: 'New clinical note added for patient Mike Ross.', date: '2025-06-20 11:15 AM' },
        { id: 4, type: 'Appointment', description: 'Confirmed appointment for Emily White.', date: '2025-06-19 09:00 AM' },
        { id: 5, type: 'Patient Update', description: 'New patient registered: Alex Green.', date: '2025-06-18 02:00 PM' },
      ]);
      setTodaysAppointments([ // Mock data for today's appointments
        { id: 'app1', time: '09:00 AM', patient: 'Alice Johnson', doctor: 'Dr. Emily White' },
        { id: 'app2', time: '10:30 AM', patient: 'Bob Williams', doctor: 'Dr. John Smith' },
        { id: 'app3', time: '02:00 PM', patient: 'Charlie Brown', doctor: 'Dr. Sarah Davis' },
      ]);
    }, 1000); // Simulate network delay

    return () => clearTimeout(mockFetch);
  }, [authLoading, user]);

  // Derived permissions from user roles (assuming user.role is available and maps to permissions)
  // This logic is simplified; in a real app, permissions might come from the user object itself.
  const userRole = user?.role || 'guest'; // Default to 'guest' if no user or role
  const canViewPatients = ['admin', 'doctor', 'nurse', 'receptionist'].includes(userRole);
  const canViewAppointments = ['admin', 'doctor', 'nurse', 'receptionist'].includes(userRole);
  const canViewClinicalNotes = ['admin', 'doctor', 'nurse'].includes(userRole);
  const canManageUsers = ['admin'].includes(userRole);
  const canAddPatient = ['admin', 'receptionist'].includes(userRole);
  const canScheduleAppointment = ['admin', 'receptionist', 'nurse'].includes(userRole);
  const canCreateNote = ['admin', 'doctor', 'nurse'].includes(userRole);


  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 10 } },
    hover: { scale: 1.03, boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.15)', transition: { duration: 0.2 } },
    tap: { scale: 0.97, transition: { duration: 0.1 } }
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: '0px 8px 15px rgba(0, 0, 0, 0.1)' },
    tap: { scale: 0.95 }
  };

  // Function to get activity type badge styles
  const getActivityBadgeClasses = (type) => {
    switch (type) {
      case 'Appointment':
        return 'bg-blue-100 text-blue-800';
      case 'Patient Update':
        return 'bg-green-100 text-green-800';
      case 'Note Added':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading) {
    return (
      <div className='flex justify-center items-center h-screen bg-gradient-to-br from-blue-100 to-indigo-200'>
        <div className='flex flex-col items-center'>
          <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className='text-lg text-gray-700'>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // This case should ideally be handled by PrivateRoute, but good for redundancy
    navigate('/login');
    return null;
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 p-8 md:p-12 lg:p-16"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Dashboard Header */}
      <motion.div variants={itemVariants} className="mb-10 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-2">
          Hello, <span className="text-blue-700">{user.username}</span>! 👋
        </h1>
        <p className="text-lg text-gray-600 font-medium">
          Welcome to your AfyaLink HMS Dashboard. Today is {currentDate}.
          <span className="ml-3 px-4 py-1 bg-blue-200 text-blue-800 text-sm font-semibold rounded-full capitalize shadow-md">
            {user.role} Access
          </span>
        </p>
      </motion.div>

      {/* Key Statistics Section */}
      <motion.section
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        variants={containerVariants}
      >
        <motion.div
          className="bg-white rounded-lg shadow-xl p-6 flex flex-col items-center text-center transition-all duration-300 transform hover:-translate-y-1"
          variants={cardVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <div className="text-blue-500 mb-3">
            <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M12 20.354a4 4 0 110-5.292M12 14c-1.488 0-2.922.09-4.333.268M12 14c1.488 0 2.922.09 4.333.268M12 14l-.001-.001M12 14L12 6m-5.333 14c-1.293-1.077-2.67-2.128-4.008-3.056M12 14l.001-.001M12 14L12 6m-5.333 14c-1.293-1.077-2.67-2.128-4.008-3.056M12 14l.001-.001M12 14L12 6m-5.333 14c-1.293-1.077-2.67-2.128-4.008-3.056"></path>
            </svg>
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-2">{stats.totalPatients}</p>
          <p className="text-lg text-gray-600">Total Patients</p>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg shadow-xl p-6 flex flex-col items-center text-center transition-all duration-300 transform hover:-translate-y-1"
          variants={cardVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <div className="text-green-500 mb-3">
            <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
            </svg>
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-2">{stats.totalDoctors}</p>
          <p className="text-lg text-gray-600">Total Doctors</p>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg shadow-xl p-6 flex flex-col items-center text-center transition-all duration-300 transform hover:-translate-y-1"
          variants={cardVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <div className="text-purple-500 mb-3">
            <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h.01M7 11h.01M7 15h.01M11 15h.01M15 15h.01M17 11h.01M17 15h.01M10 18H5a2 2 0 01-2-2V8a2 2 0 012-2h14a2 2 0 012 2v7a2 2 0 01-2 2h-5a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-2">{stats.upcomingAppointments}</p>
          <p className="text-lg text-gray-600">Upcoming Appointments</p>
        </motion.div>

        <motion.div
          className="bg-white rounded-lg shadow-xl p-6 flex flex-col items-center text-center transition-all duration-300 transform hover:-translate-y-1"
          variants={cardVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <div className="text-red-500 mb-3">
            <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
            </svg>
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-2">{stats.recentNotes}</p>
          <p className="text-lg text-gray-600">Recent Notes</p>
        </motion.div>
      </motion.section>

      {/* Quick Access/Feature Cards Section */}
      <motion.section
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        variants={containerVariants}
      >
        {canViewPatients && (
          <motion.div
            className="bg-white rounded-lg shadow-xl p-6 flex flex-col items-center text-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 cursor-pointer"
            variants={cardVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => navigate('/patients')}
          >
            <div className="text-blue-600 mb-4">
              <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M12 20.354a4 4 0 110-5.292M12 14c-1.488 0-2.922.09-4.333.268M12 14c1.488 0 2.922.09 4.333.268M12 14l-.001-.001M12 14L12 6m-5.333 14c-1.293-1.077-2.67-2.128-4.008-3.056M12 14l.001-.001M12 14L12 6m-5.333 14c-1.293-1.077-2.67-2.128-4.008-3.056M12 14l.001-.001M12 14L12 6m-5.333 14c-1.293-1.077-2.67-2.128-4.008-3.056"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Patient Management</h3>
            <p className="text-gray-600 text-sm">View, add, and manage patient records.</p>
          </motion.div>
        )}

        {canViewAppointments && (
          <motion.div
            className="bg-white rounded-lg shadow-xl p-6 flex flex-col items-center text-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 cursor-pointer"
            variants={cardVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => navigate('/appointments')}
          >
            <div className="text-green-600 mb-4">
              <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h.01M7 11h.01M7 15h.01M11 15h.01M15 15h.01M17 11h.01M17 15h.01M10 18H5a2 2 0 01-2-2V8a2 2 0 012-2h14a2 2 0 012 2v7a2 2 0 01-2 2h-5a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Appointments</h3>
            <p className="text-gray-600 text-sm">Schedule and manage patient appointments.</p>
          </motion.div>
        )}

        {canViewClinicalNotes && (
          <motion.div
            className="bg-white rounded-lg shadow-xl p-6 flex flex-col items-center text-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 cursor-pointer"
            variants={cardVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => navigate('/clinical-notes')}
          >
            <div className="text-red-600 mb-4">
              <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Clinical Notes</h3>
            <p className="text-gray-600 text-sm">Access and manage patient clinical notes.</p>
          </motion.div>
        )}

        {canManageUsers && (
          <motion.div
            className="bg-white rounded-lg shadow-xl p-6 flex flex-col items-center text-center transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 cursor-pointer"
            variants={cardVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => navigate('/user-management')}
          >
            <div className="text-yellow-600 mb-4">
              <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h-2v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2H3a2 2 0 00-2 2v3a1 1 0 001 1h18a1 1 0 001-1v-3a2 2 0 00-2-2zM10 9a2 2 0 100-4 2 2 0 000 4zm7.5 0a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">User Management</h3>
            <p className="text-gray-600 text-sm">Add, edit, and manage system users.</p>
          </motion.div>
        )}
      </motion.section>

      {/* New: Quick Actions Section */}
      <motion.section
        className="bg-white rounded-lg shadow-xl p-6 mb-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h3 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {canAddPatient && (
            <motion.button
              className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => navigate('/patients/new')} // Assuming a route for new patient form
            >
              <svg className="h-6 w-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Add New Patient
            </motion.button>
          )}

          {canScheduleAppointment && (
            <motion.button
              className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => navigate('/appointments/new')} // Assuming a route for new appointment form
            >
              <svg className="h-6 w-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h.01M7 11h.01M7 15h.01M11 15h.01M15 15h.01M17 11h.01M17 15h.01M10 18H5a2 2 0 01-2-2V8a2 2 0 012-2h14a2 2 0 012 2v7a2 2 0 01-2 2h-5a2 2 0 01-2 2z"></path>
              </svg>
              Schedule Appointment
            </motion.button>
          )}

          {canCreateNote && (
            <motion.button
              className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => navigate('/clinical-notes/new')} // Assuming a route for new clinical note
            >
              <svg className="h-6 w-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
              Create Clinical Note
            </motion.button>
          )}
        </div>
      </motion.section>

      {/* New: Today's Appointments Section */}
      {user && canViewAppointments && (
        <motion.section
          className="bg-white rounded-lg shadow-xl p-6 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-3">Today's Appointments</h3>
          <ul className="divide-y divide-gray-200">
            {todaysAppointments.length > 0 ? (
              todaysAppointments.map(appointment => (
                <motion.li
                  key={appointment.id}
                  className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between transition-colors duration-200"
                  variants={itemVariants}
                  whileHover={{ backgroundColor: '#f9fafb' }}
                >
                  <div className="flex-1 mr-4 mb-2 sm:mb-0">
                    <p className="text-gray-800 font-medium text-base leading-snug">
                      <span className="font-semibold text-blue-700">{appointment.time}</span> - {appointment.patient} with {appointment.doctor}
                    </p>
                  </div>
                  <div className="text-gray-400">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </motion.li>
              ))
            ) : (
              <motion.li variants={itemVariants} className="py-4 text-gray-500 text-center">
                No appointments scheduled for today.
              </motion.li>
            )}
          </ul>
          {todaysAppointments.length > 0 && (
            <motion.div variants={itemVariants} className="mt-5 text-right">
              <Link to="/appointments" className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200">
                View All Appointments &rarr;
              </Link>
            </motion.div>
          )}
        </motion.section>
      )}

      {/* Recent Activities Section - Moved to bottom for hierarchy */}
      {user && (canViewPatients || canViewAppointments || canViewClinicalNotes || canManageUsers) && (
        <motion.section
          className="bg-white rounded-lg shadow-xl p-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-3">Recent Activities</h3>
          <ul className="divide-y divide-gray-200">
            {recentActivities.length > 0 ? (
              recentActivities.map(activity => (
                <motion.li
                  key={activity.id}
                  className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between transition-colors duration-200"
                  variants={itemVariants}
                  whileHover={{ backgroundColor: '#f9fafb' }}
                >
                  <div className="flex-1 mr-4 mb-2 sm:mb-0">
                    <p className="text-gray-800 font-medium text-base leading-snug">{activity.description}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold mr-2 ${getActivityBadgeClasses(activity.type)}`}>
                        {activity.type}
                      </span>
                      {activity.date}
                    </p>
                  </div>
                  <div className="text-gray-400">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </motion.li>
              ))
            ) : (
              <motion.li variants={itemVariants} className="py-4 text-gray-500 text-center">
                No recent activities to display.
              </motion.li>
            )}
          </ul>
          {recentActivities.length > 0 && (
            <motion.div variants={itemVariants} className="mt-5 text-right">
              <Link to="/activities" className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200">
                View All Activities &rarr;
              </Link>
            </motion.div>
          )}
        </motion.section>
      )}
    </motion.div>
  );
}

export default DashboardPage;