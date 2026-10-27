import {it,expect} from 'vitest';
import {existsSync,readFileSync} from 'node:fs';
import {lessons,words} from '../lib/learning';
import {lessonGuide,guideAudio} from '../lib/lesson-guide';
import {audioManifest,rankFrenchVoices} from '../lib/speech';
import {phonetics} from '../lib/reference';
it('所有课文、讲解片段、词汇与听力题都有原速和慢读文件',()=>{
 const texts=[...guideAudio,...lessons.map(l=>l.example),...lessons.flatMap(l=>l.exercises.flatMap(e=>e.audio?[e.audio]:[])),...words.flatMap(w=>[w.term,w.example]),...phonetics.flatMap(p=>[p.left,p.right])];
 for(const text of texts){expect(audioManifest[text],text).toBeTruthy();for(const variant of ['normal','slow'] as const){const p='public/'+audioManifest[text][variant];expect(existsSync(p),p).toBe(true);expect(readFileSync(p).byteLength).toBeGreaterThan(1000)}}
 for(const l of lessons){const g=lessonGuide(l);expect(g.parts.length).toBeGreaterThan(1);expect(g.words).toHaveLength(l.words.length);expect(g.tip.length).toBeGreaterThan(20)}
});
it('系统声音不误用其他语言，优先 fr-FR 高质量语音',()=>{
 const voices=[{lang:'en-US',name:'English premium'},{lang:'fr-CA',name:'French Canada'},{lang:'fr-FR',name:'Basic'},{lang:'fr-FR',name:'Thomas enhanced',localService:true}] as SpeechSynthesisVoice[];
 expect(rankFrenchVoices(voices).map(v=>v.name)).toEqual(['Thomas enhanced','Basic','French Canada']);
});
