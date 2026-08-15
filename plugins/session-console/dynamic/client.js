const CSS = [
  '.dsh-sc-root{position:fixed;top:12px;right:12px;z-index:200;pointer-events:auto;font-family:inherit}',
  '.dsh-sc-panel{width:320px;max-height:calc(100vh - 40px);display:flex;flex-direction:column;background:var(--dsw-alias-bg-overlay);border:1px solid var(--dsw-alias-border-l1);border-radius:12px;box-shadow:0 12px 32px rgba(0,0,0,.25);overflow:hidden;color:var(--dsw-alias-label-primary)}',
  '.dsh-sc-head{display:flex;align-items:center;gap:6px;padding:10px 12px;border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1)}',
  '.dsh-sc-title{font-size:13px;font-weight:600;flex:1}',
  '.dsh-sc-sub{font-size:10px;color:var(--dsw-alias-label-secondary);border:1px solid var(--dsw-alias-border-l2);border-radius:999px;padding:1px 8px}',
  '.dsh-sc-btn{border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-secondary);border-radius:6px;width:22px;height:22px;font-size:12px;line-height:1;cursor:pointer;padding:0}',
  '.dsh-sc-btn:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2)}',
  '.dsh-sc-tabs{display:flex;gap:2px;padding:6px 8px 0;background:var(--dsw-alias-bg-layer-1);border-bottom:1px solid var(--dsw-alias-border-l1)}',
  '.dsh-sc-tab{padding:6px 10px;border:none;background:transparent;color:var(--dsw-alias-label-secondary);font-size:12px;border-radius:8px 8px 0 0;cursor:pointer}',
  '.dsh-sc-tab:hover{color:var(--dsw-alias-label-primary)}',
  '.dsh-sc-tab-active{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2)}',
  '.dsh-sc-count{font-size:10px;color:var(--dsw-alias-label-secondary);margin-left:4px}',
  '.dsh-sc-body{flex:1;overflow-y:auto;padding:8px}',
  '.dsh-sc-error{margin:0 0 8px;padding:6px 8px;border:1px solid var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary);border-radius:8px;font-size:11px;white-space:pre-wrap}',
  '.dsh-sc-note{margin:0 0 8px;padding:6px 8px;border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);border-radius:8px;font-size:11px;line-height:1.5}',
  '.dsh-sc-item{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);border-radius:8px;padding:8px;margin-bottom:6px}',
  '.dsh-sc-row{display:flex;align-items:center;gap:6px}',
  '.dsh-sc-name{flex:1;font-size:12px;font-weight:600;word-break:break-all}',
  '.dsh-sc-desc{margin-top:4px;font-size:11px;line-height:1.5;color:var(--dsw-alias-label-secondary)}',
  '.dsh-sc-tag{display:inline-block;margin-top:4px;font-size:10px;padding:1px 6px;border-radius:999px;border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary)}',
  '.dsh-sc-link{border:none;background:transparent;color:var(--dsw-alias-brand-primary);font-size:11px;cursor:pointer;padding:2px 4px;border-radius:4px}',
  '.dsh-sc-link:hover{background:var(--dsw-alias-bg-layer-2)}',
  '.dsh-sc-toggle{position:relative;width:32px;height:18px;border-radius:999px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);cursor:pointer;padding:0;flex:none}',
  '.dsh-sc-toggle:disabled{opacity:.5;cursor:not-allowed}',
  '.dsh-sc-knob{position:absolute;top:2px;left:2px;width:12px;height:12px;border-radius:50%;background:var(--dsw-alias-label-secondary);transition:transform .15s ease}',
  '.dsh-sc-on{background:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary)}',
  '.dsh-sc-on .dsh-sc-knob{transform:translateX(14px);background:#fff}',
  '.dsh-sc-empty{padding:16px 8px;text-align:center;font-size:11px;color:var(--dsw-alias-label-secondary)}',
  '.dsh-sc-status{font-size:10px;padding:1px 6px;border-radius:999px;border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);white-space:nowrap}',
  '.dsh-sc-status-run{color:var(--dsw-alias-state-success-primary);border-color:var(--dsw-alias-state-success-primary)}',
  '.dsh-sc-status-del{color:var(--dsw-alias-state-error-primary);border-color:var(--dsw-alias-state-error-primary)}',
  '.dsh-sc-log{font-size:10px;color:var(--dsw-alias-label-secondary);line-height:1.6;margin:0;padding:6px 2px 0;word-break:break-all}',
  '.dsh-sc-loghead{font-size:11px;font-weight:600;color:var(--dsw-alias-label-primary);margin:10px 0 4px}',
  '.dsh-sc-detail{border:1px solid var(--dsw-alias-brand-primary);border-radius:8px;padding:8px;margin-bottom:8px;background:var(--dsw-alias-bg-layer-1)}',
  '.dsh-sc-detail-head{display:flex;align-items:center;gap:6px}',
  '.dsh-sc-x{margin-left:auto;border:none;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;font-size:14px;line-height:1;padding:2px 6px;border-radius:4px}',
  '.dsh-sc-x:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2)}',
  '.dsh-sc-pre{margin:6px 0 0;padding:8px;background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l1);border-radius:6px;font-size:10px;line-height:1.5;white-space:pre-wrap;max-height:220px;overflow-y:auto;color:var(--dsw-alias-label-secondary)}',
  '.dsh-sc-handle{position:fixed;top:45%;right:0;z-index:200;pointer-events:auto;border:1px solid var(--dsw-alias-border-l1);border-right:none;border-radius:10px 0 0 10px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-size:11px;padding:10px 6px;cursor:pointer;writing-mode:vertical-rl}',
  '.dsh-sc-handle:hover{background:var(--dsw-alias-bg-layer-2)}',
].join('\n')

