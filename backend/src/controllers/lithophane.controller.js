const pool = require("../config/db");
const { ApiError, asyncHandler } = require("../utils/errors");
const { sendBrevoEmail } = require("../utils/email");

const NOTIFY_TO = [
  { email: "info@forgerealm.co.uk", name: "ForgeRealm" },
  { email: "forgerealmltd@gmail.com", name: "ForgeRealm" },
];
const FALLBACK_EMAIL = "info@forgerealm.co.uk";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ORIGINAL_BYTES = 25 * 1024 * 1024;

// Single-line text: trim, collapse whitespace (also strips CR/LF), cap length
const oneLine = (value, max) =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatBytes = (bytes) => {
  if (!Number.isFinite(bytes)) return "unknown";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// "My Photo (1).HEIC" -> "my-photo-1.jpg": the browser always sends a JPEG
const attachmentName = (original) => {
  const base = String(original || "photo")
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${base || "photo"}.jpg`;
};

const createLithophaneRequest = asyncHandler(async (req, res) => {
  const body = req.body || {};

  // Honeypot: real people never see this field. Pretend it worked so bots
  // don't learn anything, but send and store nothing.
  if (body.website) {
    return res.status(201).json({ success: true });
  }

  const name = oneLine(body.name, 120);
  const email = oneLine(body.email, 254);
  const phone = oneLine(body.phone, 40) || null;
  // Multipart bodies send newlines as CRLF; normalise first so a 500-char
  // message with line breaks isn't counted as longer than the browser counted it
  const message =
    String(body.message ?? "")
      .replace(/\r\n?/g, "\n")
      .trim() || null;

  if (!name) throw new ApiError(400, "Please add your name");
  if (!EMAIL_RE.test(email))
    throw new ApiError(400, "Please add a valid email address");
  if (message && message.length > 500)
    throw new ApiError(400, "Message must be 500 characters or fewer");
  if (!req.file) throw new ApiError(400, "Please attach a photo");

  const originalFilename =
    oneLine(body.originalName || req.file.originalname, 255) || null;
  const parsedOriginal = Number.parseInt(body.originalSize, 10);
  const originalBytes =
    parsedOriginal > 0 && parsedOriginal <= MAX_ORIGINAL_BYTES
      ? parsedOriginal
      : null;
  const compressedBytes = req.file.size;
  const userAgent = oneLine(req.get("user-agent"), 500) || null;

  const rows = [
    ["Name", name],
    ["Email", email],
    ["Phone", phone || "Not given"],
    ["Original file", originalFilename || "Unknown"],
    [
      "Photo size",
      `${formatBytes(originalBytes ?? NaN)} original, ${formatBytes(compressedBytes)} attached`,
    ],
  ];
  const htmlContent = `
    <div style="font-family:Arial,sans-serif;color:#0B1540;font-size:14px;line-height:1.5;">
      <h2 style="margin:0 0 12px;font-size:18px;">New lithophane request</h2>
      <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        ${rows
          .map(
            ([label, value]) => `
          <tr>
            <td style="padding:4px 16px 4px 0;color:#555;vertical-align:top;">${label}</td>
            <td style="padding:4px 0;">${escapeHtml(value)}</td>
          </tr>`,
          )
          .join("")}
      </table>
      <h3 style="margin:16px 0 4px;font-size:14px;">Message</h3>
      <p style="margin:0;white-space:pre-wrap;">${message ? escapeHtml(message) : "<em>No message</em>"}</p>
      <p style="margin:16px 0 0;color:#555;">The photo is attached. Reply to this email to answer ${escapeHtml(name)} directly.</p>
    </div>`;

  let emailSent = false;
  let emailError = null;
  try {
    await sendBrevoEmail({
      to: NOTIFY_TO,
      replyTo: { email, name },
      subject: `Lithophane request — ${name}`,
      htmlContent,
      attachment: {
        buffer: req.file.buffer,
        filename: attachmentName(originalFilename),
      },
    });
    emailSent = true;
  } catch (err) {
    emailError = String(err?.message || err).slice(0, 1000);
    console.error("Lithophane request email failed:", emailError);
  }

  // Record the enquiry whether or not the email went out, so failed sends can
  // be spotted and followed up. A DB failure must not hide a successful send.
  try {
    await pool.query(
      `INSERT INTO lithophane_requests
         (name, email, phone, message, original_filename, original_bytes,
          compressed_bytes, user_agent, email_sent, email_error)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        phone,
        message,
        originalFilename,
        originalBytes,
        compressedBytes,
        userAgent,
        emailSent,
        emailError,
      ],
    );
  } catch (err) {
    console.error("Failed to record lithophane request:", err?.message || err);
  }

  if (!emailSent) {
    throw new ApiError(
      502,
      `We couldn't send your request just now. Please email your photo to ${FALLBACK_EMAIL} and we'll take it from there.`,
    );
  }

  res.status(201).json({ success: true });
});

module.exports = { createLithophaneRequest };
