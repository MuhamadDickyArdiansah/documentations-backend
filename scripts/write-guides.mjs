import fs from 'node:fs';
const fence = (lang, title, code) => `\n\`\`\`${lang} title="${title}"\n${code.trim()}\n\`\`\`\n`;
const source = file => fence('js', `examples/${file}`, fs.readFileSync(`examples/${file}`, 'utf8'));
const write = (file, title, description, body) => fs.writeFileSync(`content/docs/${file}.mdx`, `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\n---\n\n${body.trim()}\n`);

write('getting-started/introduction', 'Introduction', 'Satu handbook untuk memahami, membangun, dan merawat backend JavaScript & TypeScript.', `
## Selamat datang

Backend adalah bagian aplikasi yang menerima request, menjalankan aturan bisnis, dan mengelola data. Di balik tombol “Simpan”, ada validasi, keputusan hak akses, operasi database, serta response yang perlu dirancang dengan jelas.

Handbook ini membantu kamu memahami alasan di balik implementasi. Kamu akan mulai dengan HTTP dan Node.js, membangun API Express, menambahkan database dan identitas, kemudian menguji serta merilisnya.

<Callout type="info" title="Untuk siapa handbook ini?">Developer yang baru mulai belajar backend, frontend engineer yang ingin menjadi fullstack, dan backend engineer yang membutuhkan referensi implementasi.</Callout>

## Concept

Alur dasar backend dapat dibaca sebagai empat tahap:

| Tahap | Tanggung jawab | Contoh |
| --- | --- | --- |
| Transport | Menerima dan mengurai request | POST /api/notes |
| Validation & policy | Memeriksa input dan hak akses | Title tidak kosong, user terautentikasi |
| Business & data | Menjalankan aturan dan menyimpan hasil | Membuat note milik actor |
| Response | Mengembalikan hasil yang konsisten | HTTP 201 dan object data |

Jangan mengandalkan validasi frontend. Request dapat dibuat langsung melalui curl, script, atau client lain.

## Prerequisites

- Dasar JavaScript: fungsi, object, array, dan Promise.
- Terminal dan Git.
- Node.js LTS yang masih didukung. Periksa [rilis resmi](https://nodejs.org/en/about/previous-releases).

## Installation

Clone repository handbook, lalu dari root jalankan:
${fence('bash','terminal','npm ci\nnpm run dev')}

## Project Structure

Artikel disimpan sebagai MDX pada content/docs. Contoh backend terpisah pada examples dan tidak dipakai sebagai server untuk website dokumentasi.
${fence('text','repository','content/docs/     # Artikel MDX dan navigasi\nsrc/app/          # Website Next.js\nsrc/components/   # Komponen UI\nexamples/         # API pembelajaran yang dapat dijalankan')}

## Implementation

<Cards>
<Card title="Ikuti roadmap" href="/docs/getting-started/backend-roadmap">Bangun fondasi dan pilih urutan belajar.</Card>
<Card title="Langsung praktik" href="/docs/getting-started/first-backend-application">Buat endpoint pertama menggunakan Express.</Card>
<Card title="Cari implementasi" href="/docs/projects/complete-backend-starter">Pelajari contoh auth, authorization, dan CRUD.</Card>
</Cards>

## Code Explanation

Setiap artikel memperkenalkan konsep sebelum kode. Label filename menunjukkan lokasi berkas, sementara tab memisahkan JavaScript dan TypeScript jika implementasi berbeda. Gunakan tombol salin untuk mengambil kode tanpa label baris.

## API Examples

Response sukses pada contoh menggunakan field data. Kegagalan menggunakan error.code yang stabil dan error.message yang dapat dibaca. Header, status code, dan body merupakan bagian kontrak yang sama.
${fence('json','200 — GET /health','{"data":{"status":"ok"}}')}

## Error Handling

Periksa versi Node dan hasil npm ci jika contoh gagal dijalankan. Status 401 berarti credential belum valid; 404 juga digunakan untuk resource yang tidak tersedia dalam scope pengguna.

## Security & Best Practices

<Callout type="warn" title="Batas contoh pembelajaran">API lokal memakai penyimpanan in-memory dan diikat ke loopback. Data hilang saat restart. Untuk production, ganti dengan persistence yang mendukung transaksi, gunakan TLS, dan kelola secret melalui platform deployment.</Callout>

## Testing
${fence('bash','terminal','npm run test:examples\nnpm run test:content\nnpm run build')}

## Related Topics

- [Development Environment](/docs/getting-started/development-environment)
- [Backend Roadmap](/docs/getting-started/backend-roadmap)
- [First Backend Application](/docs/getting-started/first-backend-application)
`);

