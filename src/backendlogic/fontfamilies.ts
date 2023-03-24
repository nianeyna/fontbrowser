import fontkit from 'fontkit';
import { glob } from "glob";
import { FontBrowser } from "../types/defs";

export async function getFontFamilies(): Promise<[string, Font[]][]> {
  const fonts = await getFonts();
  return sortFonts(fonts);
}

export async function loadFontFeatures(filePath: string): Promise<FontDetails> {
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
