export const mobileLocal=process.env.NEXT_PUBLIC_LOCAL_MODE==='true';
export async function request(path:string,data?:unknown,method='POST'){
 if(mobileLocal){const {browserRequest}=await import('./browser-store');return browserRequest(path,data,method);}
 const r=await fetch(path,data===undefined?undefined:{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const v=await r.json();if(!r.ok)throw Error(v.error||'请求失败');return v;
}
export async function exportLearningBackup(){
 if(!mobileLocal){location.href='/api/backup';return;}
 const value=await request('/api/backup');const file=new File([JSON.stringify(value,null,2)],`BonjourLab-${new Date().toISOString().slice(0,10)}.json`,{type:'application/json'});
 if(navigator.canShare?.({files:[file]})){await navigator.share({files:[file],title:'BonjourLab 学习备份'});return;}
 const url=URL.createObjectURL(file);const a=document.createElement('a');a.href=url;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
