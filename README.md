# BonjourLab · 你的法语学习实验室

面向中文母语初学者的个人法语学习应用。28 节四周入门课覆盖 A0 与部分 A1 基础，并非完整 A1 认证课程。无需账号，也无需 AI 密钥。

## iPhone / iPad 手机版

手机端已经提供可添加到主屏幕的本地离线网页版本，无需 Windows 程序。详见 **[手机使用与部署说明](MOBILE_README.md)**。

GitHub Pages 已开启，通过 **https://hhhhyy178.github.io/-/** 使用。学习数据只存在手机本地，不会自动同步其他设备；支持 JSON 备份迁移。

新版采用分步教学、一题一屏、错题提示，附 194 条法语示范（原速和慢读共 388 段，可离线）。开发技能来源见 [skills](skills/README.md)，设计规范见 [DESIGN.md](DESIGN.md)。

## 免安装包：只需下载、解压、双击

**[直接下载 Windows 免安装包（约 68 MB）](https://github.com/hhhhyy178/-/raw/refs/heads/main/downloads/BonjourLab-Windows.zip)** · [下载目录与说明](downloads/README.md)


如果你拿到的是 BonjourLab-Windows.zip，不需要安装任何开发工具：右键压缩包选择「全部解压」，打开 BonjourLab 文件夹，双击「启动 BonjourLab.cmd」。浏览器会自动打开。首次启动会自动创建 data/bonjourlab.db，学习记录以后都存在 data 文件夹。保持启动窗口开启，学习结束关闭它即可。适用于 Windows 10/11 x64。下面的开发环境安装说明仅适用于源码版本。

## 第一次打开源码版本（Windows）

1. 从 https://nodejs.org 安装 **Node.js 24 LTS**，安装时保留默认选项。
2. 将整个项目文件夹保存到电脑。双击 `start-bonjourlab.cmd`。
3. 首次启动会下载依赖，需要联网。看到启动成功后，在浏览器地址栏输入 `http://localhost:3000`。
4. 点击「开始第一节课」。先读解释、播放发音，再完成本课练习。答错可重试，每道至少正确一次后，课程自动保存并解锁下一课。
5. 点击「复习本课词汇」，先主动回忆再翻卡自评。以后再次启动，记录仍在。

保持命令窗口开启。停止时在窗口按 **Ctrl+C**；下次双击同一个启动文件。此脚本不需要管理员权限。

如果偏好 PowerShell，在项目文件夹右键打开终端，逐行执行：

```powershell
npm.cmd ci
npm.cmd run db:setup
npm.cmd run dev
```

PowerShell 阻止 npm.ps1 时使用上面的 `npm.cmd`，不需要调整执行策略。命令必须在含有 package.json 的项目文件夹内执行。

## 日常学习

- **学习控制台**：真实学习时长、连续天数、词汇数、到期复习、最近答题与错误建议。当前级别由所处课程标识，能力条只是答题正确率，不是 CEFR 测评。
- **系统课程**：28 节均有讲解、示例、词汇、两类以上练习及解析；全部练习正确至少一次才完成。A2/B1/B2 未开放。
- **单词复习**：四种回忆模式，支持主动输入和自评。SM-2 风格调度：首次成功 1 天、第二次 6 天、之后按易度扩展；失败重置成功次数，次日再现，最低易度 1.3。按绝对 24 小时间隔计算。
- **发音实验室**：元音、鼻化元音、辅音、联诵、连读、拼读与节奏。14 组教学卡及听辨/跟读练习。优先 fr-FR，其次其他法语语音，绝不降级成英语语音。
- **语法知识库**：19 个可搜索主题，带解释、例句、常见错误和关联课程。课程未解锁时仍可浏览知识库。
- **听力与口语**：播放、听写、显示原文、录音回听、可用时法语转写。无麦克风可输入文本；转写匹配不是音素评分。自由练习不计入课程能力统计。
- **私人教师**：无密钥时明确为预设规则资料，支持 être、性别搭配及记录诊断，不能自由理解所有问题。聊天显示在当前页面，完整问答保存于数据库与备份，暂未提供历史会话浏览。

时长每 30 秒记录一次，只计学习页在前台的时间；未满 30 秒部分不计。连续天数依据答题、完成课程与词汇复习；仅浏览不算完成学习。统计日期按设备本地日期显示。

## 保存、备份与恢复

学习数据默认位于 **`prisma/bonjourlab.db`**，不是浏览器缓存。清除浏览器缓存不会删除进度；不要删除项目中的数据库文件。

最方便的方法：顶部下载图标导出 JSON，妥善保存到其他磁盘；换电脑后启动同版本应用，点击顶部「恢复备份」，选择 JSON 并确认。恢复将替换已有学习记录，操作前先导出当前备份。备份包含问答内容，请自行保管。

另一方法：**先停止应用**，复制 `prisma/bonjourlab.db`（如存在 `-wal`、`-shm` 同名附属文件，也一并复制）。恢复时先停止应用，再用备份替换同路径文件。不要在运行期间直接复制单个数据库文件。

测试使用 `prisma/test-learning.db` 和 `prisma/e2e-learning.db`，不写入日常学习数据库。数据库初始化可重复执行，不会清空已有记录。

## 可选 AI 配置

1. 在项目根目录把 `.env.example` 复制为 `.env`。已有 `.env` 时保留 DATABASE_URL。
2. 在 `.env` 内填写以下服务端配置，然后重启应用：

```dotenv
DATABASE_URL="file:./prisma/bonjourlab.db"
AI_API_KEY="你的服务商密钥"
AI_BASE_URL="https://api.openai.com/v1"
AI_MODEL="gpt-4o-mini"
```

密钥只在服务端读取，不会传给浏览器。不要分享 `.env` 或将其提交到 Git。兼容 Chat Completions 格式的服务可更换 URL 和模型。AI 请求会发送你的问题及薄弱项摘要，25 秒超时；服务错误会明确显示，普通课程不受影响。每次提问独立，当前不自动附带前文聊天。

云环境中需在环境设置安全填写变量，并允许服务商域名；本项目没有自带付费凭据。未用真实密钥验证在线模型，已通过本地协议模拟测试。

## 常见问题

- **没有声音**：安装系统法语语音（Windows 设置 → 时间和语言 → 语音），重启浏览器。某些浏览器不提供法语 TTS，页面会明确提示。慢速参数由系统引擎解释，不能保证精确调速或音质。课程仍可阅读 IPA 完成。
- **无法录音/转写**：允许浏览器麦克风权限；通过 localhost 或 HTTPS 访问。浏览器可能不支持识别，或其在线语音服务不可达；使用录音回听/文本输入即可。识别服务可能上传音频至浏览器供应商。
- **端口 3000 已占用**：执行 `npm.cmd run dev -- --port 3001`，浏览器改用端口 3001。
- **数据库不存在**：在项目根目录运行 `npm.cmd run db:setup`。DATABASE_URL 相对于项目根目录解析，非 Prisma 目录。
- **依赖安装失败**：检查网络后重试 `npm.cmd ci`。不要删除 `.db` 文件。Node 低于 24 请先升级。
- **翻译合理却不通过**：翻译题采用明确的可接受答案集合，支持 Unicode 规范化、引号、必要大小写及句末标点规范化，但严格保留重音和语法变化。暂不对任意多解翻译进行语义评分，可参考答案改写。

## 开发与验证

技术栈：Next.js App Router、React、TypeScript、Zod、Lucide、Node.js 内置 SQLite。使用自定义响应式 CSS（未引入 Tailwind/shadcn）。Prisma 原生引擎被当前云网络阻止后，改用有类型的本地 SQL 数据层，`prisma/schema.prisma` 仅保留数据结构参考，**运行时不依赖 Prisma**。所有 SQL 值均参数化；事务同步执行，避免请求间交错。应用面向单用户可信本机，未实现账号体系，不应直接公开到互联网。

课程、词汇、知识点和先修关系存于 `lib/content.json`；语法和发音在 `lib/reference.ts`，均与 UI 分离。持久实体为用户资料（含每日目标）、课程进度、练习尝试、复习状态/历史、学习时段、问答。Course/Lesson/KnowledgePoint/Vocabulary/Exercise 是稳定 ID 的静态内容实体。不要把只在此机创建的数据库提交到 Git。

```powershell
npm.cmd test
npm.cmd run build
# 浏览器测试先安装 Chromium
npx.cmd playwright install chromium
npm.cmd run test:e2e
# 生产启动先 build，再：
npm.cmd start
```

云机器已有 Chromium 时可设置 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`，本机正常安装 Playwright 浏览器则无需此变量。自动化测试详情、限制和人工验收步骤见 `IMPLEMENTATION_STATUS.md`。
