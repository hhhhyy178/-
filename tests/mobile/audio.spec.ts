import {test,expect} from '@playwright/test';
test('无系统 TTS：课程音频离线播放、慢读、范围请求和改名路径',async({page,context})=>{
 await page.addInitScript(()=>Object.defineProperty(window,'speechSynthesis',{value:undefined,configurable:true}));
 await page.goto('/BonjourLab/');await expect(page.getByText('✓ 课程已缓存，可离线学习')).toBeVisible();
 await page.evaluate(()=>new Promise<void>(r=>{if(navigator.serviceWorker.controller)r();else navigator.serviceWorker.addEventListener('controllerchange',()=>r(),{once:true})}));
 await context.setOffline(true);
 await page.getByRole('button',{name:'播放 Bonjour !',exact:true}).click();await expect(page.getByText('正在播放',{exact:true})).toBeVisible();await expect(page.getByText('播放完成',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'慢读 Bonjour !',exact:true}).click();await expect(page.getByText('正在慢读',{exact:true})).toBeVisible();await page.getByRole('button',{name:'停止播放'}).click();await expect(page.getByText('已停止')).toBeVisible();
 const range=await page.evaluate(async()=>{const keys=await caches.keys();const c=await caches.open(keys.find(k=>k.startsWith('bonjourlab-mobile-'))!);const requests=await c.keys();const url=requests.find(r=>r.url.endsWith('.mp3'))!.url;const r=await fetch(url,{headers:{Range:'bytes=0-99'}});return {status:r.status,size:(await r.arrayBuffer()).byteLength,contentRange:r.headers.get('Content-Range')}});
 expect(range.status).toBe(206);expect(range.size).toBe(100);expect(range.contentRange).toMatch(/^bytes 0-99\//);
 await page.reload();await expect(page.getByRole('button',{name:'开始第一节课'})).toBeVisible();await expect(page.locator('.paris-print img')).toHaveJSProperty('naturalWidth',1536);await page.evaluate(()=>document.fonts.ready);expect(await page.evaluate(()=>document.fonts.check('40px Cormorant'))).toBe(true);
});
test('分步练习不提前暴露答案，回看讲解后继续，法语重音键可用',async({page})=>{
 await page.goto('./?lesson=day-1');await expect(page.getByRole('textbox',{name:'你的答案'})).toHaveCount(0);
 await page.getByRole('button',{name:'看看这句话'}).click();await expect(page.getByText('见面说 Bonjour，感谢说 Merci。',{exact:false}).first()).toBeVisible();
 await page.getByRole('button',{name:'明白了，跟着读'}).click();await page.getByRole('button',{name:'开始练习',exact:true}).click();
 await page.getByLabel('Merci',{exact:true}).check();await page.getByRole('button',{name:'检查答案'}).click();await expect(page.getByRole('button',{name:'下一题',exact:true})).toHaveCount(0);await expect(page.getByRole('button',{name:'查看参考答案与原因'})).toHaveCount(0);
 await page.getByRole('button',{name:'再次检查'}).click();await page.getByRole('button',{name:'查看参考答案与原因'}).click();await expect(page.getByText('Bonjour —',{exact:false})).toBeVisible();
 await page.getByRole('button',{name:'再看一遍讲解'}).click();await expect(page.getByRole('heading',{name:'拆开理解',exact:true})).toBeVisible();await page.getByRole('button',{name:'明白了，跟着读'}).click();await page.getByRole('button',{name:'开始练习',exact:true}).click();
 await page.getByLabel('Bonjour',{exact:true}).check();await page.getByRole('button',{name:'检查答案'}).click();await page.getByRole('button',{name:'下一题',exact:true}).click();await page.getByRole('button',{name:'输入 é',exact:true}).click();await expect(page.getByRole('textbox',{name:'你的答案'})).toHaveValue('é');
 await page.getByRole('textbox',{name:'你的答案'}).fill('merci');await page.getByRole('button',{name:'检查答案',exact:true}).click();await page.getByRole('button',{name:'查看学习小结'}).click();await expect(page.getByRole('heading',{name:'本课已完成'})).toBeVisible();
});
