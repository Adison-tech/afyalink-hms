const pool = require('../config/db');

// Validate if user is a doctor
const isDoctor = async (userID) => {
  const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userID]);
  return userResult.rows.length > 0 && userResult.rows[0].role === 'doctor';
};

// --- Create new appointment ---
exports.createAppointment = async (req, res) => {
  const { patient_id, doctor_id, appointment_date, appointment_time, reason } = req.body;

  if (!patient_id || !doctor_id || !appointment_date || !appointment_time) {
    return res.status(400).json({ message: 'Missing required appointment fields: patient, doctor, date, time.' });
  }
  try {
    // Validate if patient_id exists
    const patientExists = await pool.query('SELECT id FROM patients WHERE id = $1', [patient_id]);
    if (patientExists.rows.length === 0) {
      return res.status(400).json({ message: 'Patient not found.' });
    }
    // Validate if doctor_id exists and is actually a 'doctor'
    if (!(await isDoctor(doctor_id))) {
      return res.status(400).json({ message: 'Invalid doctor ID or user is not a doctor.' });
    }
    // Check for doctor's availability
    const doctorSchedule = await pool.query(`SELECT * FROM appointments WHERE doctor_id = $1 AND appointment_date = $2 AND appointment_time = $3 AND status = 'scheduled'`, [doctor_id, appointment_date, appointment_time]);

    if (doctorSchedule.rows.length > 0) {
      return res.status(409).json({ message: 'Doctor is already booked at this time.' });
    }

    const newAppointment = await pool.query(`INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [patient_id, doctor_id, appointment_date, appointment_time, reason]);

    res.status(201).json({
      message: 'Appointment created successfully.',
      appointment: newAppointment.rows[0]
    });

  } catch (error) {
    console.error('Error creating appointment:', error.stack);
    if (error.code === '23503') {
      return res.status(400).json({message: 'Invalid patient or doctor ID provided.' });
    }
    res.status(500).json({ message: 'Server error when creating appointment.' });
  }
};

// --- Get all appointments (with optional filters) ---
exports.getAllAppointments = async (req, res) => {
  const { patient_id, doctor_id, date, status } = req.query;

  let query = `
  SELECT
    a.id,
    a.appointment_date,
    a.appointment_time,
    a.status,
    a.reason,
    p.first_name AS patient_first_name,
    p.last_name AS patient_last_name,
    u.username AS doctor_username,
    u.first_name AS doctor_first_name,
    u.last_name AS doctor_last_name
  FROM appointments a
  JOIN patients p ON a.patient_id = p.id
  JOIN users u ON a.doctor_id = u.id
  WHERE 1=1
  `;

  const queryParams = [];
  let paramIndex = 1;

  if (patient_id) {
    query += ` AND a.patient_id = $${paramIndex++}`;
    queryParams.push(patient_id);
  }
  if (doctor_id) {
    query += ` AND a.doctor_id = $${paramIndex++}`;
    queryParams.push(doctor_id);
  }
  if (date) {
    query += ` AND a.appointment_date = $${paramIndex++}`;
    queryParams.push(date);
  }
  if (status) {
    query += ` AND a.status = $${paramIndex}`;
    queryParams.push(status);
  }

  query += ` ORDER BY a.appointment_date DESC, a,appointment_time ASC`;

  try {
    const appointments = await pool.query(query, queryParams);
    res.status(200).json(appointments.rows);

  } catch (error) {
    console.error('Error fetching appointments:', error.stack);
    res.status(500).json({ message: 'Server error when fetching appointments.' });
  }
};

// --- Get appointment by ID ---
exports.getAppointmentById = async (req, res) => {
  const { id } = req.params;

  try {
    const appointment = await pool.query(
      `SELECT
        a.id,
        a.appointment_date,
        a.appointment_time,
        a.status,
        a.reason,
        p.id AS patient_id,
        p.first_name AS patient_first_name,
        p.last_name AS patient_last_name,
        u.id AS doctor_id,
        u.username AS doctor_username,
        u.first_name AS doctor_first_name,
        u.last_name AS doctor_last_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u ON a.doctor_id = u.id
      WHERE a.id = $1`,
      [id]
    );
    if (appointment.rows.length === 0) {
      return res.status(404).json({ message: 'Appointmnet not found.' });
    }
    res.status(200).json(appointment.rows[0]);

  } catch (error) {
    console.error('Error fetching appointment by ID:', error.stack);
    res.status(500).json({ message: 'Server error when fetching appointment by ID.' });
  }
};

// --- Update appointment ---
exports.updateAppointment = async (req, res) => {
  const { id } = req.params;
  const { patient_id, doctor_id, appointment_date, appointment_time, status, reason } = req.body;

  try {
    // Validate foreign keys if they are being updated
    if (patient_id) {
      const patientExists = await pool.query('SELECT id FROM patients WHERE id = $1', [patient_id]);
      if (patientExists.rows.length === 0) {
        return res.status(404).json({ message: 'Patient not found.' });
      }
    }
    if (doctor_id) {
      if (!(await isDoctor(doctor_id))) {
        return res.status(400).json({ message: 'Invalid doctor ID or user is not a doctor.' });
      }
      // Add doctor availability check if updating doctor_id, appointment_date or appointment_time
      if (appointment_date || appointment_time) {
        const currentAppointment = await pool.query('SELECT doctor_id, appointment_date, appointment_time FROM appointments WHERE id = $1', [id]);
        const newDoctorID = doctor_id || currentAppointment.rows[0].doctor_id;
        const newDate = appointment_date || currentAppointment.rows[0].appointment_date;
        const newTime = appointment_time || currentAppointment.rows[0].appointment_time;

        const doctorSchedule = await pool.query(
          `SELECT * FROM appointments
          WHERE doctor_id = $1 AND appointment_date = $2 AND appointment_time = $3 AND id != $4 AND status = 'scheduled'`,
          [newDoctorID, newDate, newTime, id]
        );
        if (doctorSchedule.rows.length > 0) {
          return res.status(409).json({ message: 'Doctor is already booked at this new time slot.' });
        }
      }
    }

    const updateAppointment = await pool.query(
      `UPDATE appointments
      SET patient_id = COALESCE($1, patient_id),
          doctor_id = COALESCE($2, doctor_id),
          appointment_date = COALESCE($3, appointment_date),
          appointment_time = COALESCE($4, appointment_time),
          status = COALESCE($5, status),
          reason = COALESCE($6, reason),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *`,
      [patient_id, doctor_id, appointment_date, appointment_time, status, reason, id]
    );
    if (updateAppointment.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }
    res.status(200).json({
      message: 'Appointment updated successfully.',
      appointment: updateAppointment.rows[0]
    });

  } catch (error) {
    console.error('Error updating appointment:', error.stack);
    if (error.code === '23503') {
      return res.status(400).json({ message: 'Invalid patient or doctor ID provided for update.' });
    } else if (error.code === 23505) {
      return res.status(409).json({ message: 'This patient already has an appointment with this doctor at this exact time.' });
    }
    res.status(500).json({ message: 'Server error when updating appointment.'})
  }
};

// --- Delete Appointment ---
exports.deleteAppointment = async (req, res) => {
  const { id } = req.params;

  try {
    const deleteResponse = await pool.query('DELETE FROM appointments WHERE id = $1 RETURNING id', [id]);

    if (deleteResponse.rows.length === 0) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }
    res.status(200).json({ message: 'Appointment deleted successfully.', id: deleteResponse.rows[0].id });

  } catch (error) {
    console.error('Error deleting appointment.', error.stack);
    res.status(500).json({ message: 'Server error when deleting appointment.' });
  }
};