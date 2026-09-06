@echo off
rem Chay app build san (web :4173 + server :3000) — mo browser, console an
rem Dung package @leetcode/tray-spawn: spawnHidden windowsHide + stdio ignore
cd /d "%~dp0"

rem Neu app dang chay thi chi mo browser, khong khoi dong trung lap
netstat -ano | findstr /C:":4173 " | findstr /C:"LISTENING" >nul
if %errorlevel%==0 (
    start "" http://localhost:4173
    exit /b
)

rem Mo browser sau 4 giay de vite preview kip khoi dong
start "" /min cmd /c "timeout /t 4 >nul & start http://localhost:4173"

rem Spawn ca web + server build, console bi an (windowsHide + stdio ignore)
call pnpm start:hidden