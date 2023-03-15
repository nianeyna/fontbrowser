import { createRoot, Root } from 'react-dom/client';
import { LoremIpsum } from "lorem-ipsum";
import { FontBrowser } from './defs'
import pangrams from './resource/pangrams.json';
import index, { ErrorMessage } from './components';

declare global {
  interface Window {
    'api': {
      families: () => Promise<[string, Font[]][]>
    }
  }
}

(async () => {
  const root = createRoot(document.getElementById('root'));
  try {
    const families = await getFontFamilies();
    const initSampleType = FontBrowser.SampleType.Pangram;
    const sampleText = getSampleText(initSampleType);
    function onSelectSampleType(sampleType: FontBrowser.SampleType) {
      const sampleText = getSampleText(sampleType);
      render(root, getRootElement(families, sampleType, sampleText, onSelectSampleType))
    }
    const element = getRootElement(families, initSampleType, sampleText, onSelectSampleType);
    render(root, element);
  }
  catch (e) {
    console.log(e);
    if (e instanceof FontBrowser.FontBrowserError) {
      root.render(<ErrorMessage message={e.message} />);
    }
    else {
      root.render(<ErrorMessage message='An unknown error occurred.'/>);
    }
  }
})();

async function getFontFamilies(): Promise<[string, Font[]][]> {
  try {
    return await window.api.families();
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
