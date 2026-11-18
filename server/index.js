import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { getDB } from './db.js';
import { buildVerseSystemPrompt } from './verseContext.js';

// Resolve __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables - server/.env takes priority
dotenv.config({ path: resolve(__dirname, '.env') });
dotenv.config({ path: resolve(__dirname, '../.env') }); // fallback to root

const app = express();
// API_PORT, not PORT: tools that set PORT for the frontend would otherwise move the API off the port Vite proxies to.
const PORT = process.env.API_PORT || 3001;
// No public fallback in production: a known secret would let anyone forge a login token.
const JWT_SECRET = process.env.JWT_SECRET || (process.env.VERCEL ? null : 'herverse-local-dev-only');
const GROQ_API_KEY = process.env.GROQ_API_KEY;
// Groq retires models over time; override with GROQ_MODEL in Vercel without a code change.
// Groq retired llama-3.3-70b-versatile for free/dev tiers; openai/gpt-oss-120b is its recommended replacement.
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
const MAX_CHAT_HISTORY = 100; // per user, keeps the single-document DB small
const MAX_MESSAGE_CHARS = 4000;

// Fields a client may never set on its own records.
const stripProtected = ({ id, user_id, created_at, ...rest }) => rest;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

const isHealth = (req) => req.path === '/health' || req.path === '/api/health';

app.use((req, res, next) => {
  if (!JWT_SECRET && !isHealth(req)) {
    console.error('JWT_SECRET is not set. Add it in Vercel -> Settings -> Environment Variables.');
    return res.status(500).json({ message: 'Server is not configured (JWT_SECRET missing).' });
  }
  next();
});

// Lazy database initialization (getDB retries on the next request if it failed)
const ensureDB = getDB;

// Every API request needs the database: fail fast with a clear message instead of a vague 500 or a hang.
app.use(async (req, res, next) => {
  if (isHealth(req)) return next();
  try {
    await ensureDB();
    next();
  } catch (error) {
    console.error('Database unavailable:', error);
    res.status(503).json({ message: 'Database unavailable. Please try again shortly.' });
  }
});

// Utilities
const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
};

const getCollectionName = (entityName) => {
  switch (entityName) {
    case 'UserPreferences': return 'preferences';
    case 'DailyCheckIn': return 'daily_checkins';
    case 'PeriodLog': return 'period_logs';
    case 'SymptomLog': return 'symptom_logs';
    case 'Exercise': return 'exercises';
    case 'EmergencyContact': return 'emergency_contacts';
    case 'Task': return 'tasks';
    case 'ChatHistory': return 'chat_history';
    default: return null;
  }
};

const router = express.Router();

// Express 4 does not catch rejected promises from async handlers (the request would hang);
// forward them to the error handler at the bottom instead.
for (const method of ['get', 'post', 'patch', 'delete']) {
  const register = router[method].bind(router);
  router[method] = (path, ...handlers) =>
    register(path, ...handlers.map(h => (req, res, next) => Promise.resolve(h(req, res, next)).catch(next)));
}

// Health check: which storage is live and whether auth and AI are configured (never returns secrets).
router.get('/health', async (req, res) => {
  let storage = null;
  let database = 'ok';
  try {
    const db = await ensureDB();
    storage = db.storage;
    await db.strategy.checkWrite?.();
  } catch (error) {
    database = String(error.message).replace(/https?:\/\/\S+/g, '<url>').slice(0, 200);
  }

  let model = 'GROQ_API_KEY missing';
  if (GROQ_API_KEY) {
    try {
      const r = await fetch('https://api.groq.com/openai/v1/models', { headers: { Authorization: `Bearer ${GROQ_API_KEY}` } });
      model = !r.ok ? `Groq rejected the key (${r.status})`
        : (await r.json()).data?.some(m => m.id === GROQ_MODEL) ? 'ok' : `model ${GROQ_MODEL} not available on Groq`;
    } catch {
      model = 'Groq unreachable';
    }
  }

  res.json({
    ok: database === 'ok' && !!JWT_SECRET && model === 'ok',
    storage,
    database,
    jwtSecret: JWT_SECRET ? 'ok' : 'missing',
    ai: model,
    model: GROQ_MODEL,
  });
});

