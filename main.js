const { app, BrowserWindow, dialog } = require('electron');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = process.env.DSH_PORT || '0';
const HOST = process.env.DSH_HOST || '127.0.0.1';
const NODE_MIN = [22, 19, 0];
const { execFile } = require('child_process');

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
  const portable = path.join(__dirname, 'portable-node', 'node.exe');
  if (await checkNode(portable)) return portable;
  if (await checkNode('node')) return 'node';
  return null;
}

let child = null;
let win = null;
let apiUrl = null;

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

  const dshBin = path.join(__dirname, 'node_modules', '@deepseek-ai', 'dsh', 'lib', 'bin.js');
  if (!fs.existsSync(dshBin)) {
    dialog.showErrorBox('缺少 dsh', '未找到 @deepseek-ai/dsh，请先运行 setup.cmd 安装依赖。');
    app.exit(1);
    return;
  }

  child = spawn(node, ['--expose-internals', dshBin, 'web', '--host', HOST, '--port', PORT], {
    cwd: __dirname,
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
  win = new BrowserWindow({
    width: 1280,
    height: 860,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
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

app.whenReady().then(() => {
  createWindow();
  startDsh();
});

app.on('window-all-closed', () => {
  if (child) child.kill();
  app.quit();
});
