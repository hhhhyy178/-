'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,Check,BookOpen} from 'lucide-react';
import {Lesson} from '@/lib/learning';
import {lessonGuide} from '@/lib/lesson-guide';
import {Speak} from './Speech';
import {ExerciseCard} from './ExerciseCard';
type Attempt={exerciseId:string;correct:boolean};
const stages=['先听一句','拆开理解','开口跟读','自己试试'];
export default function GuidedLesson({lesson,attempts,completed,onSaved,onReview,onNext}:{lesson:Lesson;attempts:Attempt[];completed:boolean;onSaved:()=>Promise<void>;onReview:()=>void;onNext:()=>void}){
 const guide=lessonGuide(lesson),[step,setStep]=useState(completed?4:0),[index,setIndex]=useState(()=>Math.max(0,lesson.exercises.findIndex(e=>!attempts.some(a=>a.exerciseId===e.id&&a.correct)))),[wordIndex,setWordIndex]=useState(0),[passedHere,setPassedHere]=useState(false);
 const heading=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{heading.current?.focus({preventScroll:true});window.scrollTo(0,0)},[step,index]);
 const exercise=lesson.exercises[index],word=guide.words[wordIndex];
 function move(n:number){setStep(n);setPassedHere(false)}
 const final=step===4;
 return <div className="guided-lesson">
  <div className="lesson-context"><span>第 {lesson.day} 课，共 28 课</span><span>{lesson.level} 入门</span></div>
  <h1>{lesson.title}</h1>
  <div className="lesson-steps" aria-label="学习步骤">{stages.map((label,i)=><button key={label} aria-current={step===i?'step':undefined} disabled={i>step&&!final} onClick={()=>move(i)}><span>{i<step?<Check size={14}/>:i+1}</span>{label}</button>)}</div>
  <section className="lesson-stage" aria-labelledby="stage-title">
   <h2 id="stage-title" tabIndex={-1} ref={heading}>{final?'本课已完成':stages[step]}</h2>
   {step===0&&<><p className="scene">{guide.scene}</p><div className="sentence-display"><p className="french" lang="fr">{lesson.example}</p><p>{lesson.translation}</p><Speak text={lesson.example}/></div><p className="lesson-tip">先听整句，不用急着记拼写。接下来会把它拆开讲。</p><button className="primary next-step" onClick={()=>move(1)}>看看这句话 <ArrowRight size={18}/></button></>}
   {step===1&&<><div className="sentence-parts">{guide.parts.map(part=><div key={part.fr}><p className="french" lang="fr">{part.fr}</p><p>{part.zh}</p><Speak text={part.fr}/></div>)}</div><p className="lesson-tip"><BookOpen size={18}/>{guide.tip}</p><details className="extra-explanation"><summary>展开完整讲解</summary><p>{lesson.explanation}</p></details><button className="primary next-step" onClick={()=>move(2)}>明白了，跟着读 <ArrowRight size={18}/></button></>}
   {step===2&&<><p>先听一遍，再自己说一遍。暂时读不准也可以继续。</p>{word&&<div className="word-study"><span>词语 {wordIndex+1} / {guide.words.length}</span><h3 className="french" lang="fr">{word.term}</h3><p>{word.meaning}</p><Speak text={word.term}/><details><summary>查看音标与例句</summary><p>音标 /{word.ipa}/ 表示声音，不是字母名。</p><p lang="fr">{word.example}</p><p>{word.translation}</p><Speak text={word.example}/></details><div className="actions"><button disabled={wordIndex===0} onClick={()=>setWordIndex(i=>i-1)}>上一个词</button>{wordIndex<guide.words.length-1&&<button onClick={()=>setWordIndex(i=>i+1)}>下一个词</button>}</div></div>}<p className="lesson-tip">{guide.tip}</p><button className="primary next-step" onClick={()=>move(3)}>开始练习 <ArrowRight size={18}/></button></>}
   {step===3&&<><div className="quiz-position"><span>第 {index+1} 题 / {lesson.exercises.length} 题</span><progress aria-label="练习进度" value={index} max={lesson.exercises.length}/></div><ExerciseCard key={exercise.id} exercise={exercise} passed={attempts.some(a=>a.exerciseId===exercise.id&&a.correct)} onSaved={onSaved} onCorrect={()=>setPassedHere(true)} hint={guide.tip}/><button className="text-button" onClick={()=>move(1)}><ArrowLeft size={16}/> 再看一遍讲解</button>{passedHere&&<button className="primary next-step" onClick={()=>{setPassedHere(false);if(index+1<lesson.exercises.length)setIndex(i=>i+1);else move(4)}}>{index+1<lesson.exercises.length?'下一题':'查看学习小结'} <ArrowRight size={18}/></button>}</>}
   {final&&<><div className="completion-mark"><Check size={30}/></div><p>你已经能做到：{lesson.goal}</p><p className="lesson-tip">{guide.tip}</p><p>本课词汇已加入复习。先回忆，再翻卡；评为「记得」的词会安排到明天。</p><div className="actions"><button className="primary" onClick={onReview}>复习本课词汇</button><button onClick={onNext}>{lesson.day===28?'返回课程':'继续下一课'}</button></div><button className="text-button" onClick={()=>{setIndex(0);move(0)}}>重新看这节课</button></>}
  </section>
 </div>;
}