const js = `import express from 'express';
const app = express();
app.use(express.json({ limit: '16kb' }));
app.get('/health', (_req, res) => {
  res.json({ data: { status: 'ok' } });
});
app.get('/api/notes', (_req, res) => {
  res.json({ data: [{ id: '1', title: 'Hello, backend!' }] });
});
app.use((_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Endpoint tidak ditemukan.' } });
});
app.listen(4000, '127.0.0.1', () => console.log('http://localhost:4000'));`;
const ts = js.replace("import express from 'express';", "import express, { type Request, type Response } from 'express';").replaceAll('(_req, res)', '(_req: Request, res: Response)');
write('getting-started/first-backend-application','First Backend Application','Buat API Express pertama yang dapat dijalankan, dipanggil dengan curl, dan dikembangkan secara bertahap.',`
## Overview

Dalam panduan ini kamu membuat dua endpoint: health check dan daftar notes. Tidak ada database atau authentication pada latihan pertama agar alur HTTP mudah dipahami.

## Concept

Express menjalankan middleware sesuai urutan. JSON parser disiapkan lebih dulu, kemudian route, dan terakhir fallback 404. Setiap request harus mengirim response atau diteruskan ke handler berikutnya.

## Prerequisites

Node.js LTS, npm, dan terminal. Gunakan folder baru untuk latihan ini; jangan menjalankan npm init pada root handbook.

## Installation
${fence('bash','terminal','mkdir first-backend\ncd first-backend\nnpm init -y\nnpm pkg set type=module\nnpm install express@5')}

Untuk varian TypeScript, tambahkan compiler dan runner:
${fence('bash','terminal','npm install --save-dev typescript tsx @types/express @types/node')}

## Project Structure
${fence('text','first-backend/','first-backend/\n  package.json\n  package-lock.json\n  app.js       # JavaScript, atau app.ts untuk TypeScript')}

## Implementation

<Tabs items={['JavaScript', 'TypeScript']}>
<Tab value="JavaScript">${fence('js','app.js',js)}</Tab>
<Tab value="TypeScript">${fence('ts','app.ts',ts)}</Tab>
</Tabs>

<Tabs items={['JavaScript', 'TypeScript']}>
<Tab value="JavaScript">${fence('bash','terminal','node --watch app.js')}</Tab>
<Tab value="TypeScript">${fence('bash','terminal','npx tsx watch app.ts')}</Tab>
</Tabs>

## Code Explanation

1. express() membuat aplikasi tanpa langsung membuka port.
2. express.json membatasi ukuran body menjadi 16 KB dan membaca JSON untuk route berikutnya.
3. GET /health mengembalikan status proses. Endpoint ini tidak mengecek database.
4. GET /api/notes mengembalikan array statis. Ini belum CRUD atau data persisten.
5. Fallback mengembalikan JSON 404 dengan kode error yang stabil.
6. Server hanya mendengarkan loopback agar latihan tidak otomatis terbuka ke jaringan lain.

## API Examples

| Method | URL | Auth | Status | Deskripsi |
| --- | --- | --- | --- | --- |
| GET | /health | Tidak | 200 | Status proses |
| GET | /api/notes | Tidak | 200 | Daftar notes statis |

Endpoint GET tidak memerlukan request body.
${fence('bash','terminal','curl -i http://localhost:4000/health\ncurl -i http://localhost:4000/api/notes')}
${fence('json','200 — GET /api/notes','{"data":[{"id":"1","title":"Hello, backend!"}]}')}

## Error Handling

EADDRINUSE berarti port 4000 sudah digunakan. Hentikan proses sebelumnya atau ganti port latihan. Path yang tidak dikenal mengembalikan 404. Penanganan malformed JSON secara terstruktur dibahas pada [Express Error Handling](/docs/express/error-handling).

## Security & Best Practices

<Callout type="warn" title="Sebelum menambah endpoint mutasi">Tambahkan validasi runtime, authentication, dan pemeriksaan ownership. Contoh GET publik ini tidak mengimplementasikan kontrol tersebut.</Callout>

## Testing

Panggil dua endpoint dengan curl dan pastikan status 200. Coba /missing dan pastikan status 404. Untuk aplikasi dengan test otomatis dan CRUD lengkap, jalankan contoh repository:
${fence('bash','root handbook','npm run test:examples\nnpm run examples')}

## Related Topics

- [Routing](/docs/express/routing)
- [Middleware](/docs/express/middleware)
- [Complete Backend Starter](/docs/projects/complete-backend-starter)
`);

