import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root = 'content/docs';
function walk(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir,e.name)) : [path.join(dir,e.name)]); }
const files = walk(root).filter(f=>f.endsWith('.mdx'));
const routes = new Set(['/', ...files.map(f=>'/docs/'+path.relative(root,f).replaceAll('\\','/').replace(/\.mdx$/,'').replace(/(^|\/)index$/,'').replace(/\/$/,''))]);
let links=0;
for (const file of files) {
 const text=fs.readFileSync(file,'utf8');
 assert.match(text,/^---\r?\ntitle: .+/); assert.match(text,/\ndescription: .+/);
 assert.match(text,/\n## Referensi\n/,`Missing references section: ${file}`);
 assert.match(text.split('\n## Referensi\n')[1],/Referensi dari \[[^\]]+\]\(https:\/\//,`Missing named primary source: ${file}`);
 assert.ok(!/\b(TODO|TBD|Lorem ipsum|Coming soon)\b/i.test(text), `Unfinished content: ${file}`);
 for(const m of text.matchAll(/(?:\]\(|href=["'])(\/(?!\/)[^\s"')#?]+)/g)) { links++; assert.ok(routes.has(m[1]),`Broken link ${m[1]} in ${file}`); }
 const stripped=text.replace(/```[\s\S]*?```/g,'[code example]');
 assert.ok(!/## [^\n]+\n\s*## /.test(stripped),`Empty section in ${file}`);
}
const prd=fs.readFileSync('prd.md','utf8');
const sections=[...prd.matchAll(/### 3\.\d+ ([^\r\n]+)\r?\n([\s\S]*?)(?=### 3\.|---)/g)];
const expected=sections.reduce((sum,m)=>sum+[...m[2].matchAll(/^- /gm)].length,0);
assert.ok(files.length>=expected+sections.length+1,'All PRD topics plus category pages and overview must exist');
const folders=['getting-started','javascript','nodejs','express','rest-api','authentication','authorization','database','crud','security','advanced','testing','architecture','deployment','projects'];
const slugify=s=>s.toLowerCase().replace(/&/g,'and').replace(/\//g,' ').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
sections.forEach((section,i)=>{
 for(const topic of section[2].matchAll(/^- (.+)$/gm)) {
  assert.ok(routes.has(`/docs/${folders[i]}/${slugify(topic[1].trim())}`),`Missing PRD topic: ${topic[1]}`);
 }
});
console.log(`${files.length} MDX pages, ${expected} PRD topics, ${links} internal links verified.`);
const passwordSource=fs.readFileSync('examples/authentication/password.mjs','utf8').trim();
for(const article of ['authentication/jwt-authentication','authentication/password-hashing','security/password-security']) {
 assert.ok(fs.readFileSync(`${root}/${article}.mdx`,'utf8').includes(passwordSource),`Password example differs from tested source: ${article}`);
}
