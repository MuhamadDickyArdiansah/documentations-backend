'use client';
import { lazy } from 'react';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { translations } from '@/lib/translations';
const SearchDialog = lazy(() => import('./search-dialog'));
export function Providers({ children }: { children: React.ReactNode }) {
  return <RootProvider theme={{ defaultTheme: 'light', enableSystem: true }} i18n={{ translations }} search={{ SearchDialog, preload: false }}>{children}</RootProvider>;
}
