'use client';
import { useSearchContext } from 'fumadocs-ui/contexts/search';
import { Search } from 'lucide-react';
export function SearchTrigger({ hero = false }: { hero?: boolean }) {
  const { setOpenSearch } = useSearchContext();
  return <button className={hero ? 'hero-search' : 'header-search'} onClick={() => setOpenSearch(true)} aria-label={hero ? 'Cari konsep, panduan, atau potongan kode...' : 'Cari dokumentasi'}><Search size={hero ? 19 : 16} /><span>{hero ? 'Cari konsep, panduan, atau potongan kode...' : 'Cari dokumentasi...'}</span><kbd aria-hidden="true">Ctrl K</kbd></button>;
}
