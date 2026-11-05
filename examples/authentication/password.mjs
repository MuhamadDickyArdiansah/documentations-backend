import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const derive = promisify(scrypt);
const options = { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = await derive(password, salt, 64, options);
  return `scrypt:${salt}:${hash.toString('hex')}`;
}
export async function verifyPassword(password, encoded) {
  const [algorithm, salt, stored] = encoded.split(':');
  if (algorithm !== 'scrypt' || !salt || !stored) return false;
  const expected = Buffer.from(stored, 'hex');
  const actual = await derive(password, salt, 64, options);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
