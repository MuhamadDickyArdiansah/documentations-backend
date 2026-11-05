import { randomBytes } from 'node:crypto';
import { createApp } from './app.mjs';
if (process.env.NODE_ENV === 'production') throw new Error('The in-memory teaching adapter is not suitable for production.');
const app = await createApp({ secret: process.env.JWT_SECRET || randomBytes(48).toString('base64url') });
const port = Number(process.env.PORT || 4000);
const server = app.listen(port, '127.0.0.1', () => console.log(`Learning API: http://localhost:${port} (in-memory; resets on restart)`));
function shutdown() { server.close(() => process.exit(0)); setTimeout(() => process.exit(1), 10_000).unref(); }
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
