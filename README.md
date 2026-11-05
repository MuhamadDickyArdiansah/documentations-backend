# Backend Handbook

Website dokumentasi Backend Engineering dalam Bahasa Indonesia, dibangun mengikuti [prd.md](prd.md). Memuat 164 topik dalam 15 kategori, 15 halaman kategori, dan satu overview. Konten ditulis dalam MDX; website tidak membutuhkan database, login, atau CMS.

Hasil pemeriksaan dan batas kesiapan rilis dicatat pada [VALIDATION.md](VALIDATION.md), termasuk target performa yang belum terpenuhi dan deployment yang masih menunggu konfigurasi tujuan.

## Jalankan lokal

Gunakan Node.js LTS yang masih didukung dan npm. Versi yang digunakan untuk verifikasi: Node.js 24.

```bash
npm ci
npm run dev
```

Buka http://localhost:3000. Untuk build production:

```bash
npm run build
npm start
```

## Stack dan fitur

- Next.js 16 App Router, React, TypeScript, dan Tailwind CSS 4.
- Fumadocs UI/Core/MDX untuk sidebar bertingkat, breadcrumbs, TOC otomatis dengan active heading, navigasi sebelumnya/selanjutnya, dan pencarian lokal berbasis isi artikel.
- Shiki untuk syntax highlighting pada saat kompilasi, filename, copy code, tabs, callouts, tables, dan steps.
- Light/dark theme tersimpan lokal. Ctrl+K atau Cmd+K membuka pencarian yang dapat digunakan dengan keyboard.
- Homepage dengan quick start, seluruh kategori, referensi populer, learning path, dan project references.
- Metadata halaman, canonical URL, sitemap, robots, dan Open Graph image.

## Struktur

```text
content/docs/          Artikel MDX dan meta.json
src/app/              Homepage, docs, metadata, dan search route
src/components/       Brand, header, pencarian, tabs demo, komponen MDX
src/lib/              Fumadocs source dan konfigurasi website
examples/             API pembelajaran auth, authorization, dan CRUD
scripts/              Pemeriksaan konten dan alat editorial
tests/                Pengujian browser dan accessibility
source.config.ts      Konfigurasi Fumadocs dan tema Shiki
```

## Menambah artikel

1. Buat `content/docs/<kategori>/<slug>.mdx`.
2. Isi frontmatter title dan description.
3. Tambahkan slug pada array pages dalam meta.json kategori untuk menentukan urutan navigasi.
4. Gunakan heading level dua dan tiga; TOC, anchor, dan indeks pencarian dibuat otomatis. Setiap artikel wajib memiliki bagian Referensi dengan nama sumber asli, tautan langsung, dan keterangan relevansinya.
5. Jalankan pemeriksaan konten dan build.

````mdx
---
title: Contoh Materi
description: Penjelasan singkat topik dalam Bahasa Indonesia.
---

## Overview

Jelaskan masalah yang diselesaikan dan batas implementasi.

<Callout type="info" title="Prasyarat">Node.js dan npm.</Callout>

<Tabs items={['JavaScript', 'TypeScript']}>
<Tab value="JavaScript">

```js title="example.mjs"
export const message = 'Hello, backend!';
```

</Tab>
<Tab value="TypeScript">

```ts title="example.ts"
export const message: string = 'Hello, backend!';
```

</Tab>
</Tabs>

## Referensi

