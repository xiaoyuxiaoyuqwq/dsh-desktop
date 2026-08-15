# dsh-session-console 会话控制台侧栏

DeepSeek Harness 右侧悬浮侧栏：对**当前对话**使用的技能（skill）与工具提供快捷功能了解和启用管理，并展示本次对话的动态插件活动时间线。

## 功能

| 标签页 | 内容 |
|---|---|
| 技能 | 当前会话技能列表 + 功能描述 + 「详情」展开完整说明；开关可拦截该技能的 `skill` 调用（按会话分桶） |
| 工具 | 当前会话工具目录 + 说明；开关可拦截该工具调用（核心工具如 read/write/edit/skill/cordis_* 不可禁用） |
| 插件 | 本次对话 define/run/stop/undefine 过的动态插件状态卡片 + 活动时间线 |

面板可刷新、可收起为右侧小把手；样式全部使用 `--dsw-*` 主题 token，自动跟随明暗主题。

## 安装（永久，重启后生效）

这是 `dsh.client` 双面插件（宿主半 + 浏览器半），以 web profile 插件方式安装：

1. 把本目录复制到 `%USERPROFILE%\.dsh\profiles\web\node_modules\dsh-session-console\`（即
   `~/.dsh/profiles/web/node_modules/dsh-session-console`）。
2. 在 `~/.dsh/profiles/web/cordis.patch.yml` 的 `- insert:` 列表内加一行：
   ```yaml
       - id: session-console
         name: dsh-session-console
   ```
3. 完全重启 dsh（关掉桌面程序重开），右侧栏自动出现。

在 dsh-desktop 仓库中可用一键脚本：
```
scripts\install-session-console.cmd
```

## 目录结构

- `index.js` — 宿主半：`/session-console/api` 前缀路由（技能/工具列表、开关、插件活动），
  按 `exec.agent.session.id` 分桶的 `tools/pre-execute` 拦截，`webServer` 路由注册
- `client.js` — 浏览器半：`window.__ModuleLoader__.load` 包，`require("react")`，
  注册 `shell.overlay` 槽位，`fetch` 调 API
- `package.json` — `dsh.client` 声明（platform web / immediately）与 `./client` 导出
- `dynamic/` — 动态插件版源码（进程内临时安装用，重启失效），供参考与调试

## 动态版（备用安装方式）

`dynamic/host.js` 与 `dynamic/client.js` 可作为动态 Cordis 插件安装（`cordis_define` →
`cordis_run`），页面立即生效但进程重启后失效。实现要点与永久版一致
（`tools/pre-execute` 拦截 + 门面 `skills`/`tools.schemas` + `sessionQuery`）。
