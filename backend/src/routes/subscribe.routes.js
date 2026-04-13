const express = require('express');
const rateLimit = require('express-rate-limit');
const { addSubscriber } = require('../controllers/subscribe.controller');

const router = express.Router();

const subscribeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) =>
    req.headers['cf-connecting-ip'] ||
    (req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'].split(',')[0].trim()) ||
    req.ip,
});

router.post('/', subscribeLimiter, addSubscriber);

module.exports = router;
