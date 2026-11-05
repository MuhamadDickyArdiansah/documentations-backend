import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { randomBytes } from 'node:crypto';
import { SignJWT } from 'jose';
import { createApp } from './complete-backend/app.mjs';
import { can, owns } from './authorization/policy.mjs';

const secret = randomBytes(48).toString('base64url');
const password = 'correct-example-password';
test('permission policy denies unknown actors and enforces ownership', () => {
  assert.equal(can(null, 'notes:read'), false);
  assert.equal(can({ role: 'unknown' }, 'notes:read'), false);
  assert.equal(can({ role: 'user' }, 'users:read'), false);
  assert.equal(can({ role: 'admin' }, 'users:read'), true);
  assert.equal(owns({ id: 'a' }, { ownerId: 'b' }), false);
});
test('authentication and CRUD contracts', async t => {
  const app = await createApp({ secret, enableRateLimit: false });
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  async function request(method, path, body, token) {
    const response = await fetch(base + path, { method, headers: { ...(body !== undefined && { 'Content-Type': 'application/json' }), ...(token && { Authorization: `Bearer ${token}` }) }, body: body !== undefined ? JSON.stringify(body) : undefined });
    return { status: response.status, body: response.status === 204 ? null : await response.json(), headers: response.headers };
  }
  const register = email => request('POST', '/api/auth/register', { email, password });
  const login = email => request('POST', '/api/auth/login', { email, password });
  await t.test('health, security headers, registration, and validation', async () => {
    const health = await request('GET', '/health');
    assert.equal(health.status, 200); assert.equal(health.headers.get('x-content-type-options'), 'nosniff');
    const user = await register('alice@example.com');
    assert.equal(user.status, 201); assert.equal('passwordHash' in user.body.data, false);
    assert.equal((await register('ALICE@example.com')).status, 409);
    assert.equal((await request('POST', '/api/auth/register', { email: 'bad', password: 'short' })).status, 422);
    assert.equal((await request('POST', '/api/auth/register', { email: 'admin@example.com', password, role: 'admin' })).status, 422);
  });
  let alice, bob;
  await t.test('login rejects invalid credentials and verifies signed JWT', async () => {
    assert.equal((await request('POST', '/api/auth/login', { email: 'alice@example.com', password: 'wrong-long-password' })).status, 401);
    assert.equal((await request('POST', '/api/auth/login', { email: 'missing@example.com', password })).status, 401);
    alice = (await login('alice@example.com')).body.data;
    await register('bob@example.com'); bob = (await login('bob@example.com')).body.data;
    assert.equal((await request('GET', '/api/notes')).status, 401);
    assert.equal((await request('GET', '/api/notes', undefined, `${alice.accessToken}x`)).status, 401);
    const expired = await new SignJWT({ sid: 'fake' }).setProtectedHeader({ alg: 'HS256', typ: 'JWT' }).setSubject('fake').setIssuer('backend-handbook').setAudience('handbook-api').setExpirationTime(1).sign(new TextEncoder().encode(secret));
    assert.equal((await request('GET', '/api/notes', undefined, expired)).status, 401);
  });
  await t.test('CRUD validates data and blocks cross-user reads, updates, and deletes', async () => {
    const token = alice.accessToken;
    assert.equal((await request('POST', '/api/notes', { title: '' }, token)).status, 422);
    assert.equal((await request('POST', '/api/notes', { title: 'note', ownerId: 'bob' }, token)).status, 422);
    const created = await request('POST', '/api/notes', { title: '  First note  ' }, token);
    assert.equal(created.status, 201); assert.equal(created.body.data.title, 'First note');
    const path = `/api/notes/${created.body.data.id}`;
    assert.equal((await request('GET', path, undefined, bob.accessToken)).status, 404);
    assert.equal((await request('PATCH', path, { title: 'stolen' }, bob.accessToken)).status, 404);
    assert.equal((await request('DELETE', path, undefined, bob.accessToken)).status, 404);
    assert.deepEqual((await request('GET', '/api/notes', undefined, bob.accessToken)).body.data, []);
    assert.equal((await request('GET', '/api/notes?limit=1000', undefined, token)).status, 422);
    assert.equal((await request('PATCH', path, { title: 'Updated' }, token)).body.data.title, 'Updated');
    assert.equal((await request('DELETE', path, undefined, token)).status, 204);
    assert.equal((await request('GET', path, undefined, token)).status, 404);
  });
  await t.test('refresh rotation detects replay and revokes the entire session', async () => {
    const rotated = await request('POST', '/api/auth/refresh', { refreshToken: alice.refreshToken });
    assert.equal(rotated.status, 200);
    assert.notEqual(rotated.body.data.refreshToken, alice.refreshToken);
    const replay = await request('POST', '/api/auth/refresh', { refreshToken: alice.refreshToken });
    assert.equal(replay.status, 401); assert.equal(replay.body.error.code, 'REFRESH_REPLAY');
    assert.equal((await request('GET', '/api/notes', undefined, rotated.body.data.accessToken)).status, 401);
    assert.equal((await request('POST', '/api/auth/refresh', { refreshToken: rotated.body.data.refreshToken })).status, 401);
  });
  await t.test('logout immediately invalidates access and refresh credentials', async () => {
    assert.equal((await request('POST', '/api/auth/logout', undefined, bob.accessToken)).status, 204);
    assert.equal((await request('GET', '/api/notes', undefined, bob.accessToken)).status, 401);
    assert.equal((await request('POST', '/api/auth/refresh', { refreshToken: bob.refreshToken })).status, 401);
  });
  await t.test('malformed and oversized JSON are handled without leaking internals', async () => {
    const bad = await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
    assert.equal(bad.status, 400); assert.equal((await bad.json()).error.code, 'INVALID_JSON');
    assert.equal((await request('POST', '/api/auth/login', { email: 'a'.repeat(20000), password })).status, 413);
  });
});
