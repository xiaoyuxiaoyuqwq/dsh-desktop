# DeepSeek Harness 桌面版

DeepSeek Harness 的桌面壳。用 Electron 内嵌 `dsh web`，像 opencode 桌面版一样使用，支持一键安装、自动更新。

## 特性

- **桌面窗口**：内嵌 dsh Web UI，无需开浏览器
- **自动更新**：界面右下角鲸鱼图标出现红点即提示有新版本，点击自动更新并重启
- **一键安装**：安装程序内置便携版 Node.js，无需系统安装 Node
- **鲸鱼图标**：安装包 / 快捷方式 / 窗口均使用 dsh 官方鲸鱼图标
- **零系统依赖**：内置便携 Node，系统 Node 版本不足也能运行

## 安装

### 方式一：zip 便携版（推荐）

从 [GitHub Releases](https://github.com/xiaoyuxiaoyuqwq/dsh-desktop/releases) 下载
`DeepSeek Harness-*-win.zip`，解压后双击 `DeepSeek Harness.exe` 即用，免安装、启动更快。

### 方式二：安装程序

从 [GitHub Releases](https://github.com/xiaoyuxiaoyuqwq/dsh-desktop/releases) 下载
`DeepSeek Harness Setup X.X.X.exe`，双击安装，自动创建桌面快捷方式。

### 方式三：源码运行

```
setup.cmd    一键安装（检测 Node、装依赖）
start.cmd    一键启动（弹出桌面窗口）
update.cmd   手动更新 dsh 到最新版
```

## 自动更新

启动后应用会每 3 小时检查一次 `@deepseek-ai/dsh` 是否有新版本。

- 有新版本时，窗口**右下角出现带红点的鲸鱼角标**
- 点击角标 → 确认后自动下载安装 → 完成后自动重启
- 想立即检查：点击角标位置若未出现红点，可重启应用触发

## 从源码打包

```
build.cmd    一键打包（生成 Windows 安装程序到 dist\）
```

## 环境变量

| 变量 | 说明 | 默认 |
|---|---|---|
| `DSH_PORT` | dsh web 端口，`0` 表示随机 | `0` |
| `DSH_HOST` | dsh web 监听地址 | `127.0.0.1` |
| `DSH_NODE` | 指定用于运行 dsh 的 node 路径 | 自动探测 |

## 目录结构

```
main.js                  Electron 主进程（拉起 dsh + 内嵌窗口 + 更新检查）
preload.js               注入更新角标（鲸鱼图标 + 红点 + 自动更新）
loading.html             启动加载页
setup.cmd / start.cmd / update.cmd / build.cmd
scripts/gen-icon.mjs     鲸鱼图标生成
scripts/download-node.ps1  便携 Node 下载
build/                   图标资源（打包用）
dist/                    打包产物（安装程序）
portable-node/           便携 Node（运行时生成，不入库）
```

## 原理

`main.js` 用内置便携 Node（版本不足时自动探测系统 Node）以 `--expose-internals`
启动 `node_modules/@deepseek-ai/dsh/lib/bin.js web`，解析其监听地址后加载到
Electron 窗口。定期查询 npm registry 检查 dsh 更新，收到新版本信号后通过
`npm install @deepseek-ai/dsh@latest` 更新并重启。
