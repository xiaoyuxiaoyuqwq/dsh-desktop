const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const { spawn, execFile } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = process.env.DSH_PORT || '0';
const HOST = process.env.DSH_HOST || '127.0.0.1';
const NODE_MIN = [22, 19, 0];
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

async function startDsh() {
  const node = await findNode();
  if (!node) {
    dialog.showErrorBox(
      'Node 版本过低',
      `需要 Node.js >= ${NODE_MIN.join('.')}。\n请运行 setup.cmd 自动安装便携版，或安装新版 Node.js 后重试。`
    );
    app.exit(1);
    return;
  }
  console.log('[dsh] using node:', node);

  const dshBin = dshBinPath();
  if (!dshBin) {
    dialog.showErrorBox('缺少 dsh', '未找到 @deepseek-ai/dsh，请先运行 setup.cmd 安装依赖。');
    app.exit(1);
    return;
  }

  child = spawn(node, ['--expose-internals', dshBin, 'web', '--host', HOST, '--port', PORT], {
    cwd: APP_DIR,
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout.on('data', (d) => {
    const s = String(d);
    if (!apiUrl) {
      const m = s.match(/http:\/\/[\w.:]+/);
      if (m) {
        apiUrl = m[0];
        console.log('[dsh] listening on', apiUrl);
        if (win) win.loadURL(apiUrl);
      }
    }
    console.log('[dsh]', s.trim());
  });
  child.stderr.on('data', (d) => console.log('[dsh:err]', String(d).trim()));
  child.on('exit', (code) => {
    console.log('[dsh] exited with', code);
    if (!win || win.isDestroyed()) return;
    win.webContents.reload();
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
    if (child) child.kill();
    app.quit();
  });

  if (apiUrl) win.loadURL(apiUrl);
  else win.loadFile('loading.html');
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
        child && child.kill();
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

ipcMain.on('check-update', () => checkForUpdate(true));
ipcMain.on('do-update', () => runUpdate());

app.whenReady().then(() => {
  createWindow();
  startDsh();
  startUpdateChecks();
});

app.on('window-all-closed', () => {
  if (child) child.kill();
  app.quit();
});

app.on('before-quit', () => {
  if (updateTimer) clearInterval(updateTimer);
  if (child) child.kill();
});
