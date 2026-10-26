@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo 请先从 https://nodejs.org 安装 Node.js 24 LTS，再重新双击此文件。
 pause
 exit /b 1
)
node -e "if(Number(process.versions.node.split('.')[0])<24){console.error('需要 Node.js 24 或更高版本');process.exit(1)}"
if errorlevel 1 goto failed
if not exist node_modules (
 call npm ci
 if errorlevel 1 goto failed
)
call npm run db:setup
if errorlevel 1 goto failed
echo 请在浏览器打开 http://localhost:3000 。保持本窗口开启，按 Ctrl+C 停止。
call npm run dev
if errorlevel 1 goto failed
exit /b 0
:failed
echo 启动失败，请查看上面的错误。网络问题可稍后重试；请勿删除学习数据库。
pause
exit /b 1
