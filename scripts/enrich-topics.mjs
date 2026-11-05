import fs from 'node:fs';
const snippets = {
javascript: {
'javascript-fundamentals': ['js', 'const formatTitle = value => String(value).trim();\nconsole.assert(formatTitle("  Backend  ") === "Backend");'],
'variables-and-data-types': ['js','const config = { port: 4000 };\nconfig.port = 5000; // const tidak membuat object immutable\nconsole.log(typeof config.port); // number\nconsole.log(null === undefined); // false'],
'functions': ['js','export function calculateTotal(items) {\n  return items.reduce((total, item) => total + item.price * item.quantity, 0);\n}\nconsole.assert(calculateTotal([{ price: 5000, quantity: 2 }]) === 10000);'],
'objects-and-arrays': ['js','const user = { id: "u1", email: "reader@example.com", passwordHash: "internal" };\nconst { id, email } = user;\nconst response = { id, email };\nconsole.assert(!("passwordHash" in response));'],
'asynchronous-programming': ['js','const delay = ms => new Promise(resolve => setTimeout(resolve, ms));\nawait Promise.all([delay(10), delay(20)]);\nconsole.log("Kedua operasi selesai");'],
'promise': ['js','const results = await Promise.allSettled([\n  Promise.resolve("ok"),\n  Promise.reject(new Error("Provider unavailable")),\n]);\nconsole.log(results.map(result => result.status)); // fulfilled, rejected'],
'async-await': ['js','export async function loadWithTimeout(url) {\n  const response = await fetch(url, { signal: AbortSignal.timeout(3000) });\n  if (!response.ok) throw new Error(`HTTP ${response.status}`);\n  return response.json();\n}\n// URL ditentukan server dari konfigurasi yang dipercaya.'],
'modules': ['js','// math.mjs\nexport const sum = (a, b) => a + b;\n// Pada main.mjs yang terpisah:\n// import { sum } from "./math.mjs";\n// console.log(sum(2, 3)); // 5'],
'error-handling': ['js','export class ValidationError extends Error {\n  constructor(message) { super(message); this.name = "ValidationError"; }\n}\nexport function title(value) {\n  if (typeof value !== "string" || !value.trim()) throw new ValidationError("Title wajib diisi");\n  return value.trim();\n}'],
'typescript-fundamentals': ['ts','function readTitle(value: unknown): string {\n  if (typeof value !== "string") throw new Error("Title harus string");\n  return value.trim();\n}\nconsole.log(readTitle("Backend"));'],
'type-and-interface': ['ts','interface Note { id: string; title: string }\ntype Result<T> = { ok: true; data: T } | { ok: false; code: string };\nfunction unwrap(result: Result<Note>): string {\n  return result.ok ? result.data.title : result.code;\n}'],
'generics': ['ts','function first<T>(items: readonly T[]): T | undefined {\n  return items[0];\n}\nconst title = first(["Backend", "Testing"]); // string | undefined'],
'typescript-configuration': ['json','{"compilerOptions":{"target":"ES2022","module":"NodeNext","moduleResolution":"NodeNext","strict":true,"noUncheckedIndexedAccess":true,"outDir":"dist"},"include":["src/**/*.ts"]}'],
},
nodejs: {
'node-js-architecture': ['js','import { availableParallelism } from "node:os";\nconsole.log({ logicalParallelism: availableParallelism() });\n// Ini kapasitas yang tersedia, bukan jumlah request yang dapat ditangani.'],
'event-loop': ['js','console.log("sync");\nqueueMicrotask(() => console.log("microtask"));\nsetImmediate(() => console.log("check phase"));\n// sync -> microtask -> check phase'],
'npm': ['bash','npm ls --depth=0\nnpm audit\nnpm ci'],
'environment-variables': ['js','const port = Number(process.env.PORT ?? 4000);\nif (!Number.isInteger(port) || port < 1 || port > 65535) {\n  throw new Error("PORT harus integer 1–65535");\n}\nconsole.log({ port }); // Jangan log seluruh process.env.'],
'file-system': ['js','import { readFile } from "node:fs/promises";\ntry {\n  const content = await readFile(new URL("./config.json", import.meta.url), "utf8");\n  console.log(JSON.parse(content));\n} catch (error) {\n  if (error.code === "ENOENT") console.error("Config tidak tersedia");\n  else throw error;\n}'],
'error-handling': ['js','import { pipeline } from "node:stream/promises";\nimport { createReadStream, createWriteStream } from "node:fs";\n// Kedua path berasal dari konfigurasi server, bukan input bebas.\nawait pipeline(createReadStream("input.txt"), createWriteStream("output.txt"));\n// pipeline meneruskan error dan membersihkan stream.'],
'package-management': ['bash','npm install express@5\nnpm install --save-dev typescript\nnpm ls express'],
},
express: {
'routing': ['js','import { Router } from "express";\nexport const router = Router();\nrouter.get("/health", (_req, res) => res.json({ data: { status: "ok" } }));\n// Mount pada app: app.use("/api/v1", router);'],
'middleware': ['js','import { randomUUID } from "node:crypto";\nexport function requestId(req, res, next) {\n  req.requestId = randomUUID();\n  res.setHeader("X-Request-ID", req.requestId);\n  next();\n}'],
'controllers': ['js','export function createController(service) {\n  return async function list(req, res) {\n    const notes = await service.listForUser(req.actor.id);\n    res.json({ data: notes });\n  };\n}'],
'services': ['js','export function createService(repository) {\n  return {\n    async create(actor, title) {\n      if (!title.trim()) throw new Error("Title wajib diisi");\n      return repository.create(actor.id, title.trim());\n    },\n  };\n}'],
'repository-pattern': ['js','export function createRepository(client) {\n  return {\n    findForUser(id, ownerId) {\n      return client.find({ id, ownerId });\n    },\n  };\n}\n// client adalah adapter storage dengan operasi find berscope.'],
'request-and-response': ['js','export function publicUser(user) {\n  return { id: user.id, email: user.email };\n}\n// Controller: res.status(201).json({ data: publicUser(created) });'],
'error-handling': ['js','export function errorHandler(error, req, res, next) {\n  if (res.headersSent) return next(error);\n  if (error.type === "entity.parse.failed") {\n    return res.status(400).json({ error: { code: "INVALID_JSON", message: "JSON tidak valid" } });\n  }\n  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan internal" } });\n}\n// app.use(errorHandler) ditempatkan terakhir.'],
'validation': ['js','import { z } from "zod";\nconst schema = z.strictObject({ title: z.string().trim().min(1).max(200) });\nconst result = schema.safeParse({ title: "  Backend  " });\nif (result.success) console.log(result.data.title); // Backend'],
'logging': ['js','export function logResponse(req, res, next) {\n  const start = performance.now();\n  res.on("finish", () => console.log(JSON.stringify({\n    event: "http_request", requestId: req.requestId,\n    method: req.method, status: res.statusCode, durationMs: performance.now() - start,\n  })));\n  next();\n}\n// Tidak mencatat cookie, token, password, atau body.'],
'api-architecture': ['text','HTTP controller -> use case -> repository interface\n                                |\n                                +-> PostgreSQL adapter\n                                +-> in-memory test adapter'],
},
'rest-api': {
'http-methods': ['http','GET /api/notes HTTP/1.1\nAuthorization: Bearer <access-token>\nAccept: application/json'],
'http-status-codes': ['json','{"error":{"code":"VALIDATION_ERROR","message":"Input tidak memenuhi schema."}}'],
'endpoint-design': ['text','GET    /api/v1/notes\nPOST   /api/v1/notes\nGET    /api/v1/notes/:id\nPATCH  /api/v1/notes/:id\nDELETE /api/v1/notes/:id'],
'url-parameters': ['js','import { z } from "zod";\nexport const paramsSchema = z.object({ id: z.uuid() });\n// paramsSchema.parse(req.params), sebelum repository dipanggil.'],
'query-parameters': ['js','import { z } from "zod";\nexport const querySchema = z.object({\n  page: z.coerce.number().int().min(1).default(1),\n  limit: z.coerce.number().int().min(1).max(100).default(20),\n});'],
'request-body': ['js','import express from "express";\nconst app = express();\napp.use(express.json({ limit: "16kb", strict: true }));\n// Daftarkan router setelah parser, error handler setelah router.'],
'api-response-format': ['json','{"data":[{"id":"n1","title":"Backend"}],"meta":{"page":1,"limit":20}}'],
'pagination': ['js','export function paginate(rows, page = 1, limit = 20) {\n  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {\n    throw new RangeError("Pagination tidak valid");\n  }\n  return rows.slice((page - 1) * limit, page * limit);\n}'],
'filtering': ['js','const notes = [{ ownerId: "u1", archived: false }, { ownerId: "u2", archived: false }];\nconst actor = { id: "u1" };\nconst filtered = notes.filter(n => n.ownerId === actor.id && !n.archived);\nconsole.assert(filtered.length === 1);'],
'sorting': ['js','const rows = [{ id: "b", title: "B" }, { id: "a", title: "A" }];\nconst sorted = [...rows].sort((a, b) => a.title.localeCompare(b.title) || a.id.localeCompare(b.id));\nconsole.log(sorted.map(row => row.id)); // a, b'],
'searching': ['js','export function searchTitles(notes, query) {\n  const q = query.trim().toLocaleLowerCase("id-ID");\n  if (!q || q.length > 100) return [];\n  return notes.filter(n => n.title.toLocaleLowerCase("id-ID").includes(q));\n}\n// Scope notes ke actor sebelum memanggil fungsi ini.'],
'api-versioning': ['js','import express from "express";\nconst app = express();\nconst v1 = express.Router();\nv1.get("/health", (_req, res) => res.json({ data: { status: "ok" } }));\napp.use("/api/v1", v1);'],
'rate-limiting': ['js','import { rateLimit } from "express-rate-limit";\nexport const loginLimiter = rateLimit({\n  windowMs: 15 * 60_000, limit: 30,\n  standardHeaders: "draft-8", legacyHeaders: false,\n});\n// app.use("/api/auth/login", loginLimiter); satu proses saja.'],
'openapi-swagger': ['yaml','openapi: 3.1.0\ninfo:\n  title: Notes API\n  version: 1.0.0\npaths:\n  /health:\n    get:\n      summary: Status proses\n      responses:\n        "200":\n          description: Proses berjalan'],
},
authorization: {
'authorization-fundamentals': ['js','export function allow(actor, action, resource) {\n  if (!actor || !resource) return false;\n  return action === "read" && actor.id === resource.ownerId;\n}'],
'role-based-access-control': ['js','const grants = { user: ["notes:read"], editor: ["notes:read", "notes:write"] };\nexport const hasPermission = (actor, permission) =>\n  Boolean(actor && grants[actor.role]?.includes(permission));'],
'permission-based-access-control': ['js','export function requirePermission(permission, policy) {\n  return (req, res, next) => {\n    if (!policy(req.actor, permission)) return res.status(403).json({ error: { code: "FORBIDDEN" } });\n    next();\n  };\n}'],
'resource-ownership': ['js','export function visibleTo(actor, rows) {\n  if (!actor) return [];\n  return rows.filter(row => row.ownerId === actor.id);\n}\n// Di SQL: WHERE id = $1 AND owner_id = $2'],
'protected-routes': ['text','request -> verify JWT -> load active session -> permission -> ownership -> handler\n           |              |                     |            |\n           401            401                   403          404'],
'authorization-middleware': ['js','export function requireOwner(loadResource) {\n  return async (req, res, next) => {\n    const resource = await loadResource(req.params.id, req.actor.id);\n    if (!resource) return res.status(404).json({ error: { code: "NOT_FOUND" } });\n    req.resource = resource;\n    next();\n  };\n}'],
'role-and-permission-schema': ['sql','CREATE TABLE role_permissions (\n  role_name text NOT NULL,\n  permission text NOT NULL,\n  PRIMARY KEY (role_name, permission)\n);'],
'admin-user-permissions': ['js','const permissions = {\n  user: new Set(["profile:read:self", "profile:update:self"]),\n  admin: new Set(["users:read", "users:disable"]),\n};\nexport const can = (role, action) => permissions[role]?.has(action) ?? false;'],
},
database: {
'database-fundamentals': ['sql','CREATE TABLE users (\n  id uuid PRIMARY KEY,\n  email text NOT NULL UNIQUE,\n  created_at timestamptz NOT NULL DEFAULT now()\n);'],
'database-relationships': ['sql','CREATE TABLE user_notes (\n  id uuid PRIMARY KEY,\n  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,\n  title varchar(200) NOT NULL\n);\nCREATE INDEX user_notes_owner_idx ON user_notes(owner_id);'],
'transactions': ['sql','BEGIN;\nINSERT INTO users (id, email)\nVALUES (\'00000000-0000-4000-8000-000000000001\', \'demo@example.com\');\nINSERT INTO user_notes (id, owner_id, title)\nVALUES (\'00000000-0000-4000-8000-000000000002\',\n        \'00000000-0000-4000-8000-000000000001\', \'First note\');\nCOMMIT;\n-- Jalankan setelah membuat tabel users dan user_notes.'],
'indexing': ['sql','CREATE INDEX user_notes_owner_title_idx ON user_notes(owner_id, title, id);\nEXPLAIN SELECT id, title FROM user_notes\nWHERE owner_id = \'00000000-0000-4000-8000-000000000001\'\nORDER BY title, id LIMIT 20;'],
'query-optimization': ['sql','EXPLAIN (ANALYZE, BUFFERS)\nSELECT id, title FROM user_notes\nWHERE owner_id = \'00000000-0000-4000-8000-000000000001\'\nORDER BY title, id LIMIT 20;\n-- ANALYZE benar-benar menjalankan query. Gunakan lingkungan yang aman.'],
'seeding': ['sql','INSERT INTO users (id, email)\nVALUES (\'00000000-0000-4000-8000-000000000001\', \'demo@example.com\')\nON CONFLICT (email) DO NOTHING;\n-- Seed development, bukan akun production.'],
'migrations': ['sql','-- Contoh expand: tambah kolom nullable agar versi lama tetap bekerja.\nALTER TABLE users ADD COLUMN display_name text;\n-- Backfill dan deploy pembaca baru sebelum memperketat constraint.'],
'database-design': ['sql','CREATE TABLE accounts (\n  id uuid PRIMARY KEY,\n  owner_id uuid NOT NULL REFERENCES users(id),\n  currency char(3) NOT NULL,\n  balance_minor bigint NOT NULL CHECK (balance_minor >= 0)\n);'],
'postgresql': ['bash','psql "$DATABASE_URL" -c "SELECT current_database(), current_user;"\n# DATABASE_URL berasal dari environment, bukan disimpan pada source.'],
},
crud: {
'create': ['js','import { createNoteRepository } from "./examples/crud/repository.mjs";\nconst repository = createNoteRepository();\nconst note = repository.create("u1", "Backend");\nconsole.assert(note.ownerId === "u1");'],
'read': ['js','import { createNoteRepository } from "./examples/crud/repository.mjs";\nconst repository = createNoteRepository();\nconst note = repository.create("u1", "Private");\nconsole.assert(repository.find(note.id, "u2") === null);'],
'update': ['js','import { createNoteRepository } from "./examples/crud/repository.mjs";\nconst repository = createNoteRepository();\nconst note = repository.create("u1", "Draft");\nconsole.log(repository.update(note.id, "u1", "Published"));'],
'delete': ['js','import { createNoteRepository } from "./examples/crud/repository.mjs";\nconst repository = createNoteRepository();\nconst note = repository.create("u1", "Temporary");\nconsole.assert(repository.delete(note.id, "u1"));\nconsole.assert(!repository.delete(note.id, "u1"));'],
'crud-validation': ['js','import { z } from "zod";\nexport const createNote = z.strictObject({ title: z.string().trim().min(1).max(200) });\nexport const updateNote = createNote.partial().refine(value => Object.keys(value).length > 0);\n// ownerId tidak termasuk allowlist dan akan ditolak.'],
'pagination-and-filtering': ['js','import { createNoteRepository } from "./examples/crud/repository.mjs";\nconst repository = createNoteRepository();\nrepository.create("u1", "One");\nrepository.create("u2", "Hidden");\nconsole.assert(repository.list("u1", 0, 20).length === 1);'],
'soft-delete': ['sql','ALTER TABLE user_notes ADD COLUMN deleted_at timestamptz;\nSELECT id, title FROM user_notes\nWHERE owner_id = \'00000000-0000-4000-8000-000000000001\'\nAND deleted_at IS NULL;'],
'crud-with-authorization': ['js','import { can, owns } from "./examples/authorization/policy.mjs";\nconst actor = { id: "u1", role: "user" };\nconst note = { ownerId: "u2" };\nconsole.assert(can(actor, "notes:write"));\nconsole.assert(!owns(actor, note)); // Permission saja belum cukup.'],
},
security: {
'cors': ['js','// Middleware allowlist minimal. Untuk konfigurasi lengkap gunakan paket cors.\nexport function allowedOrigin(req, res, next) {\n  const origin = req.headers.origin;\n  if (origin && origin !== "https://app.example.com") return res.status(403).end();\n  if (origin) { res.setHeader("Access-Control-Allow-Origin", origin); res.vary("Origin"); }\n  next();\n}\n// Ini bukan authentication dan tidak menangani seluruh preflight.'],
'helmet-and-security-headers': ['js','import helmet from "helmet";\nimport express from "express";\nconst app = express();\napp.use(helmet());\napp.disable("x-powered-by");'],
'input-validation': ['js','import { z } from "zod";\nconst schema = z.strictObject({ title: z.string().trim().min(1).max(200) });\nconsole.assert(!schema.safeParse({ title: "Note", role: "admin" }).success);'],
'sql-injection-prevention': ['sql','-- Prepared statement PostgreSQL, bukan interpolasi string dari client.\nPREPARE note_for_owner(uuid, uuid) AS\nSELECT id, title FROM user_notes WHERE id = $1 AND owner_id = $2;\n-- Panggil menggunakan driver dengan parameter terpisah.'],
'csrf-protection': ['js','const allowed = new Set(["https://app.example.com"]);\nexport function checkOrigin(req, res, next) {\n  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();\n  if (!allowed.has(req.headers.origin)) return res.status(403).end();\n  next();\n}\n// Terapkan bersama SameSite dan strategi CSRF token sesuai konteks.'],
'secret-management': ['js','const secret = process.env.JWT_SECRET;\nif (!secret || Buffer.byteLength(secret) < 32) {\n  throw new Error("JWT_SECRET tidak valid");\n}\n// Jangan console.log(secret), memasukkannya ke response, atau commit .env.'],
'token-security': ['js','import { randomBytes, createHash } from "node:crypto";\nconst token = randomBytes(32).toString("base64url");\nconst hash = createHash("sha256").update(token).digest("hex");\n// Simpan hash + expiry pada server, kirim token sekali melalui saluran aman.'],
'secure-file-upload': ['js','import { randomUUID } from "node:crypto";\nexport function storageKey() { return `uploads/${randomUUID()}`; }\n// Verifikasi magic bytes dan size sebelum menyimpan.\n// Jangan gunakan filename client sebagai path storage.'],
},
advanced: {
'external-api-integration': ['js','export async function providerJSON(url) {\n  const response = await fetch(url, { signal: AbortSignal.timeout(5000) });\n  if (!response.ok) throw new Error(`Provider failed: ${response.status}`);\n  return response.json();\n}\n// url dari konfigurasi allowlist server; validasi schema response.'],
'webhooks': ['js','import { createHmac, timingSafeEqual } from "node:crypto";\nexport function verify(rawBody, signatureHex, secret) {\n  const expected = createHmac("sha256", secret).update(rawBody).digest();\n  const actual = Buffer.from(signatureHex, "hex");\n  return actual.length === expected.length && timingSafeEqual(actual, expected);\n}\n// rawBody harus byte asli. Tambahkan timestamp dan event ID untuk menolak replay.'],
'audit-logging': ['js','export function audit({ actorId, action, resourceId }) {\n  console.log(JSON.stringify({\n    at: new Date().toISOString(), actorId, action, resourceId,\n  }));\n}\n// Production: salurkan ke storage dengan retention dan akses terbatas.'],
'idempotency': ['sql','CREATE TABLE idempotency_keys (\n  actor_id uuid NOT NULL,\n  key text NOT NULL,\n  request_hash text NOT NULL,\n  response jsonb,\n  PRIMARY KEY (actor_id, key)\n);\n-- Insert key dan efek bisnis dalam transaksi yang sama.'],
'scheduled-tasks': ['js','const interval = setInterval(() => {\n  console.log({ at: new Date().toISOString(), task: "local-heartbeat" });\n}, 60_000);\ninterval.unref();\n// Untuk tugas terjadwal persisten: scheduler terpusat + lock dan riwayat eksekusi.'],
},
testing: {
'unit-testing': ['js','import test from "node:test";\nimport assert from "node:assert/strict";\nconst trim = value => value.trim();\ntest("menormalisasi spasi", () => assert.equal(trim(" Note "), "Note"));'],
'api-testing': ['js','import { createApp } from "./examples/complete-backend/app.mjs";\nimport { randomBytes } from "node:crypto";\nconst app = await createApp({ secret: randomBytes(48).toString("hex") });\nconst server = app.listen(0, "127.0.0.1", async () => {\n  try {\n    const response = await fetch(`http://127.0.0.1:${server.address().port}/health`);\n    console.assert(response.status === 200);\n  } finally { server.close(); }\n});'],
'mocking': ['js','const fakeRepository = { async findById(id) { return { id, ownerId: "u1" }; } };\nexport function service(repository) {\n  return async (id, actor) => {\n    const note = await repository.findById(id);\n    return note.ownerId === actor.id ? note : null;\n  };\n}\nconsole.assert(await service(fakeRepository)("n1", { id: "u2" }) === null);'],
'authentication-testing': ['bash','node --test examples/backend.test.mjs\n# Mencakup credential salah, JWT rusak/kedaluwarsa, refresh replay, dan logout.'],
'test-coverage': ['bash','node --test --experimental-test-coverage examples/backend.test.mjs'],
},
architecture: {
'dependency-injection': ['js','export const createClockService = clock => ({ now: () => clock() });\nconst fixed = createClockService(() => new Date("2026-01-01T00:00:00Z"));\nconsole.assert(fixed.now().getUTCFullYear() === 2026);'],
'solid-principles': ['js','// Service bergantung pada kemampuan send, bukan provider tertentu.\nexport const notify = sender => async message => sender.send(message);\nconst fake = { async send(message) { return { accepted: Boolean(message) }; } };\nconsole.assert((await notify(fake)("Hello")).accepted);'],
'error-handling-standards': ['js','export class DomainError extends Error {\n  constructor(code, message, options) { super(message, options); this.code = code; }\n}\n// Adapter HTTP memetakan code ke status. Domain tidak mengimpor Express.'],
'logging-standards': ['js','export function logEvent(level, event, context = {}) {\n  const { requestId, resourceId } = context;\n  console.log(JSON.stringify({ level, event, requestId, resourceId, at: new Date().toISOString() }));\n}\n// Allowlist field; jangan menerima arbitrary request body.'],
'code-organization': ['text','src/\n  features/\n    auth/\n      auth.routes.mjs\n      auth.service.mjs\n    notes/\n      notes.routes.mjs\n      notes.service.mjs\n  infrastructure/\n    database.mjs\n  server.mjs'],
'clean-architecture': ['text','domain/       # invariant dan entity\nuse-cases/    # orchestration, bergantung pada port\nports/        # kontrak repository dan provider\nadapters/     # HTTP, database, queue\nmain.mjs      # composition root'],
},
deployment: {
'docker': ['dockerfile','FROM node:24-alpine AS build\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\nFROM node:24-alpine\nWORKDIR /app\nENV NODE_ENV=production\nCOPY --from=build --chown=node:node /app ./\nUSER node\nEXPOSE 3000\nCMD ["npm", "start"]'],
'docker-compose': ['yaml','services:\n  postgres:\n    image: postgres:17-alpine\n    environment:\n      POSTGRES_DB: handbook\n      POSTGRES_USER: handbook\n      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD}\n    ports:\n      - "127.0.0.1:5432:5432"\n    volumes:\n      - pgdata:/var/lib/postgresql/data\nvolumes:\n  pgdata:'],
'environment-configuration': ['js','const origin = new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");\nif (process.env.NODE_ENV === "production" && origin.protocol !== "https:") {\n  throw new Error("Production origin harus HTTPS");\n}'],
'health-checks': ['js','export function registerHealth(app) {\n  app.get("/health", (_req, res) => res.json({ data: { status: "ok" } }));\n}\n// Readiness database memerlukan handler terpisah dengan timeout.'],
'production-configuration': ['bash','npm ci\nnpm run build\n# Tetapkan NODE_ENV=production melalui platform sebelum npm start.\n# Website handbook tidak menjalankan API examples.'],
'monitoring': ['js','export function durationMetric(start, status) {\n  return { durationMs: performance.now() - start, status };\n}\n// Kirim metric ke backend observability; hindari label ber-cardinality tinggi.'],
'deployment-checklist': ['text','[ ] Konfigurasi dan secret production valid\n[ ] Test, typecheck, dependency audit, dan build lulus\n[ ] Migration kompatibel dan backup dapat dipulihkan\n[ ] Health check dan smoke test berhasil\n[ ] Error rate dan latency dipantau\n[ ] Versi sebelumnya tersedia untuk rollback'],
},
};
let count=0;
for(const [category, topics] of Object.entries(snippets)) {
 for(const [slug,[lang,code]] of Object.entries(topics)) {
  const file=`content/docs/${category}/${slug}.mdx`;
  if(!fs.existsSync(file)) throw new Error(`Missing topic ${file}`);
  let text=fs.readFileSync(file,'utf8');
  if(text.includes('### Contoh terfokus')) continue;
  const marker=/Contoh dasar [^\n]+:\n/;
  if(!marker.test(text)) continue;
  const context=category==='crud'||slug==='api-testing' ? 'Jalankan berkas .mjs ini dari root repository agar path import examples sesuai.' : 'Cuplikan ini berfokus pada konsep di atas. Untuk fragmen middleware, daftarkan pada aplikasi Express setelah dependensi yang dibutuhkan; contoh aplikasi lengkap tersedia pada Project References.';
  text=text.replace(marker,`### Contoh terfokus\n\n${context}\n\n\`\`\`${lang} title="${slug}.${lang==='js'?'mjs':lang}"\n${code}\n\`\`\`\n\n### Konteks kategori\n`);
  fs.writeFileSync(file,text); count++;
 }
}
console.log(`Enriched ${count} articles with topic-specific implementations.`);
