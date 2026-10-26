import {describe,it,expect} from 'vitest';
import {execFileSync} from 'node:child_process';
process.env.DATABASE_URL='file:./prisma/test-learning.db';
execFileSync('node',['scripts/init-db.mjs'],{env:process.env,stdio:'pipe'});
const {db}=await import('../lib/db');
const {attempt,review}=await import('../lib/service');

describe('SQLite 核心学习闭环',()=>{
 it('拒绝越级；错误和正确分别保存；全题通过才完成',async()=>{
 await db.reviewHistory.deleteMany();await db.vocabularyReviewState.deleteMany();await db.lessonProgress.deleteMany();await db.exerciseAttempt.deleteMany();
 await expect(attempt('day-2-q1','tu')).rejects.toThrow('前一节');
 expect((await attempt('day-1-q1','Merci')).correct).toBe(false);
 expect((await attempt('day-1-q1','Bonjour')).complete).toBe(false);
 expect(await db.lessonProgress.count()).toBe(0);
 expect((await attempt('day-1-q2',' merci ! ')).complete).toBe(true);
 expect(await db.lessonProgress.count()).toBe(1);
 expect(await db.vocabularyReviewState.count()).toBe(3);
 expect(await db.exerciseAttempt.count()).toBe(3);
 });
 it('重新连接仍保留进度，复习真正更新日期且防重复',async()=>{
 const saved=execFileSync('node',['--input-type=module','-e',"import {DatabaseSync} from 'node:sqlite';const db=new DatabaseSync('./prisma/test-learning.db');console.log(db.prepare('SELECT COUNT(*) AS n FROM LessonProgress').get().n);db.close()"],{encoding:'utf8'});expect(saved.trim()).toBe('1');
 const result=await review('w1-0',4);expect(result.interval).toBe(1);expect(result.due.getTime()).toBeGreaterThan(Date.now()+23*3600000);
 await expect(review('w1-0',4)).rejects.toThrow('尚未到');
 await attempt('day-1-q2','merci');expect((await db.vocabularyReviewState.findUniqueOrThrow({where:{wordId:'w1-0'}})).interval).toBe(1);
 expect(await db.reviewHistory.count()).toBe(1);
 });
});
it('全部 28 节课程依次通过，70 道题可评分并收录 57 个词条',async()=>{
 const {lessons,words}=await import('../lib/learning');
 for(const lesson of lessons){for(const exercise of lesson.exercises){const result=await attempt(exercise.id,exercise.answers[0]);expect(result.correct).toBe(true);}expect(db.lessonProgress.findUnique({where:{lessonId:lesson.id}})).not.toBeNull();}
 expect(db.lessonProgress.count()).toBe(28);expect(db.vocabularyReviewState.count()).toBe(words.length);
});
