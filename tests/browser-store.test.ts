import {describe,it,expect} from 'vitest';
import {applyBrowserOperation,emptyState,parseBrowserBackup} from '../lib/browser-store';
import {lessons} from '../lib/learning';
describe('手机本地学习逻辑',()=>{
 it('按顺序完成全部课程，保留错误并生成复习队列',()=>{const s=emptyState();expect(()=>applyBrowserOperation(s,'/api/attempt',{exerciseId:'day-2-q1',answer:'tu'})).toThrow('前一节');applyBrowserOperation(s,'/api/attempt',{exerciseId:'day-1-q1',answer:'Merci'});expect(s.attempts[0].correct).toBe(false);for(const l of lessons)for(const e of l.exercises)applyBrowserOperation(s,'/api/attempt',{exerciseId:e.id,answer:e.answers[0]});expect(s.progress).toHaveLength(28);expect(s.reviews).toHaveLength(57);expect(s.attempts).toHaveLength(71);});
 it('复习更新真实日期，不允许同日无限重复',()=>{const s=emptyState();const now=new Date('2026-10-26T02:00:00Z');for(const e of lessons[0].exercises)applyBrowserOperation(s,'/api/attempt',{exerciseId:e.id,answer:e.answers[0]},'POST',now);applyBrowserOperation(s,'/api/review',{wordId:'w1-0',quality:4},'POST',now);expect(s.reviews[0].due).toBe('2026-10-27T02:00:00.000Z');expect(()=>applyBrowserOperation(s,'/api/review',{wordId:'w1-0',quality:4},'POST',now)).toThrow('尚未到');});
 it('跨版本备份可恢复，非法文件不覆盖已有数据',()=>{const s=emptyState();applyBrowserOperation(s,'/api/state',{goal:30},'PATCH');const backup=applyBrowserOperation(s,'/api/backup');expect(parseBrowserBackup(backup).profile.goal).toBe(30);expect(()=>applyBrowserOperation(s,'/api/backup',{version:99})).toThrow();expect(s.profile.goal).toBe(30)});
 it('本地教师明确标识且不请求服务器',()=>{const s=emptyState();expect(applyBrowserOperation(s,'/api/tutor',{mode:'纠错',message:'Je suis une étudiant.'})).toMatchObject({source:'手机本地预设规则（非大模型）'});expect(s.conversations[0].answer).toContain('une étudiante')});
});
