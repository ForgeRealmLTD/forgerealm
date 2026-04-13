const express = require('express');
const { handleStripeWebhook } = require('../controllers/webhook.controller');

const router = express.Router();

// Stripe webhook - uses raw body parser (configured in app.js before json middleware)
router.post('/stripe', handleStripeWebhook);

module.exports = router;
