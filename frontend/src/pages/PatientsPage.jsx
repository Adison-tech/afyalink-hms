import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function PatientsPage() {
  const { token, isAuthenticated, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddPatientForm, setShowAddPatientForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);

  // State for new/edited patient form
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    national_id: '',
    contact_phone: '',
    email: '',
    address: ''
  });

  // Fetch patients when component mounts or token changes
  useEffect(() => {
    console.log('PatientsPage useEffect - isAuthenticated:', isAuthenticated);
    console.log('PatientsPage useEffect - token:', token);
    console.log('PatientsPage useEffect - authLoading:', authLoading);

    // Only attempt to fetch if authcontext has finished loading and user is authenticated and token is present
    if (isAuthenticated && token) {
      console.log('PatientsPage useEffect: Auth context loaded, user authenticated. Fetching patients.');
      fetchPatients();
    } else {
      //    If not authenticated (and authLoading is false), navigate to login.
      console.log('PatientsPage useEffect: Auth context loaded, user NOT authenticated. Navigating to login.');
      navigate('/login');
    }
  }, [isAuthenticated, token, authLoading, navigate]);

  const fetchPatients = async () => {
    setLoading(true);
    setError(null);

    try {
      const headersToSend = { // <--- ADD THIS BLOCK
        'Authorization': `Bearer ${token}`
      };
      console.log('Sending headers:', headersToSend); // <--- ADD 

      const response = await fetch('/api/patients', {
        headers: headersToSend // <--- USE THE headersToSend VARIABLE HERE
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to fetch patients.');
      }
      const data = await response.json();
      setPatients(data);

    } catch (err) {
      console.error('Error fetching patients.');
      setError(err.message || 'Failed to load patients.');

    }finally {
      setLoading(false);
    }
  };
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Client side validation
    if (!formData.first_name || !formData.last_name || !formData.date_of_birth || !formData.gender || !formData.contact_phone) {
      setError('Please fill in all required fields: First Name, Last Name, Date of Birth, Gender, Contact Phone.');
      return;
    }

    try {
      const url = editingPatient ? `/api/patients/${editingPatient.id}` : '/api/patients';
      const method = editingPatient ? 'PUT' : 'POST';

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
        throw new Error(errData.message || `Failed to ${editingPatient ? 'update' : 'add'} patient.`);
      }
      // If successful, refetch patients to update the list
      await fetchPatients();
      setShowAddPatientForm(false);
      setEditingPatient(null);
      // Reset form data
      setFormData({
        first_name: '', last_name: '', date_of_birth: '', gender: '',
        national_id: '', contact_phone: '', email: '', address: ''
      });

    } catch (err) {
      console.error(`Error ${editingPatient ? 'updating' : 'adding'} patient:`, err);
      setError(err.message || `An error occured while ${editingPatient ? 'updating' : 'adding'} the patient.`);
    }
  };

  const handleDeletePatient = async (patientId) => {
    if (!window.confirm('Are you sure you want to delete this patient record? This action cannot be undone.')) {
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to delete patient.');
      }
      await fetchPatients();
      alert('Patient deleted successfully!');

    } catch (err) {
      console.error('Error deleting patient:', err);
      setError(err.message || 'Failed to delete patient.');

    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (patient) => {
    setEditingPatient(patient);
    setFormData({
      first_name: patient.first_name,
      last_name: patient.last_name,
      date_of_birth: patient.date_of_birth.split('T')[0],
      gender: patient.gender,
      national_id: patient.national_id || '',
      contact_phone: patient.contact_phone,
      email: patient.email || '',
      address: patient.address || ''
    });
    setShowAddPatientForm(true);
  };

  // Check if logged in user has permission to create/update/delete patients
  const canManagePatients = user && (user.role === 'admin' || user.role === 'receptionist');
  // Check if logged in user has permission to view clinical notes
  const canViewClinicalNotes = user && (user.role === 'admin' || user.role === 'doctor' || user.role === 'nurse');
  
  if (authLoading) return <div className='p-6 text-center text-lg'>Loading authentication...</div>
  if (loading) return <div className='p-6 text-center text-lg'>Loading patients...</div>;
  if (error) return <div className='p-6 text-center text-lg text-red-600'>Error: {error}</div>;
  if (!isAuthenticated) return <div className='p-6 text-center text-lg'>Redirecting to login...</div>;

  return (
    <div className='p-6 bg-gray-50 min-h-[calc(100vh-64px)]'>
      <h2 className='text-3xl font-bold text-gray-800 mb-6 border-b pb-2'>Patient Management</h2>

      {canManagePatients && (
        <button onClick={() => {
          setShowAddPatientForm(!showAddPatientForm);
          setEditingPatient(null);
          setFormData({
            first_name: '', last_name: '', date_of_birth: '', gender: '',
            national_id: '', contact_phone: '', email: '', address: ''
          });
        }}
        className='bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow transition duration-300 mb-6'>
          {showAddPatientForm ? 'Cancel' : 'Add New Patient'}
        </button>
      )}

      {showAddPatientForm && (
        <div className='bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200'>
          <h3 className='text-2xl font-semibold text-gray-700 mb-4'>{editingPatient ? 'Edit Patient' : 'Add New Patient'}</h3>
          <form onSubmit={handleAddSubmit} className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4'>
            <div>
              <label htmlFor='firstname' className='block text-gray-700 text-sm font-medium mb-1'>First Name:</label>
              <input 
                type='text'
                id='firstname'
                name='first_name'
                value={formData.first_name}
                onChange={handleChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
            <div>
              <label htmlFor='lastname' className='block text-gray-700 text-sm font-medium mb-1'>Last Name:</label>
              <input
                type='text'
                id='lastname'
                name='last_name'
                value={formData.last_name}
                onChange={handleChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
            <div>
              <label htmlFor='dob' className='block text-gray-700 text-sm font-medium mb-1'>Date of Birth:</label>
              <input
                type='date' 
                id='dob'
                name='date_of_birth'
                value={formData.date_of_birth}
                onChange={handleChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
            <div>
              <label htmlFor='gender' className='block text-gray-700 text-sm font-medium mb-1'>Gender:</label>
                <select
                  id='gender'
                  name='gender'
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
                >
                  <option value="">Select Gender</option>
                  <option value='Male'>Male</option>
                  <option value='Female'>Female</option>
                  <option value='Other'>Other</option>
                </select>
            </div>
            <div>
              <label htmlFor='nationalId' className='block text-gray-700 text-sm font-medium mb-1'>National ID:</label>
              <input
                type='text'
                id='nationalId'
                name='national_id'
                value={formData.national_id}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
            <div>
              <label htmlFor='contactPhone' className='block text-gray-700 text-sm font-medium mb-1'>Contact Phone:</label>
              <input
                id='contactPhone'
                type='text'
                name='contact_phone'
                value={formData.contact_phone}
                onChange={handleChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'/
              >
            </div>
            <div>
              <label htmlFor='email' className='block text-gray-700 text-sm font-medium mb-1'>Email:</label>
              <input
                type='email'
                id='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
            <div className='col-span-1 md:col-span-2'>
              <label htmlFor='adddress' className='block text-gray-700 text-sm font-medium mb-1'>Address:</label>
              <textarea
                id='address'
                name='address'
                value={formData.address}
                onChange={handleChange}
                rows='3'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              ></textarea>
            </div>
            <div className='col-span-1 md:col-span-2 flex justify-end items-center gap-4 mt-4'>
              <button
                type='submit'
                className='bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition duration-300'
              >
                {editingPatient ? 'Update Patient' : 'Add Patient'}
              </button>
              {error && <p className='text-red-600 text-sm ml-4'>{error}</p>}
            </div>
          </form>
        </div>
      )}

      <h3 className='text-2xl font-semibold text-gray-700 mb-4 mt-8 border-b pb-2'>Current Patients</h3>
      {patients.length === 0 ? (
        <p className='text-gray-600'>No patients registered yet.</p>
      ) : (
        <div className='overflow-x-auto rounded-lg shadow-md border border-gray-200'>
          <table className='min-w-full divide-y divide-gray-200 bg-white'>
          <thead className='bg-gray-50'>
            <tr>
              <th scope='col'className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DOB</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">National ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phones</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {patients.map(patient => (
              <tr key={patient.id} className='hover:bg-gray-50'>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patient.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{patient.first_name} {patient.last_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{patient.date_of_birth.split('T')[0]}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{patient.gender}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{patient.national_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{patient.contact_phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                  {canManagePatients && (
                    <>
                    <button
                      onClick={() => handleEditClick(patient)}
                      className='text-indigo-600 hover:text-indigo-900 px-3 py-1 border border-indigo-600 rounded-md hover:bg-indigo-50 transition duration-300'
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePatient(patient.id)} className='text-red-600 hover:text-red-900 px-3 py-1 border border-red-600 rounded-md hover:bg-red-50 transition duration-300'
                    >
                      Delete
                    </button>
                    </>
                  )}
                  {canViewClinicalNotes && (
                    <button
                      onClick={() => navigate(`/patients/${patient.id}/notes`)}
                      className='text-blue-600 hover:text-blue-900 px-3 py-1 border border-blue-600 rounded-md hover:bg-blue-50 transition duration-300'
                      >
                        View Notes
                      </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}

export default PatientsPage;