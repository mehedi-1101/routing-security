const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();

// Allow requests from the React dev server.
// Without this, the browser blocks cross-origin fetch calls.
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true, // required to allow cookies to be sent cross-origin
}));

app.use(express.json());

// --- Hardcoded users (no DB needed) ---
const USERS = [
  { email: 'admin@example.com', password: 'secret123' },
];

// --- In-memory session + CSRF store ---
// Key: sessionId, Value: { email, csrfToken }
// In a real app this would be Redis or a DB table.
const sessions = {};

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// ── POST /login ────────────────────────────────────────────────────────────────
// Validates credentials. On success, creates a session and sets an HttpOnly
// cookie. The frontend never sees the session ID directly.
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const user = USERS.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const sessionId = generateToken();
  sessions[sessionId] = { email: user.email, csrfToken: null };

  // HttpOnly: JS cannot read this cookie — only the browser sends it automatically.
  // This is what makes CSRF a real threat (and why we need the token check).
  res.setHeader('Set-Cookie', `sessionId=${sessionId}; HttpOnly; SameSite=Lax; Path=/`);
  res.json({ ok: true, email: user.email });
});

// ── POST /logout ───────────────────────────────────────────────────────────────
app.post('/logout', (req, res) => {
  const sessionId = parseCookies(req)['sessionId'];
  if (sessionId) delete sessions[sessionId];
  res.setHeader('Set-Cookie', 'sessionId=; HttpOnly; Max-Age=0; Path=/');
  res.json({ ok: true });
});

// ── GET /csrf-token ────────────────────────────────────────────────────────────
// Generates a CSRF token tied to the current session and returns it.
// The frontend will store this and attach it as a header on every POST.
app.get('/csrf-token', (req, res) => {
  const sessionId = parseCookies(req)['sessionId'];
  const session = sessions[sessionId];

  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const csrfToken = generateToken();
  session.csrfToken = csrfToken;
  res.json({ csrfToken });
});

// ── CSRF middleware ────────────────────────────────────────────────────────────
// Reusable guard for any state-changing route. Checks that the request has a
// valid session and a matching CSRF token in the X-CSRF-Token header.
function validateCsrf(req, res, next) {
  const sessionId = parseCookies(req)['sessionId'];
  const session = sessions[sessionId];

  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const incomingToken = req.headers['x-csrf-token'];
  if (!incomingToken || incomingToken !== session.csrfToken) {
    return res.status(403).json({ error: 'Invalid or missing CSRF token' });
  }

  req.session = session;
  next();
}

// ── POST /transfer (demo endpoint to test CSRF protection) ────────────────────
app.post('/transfer', validateCsrf, (req, res) => {
  res.json({ ok: true, message: `Transfer of $${req.body.amount} accepted.` });
});

// ── Helpers ────────────────────────────────────────────────────────────────────
function parseCookies(req) {
  const raw = req.headers.cookie || '';
  return Object.fromEntries(
    raw.split(';').map(c => c.trim().split('=').map(decodeURIComponent))
  );
}

// ── Start ──────────────────────────────────────────────────────────────────────
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
