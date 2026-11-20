@echo off
setlocal
title YourProject.exe - test run
cd /d "%~dp0"

echo.
echo  ==============================================
echo    YourProject.exe - test run
echo  ==============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo  Node.js isn't installed. Get it from https://nodejs.org ^(LTS^), then run this again.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo  First run: installing packages. This takes a minute...
  call npm install
  if errorlevel 1 goto failed
  echo.
)

echo  Building the site ^(checks the code, then builds it like the real gift^)...
call npm run build
if errorlevel 1 goto failed

echo.
echo  ----------------------------------------------
echo   Opening the site in your browser.
echo.
echo   Tips:
echo    - Test mode is ON while UNLOCK_EVERYTHING is true in
echo      src\config\testing.ts, so every app is open.
echo    - Press the ` key ^(backtick^) to open the date simulator and
echo      try other days ^(themes, countdown, unlock badges^).
echo    - Progress ^(ornaments, puzzle best, prizes^) is saved in this
echo      browser. For a fresh start, open the link in a private window.
echo.
echo   Leave this window open while testing.
echo   Close it ^(or press Ctrl+C^) to stop.
echo  ----------------------------------------------
echo.
call npm run preview -- --open
goto :eof

:failed
echo.
echo  Something went wrong. The error is above.
echo.
pause
exit /b 1
