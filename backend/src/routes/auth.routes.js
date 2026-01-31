const express = require('express');
const passport = require('passport');
const { login, register, me, logout, verifyEmail } = require('../controllers/auth.controller');
const { requireAdmin, requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

const loginLimiter = require('express-rate-limit')({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) =>
    req.headers['cf-connecting-ip'] ||
    (req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'].split(',')[0].trim()) ||
    req.ip,
});

const registerLimiter = require('express-rate-limit')({
  windowMs: 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) =>
    req.headers['cf-connecting-ip'] ||
    (req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'].split(',')[0].trim()) ||
    req.ip,
});

router.post('/login', loginLimiter, (req, res, next) =>
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info?.message || 'Invalid credentials' });
    req.logIn(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      return login(req, res);
    });
  })(req, res, next)
);

router.post('/register', registerLimiter, register);
router.get('/verify', verifyEmail);

router.post(
  '/admin/login',
  passport.authenticate('local', { session: true }),
  (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    return login(req, res);
  }
);

router.get('/me', requireAuth, me);
router.post('/logout', requireAuth, logout);

module.exports = router;
