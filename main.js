const { app, BrowserWindow, dialog, ipcMain, Menu } = require('electron');
const { spawn, execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = process.env.DSH_PORT || '0';
const HOST = process.env.DSH_HOST || '127.0.0.1';
const NODE_MIN = [22, 19, 0];
const BOOT_TIMEOUT = 120000;
const APP_DIR = __dirname;
const RES_DIR = process.resourcesPath || APP_DIR;

function parseNodeVersion(s) {
  const m = String(s).match(/v?(\d+)\.(\d+)\.(\d+)/);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function gte(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a[i] > b[i]) return true;
    if (a[i] < b[i]) return false;
  }
  return true;
}

function versionOk(v) {
  return v && gte(v, NODE_MIN);
}

function checkNode(cmd) {
  return new Promise((resolve) => {
    execFile(cmd, ['--version'], { timeout: 5000 }, (err, stdout) => {
      if (err) return resolve(null);
      const v = parseNodeVersion(stdout);
      resolve(versionOk(v) ? cmd : null);
    });
  });
}

async function findNode() {
  if (process.env.DSH_NODE && await checkNode(process.env.DSH_NODE)) {
    return process.env.DSH_NODE;
  }
  const candidates = [
    path.join(RES_DIR, 'portable-node', 'node.exe'),
    path.join(APP_DIR, 'portable-node', 'node.exe'),
  ];
  for (const c of candidates) {
    if (await checkNode(c)) return c;
  }
  if (await checkNode('node')) return 'node';
  return null;
}

function dshBinPath() {
  const p = path.join(APP_DIR, 'node_modules', '@deepseek-ai', 'dsh', 'lib', 'bin.js');
  return fs.existsSync(p) ? p : null;
}

function currentDshVersion() {
  try {
    const pkg = path.join(APP_DIR, 'node_modules', '@deepseek-ai', 'dsh', 'package.json');
    return JSON.parse(fs.readFileSync(pkg, 'utf8')).version;
  } catch {
    return null;
  }
}

function compareVersions(a, b) {
  const pa = String(a || '').replace(/^[v^]/, '').split('.').map(Number);
  const pb = String(b || '').replace(/^[v^]/, '').split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] || 0, y = pb[i] || 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}

async function fetchLatestDshVersion() {
  return new Promise((resolve) => {
    execFile(
      'node',
      ['-e', 'fetch("https://registry.npmjs.org/@deepseek-ai/dsh/latest").then(r=>r.json()).then(j=>console.log(j.version)).catch(()=>{})'],
      { timeout: 10000 },
      (err, stdout) => resolve(err ? null : String(stdout).trim())
    );
  });
}

let child = null;
let win = null;
let apiUrl = null;
let updateTimer = null;
let bootTimer = null;

function showLoadingError(msg) {
  if (win && !win.isDestroyed()) {
    win.webContents.executeJavaScript(`window.dshLoading && window.dshLoading.error(${JSON.stringify(String(msg).slice(0, 300))})`).catch(() => {});
  }
  console.error('[boot] failed:', msg);
}

function killTree(proc) {
  if (!proc || proc.killed) return;
  try {
    execFile('taskkill', ['/pid', String(proc.pid), '/T', '/F'], () => {});
  } catch {
    try { proc.kill(); } catch {}
  }
}

function startBootTimeout() {
  bootTimer = setTimeout(() => {
    if (apiUrl) return;
    const hint = child ? 'dsh 进程已启动但未在预期时间内就绪。' : 'dsh 进程未能启动。';
    showLoadingError(`${hint} 可能原因：未开启 Windows 开发者模式（首次运行需创建符号链接）、网络不可用、或端口被占用。`);
  }, BOOT_TIMEOUT);
}

let devModePrompted = false;

function isDevModeEnabled() {
  try {
    const k = require('child_process').execFileSync('reg', [
      'query', 'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\AppModelUnlock',
      '/v', 'AllowDevelopmentWithoutDevLicense',
    ], { encoding: 'utf8', timeout: 5000, windowsHide: true });
    return /0x1/.test(k);
  } catch {
    return false;
  }
}

