'use client';
import {useEffect,useRef,useState} from 'react';
import {Volume2,Square} from 'lucide-react';
import {audioManifest,rankFrenchVoices,claimPlayer,speechPreference,stopAllSpeech} from '@/lib/speech';
function useFrenchVoices(){
 const [voices,setVoices]=useState<SpeechSynthesisVoice[]>([]);
 useEffect(()=>{if(!window.speechSynthesis)return;const load=()=>setVoices(rankFrenchVoices(speechSynthesis.getVoices()));load();speechSynthesis.addEventListener('voiceschanged',load);return()=>speechSynthesis.removeEventListener('voiceschanged',load)},[]);
 return voices;
}
export function Speak({text}:{text:string}){
 const voices=useFrenchVoices(),[status,setStatus]=useState(''),[playing,setPlaying]=useState(false),cleanup=useRef<(()=>void)|null>(null);
 useEffect(()=>()=>cleanup.current?.(),[text]);
 function play(slow:boolean){
  cleanup.current?.();const pref=speechPreference();const clip=audioManifest[text];let cancelled=false;let audio:HTMLAudioElement|undefined;
  const stop=()=>{cancelled=true;if(audio){audio.pause();audio.removeAttribute('src');audio.load()}window.speechSynthesis?.cancel();setPlaying(false)};
  cleanup.current=claimPlayer(stop);setStatus('正在准备声音…');setPlaying(true);
  const fail=(message:string)=>{if(!cancelled){setPlaying(false);setStatus(message)}};
  if(clip&&pref.source!=='system'){
   audio=new Audio(new URL('./'+(slow?clip.slow:clip.normal),location.href).href);audio.preload='auto';
   audio.onplaying=()=>{if(!cancelled)setStatus(slow?'正在慢读':'正在播放')};audio.onended=()=>{if(!cancelled){setPlaying(false);setStatus('播放完成')}};
   audio.onerror=()=>fail('音频未能加载。请联网完成缓存后重试，或在「更多」切换系统声音。');
   audio.play().catch(()=>fail('播放未开始，请再点一次；也可在「更多」切换系统声音。'));return;
  }
  const voice=voices.find(v=>v.voiceURI===pref.voice)||voices[0];
  if(!window.speechSynthesis||!voice){fail('没有可用的法语系统声音。请在「更多」选择课程音频。');return}
  const u=new SpeechSynthesisUtterance(text);u.voice=voice;u.lang=voice.lang;u.rate=slow?.8:1;u.pitch=1;u.volume=1;
  u.onstart=()=>{if(!cancelled)setStatus('正在播放 · '+voice.name)};u.onend=()=>{if(!cancelled){setPlaying(false);setStatus('播放完成')}};u.onerror=()=>fail('系统语音播放失败，请尝试课程音频。');speechSynthesis.speak(u);
 }
 return <span className="speech"><button type="button" onClick={()=>play(false)} aria-label={`播放 ${text}`}><Volume2 size={18}/>听原速</button><button type="button" onClick={()=>play(true)} aria-label={`慢读 ${text}`}>慢读</button>{playing&&<button type="button" onClick={()=>{cleanup.current?.();setStatus('已停止')}} aria-label="停止播放"><Square size={14}/>停止</button>}<small role="status">{status}</small></span>;
}
export function AudioSettings(){
 const voices=useFrenchVoices(),[source,setSource]=useState('course'),[voice,setVoice]=useState('');
 useEffect(()=>{const p=speechPreference();setSource(p.source||'course');setVoice(p.voice||'')},[]);
 function save(s:string,v:string){stopAllSpeech();setSource(s);setVoice(v);localStorage.setItem('bonjourlab-speech',JSON.stringify({source:s,voice:v}))}
 return <section className="card audio-settings"><h2>找到听得清的声音</h2><label>发音来源<select value={source} onChange={e=>save(e.target.value,voice)}><option value="course">课程法语音频（推荐，可离线）</option><option value="system">这台设备的法语声音</option></select></label>{source==='system'&&<label>法语声音<select value={voice} onChange={e=>save(source,e.target.value)}><option value="">自动选择法国法语</option>{voices.map(v=><option key={v.voiceURI} value={v.voiceURI}>{v.name} · {v.lang}</option>)}</select></label>}<p>{source==='course'?'统一使用 Piper SIWIS 法语神经语音合成。慢读音频单独生成，保持正常音高。':'仅使用法语声音，优先法国法语。音质与离线能力取决于系统安装的语音包。'}</p><Speak text="Bonjour !"/><details><summary>iPhone 的声音还是不清楚？</summary><p>先试听上面的课程音频。如果选择系统声音，可前往 iPhone「设置 → 辅助功能 → 朗读内容（部分版本为朗读与语音）→ 声音 → 法语」，下载可用的增强或高质量声音，再重新打开本应用选择。</p><p>课程音频是合成语音，并非真人录音；请在安静环境下用耳机对照听。录音回听可在「听力与口语」中使用。</p></details></section>;
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
