# BonjourLab redesign review

| Before | After | Why |
| --- | --- | --- |
| Dashboard stats before lesson task | Current lesson, listenable phrase, one start action | A beginner can identify what to do first |
| All explanations, vocabulary and exercises in one long page | Four learning stages, one exercise at a time, manual next | Reduce working-memory load and keep feedback visible |
| First wrong answer reveals solution | Hint first, optional answer after two errors, return to explanation | Encourage a second attempt with support |
| Device-selected TTS at rate 0.65 | Fixed neural French samples with separately generated slow speech; configurable fallback | Consistent voices and offline playback across devices |
| Seven horizontally scrolling phone navigation items | Four bottom items, remaining tools under More | All destinations have visible labels without sideways hunting |
| Tiny technical/IPA labels | 16px reading, optional IPA, scenario-based Chinese explanations | Make introductory lessons readable without phonetics knowledge |

## Validation

20 unit/integration tests; 3 mobile browser flows; 2 desktop browser flows. Mobile tests cover IndexedDB reload, backup/restore, wrong-answer recovery, next-lesson gates, accent input, offline normal/slow MP3 playback with TTS absent, range requests and both repository URL prefixes. Next production build and TypeScript pass.

Chromium at 320, 375, 390, 768, 1280 and 1440 px: home and lesson had no horizontal overflow and no page errors. Programmatic focus moves to lesson stage heading. Representative home, lesson, explanation, error, success, More and light/dark screenshots reviewed. A phone next-action positioning issue was corrected. Dark screenshots captured after theme transitions settled. Bottom navigation stays fixed; page padding allows reaching the final action/footer by scrolling.

Taste source lint: 0 FAIL, 0 WARN for the three new primary components. Its bundled browser launcher could not start under this container's sandbox; Playwright with the environment's Chromium provided actual rendered screenshots and checks instead. Impeccable context engine did not run because its default cache was unwritable; project context and craft-floor instructions were read directly. Neither unavailable automatic check is claimed as passed.

## Screenshots Captured

`screenshots/home-{320,375,390,768,1280,1440}.png`, `lesson-{320,375,390,768,1280,1440}.png`, `lesson-dark-{375,768,1280}.png`, `explanation-390.png`, `quiz-error-390.png`, `quiz-success-390.png`, `tools-390.png`.

## Limits

No physical iPhone / Safari listening review, VoiceOver testing or independent French-teacher audio validation. Neural speech is not represented as human narration or guaranteed accent assessment. AI remains the existing optional server integration or offline preset rules. Repository rename was attempted with the authorized name and denied by GitHub (HTTP 403); only its owner can finish that setting with the current connection. No old learning data schema changed.

## 2026-10-28 用户否定旧视觉后的重做

| Before | After | Why |
| --- | --- | --- |
| 蓝灰背景、默认衬线字、同质卡片 | 用户选定法式杂志；真实加载 Cormorant + Manrope，黑白与钴蓝 | 以真实法语句子建立产品视觉身份 |
| 品牌、工具和缓存三行占据手机首屏 | 紧凑品牌栏、外观与备份菜单，缓存提示移至内容后 | 第一屏直接进入学习 |
| 文字大小接近，主次不清 | 法语示例 52–104px，中文标题与正文分层 | 用可听、可学的内容承担视觉中心 |
| 设计报告把源码与测试作为主要证据 | 实际生产 PWA 的桌面、手机、深色与长句截图 | 以真实渲染检验布局 |

实际应用 frontend-design 的内容与字体原则、UI/UX Pro Max 的 typography 检索、emil-design-eng 的可中断反馈与克制动画，以及 Impeccable craft-floor。没有声称 11 个工具都已成功执行。设计主规范以更新后的 DESIGN.md 为准。字体压缩的可选尝试缺少 Brotli，保留原始 TTF 与许可，未影响字体加载与离线验证。

最终生产构建通过；20 项数据与内容测试、3 项手机流程、2 项桌面流程通过。实图记录：`editorial-home-{320,375,390,768,1440}.png`、对应 lesson 截图、`editorial-dark-390.png`、`editorial-phone.png`、`editorial-settings.png`。所有检查宽度无横向溢出；`editorial-long-320.png` 为以第 28 课真实文本替换展示区的排版压力检查，非用户实际学习进度。设计报告不将「高级」当成可由自动测试证明的结论，最终审美由用户评判。

## 2026-10-28 法国艺术手册方向

| Before | After | Why |
| --- | --- | --- |
| 排版与配色承担全部视觉 | 原创巴黎版画与法语主句组成封面，约 528 KiB WebP | 让法国艺术成为真实内容资产 |
| 灰白工具界面 | 纸色、钴蓝墨色、植物绿词汇页 | 用统一的印刷与手册语境贯穿界面 |
| 首页与课程只有一般标题 | 四章法文题签、手册页脚、同源字体和墨色 | 跨页面延续身份，不把绘画压在练习正文上 |
| 静态资源更新只看代码 | 插图摘要参与离线版本号并预缓存 | 更新与离线使用能拿到一致视觉资产 |

实图：atelier-home-{320,390,768,1440}.png 与对应课程截图；最终手机首屏 atelier-phone.png。首轮各宽度无横向溢出、图片解码为 1536px、无 pageerror。AI 图像为本项目原创生成，不冒充历史版画或真人作品。设计采用 frontend-design 的「题材资产」原则与 Impeccable 的实际渲染审查。

最终检查：20 项数据与课程测试、3 项手机端离线流程、2 项桌面学习流程及 Next 生产构建通过。手机离线测试新增断网重载后插图 naturalWidth=1536、Cormorant 字体加载断言。最终截图含浅色与 atelier-dark-390.png；插图约 528 KiB 并随站点自托管，发布时不依赖图像生成服务。Windows 包也已同步此视觉，未在本 Linux 环境运行 Windows 可执行程序。

## 2026-10-28 图片柔边与电脑浏览器更新

用户明确反馈电脑浏览器看不到变化。检查发现旧 Service Worker 对导航优先返回旧缓存，而原更新按钮只在页底与更多里出现。无法直接观察用户浏览器，不能确认其本机缓存状态；现已增加全站顶部更新提示、切回窗口检查新版本与版本号，激活仍由用户点击，避免打断答题。

插图由图像编辑工具重做为透明墨线渐隐；WebP 保留 alpha，左上角 alpha=0。渲染改用 contain 显示整张画，禁止 cover 再次裁掉透明边缘。桌面生产服务单独测试：实际 / 页面加载新版插图、样式、版本号并可进入学习。截图 soft-print-desktop-production.png；网页响应式截图 soft-print-web-{320,390,1440}.png；手机首屏 soft-print-phone.png。

新增真实 Service Worker 升级测试：先安装旧脚本、设置本机目标为 30，再提供新版脚本；顶部提示出现，点击激活重载后目标仍为 30。此前首次定位器把 HTML label 的 option 文本当作精确名称，已改用非精确可访问标签匹配；升级测试通过，没有关闭断言。