function pickSessionId(state) {
  if (!state || typeof state !== 'object') return undefined
  if (typeof state.activeSessionId === 'string' && state.activeSessionId) return state.activeSessionId
  if (typeof state.activeId === 'string' && state.activeId) return state.activeId
  if (typeof state.currentSessionId === 'string' && state.currentSessionId) return state.currentSessionId
  const active = state.active
  if (typeof active === 'string' && active) return active
  if (active && typeof active === 'object' && typeof active.id === 'string') return active.id
  const current = state.current
  if (typeof current === 'string' && current) return current
  if (current && typeof current === 'object' && typeof current.id === 'string') return current.id
  return undefined
}

function Toggle(props) {
  return React.createElement('button', {
    type: 'button',
    className: 'dsh-sc-toggle' + (props.on ? ' dsh-sc-on' : ''),
    disabled: !!props.disabled,
    title: props.title || (props.on ? '点击禁用' : '点击启用'),
    onClick: (e) => { e.stopPropagation(); if (!props.disabled && props.onChange) props.onChange() },
  }, React.createElement('span', { className: 'dsh-sc-knob' }))
}

function DetailBox(props) {
  const d = props.detail
  if (!d) return null
  return React.createElement('div', { className: 'dsh-sc-detail' },
    React.createElement('div', { className: 'dsh-sc-detail-head' },
      React.createElement('span', { className: 'dsh-sc-name' }, d.found ? (d.name || '') : '技能详情'),
      React.createElement('button', { type: 'button', className: 'dsh-sc-x', title: '关闭', onClick: props.onClose }, '\u00d7')),
    d.found ? React.createElement('div', { className: 'dsh-sc-desc' }, d.description || '(无描述)') : null,
    d.found && d.body ? React.createElement('pre', { className: 'dsh-sc-pre' }, d.body + (d.truncated ? '\n\u2026(内容已截断)' : '')) : null)
}

