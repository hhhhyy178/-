import {state} from '@/lib/service';
import {db} from '@/lib/db';
import {z} from 'zod';
import {failure,localRequest} from '@/lib/http';
export const dynamic='force-dynamic';
export async function GET(){try{return Response.json(await state());}catch(e){return failure(e);}}
export async function PATCH(req:Request){try{localRequest(req);const {goal}=z.object({goal:z.union([z.literal(15),z.literal(30),z.literal(45),z.literal(60)])}).parse(await req.json());return Response.json(await db.userProfile.upsert({where:{id:1},create:{id:1,goal},update:{goal}}));}catch(e){return failure(e);}}
