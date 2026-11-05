import { defineDocs, defineConfig } from 'fumadocs-mdx/config';
export const docs = defineDocs({ dir: 'content/docs' });
export default defineConfig({ mdxOptions: { remarkStructureOptions: { filterElement: () => false }, rehypeCodeOptions: { themes: { light: 'github-light-high-contrast', dark: 'github-dark-high-contrast' } } } });
