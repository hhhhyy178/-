import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
if(existsSync('.env'))process.loadEnvFile('.env');
const databaseUrl=process.env.DATABASE_URL||'file:./prisma/bonjourlab.db';
const resolvedUrl=databaseUrl.startsWith('file:')?'file:'+resolve(databaseUrl.slice(5)):databaseUrl;
if(!existsSync('.next/standalone/server.js')){console.error('请先运行 npm run build。');process.exit(1);}
const child=spawn(process.execPath,['.next/standalone/server.js'],{stdio:'inherit',env:{...process.env,DATABASE_URL:resolvedUrl,HOSTNAME:process.env.BONJOURLAB_HOST||'0.0.0.0'}});
child.on('exit',code=>process.exit(code??1));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
