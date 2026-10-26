import {db} from '@/lib/db';
import {z} from 'zod';
import {failure,localRequest} from '@/lib/http';
export async function POST(req:Request){try{localRequest(req);const {seconds}=z.object({seconds:z.number().int().min(1).max(60)}).parse(await req.json());await db.learningSession.create({data:{seconds}});return Response.json({ok:true});}catch(e){return failure(e);}}
