// backend/src/controllers/departmentController.js

const pool = require('../config/db');

// --- Create new department ---
exports.createDepartment = async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Department name is required.' });
  }

  try {
    // Check if department name already exists
    const departmentExists = await pool.query(
      'SELECT id FROM departments WHERE name = $1', [name]
    );
    if (departmentExists.rows.length > 0) {
      return res.status(409).json({ message: 'Department with this name already exists.' });
    }

    const newDepartment = await pool.query(
      'INSERT INTO departments (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );
    res.status(201).json({
      message: 'Department created successfully.',
      department: newDepartment.rows[0]
    });
  } catch (error) {
    console.error('Error creating department:', error.stack);
    res.status(500).json({ message: 'Server error when creating department.' });
  }
};

// --- Get all departments ---
exports.getAllDepartments = async (req, res) => {
  try {
    const allDepartments = await pool.query('SELECT * FROM departments ORDER BY name ASC');
    res.status(200).json(allDepartments.rows);
  } catch (error) {
    console.error('Error fetching all departments:', error.stack);
    res.status(500).json({ message: 'Server error when fetching departments.' });
  }
};

// --- Get department by ID ---
exports.getDepartmentById = async (req, res) => {
  const { id } = req.params;

  try {
    const department = await pool.query('SELECT * FROM departments WHERE id = $1', [id]);

    if (department.rows.length === 0) {
      return res.status(404).json({ message: 'Department not found.' });
    }
    res.status(200).json(department.rows[0]);
  } catch (error) {
    console.error('Error fetching department by ID:', error.stack);
    if (error.code === '22P02') {
      return res.status(400).json({ message: 'Invalid department ID format.' });
    }
    res.status(500).json({ message: 'Server error when fetching department by ID.' });
  }
};

// --- Update department ---
exports.updateDepartment = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    // Check if a new name is provided and if it already exists for another department
    if (name) {
      const existingDepartment = await pool.query(
        'SELECT id FROM departments WHERE name = $1 AND id <> $2',
        [name, id]
      );
      if (existingDepartment.rows.length > 0) {
        return res.status(409).json({ message: 'Another department with this name already exists.' });
      }
    }

    const updatedDepartment = await pool.query(
      `UPDATE departments
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [name, description, id]
    );

    if (updatedDepartment.rows.length === 0) {
      return res.status(404).json({ message: 'Department not found.' });
    }

    res.status(200).json({
      message: 'Department updated successfully.',
      department: updatedDepartment.rows[0]
    });
  } catch (error) {
    console.error('Error updating department:', error.stack);
    if (error.code === '22P02') {
      return res.status(400).json({ message: 'Invalid data format provided.' });
    } else if (error.code === '23505') { // Unique violation
      return res.status(409).json({ message: 'A department with this name already exists.' });
    }
    res.status(500).json({ message: 'Server error when updating department.' });
  }
};

// --- Delete department ---
exports.deleteDepartment = async (req, res) => {
  const { id } = req.params;

  try {
    const deleteResponse = await pool.query('DELETE FROM departments WHERE id = $1 RETURNING id', [id]);

    if (deleteResponse.rows.length === 0) {
      return res.status(404).json({ message: 'Department not found.' });
    }
    res.status(200).json({ message: 'Department deleted successfully.', id: deleteResponse.rows[0].id });
  } catch (error) {
    console.error('Error deleting department:', error.stack);
    if (error.code === '23503') { // Foreign key violation
      return res.status(409).json({ message: 'Cannot delete department due to associated records (e.g., doctors, patients linked to this department). Remove associations first.' });
    }
    res.status(500).json({ message: 'Server error when deleting department.' });
  }
};
