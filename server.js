// ============================================================
// server.js — Portfolio contact form backend
// Receives form submissions and sends an SMS via Twilio
// ============================================================

'use strict';

require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');
const twilio     = require('twilio');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Twilio client ────────────────────────────────────────────
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// ── Middleware ───────────────────────────────────────────────
app.use(express.json());

// Only allow requests from the portfolio origin
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://127.0.0.1:5500,http://localhost:5500,null')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (e.g. opening index.html directly as a file)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
}));

// Rate-limit the contact endpoint — max 5 requests per 15 min per IP
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many messages sent. Please try again later.' },
});

// ── Helper: sanitise a string (strip HTML tags, trim) ────────
function sanitise(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim().slice(0, 500);
}

// ── POST /api/contact ────────────────────────────────────────
app.post('/api/contact', contactLimiter, async (req, res) => {
  const name    = sanitise(req.body.name);
  const email   = sanitise(req.body.email);
  const message = sanitise(req.body.message);

  // ── Validation ──────────────────────────────────────────
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  // ── Build SMS body ───────────────────────────────────────
  const smsBody = [
    '📬 New Portfolio Message',
    `From : ${name}`,
    `Email: ${email}`,
    `Msg  : ${message.slice(0, 160)}`,
  ].join('\n');

  // ── Send SMS via Twilio ──────────────────────────────────
  try {
    await twilioClient.messages.create({
      body: smsBody,
      from: process.env.TWILIO_PHONE_NUMBER,   // your Twilio number
      to:   process.env.OWNER_PHONE_NUMBER,    // +6590192209
    });

    console.log(`[contact] SMS sent for message from ${name} <${email}>`);
    return res.status(200).json({ ok: true, message: 'Message sent successfully!' });

  } catch (err) {
    console.error('[contact] Twilio error:', err.message);
    return res.status(502).json({ error: 'Failed to send notification. Please try again.' });
  }
});

// ── Health check ─────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Portfolio backend running on http://localhost:${PORT}`);
});