function Sidebar(props) {
  const useSessions = props && props.useSessions
  let sessionState
  try { sessionState = useSessions ? useSessions((s) => s) : undefined } catch (_) { sessionState = undefined }
  const sessionId = pickSessionId(sessionState)

  const [open, setOpen] = React.useState(true)
  const [tab, setTab] = React.useState('skills')
  const [skills, setSkills] = React.useState([])
  const [disabledSkills, setDisabledSkills] = React.useState([])
  const [toolsList, setToolsList] = React.useState([])
  const [disabledTools, setDisabledTools] = React.useState([])
  const [summary, setSummary] = React.useState([])
  const [activity, setActivity] = React.useState([])
  const [detail, setDetail] = React.useState(null)
  const [error, setError] = React.useState('')
  const [busy, setBusy] = React.useState({})
  const [loading, setLoading] = React.useState(true)

  const load = () => {
    setLoading(true)
    let errs = []
    const pushErr = (e) => { if (e) errs.push(String(e)) }
    const p1 = host.call('list-skills').then((r) => {
      if (!r) return
      if (Array.isArray(r.items)) setSkills(r.items)
      if (Array.isArray(r.disabled)) setDisabledSkills(r.disabled)
      pushErr(r.error)
    }).catch(pushErr)
    const p2 = host.call('list-tools').then((r) => {
      if (!r) return
      if (Array.isArray(r.items)) setToolsList(r.items)
      if (Array.isArray(r.disabled)) setDisabledTools(r.disabled)
      pushErr(r.error)
    }).catch(pushErr)
    const p3 = host.call('plugin-activity', { sessionId }).then((r) => {
      if (!r) return
      if (Array.isArray(r.summary)) setSummary(r.summary)
      if (Array.isArray(r.items)) setActivity(r.items)
      pushErr(r.error)
    }).catch(pushErr)
    Promise.all([p1, p2, p3]).then(() => {
      setError(errs.join('\uff1b'))
      setLoading(false)
    })
  }

  React.useEffect(() => { load() }, [sessionId])

  const toggleSkill = (name) => {
    const key = 's:' + name
    setBusy((b) => { const n = Object.assign({}, b); n[key] = true; return n })
    host.call('toggle-skill', { name }).then((r) => {
      if (r && Array.isArray(r.disabled)) setDisabledSkills(r.disabled)
      if (r && r.error) setError(String(r.error))
    }).catch((e) => setError(String(e && e.message ? e.message : e))).then(() => {
      setBusy((b) => { const n = Object.assign({}, b); delete n[key]; return n })
    })
  }

  const toggleTool = (name) => {
    const key = 't:' + name
    setBusy((b) => { const n = Object.assign({}, b); n[key] = true; return n })
    host.call('toggle-tool', { name }).then((r) => {
      if (r && Array.isArray(r.disabled)) setDisabledTools(r.disabled)
      if (r && r.error) setError(String(r.error))
    }).catch((e) => setError(String(e && e.message ? e.message : e))).then(() => {
      setBusy((b) => { const n = Object.assign({}, b); delete n[key]; return n })
    })
  }

  const showDetail = (name) => {
    host.call('skill-detail', { name }).then((r) => {
      if (r && r.found === false && r.error) setError(String(r.error))
      setDetail(r || null)
    }).catch((e) => setError(String(e && e.message ? e.message : e)))
  }

  const switchTab = (id) => { setTab(id); setDetail(null) }

  if (!open) {
    return React.createElement('button', { type: 'button', className: 'dsh-sc-handle', title: '展开会话控制台', onClick: () => setOpen(true) }, '会话控制台')
  }

  const TABS = [
    { id: 'skills', label: '技能', count: skills.length },
    { id: 'tools', label: '工具', count: toolsList.length },
    { id: 'plugins', label: '插件', count: summary.length },
  ]

  const tabButtons = TABS.map((t) => React.createElement('button', {
    key: t.id,
    type: 'button',
    className: 'dsh-sc-tab' + (tab === t.id ? ' dsh-sc-tab-active' : ''),
    onClick: () => switchTab(t.id),
  }, t.label, React.createElement('span', { className: 'dsh-sc-count' }, String(t.count))))

  let body = null
  if (tab === 'skills') {
    body = skills.length === 0
      ? React.createElement('div', { className: 'dsh-sc-empty' }, loading ? '加载中\u2026' : '暂无技能')
      : skills.map((s) => {
        const on = disabledSkills.indexOf(s.name) === -1
        const b = !!busy['s:' + s.name]
        return React.createElement('div', { key: s.name, className: 'dsh-sc-item' },
          React.createElement('div', { className: 'dsh-sc-row' },
            React.createElement('span', { className: 'dsh-sc-name', title: s.name }, s.name),
            React.createElement('button', { type: 'button', className: 'dsh-sc-link', disabled: b, onClick: () => showDetail(s.name) }, '详情'),
            React.createElement(Toggle, { on, disabled: b, onChange: () => toggleSkill(s.name), title: on ? '禁用本技能（拦截 skill 调用）' : '启用本技能' })),
          s.description ? React.createElement('div', { className: 'dsh-sc-desc' }, s.description) : null,
          s.source ? React.createElement('span', { className: 'dsh-sc-tag' }, s.source) : null)
      })
  } else if (tab === 'tools') {
    body = toolsList.length === 0
      ? React.createElement('div', { className: 'dsh-sc-empty' }, loading ? '加载中\u2026' : '暂无工具')
      : toolsList.map((t) => {
        const on = disabledTools.indexOf(t.name) === -1
        const b = !!busy['t:' + t.name]
        return React.createElement('div', { key: t.name, className: 'dsh-sc-item' },
          React.createElement('div', { className: 'dsh-sc-row' },
            React.createElement('span', { className: 'dsh-sc-name', title: t.name }, t.name),
            t.reserved
              ? React.createElement('span', { className: 'dsh-sc-tag', title: '核心工具，不可禁用' }, '核心')
              : React.createElement(Toggle, { on, disabled: b, onChange: () => toggleTool(t.name), title: on ? '本会话拦截该工具的调用' : '本会话恢复该工具' })),
          t.description ? React.createElement('div', { className: 'dsh-sc-desc' }, t.description) : null)
      })
  } else {
    body = React.createElement('div', null,
      React.createElement('div', { className: 'dsh-sc-note' }, '停用/启用动态插件需助手执行 cordis_stop / cordis_run；运行时未向插件代码开放注册表，侧栏只能展示状态。'),
      summary.length === 0 ? React.createElement('div', { className: 'dsh-sc-empty' }, loading ? '加载中\u2026' : '本次对话还没有动态插件活动')
        : summary.map((p) => {
          const cls = p.status === '运行中' ? ' dsh-sc-status-run' : (p.status === '已删除' ? ' dsh-sc-status-del' : '')
          return React.createElement('div', { key: p.pluginId, className: 'dsh-sc-item' },
            React.createElement('div', { className: 'dsh-sc-row' },
              React.createElement('span', { className: 'dsh-sc-name', title: p.pluginId }, p.name),
              React.createElement('span', { className: 'dsh-sc-status' + cls }, p.status)),
            p.purpose ? React.createElement('div', { className: 'dsh-sc-desc' }, p.purpose) : null,
            React.createElement('span', { className: 'dsh-sc-tag' }, String(p.pluginId)))
        }),
      activity.length > 0 ? React.createElement('div', null,
        React.createElement('div', { className: 'dsh-sc-loghead' }, '活动时间线'),
        activity.slice(0, 40).map((it, i) => React.createElement('div', { key: i, className: 'dsh-sc-log' },
          it.action + ' \u00b7 ' + (it.pkgName || it.pluginId || it.name) + (it.mode ? ' (' + it.mode + ')' : '')))) : null)
  }

  return React.createElement('div', { className: 'dsh-sc-root' },
    React.createElement('div', { className: 'dsh-sc-panel' },
      React.createElement('div', { className: 'dsh-sc-head' },
        React.createElement('span', { className: 'dsh-sc-title' }, '会话控制台'),
        React.createElement('span', { className: 'dsh-sc-sub' }, '本会话'),
        React.createElement('button', { type: 'button', className: 'dsh-sc-btn', title: '刷新', onClick: load }, '\u27f3'),
        React.createElement('button', { type: 'button', className: 'dsh-sc-btn', title: '收起', onClick: () => setOpen(false) }, '\u00bb')),
      React.createElement('div', { className: 'dsh-sc-tabs' }, tabButtons),
      React.createElement('div', { className: 'dsh-sc-body' },
        error ? React.createElement('div', { className: 'dsh-sc-error' }, error) : null,
        React.createElement(DetailBox, { detail, onClose: () => setDetail(null) }),
        body)))
}

return {
  name: 'session-console-client',
  apply(ctx) {
    const slots = ctx.get('slots')
    if (slots === undefined) return
    ctx.effect(() => styles.insert(CSS))
    slots.inject('shell.overlay', () => slots.register(
      { name: 'shell.overlay', id: 'session-console', order: 50, label: '会话控制台' },
      (props) => React.createElement(Sidebar, { useSessions: props && props.useSessions }),
    ))
  },
}
