import { createRoot } from 'react-dom/client';
import { LoremIpsum } from "lorem-ipsum";
import pangrams from './resource/pangrams.json';

declare global {
  interface Window {
    'api': {
      families: () => Promise<Map<string, Font[]>>
    }
  }
}

(async () => {
  const root = createRoot(document.getElementById('root'));

  let families: Map<string, Font[]>;
  try {
    families = await window.api.families();
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
    element = Index(families, sampleText);
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

export default function Index(families: Map<string, Font[]>, sampleText: string) {
  return Families(Array.from(families.entries()), sampleText);
}

export function Families(families: [string, Font[]][], sampleText: string) {
  return <ul>{families.map(family => Family(family, sampleText))}</ul>
}

export function Family(family: [string, Font[]], sampleText: string) {
  return (
    <li key={family[0]}>
      <h4>{family[0]}</h4>
      {Subfamilies(family[1], sampleText)}
    </li>
  );
}

export function Subfamilies(fonts: Font[], sampleText: string) {
  return <ul>{fonts.map(font => Subfamily(font, sampleText))}</ul>
}

export function Subfamily(font: Font, sampleText: string) {
  return (
    <li key={font.fullName}>
      {font.subfamilyName}
      {Sample(font.fullName, font.file, sampleText)}
      {Features(font.availableFeatures)}
    </li>
  );
}

export function Sample(fontName: string, filePath: string, sampleText: string) {
  return (
    <div>
      <style>
        {`@font-face {
          font-family: "${fontName}";
          src: url("font://${filePath}");
        }`}
      </style>
      <div style={{ fontFamily: `"${fontName}"` }}>{sampleText}</div>
    </div>
  );
}

export function Features(features: string[]) {
  return (
    <details>
      <summary>Features</summary>
      <ul>
        {features.map((feature: string) => Feature(feature))}
      </ul>
    </details>
  );
}

export function Feature(feature: string): JSX.Element {
  return <li key={feature}>{feature}</li>
}
