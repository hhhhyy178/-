import {createServer} from 'node:http';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
const root=resolve('docs');const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.mp3':'audio/mpeg','.webmanifest':'application/manifest+json'};
createServer((req,res)=>{const url=new URL(req.url,'http://localhost');let pathname=decodeURIComponent(url.pathname);const prefix=['/-/','/BonjourLab/'].find(p=>pathname.startsWith(p));if(!prefix){res.writeHead(404);res.end();return;}pathname=pathname.slice(prefix.length)||'index.html';const path=resolve(root,pathname);if(!path.startsWith(root+sep)||!existsSync(path)){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(readFileSync(path));}).listen(3102,'127.0.0.1',()=>console.log('Mobile test server ready'));
