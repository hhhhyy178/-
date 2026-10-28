'use client';
import {ArrowRight,ArrowUpRight,BookOpen,Headphones,CheckCircle2} from 'lucide-react';
import {Lesson} from '@/lib/learning';
import {Speak} from './Speech';
export default function LearningHome({next,completed,due,streak,openLesson,review,courses,weak}:{next:Lesson;completed:number;due:number;streak:number;openLesson:(id:string)=>void;review:()=>void;courses:()=>void;weak?:Lesson}){
 return <div className="learning-home">
  <div className="home-heading"><div><h1>今天，说会一句法语。</h1><p>从一声问候，开始你的法语日常。</p></div><span className="journal-date">{new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'long'}).format(new Date())}</span></div>
  <div className="home-columns"><section className="today-lesson">
   <div className="lesson-context"><span>第 {String(next.day).padStart(2,'0')} 课 / 28</span><span>{next.level} 入门</span></div>
   <div className="home-phrase"><BookOpen className="cover-bookmark" size={28} strokeWidth={1}/><p className="french" lang="fr">{next.example}</p><p className="phrase-translation">{next.translation}</p><Speak text={next.example}/></div>
   <div className="cover-caption"><h2>{next.title}</h2><p>{next.goal}</p></div>
   <button className="primary home-start" onClick={()=>openLesson(next.id)}>{completed?'继续学习':'开始第一节课'}<ArrowRight size={20}/></button>
   <p className="home-help">听一句 · 理解它 · 自己说出来</p>
  </section><div className="home-side"><section className="review-invitation"><div className="review-symbol" aria-hidden="true">à</div><h2>让学过的，<br/>留在记忆里。</h2><p>{due?`${due} 个词等你回忆。` :completed?'今天的到期词汇已复习完。':'学完第一课，开启你的词汇本。'}</p><button disabled={!due} onClick={review}>{due?'开始复习':'等待第一课'}<ArrowUpRight size={18}/></button></section>
   <section className="learning-method"><h2>一节课的小旅程</h2><ol><li><Headphones size={18}/><div>听懂<small>用一句法语，走进一个场景。</small></div></li><li><BookOpen size={18}/><div>理解<small>用中文拆解，让每个词都有意义。</small></div></li><li><CheckCircle2 size={18}/><div>开口<small>跟着读，再试着独立回答。</small></div></li></ol></section>
  </div></div>
  <section className="progress-overview"><div><h2>每一课，都算数。</h2><p>已完成 <strong>{completed}</strong> / 28 课{streak>0&&`，连续 ${streak} 天`}。</p><progress aria-label="课程完成进度" value={completed} max={28}/></div><button onClick={courses}>全部课程<ArrowUpRight size={18}/></button></section>
  {weak&&<section className="revisit"><span>根据错题，值得再看一遍</span><button onClick={()=>openLesson(weak.id)}>{weak.title}<ArrowRight size={18}/></button></section>}
 </div>;
}
