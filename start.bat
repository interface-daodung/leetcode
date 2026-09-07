@echo off
setlocal

set IMAGE=leetcode:test
set CONTAINER=leetcode-test
set PORT=3000

echo === LeetCode Lab - Start ===

REM 1) Kiem tra Docker daemon dang chay
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERR] Docker chua chay. Hay khoi dong Docker Desktop roi thu lai.
    pause
    exit /b 1
)

REM 2) Dam bao image ton tai (build neu chua)
docker image inspect %IMAGE% >nul 2>&1
if errorlevel 1 (
    echo [..] Image chua co, dang build... (lan dau co the mat vai phut)
    docker build -t %IMAGE% .
    if errorlevel 1 (
        echo [ERR] Build that bai.
        pause
        exit /b 1
    )
)

REM 3) Don container cu neu dang chay (stop truoc de giai phong port)
docker stop %CONTAINER% >nul 2>&1
docker rm -f %CONTAINER% >nul 2>&1
REM    Neu docker-compose (leetcode-app) dang chay cung port thi dung no
docker stop leetcode-app >nul 2>&1

REM 4) Chay container moi, map PORT host = PORT container
docker run -d --name %CONTAINER% -p %PORT%:3000 %IMAGE% >nul
if errorlevel 1 (
    echo [ERR] Khong the khoi dong container.
    pause
    exit /b 1
)

REM 5) Doi server san sang (max 30s)
echo [..] Dang cho server khoi dong...
set /a count=0
:wait
docker exec %CONTAINER% wget -qO- http://127.0.0.1:3000/health >nul 2>&1
if not errorlevel 1 goto ready
set /a count+=1
if %count% GEQ 30 (
    echo [ERR] Server khong phan hoi sau 30s.
    docker logs %CONTAINER%
    pause
    exit /b 1
)
timeout /t 1 /nobreak >nul
goto wait

:ready
echo [OK] Server dang chay tai http://localhost:%PORT%/
echo.
start http://localhost:%PORT%/
start http://localhost:%PORT%/admin
exit /b 0