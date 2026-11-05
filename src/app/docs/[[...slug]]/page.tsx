import { notFound } from 'next/navigation';
import { DocsPage, DocsBody, DocsTitle, DocsDescription } from 'fumadocs-ui/page';
import { source } from '@/lib/source';
import { getMDXComponents } from '@/components/mdx';
import { site } from '@/lib/site';
import type { Metadata } from 'next';
export default async function Page(props: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await props.params;
  const page = source.getPage(slug);
  if (!page) notFound();
  const MDX = page.data.body;
  return <DocsPage toc={page.data.toc} tableOfContent={{ style: 'clerk', enabled: true }} tableOfContentPopover={{ enabled: true }}><div id="main-content" className="article-header"><span className="eyebrow">BACKEND ENGINEERING / HANDBOOK</span><DocsTitle>{page.data.title}</DocsTitle><DocsDescription>{page.data.description}</DocsDescription><div className="article-meta">JavaScript & TypeScript <span>·</span> Bahasa Indonesia</div></div><DocsBody><MDX components={getMDXComponents()} /></DocsBody><div className="article-source"><span>Temukan kesalahan atau ingin berkontribusi?</span><a href={site.github} target="_blank" rel="noreferrer">Lihat referensi di GitHub ↗</a></div></DocsPage>;
}
export function generateStaticParams() { return source.generateParams(); }
export async function generateMetadata(props: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> { const { slug } = await props.params; const page = source.getPage(slug); if (!page) notFound(); return { title: page.data.title, description: page.data.description, alternates: { canonical: page.url }, openGraph: { title: page.data.title, description: page.data.description, url: page.url, images: ['/opengraph-image'] } }; }
