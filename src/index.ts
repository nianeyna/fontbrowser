import { app, BrowserWindow, ipcMain, protocol } from 'electron';
import { FontBrowser } from './defs'
import contextMenu from 'electron-context-menu';
import fontkit from 'fontkit';
import glob from 'glob';
import url from 'url';

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

contextMenu();

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
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

// IPC setups
ipcMain.handle('font-families', async (): Promise<[string, Font[]][]> => await getFontFamilies());
ipcMain.handle('font-features', async (_event, filePath: string): Promise<FontDetails> => await loadFontFeatures(filePath));

// backend logic
async function getFontFamilies(): Promise<[string, Font[]][]> {
  const fonts = await getFonts();
  return sortFonts(fonts);
}

async function loadFontFeatures(filePath: string): Promise<FontDetails> {
  const font = await fontkit.open(filePath);
  const features = [...new Set(font.availableFeatures)]; // remove duplicates
  const characters = font.characterSet;
  // may not be necessary to do this on the backend... but also no reason not to afaik
  const characterString = [...String.fromCodePoint(...characters)].join(' ');
  return new FontBrowser.FontDetailsConstructor(features, characters, characterString);
}

async function getFonts(): Promise<Map<string, fontkit.Font>> {
  const fonts: Map<string, fontkit.Font> = new Map();
  const folder = getSystemFontFolder();
  if (folder) {
    // not bothering with path.join since glob requires forward slashes anyway
    const paths = await glob(`${folder}/*.{ttf,otf,woff,woff2}`);
    await Promise.all(paths.map(async (element) => {
      try {
        const font = await fontkit.open(element);
        const filePath = element.replaceAll('\\', '/');
        fonts.set(filePath, font);
      }
      catch (e) {
        console.log(element);
        console.log(e);
      }
    }));
  }
  return fonts;
}

function sortFonts(fonts: Map<string, fontkit.Font>): [string, Font[]][] {
  const fontsList = Array.from(fonts.entries());
  const familiesMap: Map<string, Font[]> = new Map();
  fontsList.forEach(element => addFontToFamiliesMap(familiesMap, element));
  const families = Array.from(familiesMap.entries());
  families.sort((a, b) => a[0].localeCompare(b[0]));
  families.forEach(element => sortSubfamily(element));
  return families;
}

function addFontToFamiliesMap(familiesMap: Map<string, Font[]>, element: [string, fontkit.Font]): void {
  const font = element[1];
  if (!familiesMap.has(font.familyName)) {
    familiesMap.set(font.familyName, [])
  }
  familiesMap.get(font.familyName)?.push(new FontBrowser.FontConstructor(element[0], font.fullName, font.subfamilyName));
}

function sortSubfamily(subfamily: [string, Font[]]): void {
  const fonts = subfamily[1];
  fonts.sort((a, b) => a.subfamilyName.localeCompare(b.subfamilyName));
  // always display regular style first
  fonts.forEach((font, index) => {
    if (font.subfamilyName == 'Regular') {
      fonts.splice(index, 1);
      fonts.unshift(font);
    }
  });
}

function getSystemFontFolder(): string {
  const platform = process.platform;
  let folder: string;
  switch (platform) {
    case 'win32':
      folder = 'C:/Windows/Fonts';
      break;
    case 'darwin':
      folder = '$HOME/Library/Fonts';
      break;
    case 'linux':
      folder = '/usr/share/fonts';
      break;
    default:
      console.log(platform);
      folder = '';
  }
  return folder;
}
