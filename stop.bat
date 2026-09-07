@echo off
setlocal

set CONTAINER=leetcode-test

echo === LeetCode Lab - Stop ===

docker info >nul 2>&1
if errorlevel 1 (
    echo [ERR] Docker chua chay.
    pause
    exit /b 1
)

docker rm -f %CONTAINER% >nul 2>&1
if errorlevel 1 (
    echo [ERR] Khong the dung container.
    pause
    exit /b 1
)

echo [OK] Da dung container %CONTAINER%.
pause
exit /b 0