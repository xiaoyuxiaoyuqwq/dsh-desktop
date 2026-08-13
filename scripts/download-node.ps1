param(
    [string]$Version = "22.19.0"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$nodeDir = Join-Path $root "portable-node"
$zipPath = Join-Path $env:TEMP "node-v$Version-win-x64.zip"

if (Test-Path (Join-Path $nodeDir "node.exe")) {
    Write-Host "portable-node 已存在，跳过下载。"
    exit 0
}

$mirrors = @(
    "https://nodejs.org/dist/v$Version/node-v$Version-win-x64.zip",
    "https://npmmirror.com/mirrors/node/v$Version/node-v$Version-win-x64.zip"
)

$ok = $false
foreach ($url in $mirrors) {
    Write-Host "下载 $url ..."
    try {
        Invoke-WebRequest -Uri $url -OutFile $zipPath -UseBasicParsing
        $ok = $true
        break
    } catch {
        Write-Warning "下载失败: $($_.Exception.Message)"
    }
}

if (-not $ok) { throw "无法从任何镜像下载 Node.js" }

$extractDir = Join-Path $env:TEMP "node-extract-$Version"
if (Test-Path $extractDir) { Remove-Item -Recurse -Force $extractDir }
Expand-Archive -Path $zipPath -DestinationPath $extractDir -Force
$inner = Get-ChildItem $extractDir | Select-Object -First 1
New-Item -ItemType Directory -Path $nodeDir -Force | Out-Null
Copy-Item -Path (Join-Path $inner.FullName "*") -Destination $nodeDir -Recurse -Force
Remove-Item -Recurse -Force $extractDir
Remove-Item -Force $zipPath -ErrorAction SilentlyContinue
Write-Host "便携 Node.js 就绪: $nodeDir"
exit 0