write('getting-started/backend-roadmap','Backend Roadmap','Jalur belajar terarah dari JavaScript fundamentals hingga aplikasi backend siap dioperasikan.',`
## Overview

Gunakan roadmap ini sebagai urutan belajar, bukan daftar teknologi yang harus dihafal. Hasil akhirnya adalah satu API notes yang memiliki identitas pengguna, isolasi data, test, dan prosedur rilis.

## Concept

Pelajari alat saat dibutuhkan oleh masalah. Kamu tidak memerlukan Redis untuk endpoint pertama, tetapi harus memahami validasi dan ownership sebelum menyimpan data pengguna.

## Prerequisites

Dasar pemrograman dan akses ke terminal. Jika belum pernah memakai Node.js, mulai dari [Node.js Installation](/docs/getting-started/node-js-installation).

## Installation

Pasang Node.js LTS dan editor. Setelah membuka repository, gunakan npm ci untuk instalasi deterministik.

## Project Structure

Materi dikelompokkan menjadi fondasi, implementasi, dan operasi production. Setiap bagian memiliki target yang bisa diverifikasi.

## Implementation

<Steps>
<Step><h3>01 — Bangun fondasi bahasa</h3><p>Pelajari functions, objects, modules, Promise, dan async/await. Lanjutkan ke TypeScript strict dan validasi runtime.</p><p>Target: fungsi transformasi data yang dapat diuji tanpa server.</p><a href="/docs/javascript">Buka JavaScript & TypeScript →</a></Step>
<Step><h3>02 — Pahami runtime dan HTTP</h3><p>Pelajari event loop, environment variables, routing, middleware, dan status HTTP.</p><p>Target: GET /health dan GET /api/notes yang mengembalikan JSON konsisten.</p><a href="/docs/getting-started/first-backend-application">Bangun API pertama →</a></Step>
<Step><h3>03 — Kelola data</h3><p>Rancang tabel, relasi, constraint, migration, dan transaksi. Tambahkan validasi CRUD serta pagination.</p><p>Target: create, list, update, dan delete dengan error yang jelas.</p><a href="/docs/database">Pelajari Database →</a></Step>
<Step><h3>04 — Tambahkan identitas dan akses</h3><p>Implementasikan hashing password, login, JWT, refresh rotation, serta ownership. Uji akses lintas user.</p><p>Target: user A tidak dapat membaca atau mengubah note user B.</p><a href="/docs/authentication/jwt-authentication">Implementasikan authentication →</a></Step>
<Step><h3>05 — Uji dan operasikan</h3><p>Jalankan integration test, dependency audit, health checks, dan deployment dengan environment yang terpisah.</p><p>Target: rilis dapat ditelusuri dan dikembalikan ke versi sebelumnya.</p><a href="/docs/deployment/deployment-checklist">Buka checklist deployment →</a></Step>
</Steps>

## Code Explanation

Controller mengatur HTTP, service memegang aturan bisnis, dan repository mengelola persistence. Tambahkan lapisan ketika tanggung jawabnya mulai berbeda, bukan untuk memenuhi jumlah folder.

## API Examples

Kontrak yang dituju: POST /api/auth/register → POST /api/auth/login → POST /api/notes dengan bearer token → GET /api/notes. Lihat [Complete Backend Starter](/docs/projects/complete-backend-starter) untuk request dan response.

## Error Handling

Jika satu materi terasa terlalu besar, kembali ke prasyaratnya. Kegagalan test adalah petunjuk perilaku yang belum sesuai kontrak; baca status, body, dan input pemicunya.

## Security & Best Practices

Gunakan data sintetis selama belajar. Jangan memasukkan secret ke Git, menonaktifkan validasi untuk memperbaiki test, atau menggunakan in-memory adapter sebagai database production.

## Testing
${fence('bash','terminal','npm run test:examples\nnpm run test:content\nnpm run build')}

## Related Topics

- [Testing Fundamentals](/docs/testing/testing-fundamentals)
- [Layered Architecture](/docs/architecture/layered-architecture)
- [Deployment Checklist](/docs/deployment/deployment-checklist)
`);

