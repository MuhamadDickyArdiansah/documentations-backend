import { docs } from '../../.source/server';
import { loader } from 'fumadocs-core/source';
import { icons } from 'lucide-react';
import { createElement } from 'react';
export const source = loader({ baseUrl: '/docs', source: docs.toFumadocsSource(), icon(name) { const aliases: Record<string, string> = { Code2: 'CodeXml', Layers3: 'Layers', Fingerprint: 'FingerprintPattern' }; const resolved = name ? aliases[name] || name : undefined; if (resolved && resolved in icons) return createElement(icons[resolved as keyof typeof icons], { size: 17 }); } });
