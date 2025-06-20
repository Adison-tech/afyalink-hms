import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function PatientsPage() {
  const { token, isAuthenticated, user } = useAuth();
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
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchPatients();
  }, [isAuthenticated, token, navigate]);

  const fetchPatients = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/patients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
      const url = editingPatient ? `/patients/${editingPatient.id}` : '/patients';
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
      const response = await fetch(`/patients/${patientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer #{token}`
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

  if (loading) return <div>Loading patients...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (!isAuthenticated) return <div>Redirecting to login...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Patient Management</h2>

      {canManagePatients && (
        <button onClick={() => {
          setShowAddPatientForm(!showAddPatientForm);
          setEditingPatient(null);
          setFormData({
            first_name: '', last_name: '', date_of_birth: '', gender: '',
            national_id: '', contact_phone: '', email: '', address: ''
          });
        }}>
          {showAddPatientForm ? 'Cancel' : 'Add New Patient'}
        </button>
      )}

      {showAddPatientForm && (
        <div style={{ border: '1px solid #ccc', padding: '15px', marginTop: '20px', borderRadius: '8px' }}>
          <h3>{editingPatient ? 'Edit Patient' : 'Add New Patient'}</h3>
          <form onSubmit={handleAddSubmit}>
            <div style={{ marginBottom: '10px' }}>
              <label>First Name: <input type='text' name='first_name' value={formData.first_name} onChange={handleChange} required /></label>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Last Name: <input type='text' name='last_name' value={formData.last_name} onChange={handleChange} required /></label>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Date of Birth: <input type='date' name='date_of_birth' value={formData.date_of_birth} onChange={handleChange} required /></label>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Gender:
                <select name='gender' value={formData.gender} onChange={handleChange} required>
                  <option value="">Select Gender</option>
                  <option value='Male'>Male</option>
                  <option value='Female'>Female</option>
                  <option value='Other'>Other</option>
                </select>
              </label>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>National ID: <input type='text' name='national_id' value={formData.national_id} onChange={handleChange} /></label>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Contact Phone: <input type='text' name='contact_phone' value={formData.contact_phone} onChange={handleChange} required /></label>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Email: <input type='email' name='email' value={formData.email} onChange={handleChange} /></label>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Address: <textarea name='address' value={formData.address} onChange={handleChange}></textarea></label>
            </div>
            <button type='submit'>{editingPatient ? 'Update Patient' : 'Add Patient'}</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
          </form>
        </div>
      )}

      <h3 style={{ marginTop: '30px' }}>Current Patients</h3>
      {patients.length === 0 ? (
        <p>No patients registered yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ background: '#f2f2f2' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>ID</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>DOB</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Gender</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>National ID</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Phones</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map(patient => (
              <tr key={patient.id}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{patient.id}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{patient.first_name} {patient.last_name}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{patient.date_of_birth.split('T')[0]}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{patient.gender}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{patient.national_id}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{patient.contact_phone}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {canManagePatients && (
                    <>
                    <button onClick={() => handleEditClick(patient)} style={{ marginRight: '5px', background: '#4CAF50', colo: 'white', border: 'none', padding: '8px 12px', cursor: 'pointer', borderRadius: '4px' }}>Edit</button>
                    <button onClick={() => handleDeletePatient(patient.id)} style={{ background: '#f44336', color: 'white', border: 'none', padding: '8px 12px', cursor: 'pointer', borderRadius: '4px' }}>Delete</button>
                    </>
                  )}
                  {canViewClinicalNotes && (
                    <button onClick={() => navigate(`/patients/${patient.id}/notes`)} style={{ marginLeft: '5px', background: '#008CBA', color: 'white', border: 'none', padding: '8px 12px', cursor: 'pointer', borderRadius: '4px' }}>View Notes</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PatientsPage;