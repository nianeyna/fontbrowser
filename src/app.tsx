import { createRoot, Root } from 'react-dom/client';
import { FontBrowser } from './defs'
import { Index, ErrorMessage } from './components';
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
    const fontFamilies = await getFontFamilies();
    const element = getRootElement(fontFamilies);
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
      family[1].forEach(async font => {
        const featuresList = await window.api.features(font.file);
        const eventName = `feature-update-${slugify(font.fullName)}`;
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent<string[]>(eventName, { detail: featuresList }));
        }, 5);
      }));
    return familiesList;
  }
  catch (e) {
    throw new FontBrowser.FontFamiliesAccessError('Problem getting font details from local system.');
  }
}

function getRootElement(families: [string, Font[]][]) {
  try {
    return <Index families={families} />;
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
