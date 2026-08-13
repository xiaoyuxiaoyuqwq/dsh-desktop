@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
cd /d "%~dp0"

if not exist "node_modules\@deepseek-ai\dsh" (
  echo 尚未安装依赖，请先运行 setup.cmd
  pause
  exit /b 1
)

echo [1/2] 更新 @deepseek-ai/dsh 到最新版 ...
call npm install @deepseek-ai/dsh@latest
if errorlevel 1 (
  echo.
  echo 更新失败。
  pause
  exit /b 1
)

echo [2/2] 更新完成！
echo.
pause
