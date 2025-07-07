// frontend/src/pages/UsersManagementPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

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
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3
                  ${bgColor} ${borderColor} ${textColor} border-l-4`}
      role="alert"
    >
      {type === 'success' ? (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      ) : (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      )}
      <p className="font-medium">{message}</p>
      <button onClick={onClose} className={`ml-auto ${textColor} hover:opacity-75`}>
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </motion.div>
  );
};

// --- Reusable Modal Component ---
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={onClose} // Allows clicking outside to close
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-3">{title}</h2>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-3xl leading-none"
            >
              &times;
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Delete Confirmation Modal ---
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, userName }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Deletion">
      <p className="text-gray-700 mb-6">
        Are you sure you want to delete user <span className="font-semibold">{userName}</span>? This action cannot be undone.
      </p>
      <div className="flex justify-end space-x-4">
        <button
          onClick={onClose}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300"
        >
          Delete
        </button>
      </div>
    </Modal>
  );
};


// --- Main UsersManagementPage Component ---
function UsersManagementPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: null, type: null });
  const [showUserFormModal, setShowUserFormModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // User object being edited
  const [userToDelete, setUserToDelete] = useState(null); // User object to be deleted
  const [filterRole, setFilterRole] = useState(''); // State for role filter

  const initialFormData = {
    username: '',
    password: '',
    confirmPassword: '', // For new user registration
    role: 'receptionist',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: '',
    date_of_birth: '',
    gender: ''
  };
  const [formData, setFormData] = useState(initialFormData);

  const roles = ['admin', 'doctor', 'nurse', 'receptionist']; // Available roles

  const resetFormData = () => {
    setFormData(initialFormData);
  };

  const handleNotificationClose = () => {
    setNotification({ message: null, type: null });
  };

  const fetchUsers = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const queryParams = filterRole ? `?role=${filterRole}` : '';
      const response = await fetch(`/api/users${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 403) {
          setNotification({ message: 'You are not authorized to view users.', type: 'error' });
          // Optionally redirect to dashboard if not authorized
          navigate('/dashboard');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setNotification({ message: `Failed to fetch users: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [token, filterRole, navigate]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddUserClick = () => {
    setEditingUser(null);
    resetFormData();
    setNotification({ message: null, type: null }); // Clear any previous modal errors
    setShowUserFormModal(true);
  };

  const handleEditUserClick = (user) => {
    setEditingUser(user);
    // Populate form data, ensuring password fields are empty for security
    setFormData({
      username: user.username,
      password: '', // Never pre-fill passwords
      confirmPassword: '',
      role: user.role,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone_number: user.phone_number || '',
      address: user.address || '',
      date_of_birth: user.date_of_birth ? new Date(user.date_of_birth).toISOString().split('T')[0] : '',
      gender: user.gender || ''
    });
    setNotification({ message: null, type: null });
    setShowUserFormModal(true);
  };

  const handleSubmitUserForm = async (e) => {
    e.preventDefault();
    setNotification({ message: null, type: null });

    if (!editingUser && formData.password !== formData.confirmPassword) {
      setNotification({ message: 'Passwords do not match.', type: 'error' });
      return;
    }

    const payload = { ...formData };
    if (editingUser) {
      // For update, only send fields that are present and not empty, excluding password if not changed
      delete payload.confirmPassword;
      if (!payload.password) {
        delete payload.password; // Don't send empty password if not being updated
      }
    } else {
      // For create, password and confirmPassword are required
      delete payload.confirmPassword;
    }

    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/auth/register';
      const method = editingUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${editingUser ? 'update' : 'add'} user.`);
      }

      setNotification({ message: data.message || `User ${editingUser ? 'updated' : 'added'} successfully!`, type: 'success' });
      setShowUserFormModal(false);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error(`Error ${editingUser ? 'updating' : 'adding'} user:`, error);
      setNotification({ message: error.message || `An error occurred while ${editingUser ? 'updating' : 'adding'} the user.`, type: 'error' });
    }
  };

  const handleDeleteUserClick = (user) => {
    setUserToDelete(user);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setNotification({ message: null, type: null });
    try {
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete user.');
      }

      setNotification({ message: data.message || 'User deleted successfully!', type: 'success' });
      setUserToDelete(null); // Close confirmation modal
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error deleting user:', error);
      setNotification({ message: error.message || 'An error occurred while deleting the user.', type: 'error' });
    }
  };

  // Ensure only admin can access this page
  if (!user || user.role !== 'admin') {
    navigate('/dashboard'); // Redirect unauthorized users
    return null;
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen bg-gray-100'>
        <div className='text-xl text-gray-700'>Loading users...</div>
      </div>
    );
  }

  return (
    <motion.div
      className='min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8'
      initial='hidden'
      animate='visible'
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
      }}
    >
      <Notification message={notification.message} type={notification.type} onClose={handleNotificationClose} />

      <motion.h1
        className='text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 sm:mb-8 text-center'
        variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
      >
        User Management
      </motion.h1>

      <div className='flex flex-col sm:flex-row justify-between items-center mb-6 gap-4'>
        <div className='w-full sm:w-auto flex flex-col sm:flex-row gap-3'>
          <select
            name="roleFilter"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
          >
            <option value="">All Roles</option>
            {roles.map(role => (
              <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
            ))}
          </select>
          <button
            onClick={handleAddUserClick}
            className='w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out'
          >
            Add New User
          </button>
        </div>
      </div>

      <div className='bg-white rounded-xl shadow-lg overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Username</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Name</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Role</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Email</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Phone</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Actions</th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {users.length > 0 ? (
                users.map((u) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className='hover:bg-gray-50'
                  >
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>{u.username}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>{u.first_name} {u.last_name}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>{u.role}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>{u.email}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700'>{u.phone_number}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      <button
                        onClick={() => handleEditUserClick(u)}
                        className='text-blue-600 hover:text-blue-900 mr-3'
                        title='Edit User'
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUserClick(u)}
                        className='text-red-600 hover:text-red-900'
                        title='Delete User'
                      >
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan='6' className='px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500'>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Form Modal */}
      <Modal
        isOpen={showUserFormModal}
        onClose={() => { setShowUserFormModal(false); setEditingUser(null); resetFormData(); setNotification({ message: null, type: null }); }}
        title={editingUser ? 'Edit User' : 'Add New User'}
      >
        <form onSubmit={handleSubmitUserForm} className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='col-span-1'>
            <label htmlFor='username' className='block text-sm font-medium text-gray-700 mb-1'>Username</label>
            <input
              type='text'
              id='username'
              name='username'
              value={formData.username}
              onChange={handleInputChange}
              required
              className='w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 transition duration-200 ease-in-out'
            />
          </div>
          <div className='col-span-1'>
            <label htmlFor='role' className='block text-sm font-medium text-gray-700 mb-1'>Role</label>
            <select
              id='role'
              name='role'
              value={formData.role}
              onChange={handleInputChange}
              required
              className='w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 transition duration-200 ease-in-out'
            >
              {roles.map(role => (
                <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className='col-span-1'>
            <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-1'>
              {editingUser ? 'New Password (optional)' : 'Password'}
            </label>
            <input
              type='password'
              id='password'
              name='password'
              value={formData.password}
              onChange={handleInputChange}
              required={!editingUser} // Required only for new users
              className='w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 transition duration-200 ease-in-out'
            />
          </div>
          <div className='col-span-1'>
            <label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-700 mb-1'>
              {editingUser ? 'Confirm New Password' : 'Confirm Password'}
            </label>
            <input
              type='password'
              id='confirmPassword'
              name='confirmPassword'
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required={!editingUser} // Required only for new users
              className='w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 transition duration-200 ease-in-out'
            />
          </div>
          <div className='col-span-1'>
            <label htmlFor='first_name' className='block text-sm font-medium text-gray-700 mb-1'>First Name</label>
            <input
              type='text'
              id='first_name'
              name='first_name'
              value={formData.first_name}
              onChange={handleInputChange}
              className='w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 transition duration-200 ease-in-out'
            />
          </div>
          <div className='col-span-1'>
            <label htmlFor='last_name' className='block text-sm font-medium text-gray-700 mb-1'>Last Name</label>
            <input
              type='text'
              id='last_name'
              name='last_name'
              value={formData.last_name}
              onChange={handleInputChange}
              className='w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 transition duration-200 ease-in-out'
            />
          </div>
          <div className='col-span-1'>
            <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
            <input
              type='email'
              id='email'
              name='email'
              value={formData.email}
              onChange={handleInputChange}
              className='w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 transition duration-200 ease-in-out'
            />
          </div>
          <div className='col-span-1'>
            <label htmlFor='phone_number' className='block text-sm font-medium text-gray-700 mb-1'>Phone Number</label>
            <input
              type='text'
              id='phone_number'
              name='phone_number'
              value={formData.phone_number}
              onChange={handleInputChange}
              className='w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 transition duration-200 ease-in-out'
            />
          </div>
          <div className='col-span-1'>
            <label htmlFor='address' className='block text-sm font-medium text-gray-700 mb-1'>Address</label>
            <input
              type='text'
              id='address'
              name='address'
              value={formData.address}
              onChange={handleInputChange}
              className='w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 transition duration-200 ease-in-out'
            />
          </div>
          <div className='col-span-1'>
            <label htmlFor='date_of_birth' className='block text-sm font-medium text-gray-700 mb-1'>Date of Birth</label>
            <input
              type='date'
              id='date_of_birth'
              name='date_of_birth'
              value={formData.date_of_birth}
              onChange={handleInputChange}
              className='w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 transition duration-200 ease-in-out'
            />
          </div>
          <div className='col-span-1'>
            <label htmlFor='gender' className='block text-sm font-medium text-gray-700 mb-1'>Gender</label>
            <select
              id='gender'
              name='gender'
              value={formData.gender}
              onChange={handleInputChange}
              className='w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 transition duration-200 ease-in-out'
            >
              <option value=''>Select Gender</option>
              <option value='Male'>Male</option>
              <option value='Female'>Female</option>
              <option value='Other'>Other</option>
            </select>
          </div>

          <div className='col-span-1 md:col-span-2 flex justify-end items-center gap-4 mt-4'>
            <button
              type='button'
              onClick={() => { setShowUserFormModal(false); setEditingUser(null); resetFormData(); setNotification({ message: null, type: null }); }}
              className='bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300'
            >
              {editingUser ? 'Update User' : 'Add User'}
            </button>
          </div>
        </form>
      </Modal>

      <DeleteConfirmationModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={confirmDelete}
        userName={userToDelete ? userToDelete.username : ''}
      />
    </motion.div>
  );
}

export default UsersManagementPage;
