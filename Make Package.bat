@echo off
title YourProject.exe - make package
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0share-tools\make-package.ps1"
echo.
pause
