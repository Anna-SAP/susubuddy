// Electron main process — owns the floating buddy window, tray, IPC, and persistence.
const { app, BrowserWindow, Tray, Menu, ipcMain, screen, nativeImage, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// ───────────────────────────── data persistence ─────────────────────────────
const dataDir = app.getPath('userData');
const dataFile = path.join(dataDir, 'archive.json');

function loadArchive() {
  try {
    if (fs.existsSync(dataFile)) return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  } catch (e) { console.error('load archive failed', e); }
  return { items: [] };
}
function saveArchive(data) {
  try { fs.writeFileSync(dataFile, JSON.stringify(data, null, 2)); }
  catch (e) { console.error('save archive failed', e); }
}

let archive = loadArchive();

// ───────────────────────────── windows ─────────────────────────────
const BUDDY_SIZE = 160; // window side (buddy + padding)
let buddyWin = null;
let thoughtWin = null;
let archiveWin = null;
let tray = null;

function positionBottomRight(win, w, h, marginRight = 24, marginBottom = 60) {
  const { workArea } = screen.getPrimaryDisplay();
  const x = workArea.x + workArea.width - w - marginRight;
  const y = workArea.y + workArea.height - h - marginBottom;
  win.setBounds({ x, y, width: w, height: h });
}

function createBuddyWindow() {
  buddyWin = new BrowserWindow({
    width: BUDDY_SIZE,
    height: BUDDY_SIZE,
    frame: false,
    transparent: true,
    resizable: false,
    movable: true,
    minimizable: false,
    maximizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: false,
    focusable: true,
    show: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  buddyWin.setAlwaysOnTop(true, 'screen-saver');
  buddyWin.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: false });
  positionBottomRight(buddyWin, BUDDY_SIZE, BUDDY_SIZE);
  buddyWin.loadFile(path.join(__dirname, 'renderer', 'buddy.html'));
  buddyWin.once('ready-to-show', () => buddyWin.show());
  buddyWin.on('closed', () => { buddyWin = null; });
}

function openThoughtWindow() {
  if (thoughtWin && !thoughtWin.isDestroyed()) { thoughtWin.focus(); return; }
  const w = 380, h = 300;
  thoughtWin = new BrowserWindow({
    width: w, height: h,
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  // anchor above-left of the buddy
  const buddyBounds = buddyWin ? buddyWin.getBounds() : { x: 0, y: 0, width: 0, height: 0 };
  thoughtWin.setBounds({
    x: buddyBounds.x + buddyBounds.width - w + 10,
    y: buddyBounds.y - h - 8,
    width: w, height: h,
  });
  thoughtWin.loadFile(path.join(__dirname, 'renderer', 'thought.html'));
  thoughtWin.on('closed', () => { thoughtWin = null; });
  thoughtWin.on('blur', () => { if (thoughtWin && !thoughtWin.isDestroyed()) thoughtWin.close(); });
}

function openArchiveWindow() {
  if (archiveWin && !archiveWin.isDestroyed()) { archiveWin.focus(); return; }
  archiveWin = new BrowserWindow({
    width: 900, height: 640,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    resizable: true,
    minimizable: true,
    maximizable: true,
    skipTaskbar: false,
    hasShadow: true,
    title: 'susubuddy — archive',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  archiveWin.loadFile(path.join(__dirname, 'renderer', 'archive.html'));
  archiveWin.on('closed', () => { archiveWin = null; });
}

// ───────────────────────────── tray ─────────────────────────────
function buildTrayIcon() {
  // Windows uses .ico; mac/linux use PNG (tray won't render .ico on mac)
  const pngPath = path.join(__dirname, 'build', 'trayIcon.png');
  const icoPath = path.join(__dirname, 'build', 'icon.ico');
  try {
    if (process.platform === 'win32' && fs.existsSync(icoPath)) {
      return nativeImage.createFromPath(icoPath);
    }
    if (fs.existsSync(pngPath)) {
      const img = nativeImage.createFromPath(pngPath);
      if (process.platform === 'darwin') img.setTemplateImage(false);
      return img;
    }
  } catch {}
  return nativeImage.createEmpty();
}

function createTray() {
  tray = new Tray(buildTrayIcon());
  tray.setToolTip('susubuddy');
  const menu = Menu.buildFromTemplate([
    { label: 'Show buddy', click: () => { if (buddyWin) buddyWin.show(); else createBuddyWindow(); } },
    { label: 'Hide buddy', click: () => { if (buddyWin) buddyWin.hide(); } },
    { type: 'separator' },
    { label: 'Quick thought…', click: () => openThoughtWindow() },
    { label: 'Open archive…', click: () => openArchiveWindow() },
    { type: 'separator' },
    { label: 'Open data folder', click: () => shell.openPath(dataDir) },
    { type: 'separator' },
    { label: 'Quit susubuddy', click: () => { app.quit(); } },
  ]);
  tray.setContextMenu(menu);
  tray.on('click', () => { if (buddyWin) { buddyWin.isVisible() ? buddyWin.hide() : buddyWin.show(); } });
}

// ───────────────────────────── ipc ─────────────────────────────
ipcMain.handle('archive:list', () => archive);

ipcMain.handle('archive:add-note', (_e, { text, tags }) => {
  const item = {
    id: Date.now().toString(36),
    type: 'note',
    text: String(text || '').trim(),
    tags: Array.isArray(tags) ? tags : [],
    createdAt: new Date().toISOString(),
  };
  if (!item.text) return { ok: false, error: 'empty' };
  archive.items.unshift(item);
  saveArchive(archive);
  return { ok: true, item };
});

ipcMain.on('buddy:open-menu', () => {
  if (!buddyWin) return;
  const b = buddyWin.getBounds();
  const menu = Menu.buildFromTemplate([
    { label: '💭 Quick thought', click: () => openThoughtWindow() },
    { label: '📚 Open archive', click: () => openArchiveWindow() },
    { type: 'separator' },
    { label: 'Hide buddy', click: () => buddyWin.hide() },
    { label: 'Quit', click: () => app.quit() },
  ]);
  menu.popup({ window: buddyWin });
});

ipcMain.on('window:close', (e) => {
  const w = BrowserWindow.fromWebContents(e.sender);
  if (w && !w.isDestroyed()) w.close();
});

ipcMain.on('buddy:drag-move', (e, { dx, dy }) => {
  if (!buddyWin) return;
  const b = buddyWin.getBounds();
  buddyWin.setBounds({ x: b.x + dx, y: b.y + dy, width: b.width, height: b.height });
});

// ───────────────────────────── lifecycle ─────────────────────────────
// Single-instance lock so running the installed exe twice just focuses existing buddy
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => { if (buddyWin) { buddyWin.show(); buddyWin.focus(); } });

  app.whenReady().then(() => {
    createBuddyWindow();
    createTray();
  });

  app.on('window-all-closed', (e) => {
    // keep running in tray
    e.preventDefault && e.preventDefault();
  });
}
