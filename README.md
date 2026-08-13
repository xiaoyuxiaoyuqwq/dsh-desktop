# dsh-desktop

DeepSeek Harness 的桌面壳。用 Electron 内嵌 `dsh web`，一键启动，像 opencode 桌面版一样使用。

## 特性

- 一键安装：自动检测 / 下载便携版 Node.js，安装 electron + dsh
- 一键启动：双击 `start.cmd` 即弹出窗口，内嵌 dsh Web UI
- 独立更新 dsh：`update.cmd` 将 `@deepseek-ai/dsh` 升级到最新版
- 零系统依赖：系统 Node 版本不足时自动使用项目内的便携版 Node

## 快速开始

```
setup.cmd    一键安装（检测 Node、装依赖）
start.cmd    一键启动（弹出桌面窗口）
update.cmd   更新 dsh 到最新版
```

首次运行后会在 `~/.dsh` 生成 dsh 配置（含凭据与 provider 设置）。

## 手动运行

```
npm install
npm start
```

## 环境变量

| 变量 | 说明 | 默认 |
|---|---|---|
| `DSH_PORT` | dsh web 端口，`0` 表示随机 | `0` |
| `DSH_HOST` | dsh web 监听地址 | `127.0.0.1` |
| `DSH_NODE` | 指定用于运行 dsh 的 node 可执行文件路径 | 自动探测 |

## 原理

`main.js` 用系统/便携版 Node 拉起 `node_modules/@deepseek-ai/dsh/lib/bin.js web`，
解析其输出的监听地址后，在 Electron 窗口内加载该地址。关窗即结束 dsh 进程。

## 目录结构

```
main.js              Electron 主进程（拉起 dsh + 内嵌窗口）
loading.html         启动时的加载页
setup.cmd            一键安装入口
start.cmd            一键启动入口
update.cmd           更新 dsh 入口
scripts/download-node.ps1  便携 Node 下载脚本
portable-node/       便携 Node（运行时生成，不入库）
```
