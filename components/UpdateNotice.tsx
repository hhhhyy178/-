'use client';
import {useEffect,useState} from 'react';
export default function UpdateNotice(){
 const [waiting,setWaiting]=useState<ServiceWorker|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[activeUpdate,setActiveUpdate]=useState(false);
 useEffect(()=>{
  if(!('serviceWorker' in navigator))return;
  let disposed=false,registration:ServiceWorkerRegistration|undefined,lastCheck=0;let hadController=!!navigator.serviceWorker.controller;const changedController=()=>{if(hadController&&!disposed)setActiveUpdate(true);hadController=true};navigator.serviceWorker.addEventListener('controllerchange',changedController);
  const workers=new Map<ServiceWorker,()=>void>();
  const offer=(worker:ServiceWorker|null)=>{if(!disposed&&worker)setWaiting(worker)};
  const found=()=>{const worker=registration?.installing;if(!worker)return;const changed=()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)offer(worker)};workers.set(worker,changed);worker.addEventListener('statechange',changed);changed()};
  const check=()=>{if(registration&&navigator.onLine&&Date.now()-lastCheck>60000){lastCheck=Date.now();registration.update().then(()=>offer(registration?.waiting||null)).catch(()=>{})}};
  navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(reg=>{if(disposed)return;registration=reg;offer(reg.waiting);reg.addEventListener('updatefound',found);found();check()}).catch(()=>{});
  const visible=()=>{if(document.visibilityState==='visible')check()};
  window.addEventListener('focus',check);window.addEventListener('online',check);document.addEventListener('visibilitychange',visible);
  return()=>{disposed=true;navigator.serviceWorker.removeEventListener('controllerchange',changedController);registration?.removeEventListener('updatefound',found);workers.forEach((listener,worker)=>worker.removeEventListener('statechange',listener));window.removeEventListener('focus',check);window.removeEventListener('online',check);document.removeEventListener('visibilitychange',visible)};
 },[]);
 function activate(){if(activeUpdate){location.reload();return}if(!waiting)return;if(waiting.state==='redundant'){setError('这个更新已失效，请刷新页面重新检查。');return}setBusy(true);setError('');navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload(),{once:true});waiting.postMessage({type:'ACTIVATE_UPDATE'})}
 if(!waiting&&!activeUpdate)return null;
 return <aside className="update-notice" aria-label="网站更新" role="status"><div><strong>新版页面已准备好</strong><p>更新外观与课程，已保存的学习进度会保留。</p>{error&&<p role="alert">{error}</p>}</div><button className="primary" disabled={busy} onClick={activate}>{busy?'正在更新…':'更新并打开新版'}</button></aside>;
}
