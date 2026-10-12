@echo off
title Annam - Smart Food Distribution System
echo ========================================================
echo  Starting Annam Smart Food Distribution System
echo ========================================================
echo.
cd /d "%~dp0"
echo Installing dependencies if needed...
call npm install
echo.
echo Starting local Node.js server on http://localhost:5000 ...
echo Press Ctrl+C in this window anytime to stop the server.
echo.
start http://localhost:5000
npm start
pause