write('authentication/jwt-authentication','JWT Authentication','Implementasi register, login, access token, refresh rotation, logout, dan protected routes menggunakan Express dan JOSE.',`
## Overview

Panduan ini menghubungkan identitas dengan API notes. Access token menggunakan JWT HS256 berumur 15 menit; refresh token berupa nilai opaque acak dengan hash SHA-256 yang disimpan pada server. Keduanya terikat ke session ID.

<Callout type="warn" title="Lingkup implementasi">Kode dapat dijalankan dari repository dan diuji secara otomatis. Adapter user, sesi, refresh token, dan notes memakai memory satu proses. Sebelum production, ganti adapter dengan database, unique constraints, atomic rotation, dan strategi pembersihan sesi.</Callout>

## Concept

JWT ditandatangani, bukan dienkripsi. Client dapat membaca payload tetapi tidak boleh membuat signature valid tanpa key. Server memeriksa algorithm, issuer, audience, expiry, subject, dan session ID. State sesi juga dicek sehingga logout langsung mencabut access token pada contoh ini.

Alur: register → hash password → login → issue access dan refresh token → verifikasi JWT pada protected route → rotasi refresh → logout atau replay mencabut keluarga sesi.

## Prerequisites

- Node.js LTS, Express 5, JOSE, Zod, Helmet, dan express-rate-limit; versi ada di package-lock.json.
- Pemahaman [Middleware](/docs/express/middleware) dan [Password Hashing](/docs/authentication/password-hashing).
- HTTPS untuk pengiriman credential di luar loopback.

## Installation
${fence('bash','root repository','npm ci\nnpm run test:examples\nnpm run examples')}

Environment opsional: PORT (default 4000) dan JWT_SECRET minimal 32 byte. Server pembelajaran membuat key acak ketika JWT_SECRET tidak tersedia. Server menolak berjalan dengan NODE_ENV=production karena adapter belum persisten. Factory createApp selalu memerlukan secret eksplisit atau environment.

## Project Structure
${fence('text','examples/','authentication/\n  password.mjs\n  tokens.mjs\nauthorization/\n  policy.mjs\ncrud/\n  repository.mjs\ncomplete-backend/\n  app.mjs\n  server.mjs\nbackend.test.mjs')}

## Implementation

### 1. Hash dan verifikasi password

scrypt menggunakan salt acak 16 byte dan output 64 byte. Cost N=32768, r=8, p=3 menghindari hashing cepat; benchmark parameter dan kapasitas server sebelum production. Perbandingan hash dilakukan dengan timingSafeEqual.
${source('authentication/password.mjs')}

### 2. Terbitkan dan verifikasi token

Gunakan library JOSE agar verifikasi format serta algoritma tidak ditulis sendiri. Refresh token memiliki 256 bit entropi; hanya hash-nya yang berada pada tabel refresh.
${source('authentication/tokens.mjs')}

### 3. Hubungkan route, sesi, dan middleware

Implementasi lengkap berikut mencakup registrasi, login, rotasi sekali pakai, deteksi replay, logout, dan protected CRUD. Baca record.used sebelum await: pada adapter satu proses, token refresh tidak dapat dipakai dua request sukses. Pada database gunakan transaksi atau atomic compare-and-set.
${source('complete-backend/app.mjs')}

## Code Explanation

- Email dinormalisasi dan schema strict menolak role atau field tambahan dari client.
- Hash dummy membuat login untuk email tidak dikenal tetap menjalankan fungsi verifikasi password.
- User publik tidak menyertakan passwordHash.
- Refresh token lama disimpan sebagai used agar replay masih dapat dideteksi.
- Replay mencabut sesi yang sama, termasuk access token hasil rotasi sebelumnya.
- Middleware membaca role terbaru dari storage user, bukan request body.
- Ownership diterapkan pada operasi repository, termasuk update dan delete.

## API Examples

| Method | Endpoint | Auth | Body | Sukses |
| --- | --- | --- | --- | --- |
| POST | /api/auth/register | Tidak | email, password | 201, user publik |
| POST | /api/auth/login | Tidak | email, password | 200, token pair |
| POST | /api/auth/refresh | Refresh token | refreshToken | 200, token pair baru |
| POST | /api/auth/logout | Bearer | Tidak ada | 204, tanpa body |
| GET | /api/notes | Bearer | Tidak ada | 200, notes milik actor |

### Register dan login
${fence('bash','terminal',`curl -i -X POST http://localhost:4000/api/auth/register \\
  -H 'Content-Type: application/json' \\
  -d '{"email":"reader@example.com","password":"a-long-example-password"}'
curl -i -X POST http://localhost:4000/api/auth/login \\
  -H 'Content-Type: application/json' \\
  -d '{"email":"reader@example.com","password":"a-long-example-password"}'`)}
${fence('json','200 — login response','{"data":{"accessToken":"<access-token>","refreshToken":"<refresh-token>","expiresIn":900,"tokenType":"Bearer"}}')}

### Akses resource, refresh, dan logout

Ganti placeholder dengan nilai response server. Dalam shell, hindari menyimpan credential dalam history pada penggunaan nyata.
${fence('bash','terminal',`curl -i http://localhost:4000/api/notes -H 'Authorization: Bearer <access-token>'
curl -i -X POST http://localhost:4000/api/auth/refresh \\
  -H 'Content-Type: application/json' -d '{"refreshToken":"<refresh-token>"}'
curl -i -X POST http://localhost:4000/api/auth/logout -H 'Authorization: Bearer <access-token>'`)}

## Error Handling

| Status | Code | Penyebab |
| --- | --- | --- |
| 400 | INVALID_JSON | JSON tidak dapat di-parse |
| 401 | INVALID_CREDENTIALS | Email atau password salah |
| 401 | UNAUTHORIZED | Token tidak valid atau sesi dicabut |
| 401 | INVALID_REFRESH | Refresh token tidak dikenal atau berakhir |
| 401 | REFRESH_REPLAY | Token lama dipakai ulang; sesi dicabut |
| 409 | EMAIL_EXISTS | Email sudah digunakan |
| 413 | PAYLOAD_TOO_LARGE | Body melebihi 16 KB |
| 422 | VALIDATION_ERROR | Field tidak sesuai schema |
| 429 | Rate limit | Terlalu banyak request |

## Security & Best Practices

Contoh mengembalikan refresh token dalam JSON untuk demonstrasi CLI. Pada aplikasi browser, pertimbangkan cookie HttpOnly + Secure + SameSite dan kontrol CSRF yang sesuai. Jangan menyimpan refresh token jangka panjang pada localStorage tanpa memahami risiko XSS.

Rate limit memory hanya melindungi satu instance. Gunakan shared store untuk multi-instance, serta set trust proxy hanya sesuai topologi yang dipercaya. Registrasi mengembalikan konflik email sehingga dapat mengungkap keberadaan akun; produk berisiko tinggi sebaiknya menggunakan alur response generik dan verifikasi email.

Sesi contoh memiliki absolute lifetime tujuh hari. Tambahkan cleanup, rotasi signing key, audit event, recovery, dan pembatasan sesi sesuai threat model. Login baru membuat sesi independen; logout contoh mencabut satu sesi, bukan seluruh perangkat.

## Testing
${fence('bash','terminal','npm run test:examples')}

Suite menguji credential salah, JWT rusak dan kedaluwarsa, replay refresh, pencabutan setelah logout, mass assignment, pagination invalid, dan read/update/delete lintas user. Test menggunakan server loopback pada port dinamis dan menutupnya setelah selesai.

## Related Topics

- [Refresh Token](/docs/authentication/refresh-token)
- [Cookie-Based Authentication](/docs/authentication/cookie-based-authentication)
- [Resource Ownership](/docs/authorization/resource-ownership)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [JOSE](https://github.com/panva/jose)
`);

write('projects/complete-backend-starter','Complete Backend Starter','API notes lokal dengan authentication, authorization, CRUD, validation, dan pengujian HTTP nyata.',`
## Overview

Starter ini menyatukan contoh di handbook menjadi aplikasi yang dapat dijalankan. Tujuannya mempelajari boundary dan kontrol akses. Adapter memory sengaja sederhana dan bukan persistence production.

## Concept

Semua data notes terikat pada actor. Authentication memverifikasi JWT dan sesi; permission memutuskan aksi; repository membatasi record berdasarkan ownerId. Tidak ada register, login, atau database pada website dokumentasi itu sendiri.

## Prerequisites

Node.js LTS dan dependensi root. API menggunakan Express 5, JOSE, Zod, Helmet, dan express-rate-limit; lihat package-lock.json untuk versi terkunci.

## Installation
${fence('bash','terminal','npm ci\nnpm run test:examples\nnpm run examples')}

API tersedia pada http://localhost:4000. Data dan key development hilang ketika proses restart. Gunakan PORT jika port tersebut telah dipakai.

## Project Structure
${fence('text','examples/','authentication/password.mjs  # scrypt + constant-time comparison\nauthentication/tokens.mjs    # JWT + opaque refresh token\nauthorization/policy.mjs     # permission + ownership\ncrud/repository.mjs          # scoped in-memory adapter\ncomplete-backend/app.mjs     # composition dan HTTP routes\ncomplete-backend/server.mjs  # entry point dan shutdown\nbackend.test.mjs            # integration tests')}

## Implementation

### Entry point
${source('complete-backend/server.mjs')}

### Repository yang membatasi ownership
${source('crud/repository.mjs')}

### Policy
${source('authorization/policy.mjs')}

Implementasi HTTP dan seluruh alur token tersedia pada [JWT Authentication](/docs/authentication/jwt-authentication).

## Code Explanation

Factory app mengisolasi state setiap instance sehingga test tidak saling mencemari. Entry point membuka listener setelah konfigurasi valid. Repository menerima ownerId sebagai argumen wajib; controller tidak dapat tanpa sengaja memakai operasi read global.

## API Examples

| Method | Path | Body | Auth | Sukses |
| --- | --- | --- | --- | --- |
| GET | /health | — | Tidak | 200 |
| POST | /api/auth/register | email, password | Tidak | 201 |
| POST | /api/auth/login | email, password | Tidak | 200 |
| POST | /api/auth/refresh | refreshToken | Refresh | 200 |
| POST | /api/auth/logout | — | Bearer | 204 |
| POST | /api/notes | title | Bearer | 201 |
| GET | /api/notes?page=1&limit=20 | — | Bearer | 200 |
| GET | /api/notes/:id | — | Bearer | 200 |
| PATCH | /api/notes/:id | title | Bearer | 200 |
| DELETE | /api/notes/:id | — | Bearer | 204 |

Register dan login memakai email valid serta password 15–128 karakter. Isi ACCESS_TOKEN dengan hasil login sebelum perintah CRUD berikut:
${fence('bash','terminal',`curl -i -X POST http://localhost:4000/api/notes \\
  -H "Authorization: Bearer $ACCESS_TOKEN" \\
  -H 'Content-Type: application/json' -d '{"title":"Belajar backend"}'
curl -i 'http://localhost:4000/api/notes?page=1&limit=20' \\
  -H "Authorization: Bearer $ACCESS_TOKEN"`)}
${fence('json','201 — create response shape','{"data":{"id":"<note-id>","ownerId":"<user-id>","title":"Belajar backend"}}')}

## Error Handling

401 menolak credential tidak valid, 403 menolak permission, dan 404 menyembunyikan resource milik actor lain. Schema strict menghasilkan 422 jika client mencoba mengirim ownerId atau role. Error 500 menggunakan pesan umum tanpa stack trace.

## Security & Best Practices

<Callout type="warn" title="Sebelum production">Ganti Map dengan database dan transaksi. Tambahkan unique index pada email, atomic refresh rotation, expiry cleanup, shared rate limit, TLS, request logging dengan redaction, dan monitoring. Server pembelajaran menolak NODE_ENV=production.</Callout>

## Testing

Test suite dapat dibaca langsung untuk memahami alur API dan assertion keamanan.
${source('backend.test.mjs')}

## Related Topics

- [JWT Authentication](/docs/authentication/jwt-authentication)
- [CRUD with Authorization](/docs/crud/crud-with-authorization)
- [Database Transactions](/docs/database/transactions)
- [Deployment Checklist](/docs/deployment/deployment-checklist)
`);
console.log('Updated five complete guides with source-backed examples.');
