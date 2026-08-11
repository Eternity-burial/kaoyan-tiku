@echo off
chcp 65001 >nul
REM 考研题库 — 双击启动，自动后台备份

set "APP=%~dp0index.html"
set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME%" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"

if not exist "%APP%" ( echo 未找到 index.html & pause & exit /b 1 )
if not exist "%CHROME%" ( echo 未找到 Chrome & pause & exit /b 1 )

REM 启动备份守护（最小化窗口，静默运行）
start /min "题库备份" node "%~dp0scripts\sync.js"

REM 启动 Chrome
start "" "%CHROME%" --remote-debugging-port=9223 --user-data-dir="%LOCALAPPDATA%\Google\Chrome\User Data" "%APP%"

exit
