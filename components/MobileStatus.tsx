'use client';
import {useEffect,useState} from 'react';
export default function MobileStatus(){
 const [ready,setReady]=useState(false),[online,setOnline]=useState(true),[error,setError]=useState(''),[update,setUpdate]=useState<ServiceWorker|null>(null);
 useEffect(()=>{setOnline(navigator.onLine);const onOnline=()=>setOnline(true),onOffline=()=>setOnline(false);window.addEventListener('online',onOnline);window.addEventListener('offline',onOffline);
 if('serviceWorker'in navigator){navigator.serviceWorker.register('./sw.js').then(reg=>{if(reg.waiting)setUpdate(reg.waiting);reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)setUpdate(worker)});});return navigator.serviceWorker.ready}).then(()=>setReady(true)).catch(()=>setError('离线课程缓存失败，请联网重新打开后再试。'));}else setError('当前浏览器不能缓存离线课程，请用 Safari 打开。');
 return()=>{window.removeEventListener('online',onOnline);window.removeEventListener('offline',onOffline)};
 },[]);
 return <section className="mobile-status" aria-label="手机本地版"><div className="offline-state" role="status"><strong>{online?'手机本地版':'当前离线'}</strong><span>{error|| (ready?'✓ 课程已缓存，可离线学习':'正在缓存课程，完成前请保持联网…')}</span>{update&&<button onClick={()=>{navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload(),{once:true});update.postMessage({type:'ACTIVATE_UPDATE'})}}>更新课程并重载</button>}</div><details><summary>iPhone：添加到主屏幕与备份</summary><p>用 Safari 打开 → 点「分享」（方框向上箭头）→「添加到主屏幕」。建议添加后从桌面图标开始学习。</p><p>进度保存在这台手机，不会自动上传 GitHub 或同步其他设备。清除网站数据、无痕浏览或系统清理可能导致记录丢失；请定期打开顶部设置，点下载图标，将备份存入「文件」。可用「恢复备份」导入 Windows 版或另一台设备导出的 JSON。</p><p>首次缓存后可以离线读课、答题和复习；课程原速和慢读音频也会一起缓存，可离线播放。选择系统声音时，离线能力取决于系统语音包。AI 当前只提供本地规则讲解。</p></details></section>;
}
