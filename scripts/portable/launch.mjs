import {spawn,spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {existsSync,mkdirSync} from 'node:fs';
import {createServer} from 'node:net';
const root=dirname(fileURLToPath(import.meta.url));
process.chdir(root);
if(existsSync(join(root,'.env')))process.loadEnvFile(join(root,'.env'));
mkdirSync(join(root,'data'),{recursive:true});
const env={...process.env,DATABASE_URL:`file:${join(root,'data','bonjourlab.db')}`,HOSTNAME:'127.0.0.1',NODE_ENV:'production',NEXT_TELEMETRY_DISABLED:'1'};
const init=spawnSync(process.execPath,[join(root,'init-db.mjs')],{cwd:root,env,stdio:'inherit'});
if(init.status!==0){console.error('学习数据库初始化失败。请将文件夹解压到你有写入权限的位置，例如桌面。');process.exit(1);}
const port=await new Promise((resolve,reject)=>{const s=createServer();s.on('error',reject);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});
env.PORT=String(port);
const child=spawn(process.execPath,[join(root,'app','server.js')],{cwd:join(root,'app'),env,stdio:'inherit'});
child.on('error',e=>{console.error('启动失败：',e.message);process.exit(1)});
child.on('exit',code=>process.exit(code??1));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
const url=`http://127.0.0.1:${port}`;
let ready=false;
for(let i=0;i<60;i++){
 try{const r=await fetch(`${url}/api/state`,{signal:AbortSignal.timeout(1000)});if(r.ok){const data=await r.json();if(data.profile){ready=true;break;}}}catch{}
 await new Promise(resolve=>setTimeout(resolve,500));
}
if(!ready){console.error('启动超时，请查看上方错误。请不要删除 data 文件夹。');child.kill();process.exit(1);}
console.log('\nBonjourLab 已启动！\n浏览器地址：'+url+'\n保持此窗口打开。停止学习时关闭本窗口，或按 Ctrl+C。\n学习数据保存在旁边的 data 文件夹，下次启动会自动恢复。\n');
if(process.platform==='win32')spawn('cmd.exe',['/c','start','',url],{stdio:'ignore',windowsHide:true});
