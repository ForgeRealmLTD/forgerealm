const jwt = require('jsonwebtoken');
const crypto = require('crypto');
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
    'INSERT INTO users (username, email, password_hash, salt, role, email_verified, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
    [username, email || null, passwordHash, salt, 'user', 0]
  );
  return { id: result.insertId, username, email, role: 'user' };
};

const createVerificationToken = () => crypto.randomBytes(32).toString('hex');
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const sendVerificationEmail = async ({ toEmail, toName, token }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'info@forgerealm.co.uk';
  const senderName = process.env.BREVO_SENDER_NAME || 'ForgeRealm';
  const appBaseUrl = process.env.APP_BASE_URL || 'https://forgerealm.co.uk';

  if (!apiKey) {
    throw new ApiError(500, 'BREVO_API_KEY is not configured');
  }

  const verifyUrl = `${appBaseUrl}/shop/verify?token=${encodeURIComponent(token)}`;
  const payload = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: toEmail, name: toName || toEmail }],
    subject: 'Activate your ForgeRealm access',
    htmlContent: `
      <div style="margin:0;padding:0;background:#0b1220;font-family:'Trebuchet MS',Arial,sans-serif;color:#e2e8f0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b1220;padding:32px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;border-radius:28px;overflow:hidden;background:#0f172a;border:1px solid rgba(148,163,184,0.15);box-shadow:0 24px 60px rgba(59,130,246,0.25);">
                <tr>
                  <td style="padding:28px 28px 12px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="text-align:left;">
                          <div style="display:inline-block;padding:6px 14px;border-radius:999px;background:rgba(59,130,246,0.15);border:1px solid rgba(125,211,252,0.35);text-transform:uppercase;letter-spacing:0.32em;font-size:10px;color:#bae6fd;">
                            ForgeRealm Access
                          </div>
                        </td>
                        <td style="text-align:right;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.2em;">
                          Verified Craft
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 28px 0;">
                    <h1 style="margin:0;font-size:28px;line-height:1.2;color:#f8fafc;">
                      Light the ForgeRealm gateway
                    </h1>
                    <p style="margin:12px 0 0;font-size:15px;color:#cbd5f5;">
                      Hey ${toName || 'Maker'}, your build slot is ready. Verify your email to unlock the ForgeRealm workshop.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 28px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(120deg,rgba(59,130,246,0.18),rgba(16,185,129,0.12));border-radius:22px;border:1px solid rgba(148,163,184,0.18);">
                      <tr>
                        <td style="padding:22px;text-align:center;">
                          <a href="${verifyUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;padding:14px 24px;border-radius:999px;text-decoration:none;font-weight:700;letter-spacing:0.18em;font-size:12px;text-transform:uppercase;box-shadow:0 12px 30px rgba(37,99,235,0.45);">
                            Verify Email
                          </a>
                          <p style="margin:14px 0 0;font-size:12px;color:#c7d2fe;">
                            This link expires after use for safety.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 28px 24px;">
                    <div style="padding:16px 18px;border-radius:18px;background:rgba(15,23,42,0.7);border:1px solid rgba(148,163,184,0.2);font-size:12px;color:#cbd5f5;">
                      <p style="margin:0 0 8px;">Button not working? Paste this link:</p>
                      <p style="margin:0;word-break:break-all;color:#93c5fd;">${verifyUrl}</p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 28px 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.2em;">
                          ForgeRealm Lab · Leeds, UK
                        </td>
                        <td style="text-align:right;font-size:11px;color:#94a3b8;">
                          Need help? Reply to this email.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 28px 28px;">
                    <div style="border-top:1px solid rgba(148,163,184,0.2);padding-top:16px;font-size:12px;color:#cbd5f5;">
                      <p style="margin:0 0 6px;">71-75 Shelton Street, Covent Garden</p>
                      <p style="margin:0 0 6px;">WC2H 9JQ, London</p>
                      <p style="margin:0 0 6px;">info@forgerealm.co.uk</p>
                      <p style="margin:0;">+44 (0) 7344 237800</p>
                    </div>
                  </td>
                </tr>
              </table>
              <p style="margin:18px 0 0;font-size:11px;color:#64748b;text-align:center;">
                You’re receiving this because you created a ForgeRealm account.
              </p>
            </td>
          </tr>
        </table>
      </div>
    `,
  };

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(502, body.message || 'Failed to send verification email');
  }
};

