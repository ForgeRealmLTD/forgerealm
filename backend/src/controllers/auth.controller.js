const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { ApiError, asyncHandler } = require('../utils/errors');
const pool = require('../config/db');

const hashPassword = (password, salt) =>
  crypto.createHash('sha256').update(password + salt).digest('hex');

const generateSalt = () => crypto.randomBytes(16).toString('hex');

const getDbAdmin = async (username) => {
  const [rows] = await pool.query(
    'SELECT id, username, password_hash, salt, role FROM admin_users WHERE username = ? LIMIT 1',
    [username]
  );
  return rows[0];
};

const createUser = async ({ username, email, password }) => {
  const salt = generateSalt();
  const passwordHash = hashPassword(password, salt);
  const [result] = await pool.query(
    'INSERT INTO users (username, email, password_hash, salt, role, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
    [username, email || null, passwordHash, salt, 'user']
  );
  return { id: result.insertId, username, email, role: 'user' };
};

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new ApiError(400, 'Username and password are required');
  }

  const [rows] = await pool.query(
    `
    SELECT id, username, password_hash, salt, role
    FROM users
    WHERE username = ?
    `,
    [username]
  );

  if (rows.length === 0) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const user = rows[0];
  let isValid = false;

  if (user.password_hash.startsWith('$2')) {
    isValid = await bcrypt.compare(password, user.password_hash);
  }

  else {
    const computed = legacyHash(password, user.salt);
    isValid = computed === user.password_hash;

    if (isValid) {
      const newHash = await bcrypt.hash(password, 12);
      await pool.query(
        'UPDATE users SET password_hash = ?, salt = ? WHERE id = ?',
        [newHash, '', user.id]
      );
    }
  }

  if (!isValid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // success response (keep minimal)
  res.json({
    id: user.id,
    username: user.username,
    role: user.role,
  });
});

const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !password) {
    throw new ApiError(400, 'Username and password are required');
  }

  // check if user already exists
  const [existing] = await pool.query(
    'SELECT id FROM users WHERE username = ? OR email = ?',
    [username, email]
  );

  if (existing.length > 0) {
    throw new ApiError(409, 'User already exists');
  }

  // bcrypt hash for new users
  const passwordHash = await bcrypt.hash(password, 12);

  await pool.query(
    `
    INSERT INTO users (username, email, password_hash, salt)
    VALUES (?, ?, ?, ?)
    `,
    [username, email || null, passwordHash, '']
  );

  res.status(201).json({ success: true });
});

const me = asyncHandler(async (req, res) => {
  // requireAdmin middleware already validated and attached req.user
  res.json({ user: { username: req.user.username, role: req.user.role } });
});

const logout = asyncHandler(async (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie('fr.sid');
      res.json({ message: 'Logged out' });
    });
  });
});

module.exports = { login, register, me, logout };
