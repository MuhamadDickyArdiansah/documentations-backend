'use client';
import { useFetchSearch } from 'fumadocs-core/search/client';
import { SearchDialog, SearchDialogOverlay, SearchDialogContent, SearchDialogHeader, SearchDialogIcon, SearchDialogInput, SearchDialogClose, SearchDialogList, type SharedProps } from 'fumadocs-ui/components/dialog/search';
const suggestions = [
  { id: 'start', type: 'page' as const, content: 'Mulai belajar', url: '/docs/getting-started/introduction' },
  { id: 'auth', type: 'page' as const, content: 'JWT Authentication', url: '/docs/authentication/jwt-authentication' },
  { id: 'rest', type: 'page' as const, content: 'REST API', url: '/docs/rest-api' },
];
export default function HandbookSearch(props: SharedProps) {
  const search = useFetchSearch({ api: '/api/search', delayMs: 150 });
  return <SearchDialog {...props} {...search}><SearchDialogOverlay className="z-[75]" /><SearchDialogContent className="z-[80]"><SearchDialogHeader><SearchDialogIcon /><SearchDialogInput /><SearchDialogClose /></SearchDialogHeader><SearchDialogList defaultItems={search.search ? null : suggestions} /></SearchDialogContent></SearchDialog>;
}
