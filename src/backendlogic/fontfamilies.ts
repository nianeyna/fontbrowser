import { app } from 'electron';
import fontkit from 'fontkit';
import { glob } from 'glob';

export async function getFontFamilies(fontFolders: FontFolder[]): Promise<Family[]> {
  addSystemFontFolders(fontFolders);
  const fonts = await getFonts(fontFolders);
  return sortFonts(fonts);
}

export async function loadFontFeatures(filePath: string): Promise<FontDetails> {
  try {
    const font = await fontkit.open(filePath);
    const features = [...new Set(font.availableFeatures)]; // remove duplicates
    const characters = font.characterSet;
    // may not be necessary to do this on the backend... but also no reason not to afaik
    const characterString = [...String.fromCodePoint(...characters)].join(' ');
    return { features: features, characters: characters, characterString: characterString };
  }
  catch (e) {
    console.log('Error loading font at ' + filePath);
    console.log(e);
    return { features: null, characters: null, characterString: null };
  }
}

async function getFonts(fontFolders: FontFolder[]): Promise<Map<string, fontkit.Font>> {
  const fonts: Map<string, fontkit.Font> = new Map();
  if (fontFolders.length > 0) {
    const paths: string[] = [];
    await Promise.all(fontFolders.map(async (folder) => {
      try {
        // not bothering with path.join since glob requires forward slashes anyway
        const files = await glob(`${folder.folderPath.replaceAll('\\', '/')}${folder.subfolders ? '/**' : ''}/*.{ttf,otf,woff,woff2}`);
        paths.push(...files);
      }
      catch (e) {
        console.log(folder);
        console.log(e);
      }
    }));
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

function sortFonts(fonts: Map<string, fontkit.Font>): Family[] {
  const fontsList = Array.from(fonts.entries());
  const familiesMap: Map<string, Font[]> = new Map();
  fontsList.forEach(element => addFontToFamiliesMap(familiesMap, element));
  const families = Array.from(familiesMap.entries());
  families.sort((a, b) => a[0].toString().localeCompare(b[0].toString()));
  families.forEach(element => sortSubfamily(element));
  return families.map(element => { return { name: element[0], fonts: element[1] } });
}

function addFontToFamiliesMap(familiesMap: Map<string, Font[]>, element: [string, fontkit.Font]): void {
  try {
    const font = element[1];
    if (!font.familyName) return; // sorry, poorly-formed font files
    if (!familiesMap.has(font.familyName)) {
      familiesMap.set(font.familyName, []);
    }
    familiesMap.get(font.familyName)?.push({ file: element[0], fullName: font.fullName, subfamilyName: font.subfamilyName });
  }
  catch (e) {
    console.log('Error adding font to families map. File path: ' + element[0]);
    console.log(e);
  }
}

function sortSubfamily(subfamily: [string, Font[]]): void {
  const fonts = subfamily[1];
  fonts?.sort((a, b) => a.subfamilyName.toString().localeCompare(b.subfamilyName.toString()));
  // always display regular style first
  fonts?.forEach((font, index) => {
    if (font?.subfamilyName == 'Regular') {
      fonts.splice(index, 1);
      fonts.unshift(font);
    }
  });
}

function addSystemFontFolders(fontFolders: FontFolder[]) {
  const platform = process.platform;
  switch (platform) {
    case 'win32':
      fontFolders.push({ folderPath: 'C:/Windows/Fonts', subfolders: false });
      fontFolders.push({ folderPath: `${app.getPath('appData')}/../Local/Microsoft/Windows/Fonts`, subfolders: false });
      break;
    case 'darwin':
      fontFolders.push({ folderPath: '/Library/Fonts', subfolders: true });
      fontFolders.push({ folderPath: '/System/Library/Fonts', subfolders: true });
      fontFolders.push({ folderPath: `${app.getPath('home')}/Library/Fonts`, subfolders: true });
      break;
    case 'linux':
      fontFolders.push({ folderPath: '/usr/share/fonts', subfolders: true });
      fontFolders.push({ folderPath: `${app.getPath('home')}/.fonts`, subfolders: true });
      fontFolders.push({ folderPath: `${app.getPath('home')}/.local/share/fonts`, subfolders: true });
      break;
    default:
      console.log(platform);
  }
}
