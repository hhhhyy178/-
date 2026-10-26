import {z} from 'zod';
import {db} from '@/lib/db';
import {lessons} from '@/lib/learning';
import {askAI,offline,modes} from '@/lib/tutor';
import {failure,localRequest} from '@/lib/http';
export async function POST(req:Request){try{localRequest(req);const {message,mode}=z.object({message:z.string().min(1).max(3000),mode:z.enum(modes)}).parse(await req.json());const attempts=await db.exerciseAttempt.findMany({where:{correct:false}});const counts=new Map<string,number>();for(const a of attempts)counts.set(a.knowledgeId,(counts.get(a.knowledgeId)||0)+1);const weak=[...counts].sort((a,b)=>b[1]-a[1]).slice(0,3).map(([id,n])=>`${lessons.find(l=>l.knowledgeId===id)?.title}：${n} 次错误`).join('；');const enabled=!!process.env.AI_API_KEY;const answer=enabled?await askAI(message,mode,`完成课程 ${(await db.lessonProgress.findMany()).length}/28，当前 ${ (await db.lessonProgress.count())<7?'A0':'A1起步'}。${weak}`):offline(message,mode,weak);await db.aIConversation.create({data:{mode,question:message,answer}});return Response.json({answer,source:enabled?'AI 服务':'本地预设规则（非大模型）'});}catch(e){return failure(e);}}
