'use client';
import Link from './doc-link';
import { usePathname } from 'next/navigation';
import { Moon, Sun, ArrowUpRight } from 'lucide-react';
import { Github } from './github-icon';
import { useTheme } from 'next-themes';
import { Brand } from './brand';
import { SearchTrigger } from './search-trigger';
import { site } from '@/lib/site';
export function Header() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  return <header className="site-header">
    <Link href="/" aria-label="backendhandbook. — Beranda"><Brand /></Link>
    <nav aria-label="Navigasi utama" className="header-nav">
      <Link className={pathname === '/' || pathname.startsWith('/docs') && !pathname.includes('/projects') ? 'active' : ''} href="/">Dokumentasi</Link>
      <Link href="/docs/getting-started/backend-roadmap">Learning path</Link>
      <Link className={pathname.includes('/projects') ? 'active' : ''} href="/docs/projects">Project references <ArrowUpRight size={12} /></Link>
    </nav>
    <div className="header-actions"><SearchTrigger /><span className="header-divider" /><a href={site.github} target="_blank" rel="noreferrer" aria-label="Buka referensi GitHub"><Github size={19} /></a><button className="theme-toggle" aria-label="Ganti tema terang atau gelap" onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}><Sun className="theme-sun" size={19} /><Moon className="theme-moon" size={19} /></button></div>
  </header>;
}
