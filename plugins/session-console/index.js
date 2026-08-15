/**
 * dsh-session-console 宿主半(永久版):
 * 以 web profile 插件方式挂载(见 cordis.patch.yml 的 insert 行),
 * 通过 /session-console/api 前缀路由向浏览器侧栏提供:
 *  - 当前会话技能/工具列表与功能说明
 *  - 会话级启用开关(拦截 tools/pre-execute,按 exec.agent.session.id 分桶)
 *  - 本次对话动态插件(cordis_* 工具调用)活动时间线
 */
export const name = 'session-console'

export const inject = []

export function apply(ctx) {
  const tools = ctx.get('tools')
  const skills = ctx.get('skills')
  const agents = ctx.get('agents')
  const sessionQuery = ctx.get('sessionQuery')
  const agentPresets = ctx.get('agentPresets')
  const webServer = ctx.get('webServer')

  const RESERVED = new Set(['read', 'write', 'edit', 'skill', 'todo_write', 'ask_user_question', 'exit_plan_mode'])

  // sessionId -> { skills: Set, tools: Set }
  const buckets = new Map()
  const bucketFor = (sid) => {
    const key = typeof sid === 'string' ? sid : ''
    let b = buckets.get(key)
    if (!b) { b = { skills: new Set(), tools: new Set() }; buckets.set(key, b) }
    return b
  }

  // 禁用拦截:按会话分桶的 tools/pre-execute 瀑布
  const liftPre = ctx.on('tools/pre-execute', async (exec, next) => {
    const decision = await next()
    try {
      if (decision && decision.kind !== 'allow') return decision
      const toolName = exec && (exec.name || (exec.tool && exec.tool.name))
      if (typeof toolName !== 'string') return decision
      const session = exec && exec.agent && exec.agent.session
      const sid = (session && session.id) || (exec && exec.agent && exec.agent.id) || ''
      const b = bucketFor(sid)
      if (b.tools.has(toolName)) {
        return { kind: 'deny', reason: 'tool "' + toolName + '" 已被会话控制台在本会话禁用' }
      }
      if (toolName === 'skill') {
        const args = (exec && (exec.arguments || exec.args)) || {}
        const sn = args && (args.name || args.skill)
        if (typeof sn === 'string' && b.skills.has(sn)) {
          return { kind: 'deny', reason: 'skill "' + sn + '" 已被会话控制台在本会话禁用' }
        }
      }
    } catch (_) {}
    return decision
  })
  ctx.effect(() => liftPre)

  const liveAgent = (sessionId) => {
    if (!agents || typeof agents.get !== 'function' || typeof sessionId !== 'string' || !sessionId) return undefined
    try { return agents.get(sessionId) } catch (_) { return undefined }
  }

  // 按会话取该 agent 视角的 skills 服务(合并 preset 层),退回全局服务
  const scopedSkills = (sessionId) => {
    const agent = liveAgent(sessionId)
    if (agent && agentPresets && typeof agentPresets.serviceFor === 'function') {
      try {
        const scoped = agentPresets.serviceFor(agent, 'skills')
        if (scoped && typeof scoped.list === 'function') return scoped
      } catch (_) {}
    }
    return skills && typeof skills.list === 'function' ? skills : undefined
  }

  const skillSummaries = async (sessionId) => {
    const svc = scopedSkills(sessionId)
    if (!svc) return []
    const list = await svc.list()
    return (Array.isArray(list) ? list : []).map((s) => ({
      name: typeof (s && s.name) === 'string' ? s.name : '',
      description: typeof (s && s.description) === 'string' ? s.description : (typeof (s && s.summary) === 'string' ? s.summary : ''),
      source: typeof (s && s.source) === 'string' ? s.source : '',
    })).filter((it) => it.name)
  }

  const toolSchemas = (sessionId) => {
    if (!tools || typeof tools.schemas !== 'function') return []
    let schemas
    try {
      const agent = liveAgent(sessionId)
      schemas = agent ? tools.schemas(agent) : tools.schemas()
    } catch (_) {
      schemas = tools.schemas()
    }
    return (Array.isArray(schemas) ? schemas : []).map((t) => {
      const name = typeof (t && t.name) === 'string' ? t.name : ''
      return {
        name,
        description: typeof (t && t.description) === 'string' ? t.description : '',
        reserved: name ? (RESERVED.has(name) || name.indexOf('cordis_') === 0) : true,
      }
    }).filter((it) => it.name)
  }

  const parseArgs = (a) => {
    if (a && typeof a === 'object') return a
    if (typeof a === 'string') {
      try { const j = JSON.parse(a); if (j && typeof j === 'object') return j } catch (_) {}
    }
    return null
  }

  const pluginActivity = async (sessionId) => {
    if (!sessionQuery || typeof sessionQuery.listEvents !== 'function') {
      return { items: [], summary: [], error: 'sessionQuery 服务不可用' }
    }
    const events = await sessionQuery.listEvents(sessionId)
    const items = []
    const state = new Map()
    for (const ev of (Array.isArray(events) ? events : [])) {
      const tool = ev && ev.tool
      const toolName = tool && typeof tool === 'object' && typeof tool.name === 'string' ? tool.name : (typeof tool === 'string' ? tool : '')
      const evName = typeof (ev && ev.name) === 'string' ? ev.name : ''
      const name = toolName || evName
      if (!name || name.indexOf('cordis_') !== 0) continue
      const rawArgs = (tool && typeof tool === 'object' && tool.arguments) || (ev && ev.arguments) || (ev && ev.input)
      const a = parseArgs(rawArgs)
      const action = name.slice(7)
      const pluginId = (a && typeof a.pluginId === 'string' && a.pluginId) || (a && a.plugin && typeof a.plugin === 'object' && typeof a.plugin.pluginId === 'string' ? a.plugin.pluginId : '')
      const packageId = a && typeof a.packageId === 'string' ? a.packageId : ''
      const pkgName = a && typeof a.name === 'string' ? a.name : ''
      const purpose = a && typeof a.purpose === 'string' ? a.purpose : ''
      const mode = a && typeof a.mode === 'string' ? a.mode : ''
      items.push({ action, name, pluginId, packageId, pkgName, purpose, mode })
      if (pluginId) {
        let cur = state.get(pluginId)
        if (!cur) cur = { pluginId, name: pkgName || pluginId, purpose: '', status: '已定义', lastAction: '' }
        if (pkgName) cur.name = pkgName
        if (purpose) cur.purpose = purpose
        cur.lastAction = action + (mode ? ' ' + mode : '')
        if (action === 'run') cur.status = '运行中'
        else if (action === 'stop') cur.status = '已停止'
        else if (action === 'undefine') cur.status = '已删除'
        state.set(pluginId, cur)
      }
    }
    return { items: items.slice(-80).reverse(), summary: Array.from(state.values()), error: null }
  }

  if (webServer && typeof webServer.register === 'function') {
    const send = (res, code, obj) => {
      let body
      try { body = JSON.stringify(obj) } catch (_) { body = '{"error":"serialize failed"}' }
      try {
        res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
        res.end(body)
      } catch (_) {}
    }

    const route = webServer.register({
      kind: 'prefix',
      path: '/session-console/api',
      handler: (req, res) => {
        void (async () => {
          try {
            const u = new URL(req.url || '/', 'http://localhost')
            const action = u.searchParams.get('action') || ''
            const name = u.searchParams.get('name') || ''
            const sessionId = u.searchParams.get('sessionId') || ''
            if (action === 'skills') {
              const b = bucketFor(sessionId)
              send(res, 200, { items: await skillSummaries(sessionId), disabled: Array.from(b.skills), error: null })
            } else if (action === 'skill-detail') {
              if (!name) return send(res, 400, { error: 'missing name' })
              const svc = scopedSkills(sessionId)
              if (!svc || typeof svc.get !== 'function') return send(res, 200, { found: false, error: 'skills 服务不可用' })
              const def = await svc.get(name)
              if (!def) return send(res, 200, { found: false })
              const body = typeof def.body === 'string' ? def.body : ''
              send(res, 200, {
                found: true,
                name: String(def.name || name),
                description: String(def.description || ''),
                body: body.slice(0, 3000),
                truncated: body.length > 3000,
              })
            } else if (action === 'tools') {
              const b = bucketFor(sessionId)
              send(res, 200, { items: toolSchemas(sessionId), disabled: Array.from(b.tools), error: null })
            } else if (action === 'toggle-skill') {
              if (!name) return send(res, 400, { error: 'missing name' })
              const b = bucketFor(sessionId)
              if (b.skills.has(name)) b.skills.delete(name)
              else b.skills.add(name)
              send(res, 200, { ok: true, enabled: !b.skills.has(name), disabled: Array.from(b.skills) })
            } else if (action === 'toggle-tool') {
              if (!name) return send(res, 400, { error: 'missing name' })
              if (RESERVED.has(name) || name.indexOf('cordis_') === 0) return send(res, 400, { error: '核心工具不可禁用' })
              const b = bucketFor(sessionId)
              if (b.tools.has(name)) b.tools.delete(name)
              else b.tools.add(name)
              send(res, 200, { ok: true, enabled: !b.tools.has(name), disabled: Array.from(b.tools) })
            } else if (action === 'plugins') {
              if (!sessionId) return send(res, 200, { items: [], summary: [], error: '缺少 sessionId' })
              const r = await pluginActivity(sessionId)
              send(res, 200, r)
            } else {
              send(res, 404, { error: 'unknown action: ' + action })
            }
          } catch (e) {
            send(res, 500, { error: String((e && e.message) || e) })
          }
        })()
      },
    })
    ctx.effect(() => route)
  }
}
