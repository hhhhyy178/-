import {test,expect} from '@playwright/test';
test.beforeEach(async({page})=>{page.on('pageerror',e=>console.error('BROWSER ERROR',e.message));});
test('课程完成、进度恢复、复习日期、离线教师和移动布局',async({page,request})=>{
 const blank={version:1,profile:{name:'测试',goal:15},progress:[],attempts:[],reviews:[],history:[],sessions:[],conversations:[]};
 expect((await request.post('/api/backup',{data:blank})).ok()).toBe(true);
 await page.goto('/');await expect(page.getByRole('heading',{name:'今天，说会一句法语。'})).toBeVisible();
 await page.getByRole('button',{name:'开始第一节课'}).click();await page.getByRole('button',{name:'看看这句话'}).click();await page.getByRole('button',{name:'明白了，跟着读'}).click();await page.getByRole('button',{name:'开始练习',exact:true}).click();
 await page.getByLabel('Merci',{exact:true}).check();
 await page.getByRole('button',{name:'检查答案'}).first().click();await expect(page.getByText('再想一想',{exact:true})).toBeVisible();
 await page.getByLabel('Bonjour',{exact:true}).check();await page.getByRole('button',{name:'再次检查'}).click();await expect(page.getByText('✓ 答对了，继续保持').first()).toBeVisible();
 await page.getByRole('button',{name:'下一题',exact:true}).click();await page.getByRole('textbox',{name:'你的答案'}).fill('merci');await page.getByRole('button',{name:'检查答案',exact:true}).click();
 await page.getByRole('button',{name:'查看学习小结'}).click();await expect(page.getByRole('heading',{name:/本课已完成/})).toBeVisible();await page.reload();await expect(page.getByRole('heading',{name:/本课已完成/})).toBeVisible();
 await page.getByRole('button',{name:'复习本课词汇',exact:true}).click();await page.getByRole('button',{name:'翻开卡片'}).click();const [reviewResponse]=await Promise.all([page.waitForResponse(r=>r.url().endsWith('/api/review')&&r.request().method()==='POST'),page.getByRole('button',{name:'记得',exact:true}).click()]);expect(reviewResponse.ok()).toBe(true);
 const state=await (await request.get('/api/state')).json();expect(state.reviews[0].interval).toBe(1);expect(state.history).toHaveLength(1);
 const backup=await (await request.get('/api/backup')).json();expect(backup.progress).toHaveLength(1);expect((await request.post('/api/backup',{data:backup})).ok()).toBe(true);expect((await (await request.get('/api/state')).json()).history).toHaveLength(1);
 await page.getByRole('button',{name:'系统课程',exact:true}).click();await expect(page.getByRole('button',{name:/DAY 02/})).toBeEnabled();await expect(page.getByRole('button',{name:/DAY 03/})).toBeDisabled();
 await page.getByRole('button',{name:'私人教师',exact:true}).click();await page.getByRole('button',{name:'Je suis une étudiant.',exact:true}).click();await page.getByRole('button',{name:'发送问题 →'}).click();await expect(page.getByText('本地预设规则（非大模型）',{exact:true})).toBeVisible();await expect(page.getByText(/男性：un étudiant/)).toBeVisible();
 await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'今天',exact:true}).click();await expect(page.getByRole('heading',{name:'今天，说会一句法语。'})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:'test-results/mobile-home.png',fullPage:true});
 await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'test-results/desktop-home.png',fullPage:true});
});
test('无语音与麦克风能力时给出替代练习',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(window,'speechSynthesis',{value:undefined,configurable:true});});
 // The speech component must handle APIs absent in nonstandard browser environments.
 await page.goto('/?view=practice');await expect(page.getByRole('textbox',{name:'听写答案'})).toBeVisible();await expect(page.getByRole('button',{name:/播放 /}).first()).toBeEnabled();await page.evaluate(()=>Object.defineProperty(navigator,'mediaDevices',{value:undefined,configurable:true}));await page.getByRole('button',{name:'● 录音 10 秒'}).click();await expect(page.getByText('浏览器不支持录音，请使用下方文本练习')).toBeVisible();
});