// -- Auth Routes --

router.post('/auth/register', async (req, res) => {
  try {
    const db = await ensureDB();
    const { name, password } = req.body;
    const email = req.body.email?.trim().toLowerCase() || undefined;
    const phone = req.body.phone?.replace(/[^\d+]/g, '') || undefined;

    if (!name?.trim() || (!email && !phone) || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await db.findUserByEmailOrPhone(email, phone);

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: randomUUID(),
      name: name.trim(),
      email,
      phone,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    await db.createUser(newUser);

    const token = generateToken(newUser);
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const db = await ensureDB();
    const { password } = req.body;
    const email = req.body.email?.trim().toLowerCase() || undefined;
    const phone = req.body.phone?.replace(/[^\d+]/g, '') || undefined;

    if ((!email && !phone) || !password) {
      return res.status(400).json({ message: 'Missing credentials' });
    }

    const user = await db.findUserByEmailOrPhone(email, phone);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const db = await ensureDB();
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await db.findUser({ id: decoded.id });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Generic Entity Routes

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// -- AI Routes (Groq) --

const loadUserData = async (db, userId) => {
  const q = { user_id: userId };
  const [preferences, checkIns, periodLogs, symptoms, exercises, tasks, contacts] = await Promise.all(
    ['preferences', 'daily_checkins', 'period_logs', 'symptom_logs', 'exercises', 'tasks', 'emergency_contacts']
      .map(c => db.findEntities(c, q))
  );
  return { preferences, checkIns, periodLogs, symptoms, exercises, tasks, contacts };
};

const writeSSE = (res, payload) => res.write(`data: ${JSON.stringify(payload)}\n\n`);

router.post('/ai/chat', authenticateToken, async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) {
      return res.status(400).json({ message: 'Invalid messages format' });
    }
    if (!GROQ_API_KEY) {
      return res.status(500).json({ message: 'GROQ_API_KEY is not configured on the server.' });
    }

    // Only user/assistant turns from the client; the system prompt is built here from her data.
    const history = messages
      .filter(m => (m?.role === 'user' || m?.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
      .slice(-20)
      .map(m => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }));
    const userText = history.at(-1)?.role === 'user' ? history.at(-1).content : null;
    if (!userText) return res.status(400).json({ message: 'Last message must be from the user' });

    const db = await ensureDB();
    const user = await db.findUser({ id: req.user.id });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { password: _, ...profile } = user;
    const system = buildVerseSystemPrompt(profile, await loadUserData(db, user.id), req.body.timeZone);

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'system', content: system }, ...history],
        stream: true,
        max_completion_tokens: 2048,
        temperature: 0.7,
        // gpt-oss models reason before answering: keep it quick and keep the reasoning out of the chat.
        ...(GROQ_MODEL.startsWith('openai/gpt-oss') && { reasoning_effort: 'low', include_reasoning: false }),
      }),
    });

    if (!groqResponse.ok) {
      console.error('Groq API error:', groqResponse.status, await groqResponse.text());
      return res.status(502).json({ message: 'VerseAI is unavailable right now. Please try again.' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = groqResponse.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let reply = '';

    const handleLine = (line) => {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ') || trimmed === 'data: [DONE]') return;
      try {
        const content = JSON.parse(trimmed.slice(6)).choices?.[0]?.delta?.content || '';
        if (content) {
          reply += content;
          writeSSE(res, { content });
        }
      } catch {
        // Skip malformed chunks
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Keep incomplete line in buffer
      lines.forEach(handleLine);
    }
    handleLine(buffer);

    // Save both turns in one write, keeping only the most recent MAX_CHAT_HISTORY per user.
    if (reply) {
      const now = Date.now();
      await db.appendChat(user.id, [
        { id: randomUUID(), user_id: user.id, role: 'user', content: userText, timestamp: new Date(now).toISOString() },
        { id: randomUUID(), user_id: user.id, role: 'assistant', content: reply, timestamp: new Date(now + 1).toISOString() },
      ], MAX_CHAT_HISTORY);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('AI error:', error);
    if (res.headersSent) {
      writeSSE(res, { error: 'Connection interrupted' });
      res.end();
    } else {
      res.status(500).json({ message: 'Error processing AI request' });
    }
  }
});

router.delete('/ai/history', authenticateToken, async (req, res) => {
  const db = await ensureDB();
  await db.appendChat(req.user.id, [], 0);
  res.json({ success: true });
});

// Update user profile
router.patch('/auth/profile', authenticateToken, async (req, res) => {
  try {
    const db = await ensureDB();
    const { email, phone, ...rest } = req.body || {};
    // Email/phone are login identifiers; changing them here could collide with another account.
    const updated = await db.updateUser(req.user.id, rest);
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json(updated);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

router.get('/entities/:entity', authenticateToken, async (req, res) => {
  const db = await ensureDB();
  const collectionName = getCollectionName(req.params.entity);
  if (!collectionName) return res.status(404).json({ error: 'Entity not found' });

  // Filter by user_id
  const query = { user_id: req.user.id };
  const options = {
    sort: req.query.sort || req.query.order_by,
    limit: req.query.limit
  };

  const results = await db.findEntities(collectionName, query, options);
  res.json(results);
});

router.post('/entities/:entity', authenticateToken, async (req, res) => {
  const db = await ensureDB();
  const collectionName = getCollectionName(req.params.entity);
  if (!collectionName) return res.status(404).json({ error: 'Entity not found' });

  const newItem = {
    ...stripProtected(req.body || {}),
    id: randomUUID(),
    user_id: req.user.id,
    created_at: new Date().toISOString()
  };

  // One check-in per day: a second create for the same date (double tap, Home and Health) updates the first.
  res.json(await db.createEntity(collectionName, newItem, collectionName === 'daily_checkins' ? ['date'] : []));
});

router.patch('/entities/:entity/:id', authenticateToken, async (req, res) => {
  const db = await ensureDB();
  const collectionName = getCollectionName(req.params.entity);
  if (!collectionName) return res.status(404).json({ error: 'Entity not found' });

  const updatedItem = await db.updateEntity(collectionName, req.params.id, req.user.id, stripProtected(req.body || {}));

  if (!updatedItem) return res.status(404).json({ error: 'Item not found or unauthorized' });
  res.json(updatedItem);
});

router.delete('/entities/:entity/:id', authenticateToken, async (req, res) => {
  const db = await ensureDB();
  const collectionName = getCollectionName(req.params.entity);
  if (!collectionName) return res.status(404).json({ error: 'Entity not found' });

  try {
    const success = await db.deleteEntity(collectionName, req.params.id, req.user.id);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (e) {
    if (e.message === 'Unauthorized') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    throw e;
  }
});

router.delete('/auth/delete', authenticateToken, async (req, res) => {
  try {
    const db = await ensureDB();
    const success = await db.deleteUser(req.user.id);
    if (!success) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Middleware for 404s to help debugging
router.use('*', (req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'Not found', path: req.originalUrl });
});

app.use('/api', router);
app.use('/', router);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', req.method, req.originalUrl, err);
  if (res.headersSent) return res.end();
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
});

// Start server
const startServer = () => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HerVerse server running on http://localhost:${PORT}`);
    console.log(`   AI Provider: Groq (${GROQ_API_KEY ? 'key configured' : 'NO KEY - set GROQ_API_KEY'}, model ${GROQ_MODEL})`);
  });
};

// On Vercel the app is invoked by api/[...route].js; listening there would only waste the function.
if (!process.env.VERCEL) startServer();

export default app;
