import { createRoot } from 'react-dom/client';
import { LoremIpsum } from "lorem-ipsum";
import pangrams from './resource/pangrams.json';
import index from './components';

declare global {
  interface Window {
    'api': {
      families: () => Promise<Map<string, Font[]>>
    }
  }
}

(async () => {
  const root = createRoot(document.getElementById('root'));

  let families: [string, Font[]][];
  try {
    const map = await window.api.families();
    families = Array.from(map.entries());
  }
  catch (e) {
    console.log(e);
    root.render(<div>Problem getting font details from local system.</div>);
    return;
  }

  let sampleText: string;
  try {
    sampleText = loremIpsum();
  }
  catch (e) {
    console.log(e);
    root.render(<div>Problem getting sample text.</div>);
    return;
  }

  let element: JSX.Element;
  try {
    element = index(families, sampleText);
  }
  catch (e) {
    console.log(e);
    root.render(<div>Problem loading fonts.</div>);
    return;
  }

  try {
    root.render(element);
  }
  catch (e) {
    console.log(e);
    root.render(<div>Problem rendering font list.</div>)
  }
})();

function pangram(): string {
  return pangrams[Math.floor(Math.random() * pangrams.length)];
}

function loremIpsum(): string {
  const lorem = new LoremIpsum();
  return lorem.generateParagraphs(1);
}
