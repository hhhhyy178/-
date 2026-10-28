import {test,expect} from '@playwright/test';
test('生产电脑端加载新版插图和主题，非仅手机静态站点',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await expect(page.getByRole('heading',{name:'今天，说会一句法语。'})).toBeVisible();await page.evaluate(()=>document.fonts.ready);
 const art=page.locator('.paris-print img');await expect(art).toHaveJSProperty('naturalWidth',1536);await expect(page.getByText('法语手册 2026.10.28.6',{exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(await art.evaluate(e=>getComputedStyle(e).objectFit)).toBe('contain');
 await page.screenshot({path:'screenshots/soft-print-desktop-production.png',fullPage:true});await page.getByRole('button',{name:'开始第一节课',exact:true}).click();await expect(page.getByRole('heading',{name:'先听一句',exact:true})).toBeVisible();expect(errors).toEqual([]);
});
