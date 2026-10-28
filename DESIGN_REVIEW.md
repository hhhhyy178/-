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
