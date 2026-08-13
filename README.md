更新测试中，暂时不要使用

# dsh 简易封装

一个很轻的 Electron 壳，把 `dsh web` 套进桌面窗口里，省得自己开浏览器。支持在窗口右下角提示 dsh 更新。

## 安装

### 方式一：zip 便携版

从 [GitHub Releases](https://github.com/xiaoyuxiaoyuqwq/dsh-desktop/releases) 下载
`dsh 简易封装-*-win.zip`，解压后双击 `dsh 简易封装.exe` 即用，不用安装。

### 方式二：安装程序

从 [GitHub Releases](https://github.com/xiaoyuxiaoyuqwq/dsh-desktop/releases) 下载
`dsh 简易封装 Setup X.X.X.exe`，双击安装，会创建桌面快捷方式。

### 方式三：源码运行

```
setup.cmd    装依赖
start.cmd    启动窗口
update.cmd   手动更新 dsh 到最新版
```

## 自动更新

启动后每 3 小时检查一次 `@deepseek-ai/dsh` 版本。有新版本时窗口右下角出现带红点的鲸鱼角标，点击确认后自动更新并重启。

## 从源码打包

```
build.cmd    打包（生成安装程序和 zip 便携版到 dist\）
```

## 环境变量

| 变量 | 说明 | 默认 |
|---|---|---|
| `DSH_PORT` | dsh web 端口，`0` 表示随机 | `0` |
| `DSH_HOST` | dsh web 监听地址 | `127.0.0.1` |
| `DSH_NODE` | 指定用于运行 dsh 的 node 路径 | 自动探测 |

## 目录结构

```
main.js                 主进程（拉起 dsh + 内嵌窗口 + 更新检查）
preload.js              注入更新角标
loading.html            启动加载页
setup.cmd / start.cmd / update.cmd / build.cmd
scripts/gen-icon.mjs    鲸鱼图标生成
scripts/download-node.ps1  便携 Node 下载
build/                  图标资源（打包用）
dist/                   打包产物
portable-node/          便携 Node（运行时生成，不入库）
```

## 原理

`main.js` 用便携 Node（版本不足时自动探测系统 Node）以 `--expose-internals` 启动
`node_modules/@deepseek-ai/dsh/lib/bin.js web`，解析其监听地址后加载到 Electron
窗口。定期查询 npm registry 检查 dsh 更新，有新版本时通过 `npm install @deepseek-ai/dsh@latest`
更新并重启。
