import {describe,it,expect} from 'vitest';
import {grade,normalize,schedule,unlocked,lessons,words} from '../lib/learning';
describe('确定性评分',()=>{
 it('处理空格、NFC、大小写、弯引号和句末标点',()=>{expect(grade('  J\u2019ai vingt ans ! ',["j’ai vingt ans"])).toBe(true);expect(normalize('cafe\u0301')).toBe('café');});
 it('不忽略重音、性数与变位',()=>{for(const [answer,right] of [['cafe','café'],['etudiant','étudiant'],['parle','parles'],['une étudiant','une étudiante']])expect(grade(answer,[right])).toBe(false)});
 it('支持明确的多答案集合',()=>{expect(grade('Salut !',['Bonjour','Salut'])).toBe(true)});
});
describe('SM-2 复习调度',()=>{
 it('成功回忆后依次为 1、6、扩展间隔',()=>{const now=new Date('2026-01-01T10:00:00Z');const one=schedule({ease:2.5,interval:0,repetitions:0},4,now);expect(one.interval).toBe(1);expect(one.due.toISOString()).toBe('2026-01-02T10:00:00.000Z');const two=schedule(one,4,now);expect(two.interval).toBe(6);expect(schedule(two,4,now).interval).toBe(15)});
 it('失败次日再现，重置连续成功并限制 ease 下限',()=>{const s=schedule({ease:1.3,interval:15,repetitions:3},1);expect(s.interval).toBe(1);expect(s.repetitions).toBe(0);expect(s.ease).toBe(1.3)});
});
describe('课程结构和先修关系',()=>{
 it('28 节均有真实内容及至少两类练习',()=>{expect(lessons).toHaveLength(28);for(const l of lessons){expect(l.explanation.length).toBeGreaterThan(60);expect(new Set(l.exercises.map(e=>e.type)).size).toBeGreaterThanOrEqual(2);expect(l.words.every(id=>words.some(w=>w.id===id))).toBe(true);for(const e of l.exercises){expect(e.answers.length).toBeGreaterThan(0);if(e.options)expect(e.options).toContain(e.answers[0]);}}});
 it('第一课开放，其余严格依赖前一课',()=>{expect(unlocked('day-1',[])).toBe(true);expect(unlocked('day-2',[])).toBe(false);expect(unlocked('day-2',['day-1'])).toBe(true);expect(unlocked('day-3',['day-1'])).toBe(false);expect(unlocked('invalid',[])).toBe(false)});
 it('题目与词汇 ID 唯一',()=>{expect(new Set(lessons.flatMap(l=>l.exercises.map(e=>e.id))).size).toBe(lessons.flatMap(l=>l.exercises).length);expect(new Set(words.map(w=>w.id)).size).toBe(words.length)});
});
