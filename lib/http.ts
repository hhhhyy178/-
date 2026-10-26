import {NextResponse} from 'next/server';
export function failure(error:unknown){return NextResponse.json({error:error instanceof Error?error.message:'操作失败'},{status:400});}
export function localRequest(req:Request){const origin=req.headers.get('origin');if(origin&&new URL(origin).host!==(req.headers.get('host')||new URL(req.url).host))throw Error('不允许跨站写入学习数据');}
