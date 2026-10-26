'use client';
import {useState} from 'react';
import {Exercise} from '@/lib/learning';
import {Speak} from './Speech';
const types:Record<string,string>={choice:'单项选择',listening:'听力选择',spelling:'单词拼写',translation:'中法翻译',order:'句子排序',fill:'填空',conjugation:'动词变位',gender:'阴阳性判断',pronunciation:'发音辨认',dialogue:'对话理解'};
export {request} from '@/lib/client';
import {request} from '@/lib/client';
export function ExerciseCard({exercise:e,onSaved,passed}:{exercise:Exercise;onSaved:()=>void;passed:boolean}){
 const [answer,setAnswer]=useState(''),[feedback,setFeedback]=useState<{correct:boolean;explanation:string;answers:string[]}|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function submit(){setBusy(true);setError('');try{setFeedback(await request('/api/attempt',{exerciseId:e.id,answer}));onSaved();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 return <div className="card exercise"><div className="eyebrow">{types[e.type]} {passed?'· 已通过':''}</div><h3>{e.prompt}</h3>{e.type==='listening'&&e.audio&&<Speak text={e.audio}/>}<form onSubmit={ev=>{ev.preventDefault();submit()}}>{e.options?<div className="options">{e.options.map(o=><label className={answer===o?'selected':''} key={o}><input type="radio" name={e.id} checked={answer===o} onChange={()=>setAnswer(o)}/>{o}</label>)}</div>:<input aria-label="你的答案" placeholder={e.type==='order'?'输入排列后的完整句子':'输入你的答案，注意重音符号'} value={answer} onChange={ev=>setAnswer(ev.target.value)} required/>}<button className="primary" disabled={busy||!answer.trim()}>{busy?'保存中…':feedback?'再次检查':'检查答案'}</button></form>{feedback&&<div role="status" className={`feedback ${feedback.correct?'correct':'incorrect'}`}><strong>{feedback.correct?'✓ 答对了，继续保持':'再想一想'}</strong><p>{feedback.explanation}</p>{!feedback.correct&&<p>参考答案：{feedback.answers.join(' / ')}</p>}</div>}{error&&<p role="alert">{error}</p>}{e.type==='translation'&&<small>本题使用可接受答案集合评分；其他合理表达可能需教师确认，暂不做开放语义评分。</small>}</div>;
}
