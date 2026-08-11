@echo off
REM 考研题库启动器
REM 用法：双击此文件即可打开题库，同时自动同步备份

set "APP_PATH=%~dp0index.html"
set "BACKUP_DIR=%~dp0data"

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

REM 启动 Chrome 打开题库（开启远程调试供备份脚本使用）
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9223 --user-data-dir="%LOCALAPPDATA%\Google\Chrome\User Data" "%APP_PATH%"

echo 考研题库已启动。
echo 浏览器自带每日备份（打开页面时自动弹窗保存）。
echo 如需手动备份，左侧栏点击「备份数据」。
pause
