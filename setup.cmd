@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
cd /d "%~dp0"

echo ============================================
echo   dsh-desktop 一键安装
echo ============================================
echo.

rem ---- 1. 检测 Node ----
set NODE_OK=0
set NODE_CMD=
where node >nul 2>nul
if %errorlevel%==0 (
  for /f "delims=" %%i in ('node -v 2^>nul') do set NODE_VER=%%i
  set NODE_VER=!NODE_VER:v=!
  echo [1/3] 检测到系统 Node.js !NODE_VER!
  rem 需要 >=22.19.0
  for /f "tokens=1,2 delims=." %%a in ("!NODE_VER!") do (
    set MAJ=%%a
    set MIN=%%b
  )
  if !MAJ! GEQ 22 if !MIN! GEQ 19 set NODE_OK=1
  if !NODE_OK!==1 set NODE_CMD=node
) else (
  echo [1/3] 未检测到 Node.js
)

if !NODE_OK!==0 (
  echo [1/3] 系统 Node 不可用，准备下载便携版 Node.js 22 ...
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\download-node.ps1"
  if errorlevel 1 (
    echo.
    echo 便携 Node 下载失败。请检查网络，或手动安装 Node.js >= 22.19.0 后重试。
    pause
    exit /b 1
  )
  echo [1/3] 便携 Node.js 已就绪: "%~dp0portable-node\node.exe"
)

echo.
echo [2/3] 安装依赖（electron + dsh）...
if !NODE_OK!==1 (
  call npm install
) else (
  "%~dp0portable-node\npm.cmd" install
)
if errorlevel 1 (
  echo.
  echo 依赖安装失败。
  pause
  exit /b 1
)

echo.
echo [3/3] 安装完成！
echo.
echo   启动方式:  双击 start.cmd 或运行 npm start
echo.
pause
