import { BrowserWindow, Menu, app, ipcMain, nativeTheme, protocol } from 'electron';
import contextMenu from 'electron-context-menu';
import ElectronStore from 'electron-store';
import url from 'url';
import { getFontFamilies, loadFontFeatures } from './backendlogic/fontfamilies';
import menu from './backendlogic/menu';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

if (require('electron-squirrel-startup')) {
  app.quit();
}

contextMenu();
const store = new ElectronStore<Settings>();
Menu.setApplicationMenu(Menu.buildFromTemplate(menu));

if (store.store.darkMode == null) {
  store.set('darkMode', nativeTheme.themeSource == 'dark');
}
setDarkMode();

const createWindow = (): void => {

  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      spellcheck: false
    },
  });

  mainWindow.maximize();

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(() => {
  protocol.registerFileProtocol('font', (request, callback) => {
    const filePath = url.fileURLToPath('file://' + request.url.slice('font://'.length));
    callback(filePath);
  });
});

ipcMain.handle('font-families', async (): Promise<Family[]> => await getFontFamilies(store.store.fontFolders || []));
ipcMain.handle('font-features', async (_event, filePath: string): Promise<FontDetails> => await loadFontFeatures(filePath));
ipcMain.handle('get-store-value', async () => store.store);
ipcMain.handle('set-store-value', async (_event, settings: Settings) => {
  store.set(settings);
  setDarkMode();
});

function setDarkMode() {
  if (store.store.darkMode) {
    nativeTheme.themeSource = 'dark';
  }
  else {
    nativeTheme.themeSource = 'light';
  }
}
