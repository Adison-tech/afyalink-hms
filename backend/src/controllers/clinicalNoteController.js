const pool = require('../config/db');

// ---Create new clinical note ---
exports.createClinicalNote = async (req, res) => {
  const doctor_id = req.user.id; // Must be logged in docter
  const { patient_id, visit_datetime, chief_complaint, diagnosis, medications_prescribed, vitals, notes } = req.body;

  if (!patient_id || !chief_complaint) {
    return res.status(400).json({ message: 'Missing required fields: patient ID, chief complaint.' });
  }
  try {
    // Validate if patient_id exists
    const patientExists = await pool.query('SELECT id FROM patients WHERE id = $1', [patient_id]);
    if (patientExists.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found.' });
    }
    // Validate if login user is actually a doctor
    // This check is redundant if using `authorize('doctor')` in routes, but good for safety.
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only doctors or administrators can create clinical notes.' });
    }
    const newNote = await pool.query(
      `INSERT INTO clinical_notes (patient_id, doctor_id, visit_datetime, chief_complaint, diagnosis, medications_prescribed, vitals, notes) VALUES ($1, $2, COALESCE($3, CURRENT_TIMESTAMP), $4, $5, $6, $7, $8) RETURNING *`, [patient_id, doctor_id, visit_datetime, chief_complaint, diagnosis, medications_prescribed, vitals, notes]
    );
    res.status(201).json({
      message: 'Clinical note created successfully.',
      note: newNote.rows[0]
    });

  } catch (error) {
    console.error('Error creating clinical note:', error.stack);
    if (error.code === '23503') {
      return res.status(400).json({ message: 'Invalid patientID provided.' });
    }
    res.status(500).json({ message: 'Server error when creating clinical note' });
  }
};

//---Get all clinical notes for a specific patient---
exports.getClinicalNotesByPatient = async (req, res) => {
  const { patientId } = req.params;

  try {
    const notes = await pool.query(
      `SELECT
        cn.id,
        cn.visit_datetime,
        cn.chief_complaint,
        cn.diagnosis,
        cn.medications_prescribed,
        cn.vitals,
        cn.notes,
        cn.created_at,
        cn.updated_at,
        u.username AS doctor_username,
        u.first_name AS doctor_first_name,
        u.last_name AS doctor_last_name
      FROM clinical_notes cn
      JOIN users u ON cn.doctor_id = u.id
      WHERE cn.patient_id = $1
      ORDER BY cn.visit_datetime DESC`, [patientId]
    );
    res.status(200).json(notes.rows);

  } catch (error) {
    console.error('Error fetching clinical notes by patient:', error.stack);
    res.status(500).json({ message: 'Server error when fetching clinical notes.' });
  }
};

// --- Get single clinical note by ID ---
exports.getClinicalNoteById = async (req, res) => {
  const { id } = req.params;

  try {
    const note = await pool.query(
      `SELECT
        cn.id,
        cn.patient_id,
        cn.doctor_id,
        cn.visit_datetime,
        cn.chief_complaint,
        cn.diagnosis,
        cn.medications_prescribed,
        cn.vitals,
        cn.notes,
        cn.created_at,
        cn.updated_at,
        p.first_name AS patient_first_name,
        p.last_name AS patient_last_name,
        u.username AS doctor_username,
        u.first_name AS doctor_first_name,
        u.last_name AS doctor_last_name
      FROM clinical_notes cn
      JOIN patients p ON cn.patient_id = p.id
      JOIN users u ON cn.doctor_id = u.id
      WHERE cn.id = $1`, [id]
    );
    if (note.rows.length === 0) {
      return res.status(404).json({ message: 'Clinical note not found.' });
    }
    res.status(200).json(note.rows[0]);

  } catch (error) {
    console.error('Error fetching clinical note by ID:', error.stack);
    res.status(500).json({ message: 'Server error when fetching clinical note.' });
  }
};

// --- Update clinical note ---
exports.updateClinicalNote = async (req, res) => {
  const { id } = req.params;
  const { chief_complaint, diagnosis, medications_prescribed, vitals, notes } = req.body;
  
  if (req.user.role !== 'admin' && req.user.rows[0].doctor_id) {
    return res.status(403).json({ message: 'Admin or original author is only allowed.' });
  }
  try {
    const currentNote = await pool.query('SELECT doctor_id FROM clinical_notes WHERE id = $1', [id]);
    if (currentNote.rows.length === 0) {
      return res.status(404).json({ message: 'Clinical note not found.' });
    }
    // Authorization check
    if (req.user.role !== 'admin' && req.user.id !== currentNote.rows[0].doctor_id) {
      return res.status(403).json({ message: 'Not authorized to update this clinical note. Only the authoring doctor or an administrator can. ' });
    }
    const updatedNote = await pool.query(
      `UPDATE clinical_notes
      SET chief_complaint = COALESCE($1, chief_complaint),
          diagnosis = COALESCE($2, diagnosis),
          medications_prescribed = COALESCE($3, medications_prescribed),
          vitals = COALESCE($4, vitals),
          notes = COALESCE($5, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *`, [chief_complaint, diagnosis, medications_prescribed, vitals, notes, id]
    );
    res.status(200).json({
      message: 'Clinical note updated successfully.',
      note: updatedNote.rows[0]
    });

  } catch (error) {
    console.error('Error updating clinical note:', error.stack);
    res.status(500).json({ message: 'Server error when updating clinical note.' });
  }
};

// --- Delete clinical note ---
exports.deleteClinicalNote = async (req, res) => {
  const { id } = req.params;

  try {
    const currentNote = await pool.query('SELECT doctor_id FROM clinical_notes WHERE id = $1', [id]);
    if (currentNote.rows.length === 0) {
      return res.status(404).json({ message: 'Clinical note not found.' });
    }
    // Authorization check
    if (req.user.role !== 'admin' && req.user.id !== currentNote.rows[0].doctor_id) {
      return res.status(403).json({ message: 'Not authorized to delete this clinical note. Only the authoring doctor or an administrator can.' });
    }
    const deleteResponse = await pool.query('DELETE FROM clinical_notes WHERE id = $1 RETURNING id', [id]);
    res.status(200).json({ message: 'Clinical note delete successfully.', id: deleteResponse.rows[0].id });

  } catch (error) {
    console.error('Error deleting clinical note:', error.stack);
    res.status(500).json({ message: 'Server error when deleting clinical note.' });
  }
};
