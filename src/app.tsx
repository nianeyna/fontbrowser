import { createRoot, Root } from 'react-dom/client';
import { LoremIpsum } from "lorem-ipsum";
import { FontBrowser } from './defs'
import pangrams from './resource/pangrams.json';
import index, { ErrorMessage } from './components';
import slugify from 'slugify';

declare global {
  interface Window {
    'api': {
      families: () => Promise<[string, Font[]][]>,
      features: (fileName: string) => Promise<string[]>
    }
  }
}

(async () => {
  const root = createRoot(document.getElementById('root'));
  try {
    const familiesList = await getFontFamilies();
    const initSampleType = FontBrowser.SampleType.Pangram;
    const sampleText = getSampleText(initSampleType);
    function onSelectSampleType(sampleType: FontBrowser.SampleType) {
      const sampleText = getSampleText(sampleType);
      render(root, getRootElement(familiesList, sampleType, sampleText, onSelectSampleType))
    }
    const element = getRootElement(familiesList, initSampleType, sampleText, onSelectSampleType);
    render(root, element);
  }
  catch (e) {
    console.log(e);
    if (e instanceof FontBrowser.FontBrowserError) {
      root.render(<ErrorMessage message={e.message} />);
    }
    else {
      root.render(<ErrorMessage message='An unknown error occurred.' />);
    }
  }
})();

async function getFontFamilies(): Promise<[string, Font[]][]> {
  try {
    const familiesList = await window.api.families();
    familiesList.forEach(family => 
      family[1].forEach(async font => 
        {
          const featuresList = await window.api.features(font.file);
          const eventName = `feature-update-${slugify(font.fullName)}`;
          document.dispatchEvent(new CustomEvent<string[]>(eventName, { detail: featuresList }));
        }));
    return familiesList;
  }
  catch (e) {
    throw new FontBrowser.FontFamiliesAccessError('Problem getting font details from local system.');
  }
}

function getSampleText(sampleType: FontBrowser.SampleType) {
  switch (sampleType) {
    case FontBrowser.SampleType.Pangram:
      return pangram();
    case FontBrowser.SampleType.LoremIpsum:
      return loremIpsum();
    default:
      throw new TypeError('Invalid SampleType');
  }
}

function pangram(): string {
  try {
    return pangrams[Math.floor(Math.random() * pangrams.length)];
  }
  catch (e) {
    throw new FontBrowser.PangramAccessError('Problem getting sample text.');
  }
}

function loremIpsum(): string {
  try {
    const lorem = new LoremIpsum();
    return lorem.generateParagraphs(1);
  }
  catch (e) {
    throw new FontBrowser.LoremIpsumError('Problem getting sample text.');
  }
}

function getRootElement(families: [string, Font[]][], sampleType: FontBrowser.SampleType, sampleText: string, onSelectSampleType: (x: FontBrowser.SampleType) => void) {
  try {
    return index(families, sampleType, sampleText, onSelectSampleType);
  }
  catch (e) {
    throw new FontBrowser.ElementConstructionError('Problem rendering font list.');
  }
}

function render(root: Root, element: JSX.Element) {
  try {
    root.render(element);
  }
  catch (e) {
    throw new FontBrowser.ReactRenderingError('Problem rendering font list.');
  }
}
