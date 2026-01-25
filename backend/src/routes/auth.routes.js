const express = require('express');
const passport = require('passport');
const { login, register, me, logout } = require('../controllers/auth.controller');
const { requireAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * USER LOGIN (shop users)
 * Uses bcrypt logic in auth.controller.js
 */
router.post('/login', login);

/**
 * USER REGISTER
 */
router.post('/register', register);

/**
 * ADMIN LOGIN (passport / admin_users)
 */
router.post(
  '/admin/login',
  passport.authenticate('local', { session: true }),
  (req, res) => {
    res.json({
      id: req.user.id,
      username: req.user.username,
      role: req.user.role,
    });
  }
);

/**
 * ADMIN SESSION
 */
router.get('/me', requireAdmin, me);
router.post('/logout', requireAdmin, logout);

module.exports = router;
