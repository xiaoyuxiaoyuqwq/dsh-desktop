# 更新测试中，暂时不要使用

# dsh 简易封装

一个很轻的 Electron 壳，把 `dsh web` 套进桌面窗口里，省得自己开浏览器。

在窗口右上角有一个鲸鱼图标按钮，点击可展开**控制面板**（右侧滑出，不占用原界面）。

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

## 控制面板（右上角鲸鱼按钮）

点右上角鲸鱼图标展开右侧面板：

- **用量**：会话数、工作区数、会话文件数、占用空间
- **Skill**：列出 `~/.dsh/skills` 下的技能，可勾选启用 / 禁用；同时只读展示 opencode 的 skill
- **插件**：列出当前 profile 加载的插件，可勾选启用 / 禁用

> 切换 Skill / 插件后需重启 dsh 生效。

## 自动更新

启动后每 3 小时检查一次 `@deepseek-ai/dsh` 版本。有新版本时窗口右下角出现带红点的鲸鱼角标，点击确认后自动更新并重启。

## 隐私说明

- **不包含任何模型配置、API Key、会话数据**
- 打包产物只有壳代码 + dsh 运行依赖，你的 `~/.dsh`（配置/凭据/会话）始终留在本机
- 应用运行时读取你系统环境变量里的 `OPENCODE_GO_API_KEY` 等，不会写入包内

## 首次运行

dsh 首次启动需要在 `~/.dsh` 创建符号链接，要求已开启 Windows 开发者模式。
未开启时应用会弹出引导，可一键开启（需管理员权限，弹 UAC 确认一次）。

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
| `DSH_HOME` | dsh 数据目录（默认 `~/.dsh`） | 自动探测 |

## 目录结构

```
main.js                 主进程（拉起 dsh + 内嵌窗口 + 更新检查 + 面板数据）
preload.js              注入更新角标 + 右侧控制面板
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

右侧控制面板通过 IPC 读取 `~/.dsh` 下的 skill / 插件配置与会话统计，勾选后写回
`~/.dsh/profiles/web/cordis.patch.yml` 或 skill 目录，不动 dsh 本体。
