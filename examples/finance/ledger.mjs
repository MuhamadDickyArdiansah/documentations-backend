import { randomUUID } from 'node:crypto';
// Single-process teaching model. Production transfers require a database transaction.
export function createLedger() {
  const accounts = new Map();
  const transfers = new Map();
  function owned(id, ownerId) { const row = accounts.get(id); if (!row || row.ownerId !== ownerId) throw new Error('ACCOUNT_NOT_FOUND'); return row; }
  function amount(value) { if (!Number.isSafeInteger(value) || value <= 0) throw new Error('INVALID_AMOUNT'); }
  return {
    open(ownerId, currency = 'IDR') {
      if (!ownerId || !/^[A-Z]{3}$/.test(currency)) throw new Error('INVALID_ACCOUNT');
      const row = { id: randomUUID(), ownerId, currency, balanceMinor: 0 };
      accounts.set(row.id, row); return { ...row };
    },
    credit(ownerId, id, amountMinor) {
      amount(amountMinor); const row = owned(id, ownerId);
      if (!Number.isSafeInteger(row.balanceMinor + amountMinor)) throw new Error('AMOUNT_OVERFLOW');
      row.balanceMinor += amountMinor; return { ...row };
    },
    get(ownerId, id) { return { ...owned(id, ownerId) }; },
    transfer(ownerId, { fromId, toId, amountMinor, key }) {
      amount(amountMinor);
      if (typeof key !== 'string' || !key || key.length > 100 || fromId === toId) throw new Error('INVALID_TRANSFER');
      const from = owned(fromId, ownerId), to = owned(toId, ownerId);
      const fingerprint = JSON.stringify([fromId, toId, amountMinor]);
      const mapKey = JSON.stringify([ownerId, key]);
      const prior = transfers.get(mapKey);
      if (prior) { if (prior.fingerprint !== fingerprint) throw new Error('IDEMPOTENCY_CONFLICT'); return { ...prior.result }; }
      if (from.currency !== to.currency) throw new Error('CURRENCY_MISMATCH');
      if (from.balanceMinor < amountMinor) throw new Error('INSUFFICIENT_FUNDS');
      if (!Number.isSafeInteger(to.balanceMinor + amountMinor)) throw new Error('AMOUNT_OVERFLOW');
      // No await between validation and mutations: one atomic synchronous step in this process only.
      from.balanceMinor -= amountMinor; to.balanceMinor += amountMinor;
      const result = { id: randomUUID(), fromId, toId, amountMinor, currency: from.currency };
      transfers.set(mapKey, { fingerprint, result }); return { ...result };
    },
  };
}
