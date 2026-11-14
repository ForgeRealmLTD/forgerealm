const express = require("express");
const multer = require("multer");
const rateLimit = require("express-rate-limit");
const { ApiError } = require("../utils/errors");
const {
  createLithophaneRequest,
} = require("../controllers/lithophane.controller");

const router = express.Router();

// Public upload form: 5 submissions per IP per hour. Runs before multer so a
// blocked client never gets to stream a file at us.
const lithophaneLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
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
        "Too many requests from this connection. Please try again in an hour, or email info@forgerealm.co.uk.",
    }),
});

// Memory storage: the photo goes straight into the email and is never written
// to disk or the database. The browser downscales to 2000px JPEG first, so a
// real upload is a few MB at most; 10MB leaves headroom without inviting abuse.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 10, fieldSize: 4096 },
  fileFilter: (req, file, cb) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      return cb(new ApiError(400, "Please upload a JPG, PNG or WEBP image"));
    }
    cb(null, true);
  },
});

// Turn multer's own errors (file too large, too many files) into 4xx JSON
// instead of letting them fall through as a 500.
const singlePhoto = (req, res, next) =>
  upload.single("photo")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "That photo is too large. Please try a smaller one."
          : "Please upload a single photo";
      return next(new ApiError(status, message));
    }
    next(err);
  });

router.post("/", lithophaneLimiter, singlePhoto, createLithophaneRequest);

module.exports = router;
