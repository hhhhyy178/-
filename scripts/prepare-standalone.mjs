import {cpSync,existsSync} from 'node:fs';
if(existsSync('public'))cpSync('public','.next/standalone/public',{recursive:true});
cpSync('.next/static','.next/standalone/.next/static',{recursive:true});
console.log('独立运行包已准备完成。');
