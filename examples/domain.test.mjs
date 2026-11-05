import test from 'node:test';
import assert from 'node:assert/strict';
import { createLedger } from './finance/ledger.mjs';
import { publicProfile, updateOwnProfile } from './user-management/profile.mjs';
test('profile update rejects privilege escalation and another user', () => {
  const user = { id: 'u1', email: 'reader@example.com', role: 'user', passwordHash: 'private' };
  assert.throws(() => updateOwnProfile({ id: 'u2' }, user, { displayName: 'Other' }));
  assert.throws(() => updateOwnProfile({ id: 'u1' }, user, { displayName: 'Reader', role: 'admin' }));
  const updated = updateOwnProfile({ id: 'u1' }, user, { displayName: ' Reader ' });
  assert.equal(updated.displayName, 'Reader'); assert.equal(updated.role, 'user');
  assert.equal('passwordHash' in publicProfile(updated), false);
});
test('transfers preserve balance, enforce ownership, and make retries idempotent', () => {
  const ledger = createLedger();
  const a = ledger.open('u1'), b = ledger.open('u1'), outsider = ledger.open('u2');
  ledger.credit('u1', a.id, 10000);
  const transfer = { fromId: a.id, toId: b.id, amountMinor: 3000, key: 'transfer-1' };
  const first = ledger.transfer('u1', transfer);
  assert.deepEqual(ledger.transfer('u1', transfer), first);
  assert.equal(ledger.get('u1', a.id).balanceMinor, 7000);
  assert.equal(ledger.get('u1', a.id).balanceMinor + ledger.get('u1', b.id).balanceMinor, 10000);
  assert.throws(() => ledger.transfer('u1', { ...transfer, amountMinor: 4000 }), /IDEMPOTENCY_CONFLICT/);
  assert.throws(() => ledger.transfer('u1', { ...transfer, toId: outsider.id, key: 'other' }), /ACCOUNT_NOT_FOUND/);
  assert.throws(() => ledger.transfer('u1', { ...transfer, amountMinor: 8000, key: 'too-much' }), /INSUFFICIENT_FUNDS/);
  assert.throws(() => ledger.transfer('u1', { ...transfer, amountMinor: 0.5, key: 'fraction' }), /INVALID_AMOUNT/);
  assert.equal(ledger.get('u1', a.id).balanceMinor, 7000);
});
