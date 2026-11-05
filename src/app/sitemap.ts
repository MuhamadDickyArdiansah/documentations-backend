import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';
import { site } from '@/lib/site';
export default function sitemap(): MetadataRoute.Sitemap { return [{ url: site.url, changeFrequency: 'weekly', priority: 1 }, ...source.getPages().map(page => ({ url: new URL(page.url, site.url).href, changeFrequency: 'monthly' as const, priority: 0.7 }))]; }
