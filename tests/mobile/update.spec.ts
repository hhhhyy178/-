import {test,expect} from '@playwright/test';
test('电脑浏览器：顶部发现新版，手动更新后保留本机目标',async({page,context})=>{
 await page.setViewportSize({width:1440,height:1000});
 let serveOld=true;
 await context.route('**/sw.js',async route=>{if(serveOld)await route.fulfill({contentType:'text/javascript',body:"self.addEventListener('install',()=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));"});else await route.continue()});
 await page.goto('./');await expect(page.getByRole('button',{name:'开始第一节课',exact:true})).toBeVisible();
 await page.evaluate(()=>new Promise<void>(resolve=>{if(navigator.serviceWorker.controller)resolve();else navigator.serviceWorker.addEventListener('controllerchange',()=>resolve(),{once:true})}));
 await page.getByRole('button',{name:'设置与工具',exact:true}).click();await page.getByLabel('每日目标').selectOption('30');
 // Wait until the UI mutation is actually committed in IndexedDB before upgrading.
 await expect.poll(()=>page.evaluate(()=>new Promise<number>(resolve=>{const r=indexedDB.open('bonjourlab-mobile',1);r.onsuccess=()=>{const db=r.result,t=db.transaction('learning'),q=t.objectStore('learning').get('primary');q.onsuccess=()=>resolve(q.result.profile.goal);t.oncomplete=()=>db.close()}}))).toBe(30);
 await page.getByRole('button',{name:'今天学习',exact:true}).click();serveOld=false;
 await page.evaluate(async()=>{const reg=await navigator.serviceWorker.getRegistration();await reg!.update()});
 await expect(page.getByRole('button',{name:'更新并打开新版',exact:true})).toBeVisible();await page.screenshot({path:'screenshots/soft-print-desktop-update.png',fullPage:true});await page.getByRole('button',{name:'更新并打开新版',exact:true}).click();
 await expect(page.getByText('柔边版画 2026.10.28.4',{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'更新并打开新版',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'设置与工具',exact:true}).click();await expect(page.getByLabel('每日目标')).toHaveValue('30');
});
