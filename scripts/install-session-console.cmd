@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
cd /d "%~dp0.."

set "PROFILE=%USERPROFILE%\.dsh\profiles\web"
if not exist "%PROFILE%" (
  echo [x] profile directory not found: %PROFILE%
  pause
  exit /b 1
)
if not exist "plugins\session-console\index.js" (
  echo [x] plugins\session-console not found, run from repo root
  pause
  exit /b 1
)

echo [1/3] copying plugin into profile node_modules ...
if not exist "%PROFILE%\node_modules" mkdir "%PROFILE%\node_modules"
if exist "%PROFILE%\node_modules\dsh-session-console" rmdir /s /q "%PROFILE%\node_modules\dsh-session-console"
xcopy /e /i /q /y "plugins\session-console" "%PROFILE%\node_modules\dsh-session-console" >nul

echo [2/3] patching cordis.patch.yml ...
set "PATCH=%PROFILE%\cordis.patch.yml"
findstr /c:"name: dsh-session-console" "%PATCH%" >nul 2>nul
if not errorlevel 1 (
  echo       already present, skip
) else (
  if not exist "%PATCH%" (
    > "%PATCH%" echo - insert:
  )
  >> "%PATCH%" echo.
  >> "%PATCH%" echo     # session-console sidebar: per-conversation skill/tool toggles + plugin activity
  >> "%PATCH%" echo     - id: session-console
  >> "%PATCH%" echo       name: dsh-session-console
)

echo [3/3] done. Restart dsh to take effect.
pause
