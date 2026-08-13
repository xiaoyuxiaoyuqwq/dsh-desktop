@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"

echo ============================================
echo   dsh-desktop 鎵撳寘锛圵indows 瀹夎绋嬪簭锛?echo ============================================
echo.

echo [1/3] 妫€鏌ヤ究鎼?Node锛堟墦鍖呴渶瑕佸唴缃級...
if not exist "portable-node\node.exe" (
  echo 鏈壘鍒颁究鎼?Node锛屽紑濮嬩笅杞?...
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\download-node.ps1"
  if errorlevel 1 (
    echo 渚挎惡 Node 涓嬭浇澶辫触锛岃妫€鏌ョ綉缁溿€?    pause
    exit /b 1
  )
)
echo [1/3] 渚挎惡 Node 灏辩华: portable-node\node.exe

echo.
echo [2/3] 妫€鏌ヤ緷璧?...
if not exist "node_modules\@deepseek-ai\dsh" (
  echo 姝ｅ湪瀹夎渚濊禆 ...
  call npm install
  if errorlevel 1 (
    echo 渚濊禆瀹夎澶辫触銆?    pause
    exit /b 1
  )
)

echo.
echo [3/3] 寮€濮嬫墦鍖?...
call npm run build
if errorlevel 1 (
  echo.
  echo 鎵撳寘澶辫触銆?  pause
  exit /b 1
)

echo.
echo 鎵撳寘瀹屾垚锛佸畨瑁呯▼搴忎綅浜?dist\ 鐩綍锛?echo   dist\DeepSeek Harness Setup *.exe
echo.
pause
