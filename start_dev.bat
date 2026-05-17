@echo off
title telegram-mini-app-showcase :: dev server (do not close)
cd /d "%~dp0"
set NODE_ENV=development
set PORT=5000
echo ============================================
echo  Dev server starting on http://localhost:5000
echo  Keep this window open while you work!
echo ============================================
echo.
call npm run dev
echo.
echo ============================================
echo  Dev server exited.
echo ============================================
pause
