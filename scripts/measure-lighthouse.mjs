import fs from 'node:fs';
import lighthouse from 'lighthouse';
import { createServer } from 'node:net';
import { chromium } from '@playwright/test';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';
fs.mkdirSync('test-results', { recursive: true });
const port = await new Promise(resolve => { const probe = createServer(); probe.listen(0, '127.0.0.1', () => { const selected = probe.address().port; probe.close(() => resolve(selected)); }); });
const browser = await chromium.launch({ executablePath: chromium.executablePath(), args: [`--remote-debugging-port=${port}`] });
try {
  for (const [name,route] of [['home','/'],['article','/docs/getting-started/first-backend-application']]) {
    const desktop = process.argv.includes('--desktop');
    const result = await lighthouse(`http://localhost:3000${route}`, { port, output: 'json', logLevel: 'error', onlyCategories: ['performance','accessibility','best-practices','seo'] }, desktop ? desktopConfig : undefined);
    if (!result) throw new Error('Lighthouse did not return results');
    fs.writeFileSync(`test-results/lighthouse-${name}${desktop ? '-desktop' : ''}.json`, result.report);
    console.log(desktop ? 'desktop' : 'mobile', name, JSON.stringify(Object.fromEntries(Object.entries(result.lhr.categories).map(([k,v])=>[k,Math.round(v.score*100)]))));
  }
} finally { await browser.close(); }
process.exit(0);
