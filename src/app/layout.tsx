import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import { Header } from '@/components/header';
import { site } from '@/lib/site';
import './globals.css';
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — Dokumentasi Backend Engineering`, template: `%s | ${site.name}` },
  description: site.description,
  alternates: { canonical: '/' },
  openGraph: { title: site.name, description: site.description, type: 'website', locale: 'id_ID', images: ['/opengraph-image'] },
  twitter: { card: 'summary_large_image' },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="id" data-scroll-behavior="smooth" suppressHydrationWarning><body><Providers><a href="#main-content" className="skip-link">Langsung ke konten</a><Header />{children}</Providers></body></html>;
}