const addBrevoContact = async ({ email, username }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const listId = process.env.BREVO_LIST_ID;

  if (!apiKey) {
    throw new ApiError(500, 'BREVO_API_KEY is not configured');
  }

  const payload = {
    email,
    attributes: {
      USERNAME: username,
    },
    updateEnabled: true,
  };

  if (listId) {
    payload.listIds = [Number(listId)];
  }

  const response = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    console.error('Brevo contact create failed', {
      status: response.status,
      message: body.message,
      code: body.code,
    });
    throw new ApiError(502, body.message || 'Failed to add Brevo contact');
  }
};

const login = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, 'Invalid credentials');
  }
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) throw new ApiError(500, 'JWT_SECRET is not configured');

  const token = jwt.sign(
    { role: req.user.role, username: req.user.username, userId: req.user.id },
    jwtSecret,
    { expiresIn: '12h' }
  );

  if (req.session) {
    await new Promise((resolve) => req.session.save(() => resolve()));
  }

  res.json({ token, user: { username: req.user.username, role: req.user.role } });
});

const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !password || !email) {
    throw new ApiError(400, 'Username, email, and password are required');
  }
  if (username.length < 3) throw new ApiError(400, 'Username must be at least 3 characters');
  if (password.length < 8) throw new ApiError(400, 'Password must be at least 8 characters');

  const [existingUsername] = await pool.query(
    'SELECT id FROM users WHERE username = ? LIMIT 1',
    [username]
  );
  if (existingUsername.length > 0) {
    throw new ApiError(409, 'Username already exists');
  }

  if (email) {
    const [existingEmail] = await pool.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    if (existingEmail.length > 0) {
      throw new ApiError(409, 'Email already exists');
    }
  }

  const user = await createUser({ username, email, password });
  const token = createVerificationToken();
  const tokenHash = hashToken(token);

  await pool.query(
    'UPDATE users SET email_verification_token_hash = ?, email_verification_sent_at = NOW() WHERE id = ?',
    [tokenHash, user.id]
  );

  await sendVerificationEmail({ toEmail: email, toName: username, token });

  res.status(201).json({ success: true });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const token = String(req.query.token || '');
  if (!token) {
    throw new ApiError(400, 'Verification token is required');
  }

  const tokenHash = hashToken(token);
  const [rows] = await pool.query(
    'SELECT id, email, username, email_verified FROM users WHERE email_verification_token_hash = ? LIMIT 1',
    [tokenHash]
  );
  const user = rows[0];
  if (!user) {
    throw new ApiError(400, 'Invalid or expired verification token');
  }

  if (!user.email_verified) {
    await pool.query(
      `
      UPDATE users
      SET email_verified = 1,
          email_verified_at = NOW(),
          email_verification_token_hash = NULL,
          email_verification_sent_at = NULL
      WHERE id = ?
      `,
      [user.id]
    );
  }

  if (user.email) {
    await addBrevoContact({ email: user.email, username: user.username });
  } else {
    console.warn('Brevo contact skipped: user has no email');
  }

  res.json({ success: true });
});

const me = asyncHandler(async (req, res) => {
  // requireAuth middleware already validated and attached req.user
  res.json({ user: { username: req.user.username, role: req.user.role } });
});

const logout = asyncHandler(async (req, res) => {
  if (typeof req.logout === 'function') {
    req.logout(() => {
      if (req.session && typeof req.session.destroy === 'function') {
        req.session.destroy(() => {
          res.clearCookie('fr.sid');
          res.json({ message: 'Logged out' });
        });
        return;
      }
      res.clearCookie('fr.sid');
      res.json({ message: 'Logged out' });
    });
    return;
  }

  res.clearCookie('fr.sid');
  res.json({ message: 'Logged out' });
});

module.exports = { login, register, me, logout, verifyEmail };
