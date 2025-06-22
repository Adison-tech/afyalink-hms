// frontend/src/pages/AppointmentsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // Ensure AnimatePresence is imported

// --- Reusable Notification Component ---
const Notification = ({ message, type, onClose }) => {
  if (!message) return null;

  const bgColor = type === 'success' ? 'bg-green-100' : 'bg-red-100';
  const borderColor = type === 'success' ? 'border-green-400' : 'border-red-400';
  const textColor = type === 'success' ? 'text-green-700' : 'text-red-700';
  const iconColor = type === 'success' ? 'text-green-500' : 'text-red-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: "50%" }}
      animate={{ opacity: 1, y: 0, x: "0%" }}
      exit={{ opacity: 0, y: -50 }} // This exit animation requires AnimatePresence wrapper
      transition={{ duration: 0.3 }}
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 
                  ${bgColor} ${borderColor} ${textColor} border-l-4`}
      role="alert"
    >
      {type === 'success' ? (
        <svg className={`h-6 w-6 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      ) : (
        <svg className={`h-6 w-6 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2A9 9 0 111 10a9 9 0 0118 0z"></path></svg>
      )}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className={`absolute top-1 right-1 ${iconColor} hover:text-gray-900`}>
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </motion.div>
  );
};

// --- Simple Modal Component ---
const Modal = ({ isOpen, onClose, children, title }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ y: "-100vh", opacity: 0 }}
            animate={{ y: "0", opacity: 1 }}
            exit={{ y: "100vh", opacity: 0 }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
            className="bg-white rounded-lg shadow-2xl w-full max-w-2xl transform sm:my-8 sm:align-middle sm:w-full"
          >
            <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <h3 className="text-2xl font-semibold text-gray-800">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-md p-1"
                aria-label="Close modal"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Confirm Delete Modal Component ---
const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, itemType }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Confirm Deletion of ${itemType}`}>
      <div className="text-center p-5">
        <svg className="mx-auto mb-4 w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <h3 className="mb-5 text-lg font-normal text-gray-700">
          Are you sure you want to delete this {itemType}? This action cannot be undone.
        </h3>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300"
          >
            Yes, I'm sure
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300"
          >
            No, cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

function AppointmentsPage() {
  const { token, isAuthenticated, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [patientsList, setPatientsList] = useState([]); // For patient selection in form
  const [doctorsList, setDoctorsList] = useState([]);   // For doctor selection in form
  const [pageLoading, setPageLoading] = useState(true);
  const [notification, setNotification] = useState({ message: null, type: null });

  const [showAppointmentFormModal, setShowAppointmentFormModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null); // State for delete confirmation modal

  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    reason: '',
    status: 'Scheduled'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('All'); // New filter for status


  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const showNotification = useCallback((message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: null, type: null });
    }, 5000);
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated || !token) {
      navigate('/login');
      return;
    }

    const fetchAllData = async () => {
      setPageLoading(true);
      setNotification({ message: null, type: null });
      try {
        const appointmentsResponse = await fetch('/api/appointments', { headers: { 'Authorization': `Bearer ${token}` } });
        if (!appointmentsResponse.ok) {
          throw new Error('Failed to fetch appointments.');
        }
        const appointmentsData = await appointmentsResponse.json();
        setAppointments(appointmentsData);

        const patientsResponse = await fetch('/api/patients', { headers: { 'Authorization': `Bearer ${token}` } });
        if (!patientsResponse.ok) {
          throw new Error('Failed to fetch patients list.');
        }
        const patientsData = await patientsResponse.json();
        setPatientsList(patientsData);

        const doctorsResponse = await fetch('/api/users?role=doctor', { headers: { 'Authorization': `Bearer ${token}` } });
        if (!doctorsResponse.ok) {
          throw new Error('Failed to fetch doctors list.');
        }
        const doctorsData = await doctorsResponse.json();
        setDoctorsList(doctorsData);

      } catch (err) {
        console.error('Error fetching initial data:', err);
        showNotification(err.message || 'Failed to load page data.', 'error');
      } finally {
        setPageLoading(false);
      }
    };

    fetchAllData();
  }, [isAuthenticated, token, authLoading, navigate, showNotification]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetFormData = () => {
    setFormData({
      patient_id: '', doctor_id: '', appointment_date: '', appointment_time: '', reason: '', status: 'Scheduled'
    });
  };

  const handleAddEditSubmit = async (e) => {
    e.preventDefault();
    setNotification({ message: null, type: null });

    if (!formData.patient_id || !formData.doctor_id || !formData.appointment_date || !formData.appointment_time || !formData.reason) {
      showNotification('Please fill in all required fields for the appointment.', 'error');
      return;
    }

    // Client-side validation for existing appointment at the same time for the same doctor
    const newAppointmentDateTime = `${formData.appointment_date}T${formData.appointment_time}:00`;

    const isConflict = appointments.some(app =>
      app.doctor_id === formData.doctor_id &&
      app.appointment_date.split('T')[0] === formData.appointment_date &&
      app.appointment_time.substring(0, 5) === formData.appointment_time &&
      (editingAppointment ? app.id !== editingAppointment.id : true) // Exclude the current appointment if editing
    );

    if (isConflict) {
      showNotification('An appointment for this doctor already exists at the selected date and time. Please choose a different time or doctor.', 'error');
      return;
    }

    try {
      const url = editingAppointment
        ? `/api/appointments/${editingAppointment.id}`
        : '/api/appointments';
      const method = editingAppointment ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `Failed to ${editingAppointment ? 'update' : 'add'} appointment.`);
      }

      // Re-fetch all data to ensure lists are fresh and synchronized
      const updatedAppointmentsResponse = await fetch('/api/appointments', { headers: { 'Authorization': `Bearer ${token}` } });
      if (!updatedAppointmentsResponse.ok) {
          showNotification(`Appointment ${editingAppointment ? 'updated' : 'added'} successfully, but failed to refresh data.`, 'warning');
          console.error("Failed to re-fetch appointments after successful operation:", updatedAppointmentsResponse);
      } else {
        const updatedAppointmentsData = await updatedAppointmentsResponse.json();
        setAppointments(updatedAppointmentsData);
        showNotification(`Appointment ${editingAppointment ? 'updated' : 'added'} successfully!`, 'success');
      }

      setShowAppointmentFormModal(false);
      setEditingAppointment(null);
      resetFormData();

    } catch (err) {
      console.error(`Error ${editingAppointment ? 'updating' : 'adding'} appointment:`, err);
      showNotification(err.message || `An error occurred while ${editingAppointment ? 'updating' : 'adding'} the appointment.`, 'error');
    }
  };

  const handleEditClick = (appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      patient_id: appointment.patient_id,
      doctor_id: appointment.doctor_id,
      appointment_date: appointment.appointment_date.split('T')[0], // Format date for input
      appointment_time: appointment.appointment_time.substring(0, 5), // Format time for input
      reason: appointment.reason,
      status: appointment.status || 'Scheduled'
    });
    setShowAppointmentFormModal(true);
  };

  const confirmDelete = (appointmentId) => {
    setAppointmentToDelete(appointmentId);
  };

  const handleDeleteAppointment = async () => {
    const appointmentId = appointmentToDelete;
    if (!appointmentId) return;

    setPageLoading(true);
    setNotification({ message: null, type: null });
    setAppointmentToDelete(null); // Close the confirmation modal

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to delete appointment.');
      }

      setAppointments(prevAppointments =>
        prevAppointments.filter(app => app.id !== appointmentId)
      );
      showNotification('Appointment deleted successfully!', 'success');

    } catch (err) {
      console.error('Error deleting appointment:', err);
      showNotification(err.message || 'Failed to delete appointment.', 'error');
    } finally {
      setPageLoading(false);
    }
  };

  const handleAddAppointmentClick = () => {
    setEditingAppointment(null);
    resetFormData();
    setShowAppointmentFormModal(true);
  };

  const getPatientName = (id) => {
    const patient = patientsList.find(p => p.id === id);
    return patient ? `${patient.first_name} ${patient.last_name}` : `Unknown Patient (${id})`;
  };

  const getDoctorName = (id) => {
    const doctor = doctorsList.find(d => d.id === id);
    return doctor ? `${doctor.first_name} ${doctor.last_name}` : `Unknown Doctor (${id})`;
  };

  const filteredAppointments = appointments.filter(appointment => {
    const patientName = getPatientName(appointment.patient_id).toLowerCase();
    const doctorName = getDoctorName(appointment.doctor_id).toLowerCase();
    const reason = appointment.reason.toLowerCase();
    const status = appointment.status.toLowerCase();

    const matchesSearch = searchTerm === '' ||
                          patientName.includes(searchTerm.toLowerCase()) ||
                          doctorName.includes(searchTerm.toLowerCase()) ||
                          reason.includes(searchTerm.toLowerCase());

    const appointmentDate = new Date(appointment.appointment_date).toISOString().split('T')[0];
    const matchesDate = filterDate === '' || appointmentDate === filterDate;

    const matchesStatus = filterStatus === 'All' || status === filterStatus.toLowerCase();

    return matchesSearch && matchesDate && matchesStatus;
  });

  const canManageAppointments = user && (user.role === 'admin' || user.role === 'receptionist');
  const canViewAppointments = user && (user.role === 'admin' || user.role === 'receptionist' || user.role === 'doctor' || user.role === 'nurse');

  if (authLoading) return <div className='flex justify-center items-center h-screen bg-gray-100 text-xl text-gray-700'>Loading authentication...</div>;
  if (!isAuthenticated) return <div className='flex justify-center items-center h-screen bg-gray-100 text-xl text-gray-700'>Redirecting to login...</div>;
  if (!canViewAppointments && !pageLoading) {
    return (
      <div className='p-8 bg-gray-100 min-h-[calc(100vh-64px)] flex items-center justify-center'>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='text-center p-8 bg-white rounded-lg shadow-xl'
        >
          <h2 className='text-3xl font-bold text-red-600 mb-4'>Access Denied</h2>
          <p className='text-gray-700'>You do not have permission to view this page. Please contact your administrator.</p>
        </motion.div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    let colorClass = 'bg-gray-200 text-gray-800';
    switch (status) {
      case 'Scheduled': colorClass = 'bg-blue-100 text-blue-800'; break;
      case 'Confirmed': colorClass = 'bg-green-100 text-green-800'; break;
      case 'Cancelled': colorClass = 'bg-red-100 text-red-800'; break;
      case 'Completed': colorClass = 'bg-purple-100 text-purple-800'; break;
      case 'Rescheduled': colorClass = 'bg-yellow-100 text-yellow-800'; break;
      default: colorClass = 'bg-gray-100 text-gray-700';
    }
    return (
      <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}>
        {status}
      </span>
    );
  };

  return (
    <motion.div
      className='p-8 bg-gray-100 min-h-[calc(100vh-64px)] font-sans'
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Wrap Notification with AnimatePresence */}
      <AnimatePresence>
        {notification.message && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification({ message: null, type: null })}
          />
        )}
      </AnimatePresence>

      <motion.div variants={itemVariants} className='flex justify-between items-center mb-6'>
        <h1 className='text-4xl font-extrabold text-gray-800'>Appointments Management</h1>
        {canManageAppointments && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddAppointmentClick}
            className='flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-lg font-semibold'
          >
            <svg className='w-6 h-6 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z'></path></svg>
            Add New Appointment
          </motion.button>
        )}
      </motion.div>

      {pageLoading ? (
        <div className='text-center py-10'>
          <div className='inline-block animate-spin rounded-full h-12 w-12 border-4 border-r-transparent border-blue-500'></div>
          <p className='text-gray-600 text-lg mt-4'>Loading appointments...</p>
        </div>
      ) : (
        <motion.div variants={itemVariants} className='bg-white p-6 rounded-xl shadow-2xl'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            <input
              type='text'
              placeholder='Search by patient, doctor, or reason...'
              className='p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 shadow-sm'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <input
              type='date'
              className='p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 shadow-sm'
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
            <select
              className='p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 shadow-sm'
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value='All'>All Statuses</option>
              <option value='Scheduled'>Scheduled</option>
              <option value='Confirmed'>Confirmed</option>
              <option value='Completed'>Completed</option>
              <option value='Cancelled'>Cancelled</option>
              <option value='Rescheduled'>Rescheduled</option>
            </select>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className='text-center py-10 text-gray-600 text-lg'>
              No appointments found matching your criteria.
            </div>
          ) : (
            <div className='overflow-x-auto shadow-md rounded-lg'>
              <table className='min-w-full leading-normal'>
                <thead>
                  <tr className='bg-blue-600 text-white uppercase text-sm font-semibold tracking-wider'>
                    <th className='py-3 px-5 text-left'>Patient Name</th>
                    <th className='py-3 px-5 text-left'>Doctor Name</th>
                    <th className='py-3 px-5 text-left'>Date</th>
                    <th className='py-3 px-5 text-left'>Time</th>
                    <th className='py-3 px-5 text-left'>Reason</th>
                    <th className='py-3 px-5 text-left'>Status</th>
                    {canManageAppointments && <th className='py-3 px-5 text-center'>Actions</th>}
                  </tr>
                </thead>
                <tbody className='bg-white'>
                  <AnimatePresence>
                    {filteredAppointments.map((appointment) => (
                      <motion.tr
                        key={appointment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.2 }}
                        className='border-b border-gray-200 hover:bg-gray-50'
                      >
                        <td className='py-3 px-5 text-sm text-gray-900'>
                          {getPatientName(appointment.patient_id)}
                        </td>
                        <td className='py-3 px-5 text-sm text-gray-900'>
                          {getDoctorName(appointment.doctor_id)}
                        </td>
                        <td className='py-3 px-5 text-sm text-gray-900'>
                          {new Date(appointment.appointment_date).toLocaleDateString()}
                        </td>
                        <td className='py-3 px-5 text-sm text-gray-900'>
                          {appointment.appointment_time.substring(0, 5)}
                        </td>
                        <td className='py-3 px-5 text-sm text-gray-900'>
                          {appointment.reason}
                        </td>
                        <td className='py-3 px-5 text-sm'>
                          {getStatusBadge(appointment.status)}
                        </td>
                        {canManageAppointments && (
                          <td className='py-3 px-5 text-center'>
                            <div className='flex justify-center space-x-3'>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleEditClick(appointment)}
                                className='text-blue-600 hover:text-blue-800 transition-colors duration-200'
                                title='Edit Appointment'
                              >
                                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-7-9l4 4L11 3l-4 4zm-2 2l4 4m0 0l-5 5H4v-5l5-5z'></path></svg>
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => confirmDelete(appointment.id)}
                                className='text-red-600 hover:text-red-800 transition-colors duration-200'
                                title='Delete Appointment'
                              >
                                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'></path></svg>
                              </motion.button>
                            </div>
                          </td>
                        )}
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      <Modal
        isOpen={showAppointmentFormModal}
        onClose={() => {
          setShowAppointmentFormModal(false);
          setEditingAppointment(null);
          resetFormData();
          setNotification({ message: null, type: null }); // Clear modal-specific errors
        }}
        title={editingAppointment ? 'Edit Appointment' : 'Add New Appointment'}
      >
        <form onSubmit={handleAddEditSubmit} className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          <div>
            <label htmlFor='patient_id' className='block text-gray-700 text-sm font-medium mb-1'>Patient:</label>
            <select
              id='patient_id'
              name='patient_id'
              value={formData.patient_id}
              onChange={handleInputChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              required
            >
              <option value=''>Select Patient</option>
              {patientsList.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.first_name} {patient.last_name} ({patient.id})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor='doctor_id' className='block text-gray-700 text-sm font-medium mb-1'>Doctor:</label>
            <select
              id='doctor_id'
              name='doctor_id'
              value={formData.doctor_id}
              onChange={handleInputChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              required
            >
              <option value=''>Select Doctor</option>
              {doctorsList.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.first_name} {doctor.last_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor='appointment_date' className='block text-gray-700 text-sm font-medium mb-1'>Appointment Date:</label>
            <input
              type='date'
              id='appointment_date'
              name='appointment_date'
              value={formData.appointment_date}
              onChange={handleInputChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              required
            />
          </div>
          <div>
            <label htmlFor='appointment_time' className='block text-gray-700 text-sm font-medium mb-1'>Appointment Time:</label>
            <input
              type='time'
              id='appointment_time'
              name='appointment_time'
              value={formData.appointment_time}
              onChange={handleInputChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              required
            />
          </div>
          <div className='col-span-1 md:col-span-2'>
            <label htmlFor='reason' className='block text-gray-700 text-sm font-medium mb-1'>Reason for Appointment:</label>
            <textarea
              id='reason'
              name='reason'
              value={formData.reason}
              onChange={handleInputChange}
              rows='3'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder="e.g., Follow-up, New consultation, Check-up"
              required
            ></textarea>
          </div>
          {editingAppointment && (
            <div className='col-span-1 md:col-span-2'>
              <label htmlFor='status' className='block text-gray-700 text-sm font-medium mb-1'>Status:</label>
              <select
                id='status'
                name='status'
                value={formData.status}
                onChange={handleInputChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='Scheduled'>Scheduled</option>
                <option value='Confirmed'>Confirmed</option>
                <option value='Completed'>Completed</option>
                <option value='Cancelled'>Cancelled</option>
                <option value='Rescheduled'>Rescheduled</option>
              </select>
            </div>
          )}

          <div className='col-span-1 md:col-span-2 flex justify-end items-center gap-4 mt-4'>
            <button
              type='button'
              onClick={() => {
                setShowAppointmentFormModal(false);
                setEditingAppointment(null);
                resetFormData();
                setNotification({ message: null, type: null }); // Clear modal-specific errors
              }}
              className='bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300'
            >
              {editingAppointment ? 'Update Appointment' : 'Add Appointment'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal
        isOpen={!!appointmentToDelete}
        onClose={() => setAppointmentToDelete(null)}
        onConfirm={handleDeleteAppointment}
        itemType="Appointment"
      />
    </motion.div>
  );
}

export default AppointmentsPage;