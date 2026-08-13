@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"

echo ============================================
echo   dsh-desktop 打包（Windows 安装程序）
echo ============================================
echo.

echo [1/3] 检查便携 Node（打包需要内置）...
if not exist "portable-node\node.exe" (
  echo 未找到便携 Node，开始下载 ...
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\download-node.ps1"
  if errorlevel 1 (
    echo 便携 Node 下载失败，请检查网络。
    pause
    exit /b 1
  )
)
echo [1/3] 便携 Node 就绪: portable-node\node.exe

echo.
echo [2/3] 检查依赖 ...
if not exist "node_modules\@deepseek-ai\dsh" (
  echo 正在安装依赖 ...
  call npm install
  if errorlevel 1 (
    echo 依赖安装失败。
    pause
    exit /b 1
  )
)

echo.
echo [3/3] 开始打包 ...
call npm run build
if errorlevel 1 (
  echo.
  echo 打包失败。
  pause
  exit /b 1
)

echo.
echo 打包完成！安装程序位于 dist\ 目录：
echo   dist\DeepSeek Harness Setup *.exe
echo.
pause
