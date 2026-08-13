@echo off
chcp 65001 >nul
cd /d "%~dp0"

if not exist "node_modules\electron" (
  echo 尚未安装依赖，请先运行 setup.cmd
  pause
  exit /b 1
)

echo 正在启动 dsh-desktop ...
start "" node_modules\.bin\electron.cmd .
