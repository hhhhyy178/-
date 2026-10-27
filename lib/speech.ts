import manifest from './audio-manifest.json';
export const audioManifest=manifest as Record<string,{normal:string;slow:string}>;
export function rankFrenchVoices(voices:SpeechSynthesisVoice[]){return voices.filter(v=>/^fr(?:[-_]|$)/i.test(v.lang)).sort((a,b)=>voiceScore(b)-voiceScore(a))}
function voiceScore(v:SpeechSynthesisVoice){return (/^fr[-_]FR$/i.test(v.lang)?100:0)+(/premium|enhanced|amélior|Thomas|Audrey|Amelie|Aurélie|Google français|Microsoft Denise|Microsoft Henri/i.test(v.name)?20:0)+(v.localService?5:0)}
// One active player across all buttons; replacement and unmount never overlap audio.
let stopActive:(()=>void)|undefined;
export function claimPlayer(stop:()=>void){stopActive?.();stopActive=stop;return()=>{if(stopActive===stop){stop();stopActive=undefined}}}
export function stopAllSpeech(){stopActive?.();stopActive=undefined}
export function speechPreference(){try{return JSON.parse(localStorage.getItem('bonjourlab-speech')||'{}') as {source?:string;voice?:string}}catch{return {}}}
