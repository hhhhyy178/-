# iPhone / iPad 本地离线版

这是可添加到主屏幕的网页应用（PWA），不是 Windows 程序，也不是需要签名安装的 IPA。

## iPhone 怎么用

当前网站地址：**https://hhhhyy178.github.io/-/**

1. 用 **Safari** 打开网站（不要使用聊天软件的内置浏览器）。
2. 点 Safari 的 **分享按钮**（方框向上箭头），选择 **添加到主屏幕**。
3. 从桌面上的 BonjourLab 图标打开，等页面提示「课程已缓存，可离线学习」。
4. 点击「开始第一节课」。以后可断网读课、答题、查看语法和复习单词。

需要先联网加载一次。194 条固定法语示范各有原速与慢读，共 388 段音频，跟课程一起缓存，约 4 MB；默认使用 Piper SIWIS 法语神经合成音频。可在「更多 → 发音来源」试听与切换系统声音。系统声音可能需要联网。口语转写依赖 Safari/Siri 的支持和网络，不宣称离线识别或音素评分。

## 数据保存在哪里

课程与页面存在本机 Cache Storage；学习进度、答题、词汇复习、目标和本地规则问答存在 **IndexedDB 本地数据库**。不会上传学习记录到 GitHub，也没有自动跨设备同步。

建议先添加到主屏幕，再从桌面图标开始学习：Safari 与主屏幕应用在部分 iOS 版本中可能使用不同的存储空间。换设备或换入口时可以用备份迁移。

**不要把浏览器本地保存当成永久云备份。** 清理 Safari 网站数据、无痕浏览、卸载主屏幕应用或系统存储回收可能导致记录丢失。请定期点顶部设置里的下载图标，在分享菜单中选择「存储到文件」，保留 JSON 备份。恢复时点击「恢复备份」，选择 JSON 文件。Windows 版与手机版支持互相导入这种备份。

离线规则教师能提供预设的 être、性别搭配讲解和错误诊断，不是大模型。GitHub Pages 无法运行私人 AI 服务端，因此手机版不要求输入 API Key，也不会把密钥存进公开网页。

## GitHub Pages 开启方法（仓库所有者，仅首次需要）

本仓库已开启 Pages。下面设置供重新配置时使用；当前 GitHub 连接可以推送代码，但无法修改仓库管理设置。所有者打开：

**https://github.com/hhhhyy178/-/settings/pages**

在 **Build and deployment** 下设置：

- Source：**Deploy from a branch**
- Branch：**main**
- Folder：**/docs**
- 点 **Save**，等待 GitHub 显示部署完成（通常几分钟）。

部署成功后，上面的手机网址才可访问。保存配置不等于已经部署成功，请以 GitHub Pages 显示的状态为准。如果 Source 已是分支部署，直接选择 main 和 /docs 保存即可。

## 开发和更新

```sh
npm ci
npm run build:mobile
npm test
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:mobile
```

`docs/` 是生成好的静态网站。更新课程或界面后先执行 build:mobile，再提交源代码和 docs。GitHub Pages 会发布 docs，不会读取 Windows ZIP 或启动 Node 服务。

静态打包入口为 `mobile/index.tsx`，复用已有界面与课程；`lib/browser-store.ts` 提供 IndexedDB 事务、评分、解锁、复习和备份；桌面版继续使用原来的 SQLite 和服务端 API，不会改用手机数据库。Service Worker 只更新页面缓存，不清空 IndexedDB。检测到新版本后，会提示「更新课程并重载」。

## 更新后怎么学

首页点「开始第一节课」或「继续学习」→ 听一句 → 看短句拆解 → 跟读词语 → 一次回答一道题。答错先读提示，可点「再看一遍讲解」；连续两次答错后可查看参考答案与原因。答对后点下一题，全部完成再查看小结。

如果看到「更新课程并重载」，点击即可启用新版，不会清空学习进度。

## 仓库改名为 BonjourLab

当前集成的改名请求被 GitHub 以 403 拒绝。所有者打开 [仓库设置](https://github.com/hhhhyy178/-/settings)，在 **General → Repository name** 把 `-` 改为 `BonjourLab`，点旁边的 **Rename**（不是 Rename branch）。改名后 Pages 地址为 `https://hhhhyy178.github.io/BonjourLab/`，等待重新发布并确认能打开后再使用。应用资源均为相对路径，已在两个路径验证。

改名前先导出 JSON 备份。改名后重新用 Safari 添加主屏幕图标；旧图标仍指向旧地址。普通同域浏览器的 IndexedDB 不按路径区分，但 iOS 主屏幕入口可能使用不同存储空间，必要时导入备份。仓库地址的自动重定向不代表旧 Pages 地址也会跳转。
