import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'ASSET-MANIFEST.json'),'utf8'));
const window={};vm.runInNewContext(fs.readFileSync(path.join(root,'assets/js/config.js'),'utf8'),{window});
const wanted=new Set();
function visit(value){
  if(typeof value==='string'&&value.startsWith('./assets/images/'))wanted.add(value.split('?')[0].slice(2));
  else if(Array.isArray(value))value.forEach(visit);
  else if(value&&typeof value==='object')Object.values(value).forEach(visit);
}
visit(window.DYSON_ASSETS);
const found=new Set(),issues=[];
for(const entry of manifest.files){
  const file=path.resolve(root,entry.path);
  if(!file.startsWith(root+path.sep)){issues.push('Invalid path: '+entry.path);continue;}
  if(!fs.existsSync(file)){issues.push('Missing: '+entry.path);continue;}
  const bytes=fs.readFileSync(file),hash=crypto.createHash('sha256').update(bytes).digest('hex');
  if(hash!==entry.sha256)issues.push('Changed image/media bytes: '+entry.path);
  if(entry.path.startsWith('assets/images/'))found.add(entry.path);
}
for(const file of wanted)if(!found.has(file))issues.push('Referenced image missing from manifest: '+file);
for(const file of found)if(!wanted.has(file))issues.push('Unreferenced image in manifest: '+file);
function scan(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())scan(file);else if(/\.(png|webp|m4a|wav|mp4|woff2)$/i.test(entry.name)){const relative=path.relative(root,file);if(!manifest.files.some(x=>x.path===relative))issues.push('Untracked image/media file: '+relative);}}}
scan(path.join(root,'assets'));
for(const item of [...window.DYSON_GAME_CONFIG.items,...window.DYSON_GAME_CONFIG.bonusItems])if(!item.effect&&!window.DYSON_ASSETS.sprites?.[item.day]&&!window.DYSON_ASSETS.bonusSprites?.[item.day])issues.push('Missing collectible source: '+item.day);
if(issues.length){console.error(issues.join('\n'));process.exitCode=1;}else console.log(`PASS: ${manifest.files.length} media files; ${wanted.size} current image references; no legacy or missing media.`);
