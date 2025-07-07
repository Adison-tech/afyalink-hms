const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// -------User registration---------------
exports.registerUser = async (req, res) => {
  const { username, password, role, first_name, last_name, email, phone_number, address, date_of_birth, gender } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    // Check if user already exists
    const userExists = await pool.query(
      'SELECT * FROM users WHERE username = $1', [username]
    );
    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: 'User with that username already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert new user into database
    const newUser = await pool.query(
      `INSERT INTO users (username, password_hash, role, first_name, last_name, email, phone_number, address, date_of_birth, gender)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, username, role, first_name, last_name, email, phone_number, address, date_of_birth, gender`,
      [username, passwordHash, role || 'receptionist', first_name, last_name, email, phone_number, address, date_of_birth, gender]
    );

    const user = newUser.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number,
        address: user.address,
        date_of_birth: user.date_of_birth,
        gender: user.gender
      },
      token
    });
  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// ----User Login-----
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    // Find user by username
    const userResult = await pool.query(
      `SELECT * FROM users WHERE username = $1`,
      [username]
    );

    const user = userResult.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Compare provide password with hashed password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number,
        address: user.address,
        date_of_birth: user.date_of_birth,
        gender: user.gender
      }
    });
  } catch (error) {
    console.error('Error during user login:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// --- Get User Profile (Protected Route Example) ---
exports.getProfile = async (req, res) => {
  // The `req.user` object is populated by the authMiddleware
  try {
    const user = await pool.query(
      'SELECT id, username, first_name, last_name, email, phone_number, address, date_of_birth, gender, created_at, updated_at, role FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!user.rows[0]) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({ user: user.rows[0] });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error fetching profile.' });
  }
};

// --- Get all users (with optional role filter) ---
exports.getAllUsers = async (req, res) => {
  const { role } = req.query; // Extract the 'role' query parameter

  let query = 'SELECT id, username, first_name, last_name, email, role, phone_number, address, date_of_birth, gender, created_at, updated_at FROM users';
  const params = []; // Array to hold parameters for the SQL query
  let whereClause = '';

  if (role) {
    whereClause = ' WHERE role = $1';
    params.push(role); // Add the role to the parameters array
  }

  query += whereClause + ' ORDER BY created_at DESC'; // Order by creation date for consistency

  try {
    const result = await pool.query(query, params);
    res.status(200).json(result.rows); // Send the fetched users as JSON response
  } catch (error) {
    console.error('Error fetching users:', error.stack);
    res.status(500).json({ message: 'Server error when fetching users.' });
  }
};

// --- Get user by ID ---
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await pool.query(
      'SELECT id, username, first_name, last_name, email, phone_number, address, date_of_birth, gender, created_at, updated_at, role FROM users WHERE id = $1',
      [id]
    );
    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json(user.rows[0]);
  } catch (error) {
    console.error('Error fetching user by ID:', error.stack);
    if (error.code === '22P02') {
      return res.status(400).json({ message: 'Invalid user ID format.' });
    }
    res.status(500).json({ message: 'Server error when fetching user by ID.' });
  }
};

// --- Update user ---
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, first_name, last_name, email, phone_number, address, date_of_birth, gender, role } = req.body;

  try {
    // Optional: Check if username is being changed and if new username already exists for another user
    if (username) {
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE username = $1 AND id <> $2',
        [username, id]
      );
      if (existingUser.rows.length > 0) {
        return res.status(409).json({ message: 'Another user with this username already exists.' });
      }
    }

    const updatedUser = await pool.query(
      `UPDATE users
       SET username = COALESCE($1, username),
           first_name = COALESCE($2, first_name),
           last_name = COALESCE($3, last_name),
           email = COALESCE($4, email),
           phone_number = COALESCE($5, phone_number),
           address = COALESCE($6, address),
           date_of_birth = COALESCE($7, date_of_birth),
           gender = COALESCE($8, gender),
           role = COALESCE($9, role),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING id, username, first_name, last_name, email, phone_number, address, date_of_birth, gender, role, updated_at`,
      [username, first_name, last_name, email, phone_number, address, date_of_birth, gender, role, id]
    );

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      message: 'User updated successfully.',
      user: updatedUser.rows[0]
    });
  } catch (error) {
    console.error('Error updating user:', error.stack);
    if (error.code === '22P02') {
      return res.status(400).json({ message: 'Invalid data format provided.' });
    } else if (error.code === '23505') { // Unique violation
      return res.status(409).json({ message: 'A user with this username already exists.' });
    }
    res.status(500).json({ message: 'Server error when updating user.' });
  }
};

// --- Delete user ---
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteResponse = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

    if (deleteResponse.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({ message: 'User deleted successfully.', id: deleteResponse.rows[0].id });
  } catch (error) {
    console.error('Error deleting user:', error.stack);
    if (error.code === '23503') { // Foreign key violation
      return res.status(409).json({ message: 'Cannot delete user due to associated records (e.g., appointments, clinical notes). Delete related records first.' });
    }
    res.status(500).json({ message: 'Server error when deleting user.' });
  }
};
