@echo off
REM Move backlog plan to completed - dung move (khong copy) de tiet kiem token, tranh chep sang trang khac
set PLAN_NAME=%1
if "%PLAN_NAME%"=="" (
    echo Usage: move-backlog-to-completed.bat ^<plan-name^>
    echo Vi du: AI\skills\bug-fix\move-backlog-to-completed.bat fix-created-at-default
    exit /b 1
)

set SOURCE=AI\plans\backlog\%PLAN_NAME%.md
set DEST=AI\plans\completed\%PLAN_NAME%.md

if not exist "%SOURCE%" (
    echo Plan not found: %SOURCE%
    echo Hay kiem tra AI/plans/backlog/ va ten file (khong kem .md khi truyen tham so)
    exit /b 1
)

if exist "%DEST%" (
    echo Dest already exists: %DEST%
    exit /b 1
)

move "%SOURCE%" "%DEST%"
if %errorlevel% equ 0 (
    echo Moved %PLAN_NAME% from backlog to completed
) else (
    echo Failed to move plan
    exit /b 1
)
