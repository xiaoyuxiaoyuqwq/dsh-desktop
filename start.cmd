@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"

if not exist "node_modules\electron" (
  echo 灏氭湭瀹夎渚濊禆锛岃鍏堣繍琛?setup.cmd
  pause
  exit /b 1
)

echo 姝ｅ湪鍚姩 DeepSeek Harness ...
start "" node_modules\.bin\electron.cmd .