function enableDevModeViaUac() {
  const bat = path.join(app.getPath('temp'), 'enable-dev-mode.bat');
  fs.writeFileSync(bat, '@echo off\r\nreg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\AppModelUnlock" /v AllowDevelopmentWithoutDevLicense /t REG_DWORD /d 1 /f\r\n', 'utf8');
  const ps = spawn('powershell', ['-NoProfile', '-Command', `Start-Process cmd -ArgumentList '/c','"${bat}"' -Verb RunAs -Wait`], {
    windowsHide: true,
    stdio: 'ignore',
  });
  ps.on('exit', () => {
    fs.unlinkSync(bat);
    const ok = isDevModeEnabled();
    if (ok && win && !win.isDestroyed()) {
      dialog.showMessageBox(win, {
        type: 'info',
        message: '开发者模式已开启',
        detail: '正在重新启动 dsh…',
      });
      restartDsh();
    } else if (win && !win.isDestroyed()) {
      dialog.showMessageBox(win, {
        type: 'warning',
        message: '未能开启开发者模式',
        detail: '如果刚刚拒绝了 UAC 弹窗，可稍后手动开启：\n设置 → 隐私和安全性 → 开发者选项 → 开发人员模式\n开启后点“重试”。',
        buttons: ['重试', '退出'],
      }).then(({ response }) => {
        if (response === 0) restartDsh();
        else quitApp();
      });
    }
  });
}

function promptEnableDevMode() {
  if (devModePrompted || !win || win.isDestroyed()) return;
  devModePrompted = true;
  if (isDevModeEnabled()) return;
  dialog.showMessageBox(win, {
    type: 'question',
    message: '首次运行需要开启 Windows 开发者模式',
    detail: 'dsh 需要创建符号链接，未开启开发者模式会启动失败。\n是否现在开启？（需要管理员权限，会弹出 UAC 确认）',
    buttons: ['开启开发者模式', '稍后手动开启', '退出'],
    defaultId: 0,
    cancelId: 2,
  }).then(({ response }) => {
    if (response === 0) enableDevModeViaUac();
    else if (response === 1) restartDsh();
    else quitApp();
  });
}

function restartDsh() {
  devModePrompted = false;
  if (child) killTree(child);
  child = null;
  apiUrl = null;
  if (win && !win.isDestroyed()) win.loadFile('loading.html');
  startDsh();
}

async function startDsh() {
  const node = await findNode();
  if (!node) {
    showLoadingError(`需要 Node.js >= ${NODE_MIN.join('.')}，未找到可用版本。`);
    return;
  }
  console.log('[dsh] using node:', node);

  const dshBin = dshBinPath();
  if (!dshBin) {
    showLoadingError('未找到 @deepseek-ai/dsh，请重新安装。');
    return;
  }

  child = spawn(node, ['--expose-internals', dshBin, 'web', '--host', HOST, '--port', PORT], {
    cwd: APP_DIR,
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  startBootTimeout();

  let buf = '';
  child.stdout.on('data', (d) => {
    buf += String(d);
    const s = String(d);
    if (!apiUrl) {
      const m = buf.match(/http:\/\/[\w.:]+/);
      if (m) {
        apiUrl = m[0];
        console.log('[dsh] listening on', apiUrl);
        if (bootTimer) clearTimeout(bootTimer);
        if (win) win.loadURL(apiUrl);
      }
    }
    console.log('[dsh]', s.trim());
  });
  child.stderr.on('data', (d) => {
    const s = String(d).trim();
    console.log('[dsh:err]', s);
    if (!apiUrl && /error|failed|SyntaxError|Cannot find|EPERM|expose-internals/i.test(s)) {
      showLoadingError(s.slice(0, 300));
      if (/EPERM|symlink/i.test(s)) {
        promptEnableDevMode();
      }
    }
  });
  child.on('exit', (code) => {
    console.log('[dsh] exited with', code);
    if (!apiUrl && bootTimer) clearTimeout(bootTimer);
    if (win && !win.isDestroyed() && apiUrl) {
      win.webContents.reload();
    }
  });
}

function createWindow() {
  const iconPath = path.join(APP_DIR, 'build', 'icon.png');
  win = new BrowserWindow({
    width: 1280,
    height: 860,
    title: 'dsh 简易封装',
    autoHideMenuBar: true,
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(APP_DIR, 'preload.js'),
    },
  });

  win.on('closed', () => {
    win = null;
    killTree(child);
    app.quit();
  });

  if (apiUrl) win.loadURL(apiUrl);
  else win.loadFile('loading.html');
}

function quitApp() {
  if (updateTimer) clearInterval(updateTimer);
  killTree(child);
  app.quit();
}

function buildMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        { label: '退出 dsh 简易封装', accelerator: 'Ctrl+Q', click: quitApp },
      ],
    },
    { role: 'editMenu', label: '编辑' },
    { role: 'viewMenu', label: '视图' },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

let updateAvailable = null;

