@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
cd /d "%~dp0"

echo ============================================
echo   dsh-desktop 涓€閿畨瑁?echo ============================================
echo.

rem ---- 1. 妫€娴?Node ----
set NODE_OK=0
set NODE_CMD=
where node >nul 2>nul
if %errorlevel%==0 (
  for /f "delims=" %%i in ('node -v 2^>nul') do set NODE_VER=%%i
  set NODE_VER=!NODE_VER:v=!
  echo [1/3] 妫€娴嬪埌绯荤粺 Node.js !NODE_VER!
  rem 闇€瑕?>=22.19.0
  for /f "tokens=1,2 delims=." %%a in ("!NODE_VER!") do (
    set MAJ=%%a
    set MIN=%%b
  )
  if !MAJ! GEQ 22 if !MIN! GEQ 19 set NODE_OK=1
  if !NODE_OK!==1 set NODE_CMD=node
) else (
  echo [1/3] 鏈娴嬪埌 Node.js
)

if !NODE_OK!==0 (
  echo [1/3] 绯荤粺 Node 涓嶅彲鐢紝鍑嗗涓嬭浇渚挎惡鐗?Node.js 22 ...
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\download-node.ps1"
  if errorlevel 1 (
    echo.
    echo 渚挎惡 Node 涓嬭浇澶辫触銆傝妫€鏌ョ綉缁滐紝鎴栨墜鍔ㄥ畨瑁?Node.js >= 22.19.0 鍚庨噸璇曘€?    pause
    exit /b 1
  )
  echo [1/3] 渚挎惡 Node.js 宸插氨缁? "%~dp0portable-node\node.exe"
)

echo.
echo [2/3] 瀹夎渚濊禆锛坋lectron + dsh锛?..
if !NODE_OK!==1 (
  call npm install
) else (
  "%~dp0portable-node\npm.cmd" install
)
if errorlevel 1 (
  echo.
  echo 渚濊禆瀹夎澶辫触銆?  pause
  exit /b 1
)

echo.
echo [3/3] 瀹夎瀹屾垚锛?echo.
echo   鍚姩鏂瑰紡:  鍙屽嚮 start.cmd 鎴栬繍琛?npm start
echo.
pause
