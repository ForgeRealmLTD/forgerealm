const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
require("dotenv").config();

const productRoutes = require("./routes/products.routes");
const authRoutes = require("./routes/auth.routes");
const subscribeRoutes = require("./routes/subscribe.routes");
const userRoutes = require("./routes/users.routes");
const orderRoutes = require("./routes/orders.routes");
const webhookRoutes = require("./routes/webhook.routes");
const receiptsRoutes = require("./routes/receipts.routes");
const lithophaneRoutes = require("./routes/lithophane.routes");
const { notFound, errorHandler } = require("./utils/errors");
const {
  verifyPassword,
  rehashIfNeeded,
} = require("./controllers/auth.controller");
const pool = require("./config/db");

const app = express();

// Security headers
app.use(helmet());

// Trust only the first proxy hop (Cloudflare/ALB)
app.set("trust proxy", 1);

// Stripe webhook must receive raw body for signature verification - register BEFORE json parser
app.use(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  webhookRoutes,
);

// CORS options (static allowlist, no dynamic callbacks)
const corsOptions = {
  origin: [
    "https://api.forgerealm.co.uk",
    "https://forgerealm.co.uk",
    "https://www.forgerealm.co.uk",
    "https://forgerealm.vercel.app",
    "http://localhost:3000",
    "http://localhost:3000",
    "http://localhost:4321",
    "http://localhost:8080",
    "http://127.0.0.1:8787",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Access-Control-Allow-Origin",
  ],
  optionsSuccessStatus: 204,
};

// Apply CORS middleware globally
app.use(cors(corsOptions));
// Respond to all preflight requests
app.options("*", cors(corsOptions));

// Built-in body parsers with size limits
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// Session + Passport setup
const isProd = process.env.NODE_ENV === "production";
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  console.error("FATAL: SESSION_SECRET environment variable is required");
  process.exit(1);
}
const cookieDomain =
  process.env.SESSION_COOKIE_DOMAIN ||
  (isProd ? ".forgerealm.co.uk" : undefined);
const secureCookie = isProd
  ? process.env.SESSION_COOKIE_SECURE !== "false"
  : false;
app.use(
  session({
    name: "fr.sid",
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      secure: secureCookie,
      domain: cookieDomain,
      maxAge: 1000 * 60 * 60 * 12, // 12h
    },
  }),
);

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      let dbAdmin = null;
      try {
        const [rows] = await pool.query(
          "SELECT id, username, password_hash, salt, role FROM admin_users WHERE username = ? LIMIT 1",
          [username],
        );
        dbAdmin = rows[0];
      } catch (dbErr) {
        console.error("Admin DB lookup failed:", dbErr.message || dbErr);
      }

      const envAdmins = [
        {
          username: process.env.ADMIN_USERNAME || "admin",
          password: process.env.ADMIN_PASSWORD || "changeme",
        },
        {
          username: process.env.ADMIN_USERNAME_2,
          password: process.env.ADMIN_PASSWORD_2,
        },
        {
          username: process.env.ADMIN_USERNAME_3,
          password: process.env.ADMIN_PASSWORD_3,
        },
      ].filter((a) => a.username && a.password);

      if (!dbAdmin) {
        const envMatch = envAdmins.find(
          (a) => a.username === username && a.password === password,
        );
        if (envMatch) {
          return done(null, {
            id: `env:${envMatch.username}`,
            username: envMatch.username,
            role: "admin",
          });
        }

        const [userRows] = await pool.query(
          "SELECT id, username, password_hash, salt, role, email_verified FROM users WHERE username = ? LIMIT 1",
          [username],
        );
        const user = userRows[0];
        if (!user) return done(null, false, { message: "Invalid credentials" });
        const { valid, needsRehash } = await verifyPassword(
          password,
          user.password_hash,
          user.salt,
        );
        if (!valid)
          return done(null, false, { message: "Invalid credentials" });
        if (!user.email_verified)
          return done(null, false, { message: "Email not verified" });
        if (needsRehash)
          rehashIfNeeded(user.id, password, "users").catch((e) =>
            console.error("Rehash failed:", e.message),
          );
        return done(null, {
          id: user.id,
          username: user.username,
          role: user.role || "user",
        });
      }

      const { valid, needsRehash } = await verifyPassword(
        password,
        dbAdmin.password_hash,
        dbAdmin.salt,
      );
      if (!valid) return done(null, false, { message: "Invalid credentials" });
      if (needsRehash)
        rehashIfNeeded(dbAdmin.id, password, "admin_users").catch((e) =>
          console.error("Rehash failed:", e.message),
        );

      return done(null, {
        id: dbAdmin.id,
        username: dbAdmin.username,
        role: dbAdmin.role || "admin",
      });
    } catch (err) {
      return done(err);
    }
  }),
);

passport.serializeUser((user, done) =>
  done(null, { id: user.id, username: user.username, role: user.role }),
);
passport.deserializeUser((user, done) => done(null, user));

app.use(passport.initialize());
app.use(passport.session());

// Schema is now managed out-of-band via backend/migrations/001_init.sql
// applied to Neon with psql. The old MySQL-flavoured `ensureUsersTable` /
// `ensureUsersColumns` bootstrap that used to live here was removed with the
// Postgres migration — it relied on `INFORMATION_SCHEMA.COLUMNS`, `TINYINT(1)`
// and MySQL-shape ALTER statements that don't apply on Neon.

// Health endpoints for load balancers
app.get("/", (req, res) => res.json({ status: "ok" }));
app.get("/health", (req, res) => res.send("ok"));

// Request logger for troubleshooting
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`,
    );
  });
  next();
});

// Static file serving for uploads
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/subscribe", subscribeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/receipts", receiptsRoutes);
app.use("/api/lithophane", lithophaneRoutes);

// 404 + error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
