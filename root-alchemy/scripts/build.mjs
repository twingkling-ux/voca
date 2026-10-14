import {cp,mkdir,readFile,rm} from 'node:fs/promises';
import {validateWord} from '../server/validation.js';
for(const w of JSON.parse(await readFile('public/core-words.json','utf8')))validateWord(w);
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});await cp('public','dist',{recursive:true});console.log('Built Root Alchemy Firebase client. Vercel serves api/app.js.');
