// frontend/src/pages/DashboardPage.jsx

import React, { useState, useEffect, useCallback } from 'react'; // <--- ADD useCallback HERE
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);


function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading, token } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    todaysAppointments: 0,
    revenueSummary: 0,
    // Add more stats as needed
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [todaysAppointmentsList, setTodaysAppointmentsList] = useState([]); // Renamed to avoid conflict with stats.todaysAppointments
  const [chartData, setChartData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Monthly Appointments',
        data: [65, 59, 80, 81, 56, 55, 40, 60, 70, 75, 85, 90], // Dummy data
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  });

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Fetch admin stats
  const fetchAdminStats = async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      // Optionally set an error state to display to the user
    }
  };

  // Fetch today's appointments for the list
  const fetchTodaysAppointments = useCallback(async () => {
    if (!token) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/appointments?date=${today}&status=Scheduled`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTodaysAppointmentsList(data);
    } catch (error) {
      console.error('Error fetching today\'s appointments:', error);
    }
  }, [token]);


  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    // Fetch admin stats if user is admin
    if (user.role === 'admin') {
      fetchAdminStats();
    }

    // Fetch today's appointments for all authorized roles
    fetchTodaysAppointments();

    // Simulate fetching dashboard stats and recent activities
    const mockActivities = [
      { id: 1, type: 'Patient Registered', description: 'New patient John Doe registered.', date: '2023-10-26' },
      { id: 2, type: 'Appointment Scheduled', description: 'Appointment for Jane Smith with Dr. Alex.', date: '2023-10-25' },
      { id: 3, type: 'Clinical Note Added', description: 'Clinical note added for patient Mark Johnson.', date: '2023-10-24' },
      { id: 4, type: 'User Login', description: 'Dr. Emily logged in to the system.', date: '2023-10-24' },
    ];
    setRecentActivities(mockActivities);

  }, [authLoading, user, fetchTodaysAppointments]);


  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const getActivityBadgeClasses = (type) => {
    switch (type) {
      case 'Patient Registered': return 'bg-blue-200 text-blue-800';
      case 'Appointment Scheduled': return 'bg-green-200 text-green-800';
      case 'Clinical Note Added': return 'bg-purple-200 text-purple-800';
      case 'User Login': return 'bg-yellow-200 text-yellow-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  if (authLoading) {
    return (
      <div className='flex justify-center items-center h-screen bg-gray-100'>
        <div className='text-xl text-gray-700'>Loading dashboard...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  const isDoctor = user.role === 'doctor';
  const isAdmin = user.role === 'admin';
  const isReceptionist = user.role === 'receptionist';
  const isNurse = user.role === 'nurse';


  return (
    <motion.div
      className='min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8'
      initial='hidden'
      animate='visible'
      variants={containerVariants}
    >
      <motion.h1
        className='text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 sm:mb-8 text-center'
        variants={itemVariants}
      >
        Welcome, {user.first_name || user.username}!
      </motion.h1>

      <motion.p
        className='text-lg text-gray-600 mb-8 sm:mb-10 text-center'
        variants={itemVariants}
      >
        Today is {currentDate}.
      </motion.p>

      {/* Admin Specific Stats */}
      {isAdmin && (
        <motion.section
          className='mb-8 sm:mb-10 bg-white p-6 rounded-xl shadow-lg'
          variants={containerVariants}
        >
          <motion.h2 className='text-2xl font-bold text-gray-800 mb-5' variants={itemVariants}>
            Admin Overview
          </motion.h2>
          <motion.div
            className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'
            variants={containerVariants}
          >
            <motion.div
              className='bg-blue-500 text-white p-5 rounded-lg shadow-md flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-300'
              variants={cardVariants}
            >
              <h3 className='text-lg font-semibold mb-2'>Total Patients</h3>
              <p className='text-4xl font-bold'>{stats.totalPatients}</p>
            </motion.div>
            <motion.div
              className='bg-purple-500 text-white p-5 rounded-lg shadow-md flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-300'
              variants={cardVariants}
            >
              <h3 className='text-lg font-semibold mb-2'>Total Doctors</h3>
              <p className='text-4xl font-bold'>{stats.totalDoctors}</p>
            </motion.div>
            <motion.div
              className='bg-yellow-500 text-white p-5 rounded-lg shadow-md flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-300'
              variants={cardVariants}
            >
              <h3 className='text-lg font-semibold mb-2'>Today's Appointments</h3>
              <p className='text-4xl font-bold'>{stats.todaysAppointments}</p>
            </motion.div>
            <motion.div
              className='bg-green-500 text-white p-5 rounded-lg shadow-md flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-300'
              variants={cardVariants}
            >
              <h3 className='text-lg font-semibold mb-2'>Revenue Summary</h3>
              <p className='text-4xl font-bold'>${stats.revenueSummary.toLocaleString()}</p>
            </motion.div>
          </motion.div>

          {/* Chart Section */}
          <motion.div className='mt-8 bg-gray-50 p-6 rounded-lg shadow-inner' variants={itemVariants}>
            <h3 className='text-xl font-bold text-gray-700 mb-4'>Monthly Appointments Trend</h3>
            <div className='h-80'> {/* Fixed height for chart container */}
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false, // Allows chart to fill container height
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: true,
                      text: 'Monthly Appointments',
                    },
                  },
                }}
              />
            </div>
          </motion.div>
        </motion.section>
      )}


      {/* General Dashboard Sections */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Today's Appointments */}
        <motion.section
          className='bg-white p-6 rounded-xl shadow-lg'
          variants={containerVariants}
        >
          <motion.h2 className='text-2xl font-bold text-gray-800 mb-5' variants={itemVariants}>
            Today's Appointments
          </motion.h2>
          <ul className='space-y-4'>
            {todaysAppointmentsList.length > 0 ? (
              todaysAppointmentsList.map((appointment) => (
                <motion.li
                  key={appointment.id}
                  className='flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200'
                  variants={itemVariants}
                >
                  <div>
                    <p className='text-gray-800 font-medium text-base leading-snug'>
                      <Link to={`/patients/${appointment.patient_id}`} className='text-blue-600 hover:underline'>
                        {appointment.patient_first_name} {appointment.patient_last_name}
                      </Link>
                      {' '}with Dr.{' '}
                      <Link to={`/users/${appointment.doctor_id}`} className='text-blue-600 hover:underline'>
                        {appointment.doctor_first_name} {appointment.doctor_last_name}
                      </Link>
                    </p>
                    <p className='text-sm text-gray-500 mt-1'>
                      {new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.appointment_time} - {appointment.reason}
                    </p>
                  </div>
                  <div className='text-gray-400'>
                    <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7'></path>
                    </svg>
                  </div>
                </motion.li>
              ))
            ) : (
              <motion.li variants={itemVariants} className='py-4 text-gray-500 text-center'>
                No appointments scheduled for today.
              </motion.li>
            )}
          </ul>
          {todaysAppointmentsList.length > 0 && (
            <motion.div variants={itemVariants} className='mt-5 text-right'>
              <Link to='/appointments' className='text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200'>
                View All Appointments &rarr;
              </Link>
            </motion.div>
          )}
        </motion.section>

        {/* Recent Activities */}
        <motion.section
          className='bg-white p-6 rounded-xl shadow-lg'
          variants={containerVariants}
        >
          <motion.h2 className='text-2xl font-bold text-gray-800 mb-5' variants={itemVariants}>
            Recent Activities
          </motion.h2>
          <ul className='space-y-4'>
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <motion.li
                  key={activity.id}
                  className='flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200'
                  variants={itemVariants}
                >
                  <div>
                    <p className='text-gray-800 font-medium text-base leading-snug'>{activity.description}</p>
                    <p className='text-sm text-gray-500 mt-1'>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold mr-2 ${getActivityBadgeClasses(activity.type)}`}>
                        {activity.type}
                      </span>
                      {activity.date}
                    </p>
                  </div>
                  <div className='text-gray-400'>
                    <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7'></path>
                    </svg>
                  </div>
                </motion.li>
              ))
            ) : (
              <motion.li variants={itemVariants} className='py-4 text-gray-500 text-center'>
                No recent activities to display.
              </motion.li>
            )}
          </ul>
          {recentActivities.length > 0 && (
            <motion.div variants={itemVariants} className='mt-5 text-right'>
              <Link to='/activities' className='text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200'>
                View All Activities &rarr;
              </Link>
            </motion.div>
          )}
        </motion.section>
      </div>
    </motion.div>
  );
}

export default DashboardPage;
