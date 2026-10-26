// Single-user SQLite repository. All transaction callbacks are synchronous,
// so writes cannot interleave across HTTP requests in the same Node process.
import {DatabaseSync} from 'node:sqlite';
import {resolve,dirname} from 'node:path';
import {mkdirSync} from 'node:fs';
export type Profile={id:number;name:string;goal:number};
export type Progress={lessonId:string;completedAt:Date};
export type Attempt={id:number;exerciseId:string;knowledgeId:string;skill:string;answer:string;correct:boolean;createdAt:Date};
export type Review={wordId:string;repetitions:number;interval:number;ease:number;due:Date};
export type ReviewHistory={id:number;wordId:string;quality:number;createdAt:Date};
export type Session={id:number;seconds:number;createdAt:Date};
export type Conversation={id:number;mode:string;question:string;answer:string;createdAt:Date};
type Row=Record<string,unknown>;
const path=resolve((process.env.DATABASE_URL||'file:./prisma/bonjourlab.db').replace(/^file:/,''));
mkdirSync(dirname(path),{recursive:true});
const globalDb=globalThis as unknown as {sqlite?:DatabaseSync};
const sqlite=globalDb.sqlite??new DatabaseSync(path);globalDb.sqlite=sqlite;
sqlite.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
function encode(v:unknown):string|number|null{if(v instanceof Date)return v.toISOString();if(typeof v==='boolean')return Number(v);if(v===null)return null;if(typeof v==='number'||typeof v==='string')return v;throw Error('数据库值类型无效');}
function decode<T>(row:Row):T{for(const k of ['createdAt','completedAt','due'])if(row[k])row[k]=new Date(String(row[k]).includes('T')?String(row[k]):String(row[k]).replace(' ','T')+'Z');if('correct'in row)row.correct=!!row.correct;return row as T;}
function repository<T extends object>(table:string,key:string,fields:string[]){
 function where(filter:Row={}){const values:(string|number|null)[]=[];const clauses=Object.entries(filter).map(([k,v])=>{if(!fields.includes(k))throw Error('不支持的查询字段');if(v&&typeof v==='object'&&'in'in v){const list=(v as {in:unknown[]}).in;values.push(...list.map(encode));return `${k} IN (${list.map(()=>'?').join(',')||'NULL'})`;}values.push(encode(v));return `${k}=?`;});return {sql:clauses.length?' WHERE '+clauses.join(' AND '):'',values};}
 function findMany(opts:{where?:Row;orderBy?:Row}={}){const w=where(opts.where);const order=opts.orderBy?Object.entries(opts.orderBy).map(([k,v])=>{if(!fields.includes(k))throw Error('排序字段无效');return k+(v==='desc'?' DESC':' ASC')}).join(','):'';return sqlite.prepare(`SELECT * FROM ${table}${w.sql}${order?' ORDER BY '+order:''}`).all(...w.values).map(row=>decode<T>(row));}
 function create({data}:{data:Partial<T>}){const entries=Object.entries(data).filter(([k])=>fields.includes(k));const columns=entries.map(([k])=>k);const result=sqlite.prepare(`INSERT INTO ${table} (${columns.join(',')}) VALUES (${columns.map(()=>'?').join(',')})`).run(...entries.map(([,v])=>encode(v)));const keyValue=(data as Row)[key]??Number(result.lastInsertRowid);return findMany({where:{[key]:keyValue}})[0];}
 function update({where:filter,data}:{where:Row;data:Partial<T>}){const w=where(filter),entries=Object.entries(data).filter(([k])=>fields.includes(k));if(entries.length)sqlite.prepare(`UPDATE ${table} SET ${entries.map(([k])=>k+'=?').join(',')}${w.sql}`).run(...entries.map(([,v])=>encode(v)),...w.values);const row=findMany({where:filter})[0];if(!row)throw Error('记录不存在');return row;}
 return {findMany,create,update,findUnique:({where}:{where:Row})=>findMany({where})[0]??null,findUniqueOrThrow:({where}:{where:Row})=>{const row=findMany({where})[0];if(!row)throw Error('记录不存在');return row},count:()=>Number((sqlite.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as {n:number}).n),deleteMany:()=>sqlite.prepare(`DELETE FROM ${table}`).run(),createMany:({data}:{data:Partial<T>[]})=>{for(const item of data)create({data:item});},upsert:({where,create:input,update:changes}:{where:Row;create:Partial<T>;update:Partial<T>})=>findMany({where})[0]?update({where,data:changes}):create({data:input})};
}
const repositories={
 userProfile:repository<Profile>('UserProfile','id',['id','name','goal']),
 lessonProgress:repository<Progress>('LessonProgress','lessonId',['lessonId','completedAt']),
 exerciseAttempt:repository<Attempt>('ExerciseAttempt','id',['id','exerciseId','knowledgeId','skill','answer','correct','createdAt']),
 vocabularyReviewState:repository<Review>('VocabularyReviewState','wordId',['wordId','repetitions','interval','ease','due']),
 reviewHistory:repository<ReviewHistory>('ReviewHistory','id',['id','wordId','quality','createdAt']),
 learningSession:repository<Session>('LearningSession','id',['id','seconds','createdAt']),
 aIConversation:repository<Conversation>('AIConversation','id',['id','mode','question','answer','createdAt']),
};
export const db={...repositories,
 $transaction<T>(fn:(tx:typeof repositories)=>T,_options?:{timeout:number}):T{sqlite.exec('BEGIN IMMEDIATE');try{const result=fn(db);sqlite.exec('COMMIT');return result;}catch(e){sqlite.exec('ROLLBACK');throw e;}},
};
