@echo off
cd /d "%~dp0"
echo Stopping process on port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000 " ^| findstr "LISTENING"') do (
    echo Killing PID %%a
    taskkill /F /PID %%a 2>nul
)
timeout /t 2 /nobreak >nul

start "telegram-mini-app dev (do not close)" cmd /k "title dev :: do not close && set NODE_ENV=development && set PORT=5000 && npm run dev"
echo.
echo Started new dev server in separate window.
timeout /t 3 /nobreak >nul
exit
