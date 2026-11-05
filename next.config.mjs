import { createMDX } from 'fumadocs-mdx/next';
const withMDX = createMDX();
export default withMDX({ reactStrictMode: true, turbopack: { rules: { '*.css': { loaders: ['@tailwindcss/turbopack'], as: '*.css' } } } });
