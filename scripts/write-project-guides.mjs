import fs from 'node:fs';
const block = (title, code, lang='js') => `\n\`\`\`${lang} title="${title}"\n${code.trim()}\n\`\`\`\n`;
const write=(slug,title,description,body)=>fs.writeFileSync(`content/docs/projects/${slug}.mdx`,`---\ntitle: ${title}\ndescription: ${description}\n---\n\n${body}`);
write('personal-finance-management-api','Personal Finance Management API','Referensi domain keuangan dengan integer minor units, ownership, transfer, dan idempotency.',`
## Overview

Project ini menunjukkan invariant inti pencatatan transfer: uang tidak dibuat atau hilang, saldo tidak boleh negatif, dan retry tidak menggandakan transaksi. Contoh domain berada pada examples/finance/ledger.mjs dan diuji otomatis.

## Concept

Nominal disimpan sebagai integer minor units sesuai mata uang. Sebagai contoh, jika konfigurasi currency memiliki dua digit desimal, 12345 berarti 123,45. Tentukan skala per currency secara eksplisit; kode ini tidak melakukan konversi atau foreign exchange.

Transfer contoh hanya diizinkan antara akun milik actor yang sama dan mata uang yang sama. Seluruh validasi selesai sebelum mutasi. Karena tidak ada await, perubahan berlangsung sebagai satu langkah sinkron dalam satu proses; ini bukan transaksi lintas proses.

## Prerequisites

Node.js LTS, dasar [Transactions](/docs/database/transactions), [Resource Ownership](/docs/authorization/resource-ownership), dan [Idempotency](/docs/advanced/idempotency).

## Installation
${block('terminal','npm ci\nnpm run test:examples','bash')}

## Project Structure
${block('examples/','finance/ledger.mjs       # Domain transfer in-memory\ndomain.test.mjs          # Invariant dan abuse cases','text')}

## Implementation
${block('examples/finance/ledger.mjs',fs.readFileSync('examples/finance/ledger.mjs','utf8'))}

### Coba dari root repository
${block('finance-demo.mjs',`import { createLedger } from './examples/finance/ledger.mjs';
const ledger = createLedger();
const wallet = ledger.open('u1', 'IDR');
const savings = ledger.open('u1', 'IDR');
ledger.credit('u1', wallet.id, 10000);
const transfer = ledger.transfer('u1', {
  fromId: wallet.id, toId: savings.id, amountMinor: 3000, key: 'example-transfer-1',
});
console.log(transfer, ledger.get('u1', wallet.id));`)}

## Code Explanation

1. Number.isSafeInteger mencegah fractional amount dan nilai di luar presisi integer JavaScript.
2. owned menyembunyikan akun pengguna lain melalui error yang sama dengan akun tidak ditemukan.
3. Key idempotency di-scope ke actor dan terikat ke fingerprint input. Retry identik mengembalikan hasil lama.
4. Saldo tujuan diperiksa sebelum write agar overflow tidak menimbulkan perubahan parsial.
5. credit adalah operasi pendanaan tepercaya, bukan endpoint yang boleh diberikan kepada pengguna umum tanpa proses bisnis.

## API Examples

Modul ini adalah domain reference dan belum di-mount sebagai endpoint pada API notes. Kontrak integrasi yang dapat dibangun:

| Method | Endpoint rancangan | Authentication | Request | Response |
| --- | --- | --- | --- | --- |
| POST | /api/accounts | Bearer + policy | currency | 201, account |
| GET | /api/accounts/:id | Bearer + owner | — | 200, account |
| POST | /api/transfers | Bearer + owner | fromId, toId, amountMinor | 201, transfer |

Handler transfer membaca Idempotency-Key dari header dan actor dari middleware. Jangan menerima ownerId dari body. Contoh request:
${block('POST /api/transfers — kontrak JSON','{"fromId":"<wallet-id>","toId":"<savings-id>","amountMinor":3000}','json')}

## Error Handling

| Error domain | Status integrasi | Makna |
| --- | --- | --- |
| ACCOUNT_NOT_FOUND | 404 | Akun tidak tersedia dalam scope actor |
| INVALID_AMOUNT | 422 | Jumlah bukan integer positif yang aman |
| INSUFFICIENT_FUNDS | 409 | Saldo tidak cukup |
| CURRENCY_MISMATCH | 422 | Currency berbeda |
| IDEMPOTENCY_CONFLICT | 409 | Key dipakai dengan payload berbeda |

## Security & Best Practices

<Callout type="warn" title="Batas domain demo">Gunakan database transaction, row locks atau serializable isolation, unique idempotency key, dan double-entry journal untuk produk nyata. Tambahkan audit append-only, retention, reconciliation, serta policy pendanaan. Adapter Map tidak aman sebagai sistem pencatatan keuangan production.</Callout>

## Testing

Test memverifikasi total saldo tetap, retry menghasilkan transfer yang sama, saldo tak cukup tidak memutasi akun, input pecahan ditolak, dan akun pengguna lain tidak dapat diakses.
${block('terminal','npm run test:examples','bash')}

## Related Topics

- [Transactions](/docs/database/transactions)
- [Idempotency](/docs/advanced/idempotency)
- [Audit Logging](/docs/advanced/audit-logging)
`);
write('user-management-api','User Management API','Referensi pembaruan profil dengan allowlist field, pemeriksaan ownership, dan serializer publik.',`
## Overview

Pengelolaan user perlu memisahkan profil pribadi dari operasi privilege. Contoh ini mengizinkan pengguna mengubah displayName sendiri dan menjaga role, email, serta passwordHash tetap berada di luar patch umum.

## Concept

Authentication menetapkan actor. Domain memeriksa bahwa actor.id cocok dengan user.id. Schema strict menolak field tambahan; serializer publik memilih field yang boleh keluar. Tiga kontrol ini saling melengkapi.

## Prerequisites

Node.js LTS dan Zod dari root package. Pahami [Permission-Based Access Control](/docs/authorization/permission-based-access-control) dan [Validation](/docs/express/validation).

## Installation
${block('terminal','npm ci\nnpm run test:examples','bash')}

## Project Structure
${block('examples/','user-management/profile.mjs\ndomain.test.mjs','text')}

## Implementation
${block('examples/user-management/profile.mjs',fs.readFileSync('examples/user-management/profile.mjs','utf8'))}

### Gunakan domain dari handler
${block('profile.controller.mjs',`import { updateOwnProfile, publicProfile } from './examples/user-management/profile.mjs';
export function updateProfileController(repository) {
  return async (req, res) => {
    const user = await repository.findById(req.actor.id);
    const updated = updateOwnProfile(req.actor, user, req.body);
    await repository.saveProfile(updated.id, { displayName: updated.displayName });
    res.json({ data: publicProfile(updated) });
  };
}
// Mount setelah authentication; error schema diterjemahkan ke 422 oleh error middleware.`)}

## Code Explanation

updateOwnProfile mengembalikan object baru agar input tidak dimutasi. Repository tetap perlu update field displayName saja, bukan menyimpan object arbitrer yang dikirim client. Perubahan email, password, dan role memiliki flow sendiri dengan reauthentication serta audit yang sesuai.

## API Examples

Contoh domain belum di-mount pada API notes. Kontrak handler yang disarankan:

| Method | Path rancangan | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| GET | /api/me | Bearer | — | 200, profil publik |
| PATCH | /api/me | Bearer + owner | displayName | 200, profil publik |

${block('PATCH /api/me — request','{"displayName":"Backend Reader"}','json')}
${block('200 — response','{"data":{"id":"<user-id>","email":"reader@example.com","displayName":"Backend Reader"}}','json')}

## Error Handling

401 untuk identitas invalid, 404 untuk profil tidak tersedia, 422 untuk displayName invalid atau field tambahan. Pemetaan error domain ke HTTP dilakukan di adapter, bukan di fungsi profil.

## Security & Best Practices

Jangan membuat endpoint patch yang menerima role dari body pengguna biasa. Perubahan privilege memerlukan policy administrator, audit trail, dan invalidasi sesi atau cache permission. Serializer tidak mengembalikan hash password maupun token.

## Testing

Test memeriksa akses lintas user, upaya memasukkan role admin, normalisasi displayName, serta ketiadaan passwordHash pada response publik.
${block('terminal','npm run test:examples','bash')}

## Related Topics

- [Admin/User Permissions](/docs/authorization/admin-user-permissions)
- [Input Validation](/docs/security/input-validation)
- [Audit Logging](/docs/advanced/audit-logging)
`);
console.log('Updated finance and user management reference guides.');
