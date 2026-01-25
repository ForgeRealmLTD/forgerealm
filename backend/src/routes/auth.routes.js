const express = require('express');
const passport = require('passport');
const { login, register, me, logout } = require('../controllers/auth.controller');
const { requireAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/login', login);

router.post('/register', register);

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

router.get('/me', requireAdmin, me);
router.post('/logout', requireAdmin, logout);

module.exports = router;
