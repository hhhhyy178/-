import content from './content.json';
export type Exercise={id:string;type:string;prompt:string;options?:string[];answers:string[];explanation:string;knowledgeId:string;skill:string;audio?:string|null};
export type Lesson={id:string;day:number;title:string;goal:string;explanation:string;example:string;translation:string;words:string[];knowledgeId:string;prerequisite:string|null;level:string;exercises:Exercise[];summary:string};
export const lessons:Lesson[]=content.lessons;
export const words=content.words;
export function normalize(s:string){return s.normalize('NFC').trim().toLocaleLowerCase('fr').replace(/[’‘]/g,"'").replace(/\s+/g,' ').replace(/\s+([,.!?])/g,'$1').replace(/[.!?]+$/,'').trim();}
export function grade(answer:string,accepted:string[]){return accepted.some(a=>normalize(a)===normalize(answer));}
export function unlocked(id:string,completed:string[]){const l=lessons.find(l=>l.id===id);return !!l&&(!l.prerequisite||completed.includes(l.prerequisite));}
export function schedule(state:{repetitions:number;interval:number;ease:number},quality:number,now=new Date()){
 const ease=Math.max(1.3,state.ease+0.1-(5-quality)*(0.08+(5-quality)*0.02));
 const repetitions=quality<3?0:state.repetitions+1;
 const interval=quality<3?1:repetitions===1?1:repetitions===2?6:Math.round(state.interval*ease);
 return {repetitions,interval,ease,due:new Date(now.getTime()+interval*86400000)};
}
