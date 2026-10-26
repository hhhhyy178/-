import {attempt} from '@/lib/service';
import {z} from 'zod';
import {failure,localRequest} from '@/lib/http';
export async function POST(req:Request){try{localRequest(req);const d=z.object({exerciseId:z.string().max(100),answer:z.string().min(1).max(1000)}).parse(await req.json());return Response.json(await attempt(d.exerciseId,d.answer));}catch(e){return failure(e);}}
