@echo off
setlocal

set IMAGE=leetcode:test
set CONTAINER=leetcode-test
set PORT=3000
set DATA_DIR=%~dp0packages\database\data

echo === LeetCode Lab - Start ===

REM 1) Kiem tra Docker daemon dang chay
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERR] Docker chua chay. Hay khoi dong Docker Desktop roi thu lai.
    pause
    exit /b 1
)

REM 2) DB dir tren host ton tai truoc khi mount
if not exist "%DATA_DIR%" mkdir "%DATA_DIR%"

REM 3) Container da ton tai?
docker container inspect %CONTAINER% >nul 2>&1
if not errorlevel 1 (
    REM 3a) Da mount DB tu host chua? Chua thi phai tao lai voi mount
    docker inspect -f "{{range .Mounts}}{{.Source}} {{end}}" %CONTAINER% 2>nul | findstr /C:"packages\database\data" >nul
    if errorlevel 1 (
        echo [..] Container cu khong mount DB host - tao lai...
        docker rm -f %CONTAINER% >nul 2>&1
    ) else (
        echo [..] Container %CONTAINER% da ton tai - tai su dung, khong build lai.
        docker start %CONTAINER% >nul 2>&1
        goto wait
    )
)

REM 4) Dam bao image ton tai (build neu chua)
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

REM 5) Don container cu neu dang chay (stop truoc de giai phong port)
docker stop %CONTAINER% >nul 2>&1
docker rm -f %CONTAINER% >nul 2>&1
REM    Neu docker-compose (leetcode-app) dang chay cung port thi dung no
docker stop leetcode-app >nul 2>&1

REM 6) Chay container moi, map PORT + mount DB tu packages/database/data tren host
docker run -d --name %CONTAINER% -p %PORT%:3000 ^
    -v "%DATA_DIR%:/app/packages/database/data" %IMAGE% >nul
if errorlevel 1 (
    echo [ERR] Khong the khoi dong container.
    pause
    exit /b 1
)

REM 7) Doi server san sang (max 30s) - ping lam delay vi timeout can stdin console
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
ping -n 2 127.0.0.1 >nul
goto wait

:ready
echo [OK] Server dang chay tai http://localhost:%PORT%/
echo [OK] DB: %DATA_DIR%
echo.
start http://localhost:%PORT%/
start http://localhost:%PORT%/admin
exit /b 0
