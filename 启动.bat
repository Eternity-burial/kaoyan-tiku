@echo off
chcp 65001 >nul
REM 考研题库启动器 — 双击打开，自动同步备份到本地 data/ 目录

set "APP_PATH=%~dp0index.html"
set "BACKUP_DIR=%~dp0data"
set "CHROME=C:\Program Files\Google\Chrome\Application\chrome.exe"
set "CHROME86=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"

if not exist "%CHROME%" set "CHROME=%CHROME86%"
if not exist "%CHROME%" (
    echo 未找到 Chrome，请检查安装路径。
    pause
    exit /b 1
)

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

REM 启动 Chrome（开启 CDP 供自动备份）
start "" "%CHROME%" --remote-debugging-port=9223 --user-data-dir="%LOCALAPPDATA%\Google\Chrome\User Data" "%APP_PATH%"

echo 考研题库已启动，等待 Chrome 加载...
timeout /t 5 /nobreak >nul

REM 自动运行 CDP 本地备份
echo 正在同步备份到本地文件...
node "%~dp0scripts\backup.js"
if %ERRORLEVEL% NEQ 0 (
    echo 本地备份失败（需安装 Node.js ws 模块: npm install ws）
) else (
    echo 本地备份完成 → data\latest.json
)

echo.
echo 之后每天打开页面会自动弹下载备份。
echo 也可以左侧栏点击「备份数据」手动导出。
pause
