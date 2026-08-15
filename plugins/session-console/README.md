# dsh-session-console 会话控制台侧栏

DeepSeek Harness 的右侧悬浮侧栏（动态 Cordis 插件）：对**当前对话**使用的技能（skill）与工具提供快捷功能了解与启用管理，并展示本次对话的动态插件活动时间线。

## 功能

| 标签页 | 内容 |
|---|---|
| 技能 | 当前会话可见技能列表 + 功能描述 + 「详情」展开完整说明；开关可拦截该技能的 `skill` 调用（本会话生效） |
| 工具 | 当前会话工具目录 + 说明；开关可拦截该工具的调用（核心工具如 read/write/edit/skill/cordis_* 不可禁用） |
| 插件 | 本次对话 define/run/stop/undefine 过的动态插件状态卡片 + 活动时间线（停用/启用动态插件需助手执行 `cordis_stop`/`cordis_run`，运行时未向插件代码开放注册表） |

面板右上角可刷新、可收起为右侧小把手；样式全部使用 `--dsw-*` 主题 token，自动跟随明暗主题。

## 实现要点（对后续移植有用）

- 动态插件运行时拿到的 `tools` 是**只读门面**（只有 `register`/`schemas`/`get`），没有 `restrict`/`guard`；
  本插件改用真实事件 `tools/pre-execute` 瀑布：`next()` 后若判定为 `{ kind: 'allow' }`，命中禁用集合时返回 `{ kind: 'deny', reason: '...' }`。
- 技能/工具列表来自门面 `skills.list()/skills.get()` 与 `tools.schemas()`；插件活动从 `sessionQuery.listEvents(sessionId)` 还原（`cordis_*` 工具调用事件）。
- 会话 id 由 Client 通过 `shell.overlay` 槽位的标准 props `useSessions` 取得并随 RPC 传给 Host。
- 附带 `session_console_probe` 探针工具：回报门面能力并 mount-validate 已安装的 `anchored-standard` 预设（`agentPresets.standingKeyFor`）。

## 安装（即时，本进程有效）

1. 在任意对话中让模型执行 `cordis_define`：
   - `code.host` = 本目录 `host.js` 的内容
   - `code.client` = 本目录 `client.js` 的内容
   - `plugin.kind: "new"`，`idPrefix` 用 `sbcn`（或任意 3–6 位小写字母）
2. 返回 `pluginId`/`packageId` 后执行 `cordis_run`（首次用 `mode: "run"`）。
3. 页面右上角出现「会话控制台」面板。进程重启后需重新定义（动态插件不落盘）。

## 永久化路线

动态插件是进程内临时能力。要永久内置到 dsh-desktop 封装，需按 `dsh.client` 双面插件契约移植：
host 半用 `@deepseek-ai/dsh-typert-protocol` 的 `@Remote` 服务暴露数据，client 半以
`window.__ModuleLoader__.load({ id, factory })` 形式导出 `{ name, inject, apply }`，
并在 package.json 声明 `dsh.client` 与 `./client` 导出（参考 `@deepseek-ai/dsh-client-hmr`
与 `@deepseek-ai/dsh-message-feedback`）。移植后 Host 端可直接使用完整 `tools.restrict`/`tools.guard`。
