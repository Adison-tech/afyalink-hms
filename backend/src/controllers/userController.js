const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// -------User registration---------------
exports.registerUser = async (req, res) => {
  const { username, password, role } = req.body;

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
      'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id, username, role',[username, passwordHash, role || 'receptionist']
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
      user: { id: user.id, username: user.username, role: user.role },
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
      return res.status(401).json({ message: 'Invalid crentials.' });
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
      user: { id: user.id, username: user.username, role: user.role }
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
            'SELECT id, username, role, created_at FROM users WHERE id = $1',
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