import {review} from '@/lib/service';
import {z} from 'zod';
import {failure,localRequest} from '@/lib/http';
export async function POST(req:Request){try{localRequest(req);const d=z.object({wordId:z.string().max(100),quality:z.number().int().min(0).max(5)}).parse(await req.json());return Response.json(await review(d.wordId,d.quality));}catch(e){return failure(e);}}
