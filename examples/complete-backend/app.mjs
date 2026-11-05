import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { hashPassword, verifyPassword } from '../authentication/password.mjs';
import { createTokens, digest, refreshToken } from '../authentication/tokens.mjs';
import { can } from '../authorization/policy.mjs';
import { createNoteRepository } from '../crud/repository.mjs';

const credentials = z.strictObject({ email: z.email().max(254).transform(s => s.toLowerCase()), password: z.string().min(15).max(128) });
const noteInput = z.strictObject({ title: z.string().trim().min(1).max(200) });
const refreshInput = z.strictObject({ refreshToken: z.string().min(40).max(100) });
const pagination = z.object({ page: z.coerce.number().int().min(1).max(10000).default(1), limit: z.coerce.number().int().min(1).max(100).default(20) });
const error = (res, status, code, message) => res.status(status).json({ error: { code, message } });

export async function createApp({ secret = process.env.JWT_SECRET, enableRateLimit = true, now = Date.now } = {}) {
  const tokens = createTokens(secret);
  const users = new Map();
  const sessions = new Map();
  const refreshes = new Map();
  const notes = createNoteRepository();
  const dummyHash = await hashPassword('not-a-real-user-password');
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(express.json({ limit: '16kb' }));
  if (enableRateLimit) {
    app.use(rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: 'draft-8', legacyHeaders: false }));
    app.use('/api/auth', rateLimit({ windowMs: 15 * 60_000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false }));
  }
  app.get('/health', (_req, res) => res.json({ data: { status: 'ok' } }));

  function parse(schema, body, res) {
    const result = schema.safeParse(body);
    if (!result.success) { error(res, 422, 'VALIDATION_ERROR', 'Input tidak memenuhi schema.'); return null; }
    return result.data;
  }
  function newSession(userId) {
    const sid = randomUUID();
    sessions.set(sid, { userId, revoked: false, expiresAt: now() + 7 * 86400_000 });
    return sid;
  }
  async function issue(userId, sid) {
    const refresh = refreshToken();
    refreshes.set(digest(refresh), { sid, used: false });
    return { accessToken: await tokens.sign(userId, sid), refreshToken: refresh, expiresIn: 900, tokenType: 'Bearer' };
  }
  app.post('/api/auth/register', async (req, res) => {
    const data = parse(credentials, req.body, res); if (!data) return;
    const passwordHash = await hashPassword(data.password);
    // This synchronous check+insert is atomic only within this single-process demo.
    if ([...users.values()].some(u => u.email === data.email)) return error(res, 409, 'EMAIL_EXISTS', 'Email sudah digunakan.');
    const user = { id: randomUUID(), email: data.email, passwordHash, role: 'user' };
    users.set(user.id, user);
    return res.status(201).json({ data: { id: user.id, email: user.email, role: user.role } });
  });
  app.post('/api/auth/login', async (req, res) => {
    const data = parse(credentials, req.body, res); if (!data) return;
    const user = [...users.values()].find(u => u.email === data.email);
    const valid = await verifyPassword(data.password, user?.passwordHash || dummyHash);
    if (!user || !valid) return error(res, 401, 'INVALID_CREDENTIALS', 'Email atau password tidak valid.');
    return res.json({ data: await issue(user.id, newSession(user.id)) });
  });
  app.post('/api/auth/refresh', async (req, res) => {
    const data = parse(refreshInput, req.body, res); if (!data) return;
    const record = refreshes.get(digest(data.refreshToken));
    const session = record && sessions.get(record.sid);
    if (!record || !session || session.revoked || session.expiresAt <= now()) return error(res, 401, 'INVALID_REFRESH', 'Sesi tidak valid.');
    if (record.used) { session.revoked = true; return error(res, 401, 'REFRESH_REPLAY', 'Sesi dicabut. Silakan login kembali.'); }
    // Mark used before the first await; retain the record for replay detection.
    record.used = true;
    return res.json({ data: await issue(session.userId, record.sid) });
  });
  async function authenticate(req, res, next) {
    const match = /^Bearer ([^\s]+)$/i.exec(req.headers.authorization || '');
    if (!match) return error(res, 401, 'UNAUTHORIZED', 'Bearer token diperlukan.');
    try {
      const payload = await tokens.verify(match[1]);
      const session = sessions.get(payload.sid);
      const user = users.get(payload.sub);
      if (!user || !session || session.userId !== user.id || session.revoked || session.expiresAt <= now()) throw new Error('Invalid session');
      req.actor = { id: user.id, role: user.role };
      req.sessionId = payload.sid;
      next();
    } catch { return error(res, 401, 'UNAUTHORIZED', 'Token tidak valid atau sesi berakhir.'); }
  }
  app.post('/api/auth/logout', authenticate, (req, res) => { sessions.get(req.sessionId).revoked = true; res.status(204).end(); });
  app.use('/api/notes', authenticate);
  app.use('/api/notes', (req, res, next) => {
    const permission = req.method === 'GET' ? 'notes:read' : 'notes:write';
    if (!can(req.actor, permission)) return error(res, 403, 'FORBIDDEN', 'Permission tidak mencukupi.');
    next();
  });
  app.get('/api/notes', (req, res) => {
    const params = parse(pagination, req.query, res); if (!params) return;
    const { page, limit } = params;
    res.json({ data: notes.list(req.actor.id, (page - 1) * limit, limit), meta: { page, limit } });
  });
  app.post('/api/notes', (req, res) => { const data = parse(noteInput, req.body, res); if (data) res.status(201).json({ data: notes.create(req.actor.id, data.title) }); });
  app.get('/api/notes/:id', (req, res) => { const note = notes.find(req.params.id, req.actor.id); return note ? res.json({ data: note }) : error(res, 404, 'NOT_FOUND', 'Note tidak ditemukan.'); });
  app.patch('/api/notes/:id', (req, res) => {
    const data = parse(noteInput, req.body, res); if (!data) return;
    const note = notes.update(req.params.id, req.actor.id, data.title);
    return note ? res.json({ data: note }) : error(res, 404, 'NOT_FOUND', 'Note tidak ditemukan.');
  });
  app.delete('/api/notes/:id', (req, res) => { return notes.delete(req.params.id, req.actor.id) ? res.status(204).end() : error(res, 404, 'NOT_FOUND', 'Note tidak ditemukan.'); });
  app.use((_req, res) => error(res, 404, 'NOT_FOUND', 'Endpoint tidak ditemukan.'));
  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    if (err.type === 'entity.too.large') return error(res, 413, 'PAYLOAD_TOO_LARGE', 'Body terlalu besar.');
    if (err.type === 'entity.parse.failed') return error(res, 400, 'INVALID_JSON', 'JSON tidak valid.');
    return error(res, 500, 'INTERNAL_ERROR', 'Terjadi kesalahan internal.');
  });
  return app;
}
