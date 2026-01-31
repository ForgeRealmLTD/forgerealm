const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/errors');

const requireAuth = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  const authHeader = req.headers.authorization || '';
  const token =
    authHeader.startsWith('Bearer ') ? authHeader.slice(7) : req.headers['x-admin-token'] || null;
  if (!token) {
    return next(new ApiError(401, 'Authentication required'));
  }
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return next(new ApiError(500, 'JWT_SECRET is not configured'));
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    return next();
  } catch {
    return next(new ApiError(401, 'Authentication required'));
  }
};

const requireAdmin = (req, res, next) =>
  requireAuth(req, res, (err) => {
    if (err) return next(err);
    if (!req.user || req.user.role !== 'admin') {
      return next(new ApiError(403, 'Admin access required'));
    }
    return next();
  });

module.exports = { requireAuth, requireAdmin };
