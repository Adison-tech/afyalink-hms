const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
  let token;

  // Check for token in Authorization header (Bearer token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided.' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user info to the request object
    req.user = decoded; // This will contain { is, username, role }
    next(); // Proceed to the next middleware/route handler
  } catch (error) {
    console.error('Token verification failed:', error.message);
    res.status(403).json({ message: 'Not authorized, token failed or expired.' });
  }
};

// Middleware for Role-Based Access Control (RBAC)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role '${req.user ? req.user.role : "undefined"}' is not authorized to access this route.` });
    }
    next();
  };
};