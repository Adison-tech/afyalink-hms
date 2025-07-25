// frontend/src/pages/ClinicalNotesPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';

// --- Reusable Notification Component (already refined) ---
const Notification = ({ message, type, onClose }) => {
  if (!message) return null;

  const bgColor = type === 'success' ? 'bg-green-100' : 'bg-red-100';
  const borderColor = type === 'success' ? 'border-green-400' : 'border-red-400';
  const textColor = type === 'success' ? 'text-green-700' : 'text-red-700';
  const iconColor = type === 'success' ? 'text-green-500' : 'text-red-500';

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 
                  ${bgColor} ${borderColor} ${textColor} border-l-4 transform transition-all duration-300 ease-out`}
      role="alert"
    >
      <div className={`flex-shrink-0 ${iconColor}`}>
        {type === 'success' ? (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        ) : (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2A9 9 0 111 10a9 9 0 0118 0z"></path></svg>
        )}
      </div>
      <span className="font-medium flex-grow">{message}</span>
      <button onClick={onClose} className={`ml-auto ${iconColor} hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-md p-1`}>
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </div>
  );
};

// --- Simple Modal Component (already refined with max-height and overflow) ---
const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl transform transition-all sm:my-8 sm:align-middle sm:w-full animate-scale-up">
        <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50">
          <h3 className="text-2xl font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-md p-1"
            aria-label="Close modal"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto"> {/* Added max-height and overflow-y-auto */}
          {children}
        </div>
      </div>
    </div>
  );
};


function ClinicalNotesPage() {
  const { token, isAuthenticated, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { patientId: patientIdFromUrl } = useParams();

  const [selectedPatientId, setSelectedPatientId] = useState(patientIdFromUrl || '');
  const [patient, setPatient] = useState(null);
  const [clinicalNotes, setClinicalNotes] = useState([]);
  const [patientsList, setPatientsList] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [notification, setNotification] = useState({ message: null, type: null });

  // State to manage expanded notes
  const [expandedNotes, setExpandedNotes] = useState({});

  const toggleNoteExpansion = (noteId) => {
    setExpandedNotes(prev => ({
      ...prev,
      [noteId]: !prev[noteId]
    }));
  };


  const showNotification = useCallback((message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: null, type: null });
    }, 5000);
  }, []);

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    visit_datetime: '',
    chief_complaint: '',
    diagnosis: '',
    medications_prescribed: '',
    vitals: '',
    notes: ''
  });

  // Effect to pre-fill form date/time when modal is opened for new note
  useEffect(() => {
    if (showNoteModal && !editingNote) { // Only for adding new note
      resetFormData();
    }
  }, [showNoteModal, editingNote]);

  // Fetch patients for dropdown
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !token) {
      navigate('/login');
      return;
    }

    const fetchPatients = async () => {
      try {
        const patientsRes = await fetch('/api/patients', { headers: { 'Authorization': `Bearer ${token}` } });
        if (!patientsRes.ok) throw new Error('Failed to fetch patients.');
        const patientsData = await patientsRes.json();
        setPatientsList(patientsData);
      } catch (err) {
        console.error('Error fetching patients for dropdown:', err);
        showNotification(err.message || 'Failed to load patient list.', 'error');
      } finally {
        if (!patientIdFromUrl) {
            setPageLoading(false);
        }
      }
    };
    fetchPatients();
  }, [isAuthenticated, token, authLoading, navigate, showNotification, patientIdFromUrl]);


  // Effect to fetch patient details and clinical notes when selectedPatientId changes
  useEffect(() => {
    if (!token || !selectedPatientId) {
      setPatient(null);
      setClinicalNotes([]);
      if (!patientIdFromUrl || !selectedPatientId) {
         setPageLoading(false);
      }
      return;
    }

    const fetchPatientAndNotes = async () => {
      setPageLoading(true);
      setNotification({ message: null, type: null });
      try {
        // Fetch patient details
        const patientRes = await fetch(`/api/patients/${selectedPatientId}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!patientRes.ok) {
          const errorData = await patientRes.json();
          throw new Error(errorData.message || 'Patient not found.');
        }
        const patientData = await patientRes.json();
        setPatient(patientData);

        // Fetch clinical notes for the selected patient
        const notesRes = await fetch(`/api/clinical-notes/patient/${selectedPatientId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!notesRes.ok) {
          const errorData = await notesRes.json();
          throw new Error(errorData.message || 'Failed to fetch clinical notes.');
        }
        const notesData = await notesRes.json();
        setClinicalNotes(notesData);

      } catch (err) {
        console.error('Error fetching patient details or notes:', err);
        showNotification(err.message || 'Failed to load patient data or clinical notes.', 'error');
        setPatient(null);
        setClinicalNotes([]);
      } finally {
        setPageLoading(false);
      }
    };

    fetchPatientAndNotes();
  }, [token, selectedPatientId, showNotification, patientIdFromUrl]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetFormData = () => {
    const now = new Date();
    // Adjust for local timezone to ensure `datetime-local` input displays correctly
    const formattedDateTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);

    setFormData({
      visit_datetime: formattedDateTime,
      chief_complaint: '',
      diagnosis: '',
      medications_prescribed: '',
      vitals: '',
      notes: ''
    });
  };

  const handleAddEditSubmit = async (e) => {
    e.preventDefault();
    setNotification({ message: null, type: null });

    if (!formData.chief_complaint || !formData.notes || !formData.visit_datetime) {
      showNotification('Chief Complaint, Clinical Notes (Detailed), and Visit Date/Time are required.', 'error');
      return;
    }

    try {
      const payload = {
        patient_id: parseInt(selectedPatientId),
        visit_datetime: formData.visit_datetime,
        chief_complaint: formData.chief_complaint,
        diagnosis: formData.diagnosis,
        medications_prescribed: formData.medications_prescribed,
        vitals: formData.vitals,
        notes: formData.notes,
      };

      const url = editingNote
        ? `/api/clinical-notes/${editingNote.id}`
        : '/api/clinical-notes';
      const method = editingNote ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `Failed to ${editingNote ? 'update' : 'add'} clinical note.`);
      }

      // Re-fetch notes after successful operation
      const updatedNotesRes = await fetch(`/api/clinical-notes/patient/${selectedPatientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!updatedNotesRes.ok) {
        showNotification(`Note ${editingNote ? 'updated' : 'added'} successfully, but failed to refresh notes.`, 'warning');
        console.error("Failed to re-fetch clinical notes after successful operation:", updatedNotesRes);
      } else {
        const updatedNotesData = await updatedNotesRes.json();
        setClinicalNotes(updatedNotesData);
        showNotification(`Clinical note ${editingNote ? 'updated' : 'added'} successfully!`, 'success');
      }
      setShowNoteModal(false);
      setEditingNote(null);
      resetFormData();
    } catch (err) {
      console.error(`Error ${editingNote ? 'updating' : 'adding'} clinical note:`, err);
      showNotification(err.message || `An error occurred while ${editingNote ? 'updating' : 'adding'} the note.`, 'error');
    }
  };

  const handleEditClick = (note) => {
    setEditingNote(note);
    // Ensure date format is compatible with datetime-local input
    const visitDateTime = note.visit_datetime ? new Date(note.visit_datetime) : new Date();
    const formattedDateTime = new Date(visitDateTime.getTime() - (visitDateTime.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    setFormData({
      visit_datetime: formattedDateTime,
      chief_complaint: note.chief_complaint || '',
      diagnosis: note.diagnosis || '',
      medications_prescribed: note.medications_prescribed || '',
      vitals: note.vitals || '',
      notes: note.notes || ''
    });
    setShowNoteModal(true);
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this clinical note? This action cannot be undone.')) {
      return;
    }
    setPageLoading(true);
    setNotification({ message: null, type: null });
    try {
      const response = await fetch(`/api/clinical-notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to delete clinical note.');
      }
      setClinicalNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
      showNotification('Clinical note deleted successfully!', 'success');
    } catch (err) {
      console.error('Error deleting clinical note:', err);
      showNotification(err.message || 'An error occurred while deleting the note.', 'error');
    } finally {
      setPageLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return dateString; // Return original if formatting fails
    }
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (authLoading || pageLoading) {
    return (
      <div className='flex flex-col justify-center items-center h-screen bg-gray-100 text-gray-700'>
        <svg className="animate-spin h-10 w-10 text-blue-600 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <div className='text-xl'>Loading clinical notes page...</div>
      </div>
    );
  }

  // Determine if the current user can add/edit/delete notes (e.g., doctor, admin)
  const canManageNotes = user && (user.role === 'admin' || user.role === 'doctor' || user.role === 'nurse');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ message: null, type: null })} />

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 sm:mb-0">Clinical Notes</h1>
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <label htmlFor="patient-select" className="sr-only">Select Patient</label>
          <div className="relative w-full sm:w-auto">
            <select
              id="patient-select"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full sm:w-auto px-5 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 transition duration-200 ease-in-out bg-white appearance-none pr-10 cursor-pointer"
              aria-label="Select Patient"
            >
              <option value="">-- Select a Patient --</option>
              {patientsList.map(p => (
                <option key={p.id} value={p.id}>{p.first_name} {p.last_name} (ID: {p.id})</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z"/></svg>
            </div>
          </div>

          {canManageNotes && (
            <button
              onClick={() => {
                if (!selectedPatientId) {
                  showNotification('Please select a patient first to add a clinical note.', 'error');
                  return;
                }
                setEditingNote(null);
                setShowNoteModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:scale-105 whitespace-nowrap w-full sm:w-auto"
            >
              <svg className="inline-block h-5 w-5 mr-2 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Add New Note
            </button>
          )}
        </div>
      </header>

      {selectedPatientId && patient && (
        <section className="bg-white rounded-lg shadow-md p-6 mb-8 border-l-4 border-blue-500">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center">
            <svg className="h-8 w-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Patient: {patient.first_name} {patient.last_name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-700">
            <p><strong>Date of Birth:</strong> {patient.date_of_birth}</p>
            <p><strong>Gender:</strong> {patient.gender}</p>
            <p><strong>Contact:</strong> {patient.phone_number}</p>
            <p className="md:col-span-2 lg:col-span-3"><strong>Address:</strong> {patient.address}</p>
          </div>
        </section>
      )}

      {selectedPatientId && !patient && !pageLoading && (
        <div className="text-center bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-6 rounded-md shadow-md animate-fade-in">
          <svg className="mx-auto h-12 w-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          <h3 className="mt-2 text-xl font-semibold">Patient Not Found</h3>
          <p className="mt-1 text-gray-600">The selected patient could not be loaded or does not exist.</p>
        </div>
      )}

      {selectedPatientId && patient && clinicalNotes.length > 0 && (
        <section className="grid grid-cols-1 gap-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Clinical Notes History</h2>
          {clinicalNotes.sort((a, b) => new Date(b.visit_datetime) - new Date(a.visit_datetime)).map(note => (
            <div key={note.id} className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-green-500 hover:shadow-xl transition-shadow duration-300 animate-fade-in-up">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Visit Date: {formatDate(note.visit_datetime)}</h3>
                  {note.created_at && (
                    <p className="text-sm text-gray-500">Created: {formatDate(note.created_at)} {note.created_by && `by ${note.created_by}`}</p>
                  )}
                  {note.updated_at && note.updated_at !== note.created_at && (
                    <p className="text-sm text-gray-500">Last Updated: {formatDate(note.updated_at)}</p>
                  )}
                </div>
                {canManageNotes && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditClick(note)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                      title="Edit Note"
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
                      title="Delete Note"
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      Delete
                    </button>
                  </div>
                )}
              </div>
              
              {/* Collapsible content for note details */}
              <div className="space-y-3 text-gray-700">
                <p>
                  <strong>Chief Complaint:</strong>{' '}
                  {expandedNotes[note.id] || (note.chief_complaint && note.chief_complaint.length < 150) ? note.chief_complaint : truncateText(note.chief_complaint)}
                  {note.chief_complaint && note.chief_complaint.length >= 150 && (
                    <button onClick={() => toggleNoteExpansion(note.id)} className="text-blue-500 hover:underline ml-2 text-sm focus:outline-none">
                      {expandedNotes[note.id] ? 'Show Less' : 'Show More'}
                    </button>
                  )}
                </p>

                {note.diagnosis && (
                  <p>
                    <strong>Diagnosis:</strong>{' '}
                    {expandedNotes[note.id] || (note.diagnosis && note.diagnosis.length < 150) ? note.diagnosis : truncateText(note.diagnosis)}
                    {note.diagnosis && note.diagnosis.length >= 150 && (
                      <button onClick={() => toggleNoteExpansion(note.id)} className="text-blue-500 hover:underline ml-2 text-sm focus:outline-none">
                        {expandedNotes[note.id] ? 'Show Less' : 'Show More'}
                      </button>
                    )}
                  </p>
                )}
                {note.vitals && (
                  <p>
                    <strong>Vitals:</strong>{' '}
                    {expandedNotes[note.id] || (note.vitals && note.vitals.length < 150) ? note.vitals : truncateText(note.vitals)}
                    {note.vitals && note.vitals.length >= 150 && (
                      <button onClick={() => toggleNoteExpansion(note.id)} className="text-blue-500 hover:underline ml-2 text-sm focus:outline-none">
                        {expandedNotes[note.id] ? 'Show Less' : 'Show More'}
                      </button>
                    )}
                  </p>
                )}
                {note.medications_prescribed && (
                  <p>
                    <strong>Medications Prescribed:</strong>{' '}
                    {expandedNotes[note.id] || (note.medications_prescribed && note.medications_prescribed.length < 150) ? note.medications_prescribed : truncateText(note.medications_prescribed)}
                    {note.medications_prescribed && note.medications_prescribed.length >= 150 && (
                      <button onClick={() => toggleNoteExpansion(note.id)} className="text-blue-500 hover:underline ml-2 text-sm focus:outline-none">
                        {expandedNotes[note.id] ? 'Show Less' : 'Show More'}
                      </button>
                    )}
                  </p>
                )}
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 shadow-inner">
                  <p>
                    <strong>Clinical Notes (Detailed):</strong> <br/>
                    {expandedNotes[note.id] || (note.notes && note.notes.length < 200) ? note.notes : truncateText(note.notes, 200)}
                    {note.notes && note.notes.length >= 200 && (
                      <button onClick={() => toggleNoteExpansion(note.id)} className="text-blue-500 hover:underline ml-2 text-sm focus:outline-none">
                        {expandedNotes[note.id] ? 'Show Less' : 'Show More'}
                      </button>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {selectedPatientId && patient && clinicalNotes.length === 0 && !pageLoading && (
        <div className="text-center bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-6 rounded-md shadow-md animate-fade-in">
          <svg className="mx-auto h-12 w-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          <h3 className="mt-2 text-xl font-semibold">No Clinical Notes Found</h3>
          <p className="mt-1 text-gray-600">There are no clinical notes for {patient.first_name} {patient.last_name} yet.</p>
          {canManageNotes && (
            <button
              onClick={() => {
                setEditingNote(null);
                setShowNoteModal(true);
              }}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
            >
              <svg className="inline-block h-5 w-5 mr-2 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Add the First Note
            </button>
          )}
        </div>
      )}

      {!selectedPatientId && !pageLoading && (
        <div className="text-center bg-gray-50 border-l-4 border-gray-300 text-gray-700 p-6 rounded-md shadow-md animate-fade-in">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
          <h3 className="mt-2 text-xl font-semibold">Select a Patient to Begin</h3>
          <p className="mt-1 text-gray-600">Please choose a patient from the dropdown menu above to view or add clinical notes.</p>
        </div>
      )}

      <Modal
        isOpen={showNoteModal}
        onClose={() => { setShowNoteModal(false); setEditingNote(null); resetFormData(); setNotification({ message: null, type: null }); }}
        title={editingNote ? 'Edit Clinical Note' : 'Add New Clinical Note'}
      >
        <form onSubmit={handleAddEditSubmit} className="space-y-6">
          {/* Section: Visit Details */}
          <fieldset className="border border-gray-200 p-4 rounded-lg shadow-sm">
            <legend className="text-lg font-semibold text-gray-800 px-2">Visit Details</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label htmlFor='visit_datetime' className='block text-gray-700 text-sm font-medium mb-1'>Visit Date & Time: <span className="text-red-500">*</span></label>
                <input
                  type='datetime-local'
                  id='visit_datetime'
                  name='visit_datetime'
                  value={formData.visit_datetime}
                  onChange={handleInputChange}
                  required
                  className='w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 transition duration-200 ease-in-out'
                />
              </div>
              <div>
                <label htmlFor='chief_complaint' className='block text-gray-700 text-sm font-medium mb-1'>Chief Complaint: <span className="text-red-500">*</span></label>
                <input
                  type='text'
                  id='chief_complaint'
                  name='chief_complaint'
                  value={formData.chief_complaint}
                  onChange={handleInputChange}
                  required
                  className='w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 transition duration-200 ease-in-out'
                  placeholder="e.g., Headache, Fever, Abdominal Pain"
                />
              </div>
            </div>
          </fieldset>

          {/* Section: Clinical Findings */}
          <fieldset className="border border-gray-200 p-4 rounded-lg shadow-sm">
            <legend className="text-lg font-semibold text-gray-800 px-2">Clinical Findings</legend>
            <div className="grid grid-cols-1 gap-6 mt-4">
              <div>
                <label htmlFor='vitals' className='block text-gray-700 text-sm font-medium mb-1'>Vitals:</label>
                <textarea
                  id='vitals'
                  name='vitals'
                  value={formData.vitals}
                  onChange={handleInputChange}
                  rows='3'
                  className='w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 transition duration-200 ease-in-out'
                  placeholder="e.g., BP: 120/80, HR: 72, Temp: 98.6°F, SpO2: 99%"
                ></textarea>
              </div>
              <div>
                <label htmlFor='diagnosis' className='block text-gray-700 text-sm font-medium mb-1'>Diagnosis:</label>
                <textarea
                  id='diagnosis'
                  name='diagnosis'
                  value={formData.diagnosis}
                  onChange={handleInputChange}
                  rows='4'
                  className='w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 transition duration-200 ease-in-out'
                  placeholder="e.g., Acute Viral Rhinitis, Hypertension Stage 1, Type 2 Diabetes"
                ></textarea>
              </div>
            </div>
          </fieldset>

          {/* Section: Treatment & Notes */}
          <fieldset className="border border-gray-200 p-4 rounded-lg shadow-sm">
            <legend className="text-lg font-semibold text-gray-800 px-2">Treatment & Detailed Notes</legend>
            <div className="grid grid-cols-1 gap-6 mt-4">
              <div>
                <label htmlFor='medications_prescribed' className='block text-gray-700 text-sm font-medium mb-1'>Medications Prescribed:</label>
                <textarea
                  id='medications_prescribed'
                  name='medications_prescribed'
                  value={formData.medications_prescribed}
                  onChange={handleInputChange}
                  rows='4'
                  className='w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 transition duration-200 ease-in-out'
                  placeholder="e.g., Amoxicillin 500mg TID for 7 days; Paracetamol 500mg PRN for fever"
                ></textarea>
              </div>
              <div>
                <label htmlFor='notes' className='block text-gray-700 text-sm font-medium mb-1'>Clinical Notes (Detailed): <span className="text-red-500">*</span></label>
                <textarea
                  id='notes'
                  name='notes'
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows='8'
                  required
                  className='w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 transition duration-200 ease-in-out'
                  placeholder="Detailed findings, physical exam, progress notes, treatment plan, follow-up instructions, etc."
                ></textarea>
              </div>
            </div>
          </fieldset>

          <div className='flex justify-end items-center gap-4 mt-6'>
            <button
              type='button'
              onClick={() => { setShowNoteModal(false); setEditingNote(null); resetFormData(); setNotification({ message: null, type: null }); }}
              className='bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out'
            >
              {editingNote ? 'Update Note' : 'Add Note'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ClinicalNotesPage;