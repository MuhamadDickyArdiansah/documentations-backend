import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { source } from '@/lib/source';
import { SidebarFolder } from '@/components/sidebar-folder';
export default function Layout({ children }: { children: React.ReactNode }) { return <DocsLayout tree={source.pageTree} nav={{ title: 'Dokumentasi', url: '/docs' }} sidebar={{ defaultOpenLevel: 0, prefetch: false, components: { Folder: SidebarFolder } }} themeSwitch={{ enabled: false }} searchToggle={{ enabled: false }} tabs={false}>{children}</DocsLayout>; }