async function checkForUpdate(notify = false) {
  const current = currentDshVersion();
  const latest = await fetchLatestDshVersion();
  if (!latest || !current) return;
  if (compareVersions(latest, current) > 0) {
    updateAvailable = { current, latest };
    console.log(`[update] ${current} -> ${latest}`);
    if (win && !win.isDestroyed()) {
      win.webContents.send('update-available', updateAvailable);
    }
  } else if (notify && win && !win.isDestroyed()) {
    win.webContents.send('update-none');
  }
}

function getUpdateCommand() {
  const npm = path.join(RES_DIR, 'portable-node', 'npm.cmd');
  const nodeDir = path.dirname(npm);
  return {
    cmd: npm,
    args: ['install', '@deepseek-ai/dsh@latest'],
    env: { ...process.env, PATH: nodeDir + path.delimiter + process.env.PATH },
  };
}

function runUpdate() {
  const { cmd, args, env } = getUpdateCommand();
  console.log('[update] running:', cmd, args.join(' '));
  const proc = spawn(cmd, args, { cwd: APP_DIR, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  proc.on('exit', (code) => {
    console.log('[update] finished with', code);
    if (win && !win.isDestroyed()) {
      win.webContents.send('update-result', code === 0);
    }
    if (code === 0) {
      setTimeout(() => {
        killTree(child);
        app.relaunch();
        app.exit(0);
      }, 800);
    }
  });
}

function startUpdateChecks() {
  checkForUpdate();
  updateTimer = setInterval(() => checkForUpdate(), 1000 * 60 * 60 * 3);
}

const DSH_HOME = process.env.DSH_HOME || path.join(app.getPath('home'), '.dsh');
const PROFILE_DIR = path.join(DSH_HOME, 'profiles', 'web');
const PATCH_FILE = path.join(PROFILE_DIR, 'cordis.patch.yml');

function readYamlSafe(p) {
  try {
    const raw = fs.readFileSync(p, 'utf8');
    const rows = raw.split(/\r?\n/);
    const out = [];
    for (const line of rows) {
      const t = line.trim();
      if (t === '-' || t === '[]' || t === '#' || t.startsWith('#')) continue;
      if (t.startsWith('-')) {
        out.push({ raw: line, indent: line.match(/^ */)[0].length });
      }
    }
    return out;
  } catch {
    return [];
  }
}

function listSkills() {
  const roots = [path.join(DSH_HOME, 'skills')];
  const out = [];
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    let entries = [];
    try { entries = fs.readdirSync(root, { withFileTypes: true }); } catch { continue; }
    for (const e of entries) {
      const full = path.join(root, e.name);
      let name = e.name, desc = '', enabled = true;
      if (e.isDirectory()) {
        const md = path.join(full, 'SKILL.md');
        if (!fs.existsSync(md)) continue;
        try {
          const head = fs.readFileSync(md, 'utf8').slice(0, 2000);
          const m = head.match(/^name:\s*["']?([^"'\r\n]+)/m);
          if (m) name = m[1].trim();
          const d = head.match(/^description:\s*["']?([^"'\r\n]+)/m);
          if (d) desc = d[1].trim();
        } catch {}
      } else if (e.name.endsWith('.md')) {
        name = e.name.replace(/\.md$/, '');
        try {
          const head = fs.readFileSync(full, 'utf8').slice(0, 2000);
          const d = head.match(/^description:\s*["']?([^"'\r\n]+)/m);
          if (d) desc = d[1].trim();
        } catch {}
      } else continue;
      const disabledFile = path.join(full, '.disabled');
      enabled = !fs.existsSync(disabledFile);
      out.push({ name, desc, enabled, path: full, source: 'user' });
    }
  }
  return out;
}

function listOpencodeSkills() {
  const dirs = [
    path.join(app.getPath('home'), '.config', 'opencode', 'skills'),
  ];
  const out = [];
  for (const root of dirs) {
    if (!fs.existsSync(root)) continue;
    let entries = [];
    try { entries = fs.readdirSync(root, { withFileTypes: true }); } catch { continue; }
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      const md = path.join(root, e.name, 'SKILL.md');
      if (!fs.existsSync(md)) continue;
      let name = e.name, desc = '';
      try {
        const head = fs.readFileSync(md, 'utf8').slice(0, 2000);
        const m = head.match(/^name:\s*["']?([^"'\r\n]+)/m);
        if (m) name = m[1].trim();
        const d = head.match(/^description:\s*["']?([^"'\r\n]+)/m);
        if (d) desc = d[1].trim();
      } catch {}
      out.push({ name, desc, enabled: true, path: md, source: 'opencode', readonly: true });
    }
  }
  return out;
}

function setSkillEnabled(name, enabled) {
  const root = path.join(DSH_HOME, 'skills');
  if (!fs.existsSync(root)) return false;
  const full = path.join(root, name);
  const disabledFile = path.join(root, name, '.disabled');
  if (enabled) {
    if (fs.existsSync(disabledFile)) fs.unlinkSync(disabledFile);
  } else {
    try { fs.writeFileSync(disabledFile, 'disabled\n'); } catch { return false; }
  }
  return true;
}

function listPlugins() {
  const plugins = [];
  const loaded = [];
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(PROFILE_DIR, 'package.json'), 'utf8'));
    loaded.push(...(pkg.dsh?.profile?.bundles || []));
  } catch {}
  const patch = readYamlSafe(PATCH_FILE);
  const patchedDisabled = new Set();
  for (const row of patch) {
    const m = row.raw.match(/-\s*id:\s*["']?([\w@/.-]+)/);
    if (m) patchedDisabled.add(m[1]);
  }
  for (const p of loaded) {
    const short = p.replace(/^@deepseek-ai\//, '').replace(/^dsh-/, '');
    plugins.push({ id: p, name: short, enabled: true, source: 'bundle' });
  }
  for (const p of patch) {
    const m = p.raw.match(/-\s*id:\s*["']?([\w@/.-]+)/);
    if (!m) continue;
    plugins.push({ id: m[1], name: m[1], enabled: false, source: 'patch' });
  }
  return plugins;
}

function setPluginEnabled(id, enabled) {
  try {
    let content = '';
    if (fs.existsSync(PATCH_FILE)) content = fs.readFileSync(PATCH_FILE, 'utf8');
    const rows = content.split(/\r?\n/);
    const out = [];
    let found = false;
    let lastEntryIdx = -1;
    for (let i = 0; i < rows.length; i++) {
      const line = rows[i];
      const t = line.trim();
      if (t.startsWith('- id:')) lastEntryIdx = out.length;
    }
    for (const line of rows) {
      const t = line.trim();
      const m = t.match(/^-?\s*id:\s*["']?([\w@/.-]+)/);
      if (m && m[1] === id) {
        found = true;
        if (enabled) continue; // remove entry => enable
        continue; // keep (already in patch = disabled)
      }
      out.push(line);
    }
    if (!enabled && !found) {
      let indent = '  ';
      if (lastEntryIdx >= 0) {
        const prev = out[lastEntryIdx];
        const mm = prev.match(/^(\s*)/);
        indent = mm ? mm[1] : '  ';
      }
      const insertAt = Math.max(0, lastEntryIdx + 1);
      out.splice(insertAt, 0, `${indent}- id: ${id}\n${indent}  disabled: true`);
    }
    fs.writeFileSync(PATCH_FILE, out.join('\n'), 'utf8');
    return true;
  } catch {
    return false;
  }
}

function computeUsage() {
  const stats = { sessions: 0, messages: 0, bytes: 0, workspaces: 0 };
  const sessionsDir = path.join(DSH_HOME, 'sessions');
  if (fs.existsSync(sessionsDir)) {
    try {
      for (const f of fs.readdirSync(sessionsDir, { withFileTypes: true })) {
        if (!f.isDirectory()) continue;
        const wsDir = path.join(sessionsDir, f.name);
        stats.workspaces++;
        for (const s of fs.readdirSync(wsDir)) {
          if (!s.startsWith('session-')) continue;
          const sdir = path.join(wsDir, s);
          if (!fs.statSync(sdir).isDirectory()) continue;
          stats.sessions++;
          for (const sf of fs.readdirSync(sdir)) {
            const full = path.join(sdir, sf);
            try { stats.bytes += fs.statSync(full).size; } catch {}
            if (sf.endsWith('.jsonl') || sf.endsWith('.zstd')) stats.messages++;
          }
        }
      }
    } catch {}
  }
  return stats;
}

ipcMain.handle('panel:skills', () => listSkills());
ipcMain.handle('panel:opencode-skills', () => listOpencodeSkills());
ipcMain.handle('panel:set-skill', (_e, name, enabled) => setSkillEnabled(name, enabled));
ipcMain.handle('panel:plugins', () => listPlugins());
ipcMain.handle('panel:set-plugin', (_e, id, enabled) => setPluginEnabled(id, enabled));
ipcMain.handle('panel:usage', () => computeUsage());

ipcMain.on('check-update', () => checkForUpdate(true));
ipcMain.on('do-update', () => runUpdate());

app.whenReady().then(() => {
  buildMenu();
  createWindow();
  startDsh();
  startUpdateChecks();
});

app.on('window-all-closed', () => {
  quitApp();
});

app.on('before-quit', () => {
  if (updateTimer) clearInterval(updateTimer);
  killTree(child);
});
