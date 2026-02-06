const path = require('path');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
require('dotenv').config();

const productRoutes = require('./routes/products.routes');
const authRoutes = require('./routes/auth.routes');
const subscribeRoutes = require('./routes/subscribe.routes');
const userRoutes = require('./routes/users.routes');
const { notFound, errorHandler } = require('./utils/errors');
const pool = require('./config/db');

const app = express();

const hashPassword = (password, salt) =>
  crypto.createHash('sha256').update(password + salt).digest('hex');

// Trust proxies (Cloudflare/ALB) so req.ip and protocol are correct
app.enable('trust proxy');

// CORS options (static allowlist, no dynamic callbacks)
const corsOptions = {
  origin: [
    'https://api.forgerealm.co.uk',
    'https://forgerealm.co.uk',
    'https://www.forgerealm.co.uk',
    'https://forgerealm.vercel.app',
    'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:4321',
    'http://localhost:8080',
    'http://127.0.0.1:8787'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin'],
  optionsSuccessStatus: 204,
};

// Apply CORS middleware globally
app.use(cors(corsOptions));
// Respond to all preflight requests
app.options('*', cors(corsOptions));

// Built-in body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session + Passport setup
const isProd = process.env.NODE_ENV === 'production';
const sessionSecret = process.env.SESSION_SECRET || 'change-me';
const cookieDomain = process.env.SESSION_COOKIE_DOMAIN || (isProd ? '.forgerealm.co.uk' : undefined);
const secureCookie = isProd ? process.env.SESSION_COOKIE_SECURE !== 'false' : false;
app.use(
  session({
    name: 'fr.sid',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: isProd ? 'none' : 'lax',
      secure: secureCookie,
      domain: cookieDomain,
      maxAge: 1000 * 60 * 60 * 12, // 12h
    },
  })
);

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      let dbUser = null;
      try {
        const [rows] = await pool.query(
          'SELECT id, username, password_hash, salt, role FROM admin_users WHERE username = ? LIMIT 1',
          [username]
        );
        dbUser = rows[0];
      } catch (dbErr) {
        // If DB is unreachable, fall back to env admins instead of failing the request
        console.error('Admin DB lookup failed:', dbErr.message || dbErr);
      }

      const envAdmins = [
        { username: process.env.ADMIN_USERNAME || 'admin', password: process.env.ADMIN_PASSWORD || 'changeme' },
        { username: process.env.ADMIN_USERNAME_2, password: process.env.ADMIN_PASSWORD_2 },
        { username: process.env.ADMIN_USERNAME_3, password: process.env.ADMIN_PASSWORD_3 },
      ].filter((a) => a.username && a.password);

      if (!dbUser) {
        const envMatch = envAdmins.find((a) => a.username === username && a.password === password);
        if (envMatch) {
          return done(null, { id: `env:${envMatch.username}`, username: envMatch.username, role: 'admin' });
        }

        const [userRows] = await pool.query(
          'SELECT id, username, password_hash, salt, role, email_verified FROM users WHERE username = ? LIMIT 1',
          [username]
        );
        const user = userRows[0];
        if (!user) return done(null, false, { message: 'Invalid credentials' });
        const computedUser = hashPassword(password, user.salt || '');
        if (computedUser !== user.password_hash) return done(null, false, { message: 'Invalid credentials' });
        if (!user.email_verified) return done(null, false, { message: 'Email not verified' });
        return done(null, { id: user.id, username: user.username, role: user.role || 'user' });
      }

      const computed = hashPassword(password, dbUser.salt);
      if (computed !== dbUser.password_hash) return done(null, false, { message: 'Invalid credentials' });

      return done(null, { id: dbUser.id, username: dbUser.username, role: dbUser.role || 'admin' });
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => done(null, { id: user.id, username: user.username, role: user.role }));
passport.deserializeUser((user, done) => done(null, user));

app.use(passport.initialize());
app.use(passport.session());

const ensureUsersTable = async () => {
  try {
    await pool.query(
      `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(64) NOT NULL UNIQUE,
        email VARCHAR(255) NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        salt VARCHAR(255) NOT NULL DEFAULT '',
        role VARCHAR(32) NOT NULL DEFAULT 'user',
        email_verified TINYINT(1) NOT NULL DEFAULT 0,
        email_verification_token_hash VARCHAR(255) NULL,
        email_verification_sent_at DATETIME NULL,
        email_verified_at DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
      `
    );
  } catch (err) {
    console.error('Users table check failed:', err.message || err);
  }
};

const ensureUsersColumns = async () => {
  const columns = [
    { name: 'email_verified', definition: 'TINYINT(1) NOT NULL DEFAULT 0' },
    { name: 'email_verification_token_hash', definition: 'VARCHAR(255) NULL' },
    { name: 'email_verification_sent_at', definition: 'DATETIME NULL' },
    { name: 'email_verified_at', definition: 'DATETIME NULL' },
  ];

  try {
    const [rows] = await pool.query(
      `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users'
      `
    );
    const existing = new Set(rows.map((row) => row.COLUMN_NAME));

    for (const column of columns) {
      if (!existing.has(column.name)) {
        await pool.query(`ALTER TABLE users ADD COLUMN ${column.name} ${column.definition}`);
      }
    }
  } catch (err) {
    console.error('Users columns check failed:', err.message || err);
  }
};

ensureUsersTable().then(ensureUsersColumns);

// Health endpoints for load balancers
app.get('/', (req, res) => res.json({ status: 'ok' }));
app.get('/health', (req, res) => res.send('ok'));

// Rate-limit auth endpoints based on real client IP behind CF/ALB
const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) =>
    req.headers['cf-connecting-ip'] ||
    (req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'].split(',')[0].trim()) ||
    req.ip,
});
const registerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) =>
    req.headers['cf-connecting-ip'] ||
    (req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'].split(',')[0].trim()) ||
    req.ip,
});

// Request logger for troubleshooting
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`
    );
  });
  next();
});

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/subscribe', subscribeRoutes);
app.use('/api/users', userRoutes);

// 404 + error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
