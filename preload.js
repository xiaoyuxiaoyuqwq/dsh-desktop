const { ipcRenderer, contextBridge } = require('electron');

const WHALE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="100%" height="100%"><path fill="currentColor" d="M48.8354 10.0479C48.3232 9.79199 48.1025 10.2798 47.8032 10.5278C47.7007 10.6079 47.6143 10.7119 47.5273 10.8076C46.7793 11.624 45.9048 12.1597 44.7622 12.0957C43.0923 12 41.666 12.5356 40.4058 13.8398C40.1377 12.2319 39.2476 11.272 37.8926 10.6558C37.1836 10.3359 36.4668 10.0156 35.9702 9.31982C35.6235 8.82373 35.5293 8.27197 35.356 7.72754C35.2456 7.3999 35.1353 7.06396 34.7651 7.00781C34.3633 6.94385 34.2056 7.2876 34.0479 7.57568C33.418 8.75195 33.1733 10.0479 33.1973 11.3599C33.2524 14.312 34.4736 16.6641 36.8999 18.3359C37.1758 18.5278 37.2466 18.7197 37.1597 19C36.9946 19.5757 36.7974 20.1357 36.624 20.7119C36.5137 21.0801 36.3486 21.1597 35.9624 21C34.6309 20.4321 33.481 19.5918 32.4644 18.5757C30.7393 16.8721 29.1792 14.9917 27.2334 13.52C26.7764 13.1758 26.3193 12.856 25.8467 12.5518C23.8618 10.584 26.1069 8.96777 26.627 8.77588C27.1704 8.57568 26.8159 7.8877 25.0591 7.896C23.3022 7.90381 21.6953 8.50391 19.647 9.30371C19.3477 9.42383 19.0322 9.51172 18.7095 9.58398C16.8501 9.22363 14.9199 9.14355 12.9033 9.37598C9.10596 9.80762 6.07275 11.6396 3.84326 14.7681C1.16455 18.5278 0.53418 22.7998 1.30664 27.2559C2.11768 31.9521 4.46582 35.8398 8.07373 38.8799C11.8159 42.0322 16.1255 43.5762 21.041 43.2803C24.0269 43.104 27.3516 42.6963 31.1016 39.4561C32.0469 39.936 33.0396 40.1279 34.686 40.272C35.9546 40.3921 37.1758 40.208 38.1211 40.0078C39.6021 39.688 39.4995 38.2881 38.9639 38.0322C34.623 35.9678 35.5762 36.8081 34.71 36.1279C36.9155 33.4639 40.2402 30.6958 41.54 21.728C41.6426 21.0161 41.5557 20.5679 41.54 19.9917C41.5322 19.6396 41.6108 19.5039 42.0049 19.4639C43.0923 19.3359 44.1479 19.0317 45.1167 18.4878C47.9292 16.9199 49.064 14.3438 49.3315 11.2559C49.3711 10.7837 49.3237 10.2959 48.8354 10.0479ZM24.3262 37.8398C20.1196 34.4639 18.0791 33.3521 17.2358 33.3999C16.4482 33.4482 16.5898 34.3682 16.7632 34.9678C16.9443 35.5601 17.1812 35.9683 17.5117 36.4878C17.7402 36.832 17.8979 37.3442 17.2832 37.728C15.9282 38.584 13.5728 37.4399 13.4624 37.3838C10.7207 35.7358 8.42822 33.5601 6.81348 30.584C5.25342 27.7197 4.34766 24.6479 4.19775 21.3677C4.1582 20.5757 4.38672 20.2959 5.15869 20.1519C6.17529 19.96 7.22314 19.9199 8.23926 20.0718C12.5327 20.7119 16.1885 22.6719 19.2529 25.7759C21.002 27.5439 22.3252 29.6558 23.6885 31.7202C25.1377 33.9121 26.6978 36 28.6831 37.7119C29.3843 38.312 29.9434 38.7681 30.479 39.104C28.8643 39.2881 26.1699 39.3281 24.3262 37.8398ZM26.3433 24.6001C26.3433 24.248 26.6191 23.9678 26.9658 23.9678C27.0444 23.9678 27.1152 23.9839 27.1782 24.0078C27.2651 24.04 27.3438 24.0879 27.4067 24.1602C27.5171 24.272 27.5801 24.4321 27.5801 24.6001C27.5801 24.9521 27.3042 25.2319 26.9575 25.2319C26.6108 25.2319 26.3433 24.9521 26.3433 24.6001ZM32.6064 27.8799C32.2046 28.0479 31.8027 28.1919 31.4165 28.208C30.8179 28.2397 30.1641 27.9922 29.8096 27.688C29.2583 27.2158 28.8643 26.9521 28.6987 26.1279C28.6279 25.7759 28.6675 25.2319 28.7305 24.9199C28.8721 24.248 28.7144 23.8159 28.2495 23.4238C27.8716 23.104 27.3911 23.0161 26.8633 23.0161C26.666 23.0161 26.4849 22.9277 26.3511 22.856C26.1304 22.7441 25.9492 22.4639 26.1226 22.1201C26.1777 22.0078 26.4458 21.7358 26.5088 21.688C27.2256 21.272 28.0527 21.4077 28.8169 21.7197C29.5259 22.0161 30.0615 22.5601 30.834 23.3281C31.6216 24.2559 31.7632 24.5117 32.2124 25.208C32.5669 25.752 32.8901 26.312 33.1104 26.9521C33.2446 27.3521 33.0713 27.6802 32.6064 27.8799Z"/></svg>`;

const CSS = `
#dsh-toggle { position:fixed; right:16px; top:16px; z-index:2147483646; width:40px; height:40px; border-radius:10px; background:linear-gradient(135deg,#1a2233,#0b0e17); border:1px solid #2a3550; box-shadow:0 4px 14px rgba(0,0,0,.5); cursor:pointer; display:flex; align-items:center; justify-content:center; color:#e6e8ee; transition:transform .15s; }
#dsh-toggle:hover { transform:scale(1.08); }
#dsh-panel { position:fixed; top:0; right:0; height:100vh; width:360px; max-width:90vw; z-index:2147483647; background:#0d1119; border-left:1px solid #2a3550; box-shadow:-8px 0 24px rgba(0,0,0,.5); display:flex; flex-direction:column; transform:translateX(105%); transition:transform .25s ease; font-family:system-ui,sans-serif; color:#c9d1e3; }
#dsh-panel.open { transform:translateX(0); }
#dsh-panel .p-head { padding:14px 16px; border-bottom:1px solid #202a3d; display:flex; align-items:center; justify-content:space-between; }
#dsh-panel .p-title { font-size:14px; font-weight:700; display:flex; align-items:center; gap:8px; }
#dsh-panel .p-title svg { width:22px; height:22px; color:#22d3ee; }
#dsh-panel .p-close { cursor:pointer; color:#8b93ab; font-size:18px; padding:4px 8px; border-radius:6px; }
#dsh-panel .p-close:hover { background:#1a2233; color:#fff; }
#dsh-panel .p-body { flex:1; overflow-y:auto; padding:8px 0; }
#dsh-panel .p-sec { padding:10px 16px; border-bottom:1px solid #141c2b; }
#dsh-panel .p-sec h4 { margin:0 0 8px; font-size:12px; color:#8b93ab; text-transform:uppercase; letter-spacing:.5px; }
#dsh-panel .row { display:flex; align-items:center; justify-content:space-between; padding:7px 0; border-bottom:1px solid #141c2b; }
#dsh-panel .row:last-child { border-bottom:none; }
#dsh-panel .row .r-name { font-size:13px; }
#dsh-panel .row .r-desc { font-size:11px; color:#6b7280; margin-top:2px; }
#dsh-panel .sw { position:relative; width:36px; height:20px; flex:none; }
#dsh-panel .sw input { opacity:0; width:0; height:0; }
#dsh-panel .sw .sl { position:absolute; inset:0; border-radius:10px; background:#2a3550; transition:.2s; cursor:pointer; }
#dsh-panel .sw .sl:before { content:''; position:absolute; left:2px; top:2px; width:16px; height:16px; border-radius:50%; background:#8b93ab; transition:.2s; }
#dsh-panel .sw input:checked + .sl { background:#22d3ee; }
#dsh-panel .sw input:checked + .sl:before { transform:translateX(16px); background:#0b0e17; }
#dsh-panel .empty { color:#6b7280; font-size:12px; padding:6px 0; }
#dsh-panel .usage-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
#dsh-panel .u-card { background:#141c2b; border:1px solid #202a3d; border-radius:8px; padding:10px; text-align:center; }
#dsh-panel .u-card .u-n { font-size:20px; font-weight:700; color:#22d3ee; }
#dsh-panel .u-card .u-l { font-size:11px; color:#8b93ab; margin-top:2px; }
#dsh-panel .p-foot { padding:10px 16px; border-top:1px solid #202a3d; font-size:11px; color:#6b7280; text-align:center; }
`;

let panel = null;
let toggle = null;

function fmtBytes(n) {
  if (n < 1024) return n + ' B';
  if (n < 1048576) return (n / 1024).toFixed(1) + ' KB';
  return (n / 1048576).toFixed(1) + ' MB';
}

function el(tag, attrs, parent) {
  const e = document.createElement(tag);
  if (attrs) for (const k in attrs) {
    if (k === 'style') e.style.cssText = attrs[k];
    else if (k === 'on') { for (const ev in attrs[k]) e.addEventListener(ev, attrs[k][ev]); }
    else e.setAttribute(k, attrs[k]);
  }
  if (parent) parent.appendChild(e);
  return e;
}

function injectCSS() {
  let s = document.getElementById('dsh-panel-css');
  if (!s) {
    s = document.createElement('style');
    s.id = 'dsh-panel-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }
}

async function openPanel() {
  injectCSS();
  if (toggle) toggle.style.display = 'none';
  if (!panel) {
    panel = el('div', { id: 'dsh-panel' }, document.body);
    el('div', { class: 'p-head' }, panel).innerHTML =
      '<div class="p-title">' + WHALE_SVG + '<span>dsh 控制面板</span></div>' +
      '<span class="p-close" id="dsh-panel-close">✕</span>';
    document.getElementById('dsh-panel-close').onclick = closePanel;
    const body = el('div', { class: 'p-body' }, panel);
    body.appendChild(await buildUsage());
    body.appendChild(await buildSkills());
    body.appendChild(await buildPlugins());
    el('div', { class: 'p-foot' }, panel).textContent = '切换 Skill / 插件后需重启 dsh 生效';
  }
  panel.classList.add('open');
}

function closePanel() {
  if (panel) panel.classList.remove('open');
  if (toggle) toggle.style.display = '';
}

async function buildUsage() {
  const sec = el('div', { class: 'p-sec' }, null);
  el('h4', {}, sec).textContent = '用量';
  const grid = el('div', { class: 'usage-grid' }, sec);
  const u = await ipcRenderer.invoke('panel:usage');
  const cards = [
    ['会话数', u.sessions],
    ['工作区', u.workspaces],
    ['会话文件', u.messages],
    ['占用空间', fmtBytes(u.bytes)],
  ];
  for (const [label, val] of cards) {
    const c = el('div', { class: 'u-card' }, grid);
    el('div', { class: 'u-n' }, c).textContent = val;
    el('div', { class: 'u-l' }, c).textContent = label;
  }
  return sec;
}

async function buildSkills() {
  const sec = el('div', { class: 'p-sec' }, null);
  el('h4', {}, sec).textContent = 'Skill（dsh）';
  const skills = await ipcRenderer.invoke('panel:skills');
  if (!skills.length) { el('div', { class: 'empty' }, sec).textContent = '暂无（~/.dsh/skills 为空）'; }
  for (const s of skills) {
    const row = el('div', { class: 'row' }, sec);
    const info = el('div', null, row);
    el('div', { class: 'r-name' }, info).textContent = s.name;
    if (s.desc) el('div', { class: 'r-desc' }, info).textContent = s.desc;
    const sw = el('label', { class: 'sw' }, row);
    const cb = el('input', { type: 'checkbox' }, sw);
    cb.checked = s.enabled;
    el('span', { class: 'sl' }, sw);
    cb.addEventListener('change', async () => {
      await ipcRenderer.invoke('panel:set-skill', s.name, cb.checked);
    });
  }

  return sec;
}

async function buildPlugins() {
  const sec = el('div', { class: 'p-sec' }, null);
  el('h4', {}, sec).textContent = '插件';
  const plugins = await ipcRenderer.invoke('panel:plugins');
  if (!plugins.length) { el('div', { class: 'empty' }, sec).textContent = '暂无插件信息'; return sec; }
  for (const p of plugins) {
    const row = el('div', { class: 'row' }, sec);
    const info = el('div', null, row);
    el('div', { class: 'r-name' }, info).textContent = p.name;
    const sw = el('label', { class: 'sw' }, row);
    const cb = el('input', { type: 'checkbox' }, sw);
    cb.checked = p.enabled;
    el('span', { class: 'sl' }, sw);
    cb.addEventListener('change', async () => {
      await ipcRenderer.invoke('panel:set-plugin', p.id, cb.checked);
    });
  }
  return sec;
}

function createToggle() {
  injectCSS();
  if (toggle) return;
  toggle = el('div', { id: 'dsh-toggle', title: '打开控制面板', on: { click: openPanel } }, document.body);
  toggle.innerHTML = WHALE_SVG;
}

let badge = null;
let badgeText = null;

function createBadge(info) {
  removeBadge();
  badge = document.createElement('div');
  badge.id = 'dsh-update-badge';
  Object.assign(badge.style, {
    position: 'fixed', right: '24px', bottom: '24px', zIndex: '2147483645',
    width: '44px', height: '44px', borderRadius: '12px',
    background: 'linear-gradient(135deg,#1a2233,#0b0e17)', border: '1px solid #2a3550',
    boxShadow: '0 4px 16px rgba(0,0,0,.5)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#e6e8ee', transition: 'transform .15s', fontFamily: 'system-ui,sans-serif',
  });
  badge.innerHTML = WHALE_SVG;
  badge.title = `发现新版本 ${info.latest}（当前 ${info.current}），点击自动更新`;
  const dot = document.createElement('div');
  Object.assign(dot.style, {
    position: 'absolute', top: '-4px', right: '-4px', width: '16px', height: '16px',
    borderRadius: '50%', background: '#ff4d4f', color: '#fff', fontSize: '10px',
    fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '2px solid #0b0e17',
  });
  dot.textContent = '1';
  badge.appendChild(dot);
  badge.addEventListener('mouseenter', () => { badge.style.transform = 'scale(1.08)'; });
  badge.addEventListener('mouseleave', () => { badge.style.transform = 'scale(1)'; });
  badge.addEventListener('click', () => {
    if (!confirm(`检测到新版本 ${info.latest}（当前 ${info.current}）。\n是否立即更新并重启？`)) return;
    badge.style.opacity = '.5';
    badge.style.pointerEvents = 'none';
    badge.innerHTML = '<span style="font-size:12px">更新中…</span>';
    badgeText = document.createElement('div');
    Object.assign(badgeText.style, {
      position: 'absolute', bottom: '-22px', right: '0', fontSize: '11px', color: '#8b93ab', whiteSpace: 'nowrap',
    });
    badgeText.textContent = '正在安装新版本…';
    badge.appendChild(badgeText);
    ipcRenderer.send('do-update');
  });
  document.body.appendChild(badge);
}

function showUpToDate() {
  removeBadge();
  const toast = document.createElement('div');
  Object.assign(toast.style, {
    position: 'fixed', right: '24px', bottom: '24px', zIndex: '2147483645',
    background: '#131a28', color: '#8b93ab', padding: '10px 16px', borderRadius: '8px',
    fontSize: '13px', boxShadow: '0 4px 16px rgba(0,0,0,.5)', border: '1px solid #2a3550',
    fontFamily: 'system-ui,sans-serif',
  });
  toast.textContent = '已是最新版本';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

function removeBadge() {
  if (badge) { badge.remove(); badge = null; }
}

ipcRenderer.on('update-available', (_, info) => createBadge(info));
ipcRenderer.on('update-none', () => showUpToDate());
ipcRenderer.on('update-result', (_, ok) => {
  if (badge) {
    badge.innerHTML = `<span style="font-size:13px;color:${ok ? '#52c41a' : '#ff4d4f'}">${ok ? '✓' : '✗'}</span>`;
    badge.style.pointerEvents = '';
    badge.title = ok ? '更新成功，即将重启' : '更新失败，请稍后重试';
    if (badgeText) { badgeText.textContent = ok ? '更新成功，正在重启…' : '更新失败'; }
  }
});

function initOverlay() {
  injectCSS();
  createToggle();
  setTimeout(() => ipcRenderer.send('check-update'), 5000);
}

contextBridge.exposeInMainWorld('dshUpdater', {
  check: () => ipcRenderer.send('check-update'),
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initOverlay);
} else {
  initOverlay();
}
