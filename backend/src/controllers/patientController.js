// backend/src/controllers/patientController.js

const pool = require('../config/db');

// --- Create new patient ---
exports.createPatient = async (req, res) => {
  const { first_name, last_name, date_of_birth, gender, national_id, contact_phone, email, address } = req.body;

  // Basic validation
  if (!first_name || !last_name || !date_of_birth || !gender || !contact_phone) {
    return res.status(400).json({ message: 'Missing required patient fields: first name, last name, date of birth, gender, contact phone.' });
  }

  try {
    // Check if provide national_id already exists
    if (national_id) {
      const existingPatient = await pool.query(
        'SELECT id FROM patients WHERE national_id = $1', [national_id]
      );
      if (existingPatient.rows.length > 0) {
        return res.status(409).json({ message: 'Patient with this national ID already exists' });
      }
    }
    const newPatient = await pool.query(
      'INSERT INTO patients (first_name, last_name, date_of_birth, gender, national_id, contact_phone, email, address) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *', [first_name, last_name, date_of_birth, gender, national_id, contact_phone, email, address]
    );
    res.status(201).json({
      message: "Patient registered successfully",
      patient: newPatient.rows[0]
    });
  } catch (error) {
    console.error('Error creating patient:', error.stack);
    res.status(500).json({ message: 'Server error when creating patient.' });
  }
};

// --- Get all patients ---
exports.getAllPatients = async (req, res) => {
  try {
    const allPatients = await pool.query('SELECT * FROM patients ORDER BY created_at DESC');
    res.status(200).json(allPatients.rows);
  } catch (error) {
    console.error('Error fetching all patients:', error.stack);
    res.status(500).json({ message: 'Server error when fetching patients.' });
  }
};

// --- Get patient by ID ---
exports.getPatientById = async (req, res) => {
  const { id } =req.params;

  try {
    const patient = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);

    if (patient.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.status(200).json(patient.rows[0]);
  } catch (error) {
    console.error('Error fetching patient by ID:', error.stack);
    // Add specific error handling for invalid ID format if necessary (e.g. if id is not a number)
    if (error.code === '22P02') { // invalid text representation
        return res.status(400).json({ message: 'Invalid patient ID format.' });
    }
    res.status(500).json({ message: 'Server error when fetching patient by ID' });
  }
};

// --- Update patient ---
exports.updatePatient = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, date_of_birth, gender, national_id, contact_phone, email, address } = req.body;

  try {
    // Check for national_id uniqueness if it's being updated
    if (national_id) {
      const existingPatient = await pool.query('SELECT id FROM patients WHERE national_id = $1 AND id <> $2', [national_id, id]);
      
      if (existingPatient.rows.length > 0) {
        return res.status(409).json({ message: 'Another patient with this National ID already exists' });
      }
    }
    const updatedPatient = await pool.query(`UPDATE patients SET
      first_name = COALESCE($1, first_name),
      last_name = COALESCE($2, last_name),
      date_of_birth = COALESCE($3, date_of_birth),
      gender = COALESCE($4, gender),
      national_id = COALESCE($5, national_id),
      contact_phone = COALESCE($6, contact_phone),
      email = COALESCE($7, email),
      address = COALESCE($8, address),
      updated_at = CURRENT_TIMESTAMP 
      WHERE id = $9 RETURNING *`, [first_name, last_name, date_of_birth, gender, national_id, contact_phone, email, address, id]);

    if (updatedPatient.rows.length === 0) {
        return res.status(404).json({ message: 'Patient not found after update attempt.' });
    }
    res.status(200).json({ // ADDED THIS LINE
      message: 'Patient updated successfully.',
      patient: updatedPatient.rows[0]
    });

  } catch (error) {
    console.error('Error updating patient:', error.stack);
    if (error.code === '23505') { // Unique violation, though handled above manually
        return res.status(409).json({ message: 'This National ID is already associated with another patient.' });
    } else if (error.code === '22P02') { // Invalid text representation
        return res.status(400).json({ message: 'Invalid data format provided.' });
    }
    res.status(500).json({ message: 'Server error when updating patient.' });
  }
};

// --- Delete patient ---
exports.deletePatient = async (req, res) => {
  const { id } = req.params;

  try {
    const deleteResponse = await pool.query('DELETE FROM patients WHERE id = $1 RETURNING id', [id]);

    if (deleteResponse.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found.' });
    }
    res.status(200).json({ message: 'Patient deleted successfully.', id: deleteResponse.rows[0].id });

  } catch (error) {
    console.error('Error deleting patient:', error.stack);

    if (error.code === '23503') {
      return res.status(409).json({ message: 'Cannot delete patient due to associated records (e.g., appointments, notes). Delete related records first.' });
    }
    res.status(500).json({ message: 'Server error when deleting patient' });
  }
};