- **Referensi dari [Node.js — API Documentation](https://nodejs.org/api/)** — API runtime yang digunakan pada contoh.
````

Komponen yang tersedia: Callout (info, warn/warning, tip, danger/error), Cards, Card, Tabs, Tab, Steps, dan Step. Heading, table, serta code block memakai komponen Fumadocs bawaan. Navigasi berasal dari file konten, bukan daftar route yang dipelihara manual.

Artikel topik mengikuti bagian Overview, Concept, Prerequisites, Installation, Project Structure, Implementation, Code Explanation, API Examples, Error Handling, Security & Best Practices, Testing, Related Topics, dan Referensi. Artikel konseptual menyebutkan jika tidak ada endpoint tersendiri. Registry sumber dan pemetaan halaman tersedia di content/references.json. scripts/add-references.mjs dapat menyinkronkan bagian Referensi dari registry editorial di script; tinjau diff jika bagian referensi pernah diedit manual. Sumber diprioritaskan dari dokumentasi resmi, RFC, OWASP, dan penulis asli pola arsitektur. Contoh handbook adalah implementasi pembelajaran mandiri, bukan salinan resmi sumber.

`scripts/build-content.mjs` adalah alat editorial untuk membuat koleksi awal dan tidak dijalankan saat build. Alat ini tidak menimpa file yang sudah ada. `scripts/write-guides.mjs` menyinkronkan lima panduan utama dengan source examples; jangan jalankan jika panduan tersebut telah diedit manual tanpa meninjau diff. Build biasa hanya membaca MDX.

Setelah memakai alat editorial yang menulis ulang artikel, jalankan `node scripts/add-references.mjs` untuk menyertakan kembali bagian Referensi, lalu tinjau diff. Artikel baru juga boleh menulis referensi langsung pada MDX; pemeriksaan konten memastikan bagian tersebut tidak kosong.

## Contoh backend yang dapat dijalankan

```bash
npm run test:examples
npm run examples
```

API tersedia di http://localhost:4000. Gunakan panduan [JWT Authentication](content/docs/authentication/jwt-authentication.mdx) dan [Complete Backend Starter](content/docs/projects/complete-backend-starter.mdx) untuk request/response lengkap.

Contoh menggunakan Express 5, JOSE, Zod, scrypt asinkron, Helmet, rate limit, refresh rotation, session revocation, permission policy, dan resource ownership. Test menggunakan HTTP nyata dengan port dinamis. Referensi domain profil dan ledger keuangan pada examples/user-management dan examples/finance memiliki pengujian invariant terpisah; keduanya belum dipasang sebagai endpoint pada API notes.

**Batas contoh:** storage Map hanya untuk belajar, data hilang saat restart, limiter hanya berlaku per proses, dan refresh token dikembalikan melalui JSON untuk penggunaan CLI. Server contoh menolak NODE_ENV=production. Ganti persistence dengan database transaksional, tambahkan shared limiter, TLS, audit, dan strategi cookie/CSRF sesuai kebutuhan sebelum mengadopsinya pada aplikasi production. Website dokumentasi sendiri tidak menggunakan server contoh ini.

## Verifikasi

```bash
npm run typecheck
npm run test:content
npm run test:examples
npm run build
npx playwright install chromium
npm run test:e2e
```

Pemeriksaan konten memverifikasi semua topik PRD, frontmatter, dan internal links. Pengujian browser memeriksa theme persistence, search keyboard, navigasi mobile, code tabs, copy, overflow, SEO routes, dan automated WCAG AA checks. Hasil screenshot disimpan di test-results (diabaikan Git). Browser test memakai server production dan dapat memakai server lokal yang sudah berjalan. Dengan npm start aktif, jalankan npm run test:performance untuk pengukuran Lighthouse mobile pada homepage dan artikel. Target Lighthouse 90 perlu diperiksa kembali pada deployment akhir; hasil lokal bukan jaminan performa semua perangkat.

## Deployment Vercel

1. Push repository ke GitHub dan import ke Vercel sebagai project Next.js.
2. Atur NEXT_PUBLIC_SITE_URL ke origin production penuh tanpa trailing slash.
3. Atur NEXT_PUBLIC_GITHUB_URL ke repository project ini. Sebelum URL tersedia, tombol GitHub menunjuk ke contoh resmi Express sebagai referensi.
4. Build command: npm run build. Install command: npm ci. Tidak memerlukan database atau secret API contoh.
5. Setelah deploy, verifikasi homepage, artikel, pencarian, sitemap.xml, robots.txt, dan opengraph-image. Periksa canonical URL menggunakan domain production.

Salin .env.example ke .env.local untuk konfigurasi lokal. Environment public bukan tempat menyimpan secret. URL localhost adalah default development dan harus diganti untuk metadata production.

CI pada .github/workflows/ci.yml menjalankan content checks, API integration tests, type checks, build, dan browser/accessibility tests. Vercel dapat menggunakan Git integration untuk deployment setiap commit yang lolos kebijakan repository.
# documentations-backend
