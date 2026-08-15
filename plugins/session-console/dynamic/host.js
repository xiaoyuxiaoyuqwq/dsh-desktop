return {
  name: 'session-console-host',
  apply(ctx) {
    const skills = ctx.get('skills')
    const tools = ctx.get('tools')
    const agents = ctx.get('agents')
    const sessionQuery = ctx.get('sessionQuery')
    const agentPresets = ctx.get('agentPresets')

    const disabledSkills = new Set()
    const disabledTools = new Set()
    const RESERVED = new Set(['read', 'write', 'edit', 'skill', 'todo_write', 'ask_user_question', 'exit_plan_mode'])

    // tools 门面对动态插件只暴露 register/schemas/get；用真实事件拦截禁用项
    const liftPre = ctx.on('tools/pre-execute', async (exec, next) => {
      const decision = await next()
      try {
        if (decision && decision.kind !== 'allow') return decision
        const name = exec && (exec.name || (exec.tool && exec.tool.name))
        if (typeof name !== 'string') return decision
        if (disabledTools.has(name)) {
          return { kind: 'deny', reason: 'tool "' + name + '" 已被右侧栏在本会话禁用' }
        }
        if (name === 'skill') {
          const args = (exec && (exec.arguments || exec.args)) || {}
          const sn = args && (args.name || args.skill)
          if (typeof sn === 'string' && disabledSkills.has(sn)) {
            return { kind: 'deny', reason: 'skill "' + sn + '" 已被右侧栏在本会话禁用' }
          }
        }
      } catch (_) {}
      return decision
    })
    ctx.effect(() => liftPre)

    const parseArgs = (a) => {
      if (a && typeof a === 'object') return a
      if (typeof a === 'string') {
        try { const j = JSON.parse(a); if (j && typeof j === 'object') return j } catch (_) {}
      }
      return null
    }

    harness.handle('list-skills', async () => {
      if (!skills || typeof skills.list !== 'function') return { items: [], disabled: Array.from(disabledSkills), error: 'skills 服务不可用（门面未暴露 list）' }
      try {
        const list = await skills.list()
        const items = (Array.isArray(list) ? list : []).map((s) => ({
          name: typeof (s && s.name) === 'string' ? s.name : '',
          description: typeof (s && s.description) === 'string' ? s.description : (typeof (s && s.summary) === 'string' ? s.summary : ''),
          source: typeof (s && s.source) === 'string' ? s.source : '',
        })).filter((it) => it.name)
        return { items, disabled: Array.from(disabledSkills), error: null }
      } catch (e) { return { items: [], disabled: Array.from(disabledSkills), error: String((e && e.message) || e) } }
    })

    harness.handle('skill-detail', async (args) => {
      if (!skills || typeof skills.get !== 'function') return { found: false, error: 'skills 服务不可用' }
      try {
        const name = String((args && args.name) || '')
        const def = await skills.get(name)
        if (!def) return { found: false }
        const body = typeof def.body === 'string' ? def.body : ''
        return { found: true, name: String(def.name || name), description: String(def.description || ''), body: body.slice(0, 3000), truncated: body.length > 3000 }
      } catch (e) { return { found: false, error: String((e && e.message) || e) } }
    })

    harness.handle('toggle-skill', (args) => {
      const name = String((args && args.name) || '')
      if (!name) return { ok: false, disabled: Array.from(disabledSkills), error: '缺少技能名' }
      if (disabledSkills.has(name)) disabledSkills.delete(name)
      else disabledSkills.add(name)
      return { ok: true, enabled: !disabledSkills.has(name), disabled: Array.from(disabledSkills) }
    })

    harness.handle('list-tools', () => {
      if (!tools || typeof tools.schemas !== 'function') return { items: [], disabled: Array.from(disabledTools), error: 'tools 服务不可用' }
      try {
        const schemas = tools.schemas()
        const items = (Array.isArray(schemas) ? schemas : []).map((t) => {
          const name = typeof (t && t.name) === 'string' ? t.name : ''
          return {
            name,
            description: typeof (t && t.description) === 'string' ? t.description : '',
            reserved: name ? (RESERVED.has(name) || name.indexOf('cordis_') === 0) : true,
          }
        }).filter((it) => it.name)
        return { items, disabled: Array.from(disabledTools), error: null, mode: 'deny-interception' }
      } catch (e) { return { items: [], disabled: Array.from(disabledTools), error: String((e && e.message) || e) } }
    })

    harness.handle('toggle-tool', (args) => {
      const name = String((args && args.name) || '')
      if (!name) return { ok: false, disabled: Array.from(disabledTools), error: '缺少工具名' }
      if (RESERVED.has(name) || name.indexOf('cordis_') === 0) return { ok: false, disabled: Array.from(disabledTools), error: '核心工具不可禁用' }
      if (disabledTools.has(name)) disabledTools.delete(name)
      else disabledTools.add(name)
      return { ok: true, enabled: !disabledTools.has(name), disabled: Array.from(disabledTools) }
    })

    harness.handle('plugin-activity', async (args) => {
      let sessionId = args && typeof args.sessionId === 'string' ? args.sessionId : ''
      if (!sessionId) {
        try {
          const initiator = agents && typeof agents.currentInitiator === 'function' ? agents.currentInitiator() : undefined
          sessionId = initiator && typeof initiator.id === 'string' ? initiator.id : ''
        } catch (_) {}
      }
      if (!sessionId || !sessionQuery || typeof sessionQuery.listEvents !== 'function') {
        return { items: [], summary: [], error: sessionId ? 'sessionQuery 服务不可用' : '未能确定当前会话' }
      }
      try {
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
      } catch (e) { return { items: [], summary: [], error: String((e && e.message) || e) } }
    })

    // 探针工具：回报门面能力 + 校验已安装的 anchored-standard 预设
    try {
      harness.registerTool(ctx, harness.defineTool({
        name: 'session_console_probe',
        description: '回报右侧栏宿主面能力，并 mount-validate 已安装的 anchored-standard 预设。',
        parameters: {},
        output: { schema: { type: 'string' }, render(_a, v) { return [{ type: 'text', text: v }] } },
        async execute() {
          const caps = {
            skillsList: skills && typeof skills.list === 'function',
            skillsGet: skills && typeof skills.get === 'function',
            toolsSchemas: tools && typeof tools.schemas === 'function',
            toolsGet: tools && typeof tools.get === 'function',
            toolsRegister: tools && typeof tools.register === 'function',
            sessionQueryEvents: sessionQuery && typeof sessionQuery.listEvents === 'function',
            agentsInitiator: agents && typeof agents.currentInitiator === 'function',
            agentPresetsStanding: agentPresets && typeof agentPresets.standingKeyFor === 'function',
            preExecuteListener: typeof liftPre === 'function',
          }
          let preset = { skipped: true }
          if (caps.agentPresetsStanding) {
            try {
              await agentPresets.standingKeyFor('anchored-standard')
              preset = { ok: true }
            } catch (e) { preset = { ok: false, error: String((e && e.message) || e) } }
          }
          return JSON.stringify({ caps, preset })
        },
      }))
    } catch (e) {
      console.error('probe tool registration failed:', String((e && e.message) || e))
    }
  },
}
