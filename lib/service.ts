import {db} from './db';
import {lessons,words,grade,unlocked,schedule} from './learning';
export async function state(){
 const [profile,progress,attempts,reviews,history,sessions]=await Promise.all([db.userProfile.upsert({where:{id:1},create:{id:1},update:{}}),db.lessonProgress.findMany(),db.exerciseAttempt.findMany({orderBy:{createdAt:'asc'}}),db.vocabularyReviewState.findMany(),db.reviewHistory.findMany(),db.learningSession.findMany()]);
 return {profile,progress,attempts,reviews,history,sessions,aiEnabled:!!process.env.AI_API_KEY};
}
export async function attempt(exerciseId:string,answer:string){
 const lesson=lessons.find(l=>l.exercises.some(e=>e.id===exerciseId));
 if(!lesson)throw Error('题目不存在');
 const completed=(await db.lessonProgress.findMany()).map(p=>p.lessonId);
 if(!unlocked(lesson.id,completed))throw Error('请先完成前一节课');
 const e=lesson.exercises.find(e=>e.id===exerciseId)!;
 const correct=grade(answer,e.answers);
 return db.$transaction(tx=>{
 tx.exerciseAttempt.create({data:{exerciseId,answer,correct,knowledgeId:e.knowledgeId,skill:e.skill}});
 const passed=tx.exerciseAttempt.findMany({where:{correct:true,exerciseId:{in:lesson.exercises.map(e=>e.id)}}});
 const complete=lesson.exercises.every(e=>passed.some(p=>p.exerciseId===e.id));
 if(complete){tx.lessonProgress.upsert({where:{lessonId:lesson.id},create:{lessonId:lesson.id},update:{}});for(const wordId of lesson.words)tx.vocabularyReviewState.upsert({where:{wordId},create:{wordId},update:{}});}
 return {correct,complete,explanation:e.explanation,answers:e.answers};
 });
}
export async function review(wordId:string,quality:number){
 if(!words.some(w=>w.id===wordId))throw Error('单词不存在');
 return db.$transaction(tx=>{const s=tx.vocabularyReviewState.findUnique({where:{wordId}});if(!s)throw Error('请先学习所属课程');if(s.due.getTime()>Date.now())throw Error('此单词尚未到复习时间');const result=tx.vocabularyReviewState.update({where:{wordId},data:schedule(s,quality)});tx.reviewHistory.create({data:{wordId,quality}});return result;});
}
