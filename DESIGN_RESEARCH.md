# 设计参考与使用记录

用户反馈：斜摆文字、巨大的纯蓝圆形按钮显得突兀；网站更新提示没有出现。

本次实际在线查阅 GitHub Primer 开放设计系统：
- [排版规范](https://github.com/primer/design/blob/main/content/foundations/typography.mdx)：以字重和尺度建立层级，控制行长与行高。
- [按钮规范](https://github.com/primer/design/blob/main/content/components/button.mdx)：主要按钮应清楚说明动作，图标与文字有一致的位置。
- [可理解的按钮标签](https://github.com/primer/design/blob/main/content/guides/accessibility/descriptive-buttons.mdx)：给控件明确名称。
- [响应式布局](https://github.com/primer/design/blob/main/content/foundations/layout.mdx)：手机采用单列，遵循阅读顺序，保留全部功能。

这些资料帮助校正可读性与交互，不代表它们是法国艺术风格参考，也不能替代视觉审美。结合现有透明版画和用户意见：移除旋转和装饰性文字，保留法语大字和纸页，以正常形状的墨绿按钮作明确入口。

更新机制：旧 Service Worker 导航优先返回缓存 HTML，新程序和更新提示可能一直进不来。新 worker 分批缓存资源，完成后自动激活但不自动重载正在学习的页面；新页面检测到接管后提示用户重载。旧页面可能仍需联网后刷新一次或两次才能打开新页面。版本切换只删除旧应用缓存，不删除 IndexedDB。通过真实旧缓存导航和进度保留测试。
