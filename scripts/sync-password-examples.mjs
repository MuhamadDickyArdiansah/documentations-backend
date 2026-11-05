import fs from 'node:fs';
import path from 'node:path';
function files(dir) { return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]); }
for(const file of [...files('content/docs').filter(f=>f.endsWith('.mdx')),'scripts/write-guides.mjs']) {
 const text=fs.readFileSync(file,'utf8');
 const updated=text.replaceAll('N: 32768, r: 8, p: 1','N: 32768, r: 8, p: 3').replaceAll('N=32768, r=8, p=1','N=32768, r=8, p=3');
 if(text!==updated) fs.writeFileSync(file,updated);
}
