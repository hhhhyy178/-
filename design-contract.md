# Design contract
目标：iPhone Safari 离线 PWA 中可理解、可继续的初级法语学习。

| Evidence | Confidence | Decision |
| --- | --- | --- |
| 用户说学习看不懂、发音不清晰 | provided | 分步教学，固定音频与自然慢读 |
| 原版首屏统计多、习题同屏 | observed（/tmp/bonjourlab-before.png） | 今日任务优先、一题一屏 |
| 中文零基础、手机为主 | provided | 中文讲解、44px 操作、4 项底栏 |
| 互动课本方向 | inferred | 保留品牌与课程，以实际法语句子为主视觉 |

| Keep | Change | Do not copy |
| --- | --- | --- |
| 本机数据、课程 ID、备份、品牌 | 导航与教学步骤、语音来源、反馈顺序 | 任何技能示例中的产品商标、虚构指标或营销文案 |

Taste 的 workspace 抽签结果只用于应用布局参考；财务数字、4块KPI与此教学任务不符，不照搬。采用固定句子 + 分块译文作为产品独有的内容。DeepTutor 用于先修、分解、提问、反馈教学方法；未部署其 RAG 服务。shadcn 已归档但不迁移 CSS 框架。来源见 skills/sources.json。

风险：未在实体 iPhone 人工听音；神经合成音频可能存在个别错误。设备清理仍可能移除 IndexedDB。GitHub 集成缺少改名管理权限。改名前后同域 IndexedDB 可继续读取；主屏幕入口和 Service Worker 路径须更新。

验收：320/375/390/768/1280/1440 无横溢出；离线答题、听音、重开、复习、备份可用；错误和成功可读；键盘焦点可见；浅深主题；无浏览器异常；生产构建通过。
