const express = require("express");
const rateLimit = require("express-rate-limit");
const { createCheckout } = require("../controllers/checkout.controller");

const router = express.Router();

// Each call creates a Stripe session; cap it so a script can't spam them
const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) =>
    req.headers["cf-connecting-ip"] ||
    (req.headers["x-forwarded-for"] &&
      req.headers["x-forwarded-for"].split(",")[0].trim()) ||
    req.ip,
  handler: (req, res) =>
    res.status(429).json({
      error:
        "Too many checkout attempts. Please wait a few minutes and try again.",
    }),
});

router.post("/", checkoutLimiter, createCheckout);

module.exports = router;
