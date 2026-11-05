import { randomBytes, createHash, randomUUID } from 'node:crypto';
import { SignJWT, jwtVerify } from 'jose';
export function createTokens(secret) {
  if (Buffer.byteLength(secret || '') < 32) throw new Error('JWT_SECRET must contain at least 32 bytes');
  const key = new TextEncoder().encode(secret);
  return {
    async sign(userId, sessionId) {
      return new SignJWT({ sid: sessionId }).setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .setSubject(userId).setIssuer('backend-handbook').setAudience('handbook-api')
        .setIssuedAt().setJti(randomUUID()).setExpirationTime('15m').sign(key);
    },
    async verify(token) {
      const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'], issuer: 'backend-handbook', audience: 'handbook-api', typ: 'JWT' });
      if (typeof payload.sub !== 'string' || typeof payload.sid !== 'string') throw new Error('Invalid claims');
      return payload;
    },
  };
}
export function refreshToken() { return randomBytes(32).toString('base64url'); }
export function digest(token) { return createHash('sha256').update(token).digest('hex'); }
