@echo off
set PLAN_NAME=%1
if "%PLAN_NAME%"=="" (
    echo Usage: move-plan-to-completed.bat ^<plan-name^>
    exit /b 1
)

set SOURCE=AI\plans\active\%PLAN_NAME%.md
set DEST=AI\plans\completed\%PLAN_NAME%.md

if not exist "%SOURCE%" (
    echo Plan not found: %SOURCE%
    exit /b 1
)

move "%SOURCE%" "%DEST%"
if %errorlevel% equ 0 (
    echo Moved %PLAN_NAME% to completed
) else (
    echo Failed to move plan
    exit /b 1
)