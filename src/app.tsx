import { createRoot, Root } from 'react-dom/client';
import { FontBrowser } from './defs'
import { Index, ErrorMessage } from './components';

declare global {
  interface Window {
    'api': {
      families: () => Promise<[string, Font[]][]>,
      details: (fileName: string) => Promise<FontDetails>
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
    return await window.api.families();
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
