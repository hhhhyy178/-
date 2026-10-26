'use client';
import {useEffect,useState} from 'react';
export function Speak({text}:{text:string}){
 const [voices,setVoices]=useState<SpeechSynthesisVoice[]>([]),[status,setStatus]=useState('检测法语语音中');
 useEffect(()=>{if(!window.speechSynthesis){setStatus('浏览器不支持语音合成，请阅读 IPA');return;}const load=()=>{const v=speechSynthesis.getVoices().filter(v=>/^fr[-_]/i.test(v.lang));setVoices(v);setStatus(v.length?'':'未安装法语语音；请在系统语音设置添加法语，当前可阅读 IPA');};load();speechSynthesis.addEventListener('voiceschanged',load);return()=>speechSynthesis.removeEventListener('voiceschanged',load);},[]);
 function play(rate:number){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.voice=voices.find(v=>v.lang==='fr-FR')||voices[0];u.lang=u.voice.lang;u.rate=rate;u.onstart=()=>setStatus('正在播放…');u.onend=()=>setStatus('播放完成');u.onerror=()=>setStatus('播放失败，请检查系统语音服务');speechSynthesis.speak(u);}
 return <span className="speech"><button type="button" disabled={!voices.length} onClick={()=>play(1)} aria-label={`播放 ${text}`}>◖)) 正常</button><button type="button" disabled={!voices.length} onClick={()=>play(.65)}>慢速</button><small role="status">{status}</small></span>;
}
export function Recorder({target}:{target:string}){
 const [status,setStatus]=useState(''),[text,setText]=useState(''),[url,setUrl]=useState(''),[recording,setRecording]=useState(false);
 useEffect(()=>()=>{if(url)URL.revokeObjectURL(url)},[url]);
 async function record(){try{if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined')throw Error('浏览器不支持录音，请使用下方文本练习');const stream=await navigator.mediaDevices.getUserMedia({audio:true});const recorder=new MediaRecorder(stream);const chunks:BlobPart[]=[];recorder.ondataavailable=e=>chunks.push(e.data);recorder.onstop=()=>{stream.getTracks().forEach(t=>t.stop());setUrl(URL.createObjectURL(new Blob(chunks,{type:recorder.mimeType})));setRecording(false);setStatus('录音完成，可回听；本地录音未上传。');};recorder.start();setRecording(true);setStatus('录音中，10 秒后自动停止');setTimeout(()=>{if(recorder.state==='recording')recorder.stop()},10000);}catch(e){setStatus(e instanceof Error?e.message:'无法使用麦克风，请使用文本练习');}}
 function recognize(){
 // Web Speech Recognition is vendor-specific and intentionally capability-detected.
 const api=window as unknown as {SpeechRecognition?:new()=>Recognition;webkitSpeechRecognition?:new()=>Recognition};const C=api.SpeechRecognition||api.webkitSpeechRecognition;if(!C){setStatus('浏览器不支持语音识别，可录音回听或输入文本。');return;}const r=new C();r.lang='fr-FR';r.onresult=e=>{setText(e.results[0][0].transcript);setStatus('已获得转写。转写正确不代表发音正确。');};r.onerror=()=>setStatus('识别失败或权限被拒绝，请使用文本练习');r.start();setStatus('正在识别；浏览器可能将音频发送给其语音服务。');
 }
 return <div className="card"><h3>跟读与回听</h3><p className="french">{target}</p><Speak text={target}/><div className="actions"><button onClick={record} disabled={recording}>● {recording?'录音中':'录音 10 秒'}</button><button onClick={recognize}>语音转写</button></div>{url&&<audio controls src={url}/>}<p role="status">{status}</p><label>没有麦克风？输入你读到的句子<textarea value={text} onChange={e=>setText(e.target.value)}/></label>{text&&<p>{text.normalize('NFC').toLowerCase().replace(/[.!?]/g,'').trim()===target.toLowerCase().replace(/[.!?]/g,'').trim()?'文本匹配':'文本存在差异，请与目标逐词比较。'}</p>}<small>这里只做录音、转写与文本对照，不提供音素级评分。语音识别取决于浏览器与网络。</small></div>;
}
type Recognition={lang:string;onresult:(event:{results:{[n:number]:{[n:number]:{transcript:string}}}})=>void;onerror:()=>void;start:()=>void};
