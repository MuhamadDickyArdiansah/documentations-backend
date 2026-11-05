import { randomUUID } from 'node:crypto';
// In-memory adapter for learning. Replace with transactional persistent storage before deployment.
export function createNoteRepository() {
  const rows = new Map();
  return {
    create(ownerId, title) { const note = { id: randomUUID(), ownerId, title }; rows.set(note.id, note); return { ...note }; },
    list(ownerId, offset = 0, limit = 20) { return [...rows.values()].filter(row => row.ownerId === ownerId).slice(offset, offset + limit).map(row => ({ ...row })); },
    find(id, ownerId) { const row = rows.get(id); return row?.ownerId === ownerId ? { ...row } : null; },
    update(id, ownerId, title) { const row = rows.get(id); if (row?.ownerId !== ownerId) return null; row.title = title; return { ...row }; },
    delete(id, ownerId) { const row = rows.get(id); return row?.ownerId === ownerId ? rows.delete(id) : false; },
  };
}
