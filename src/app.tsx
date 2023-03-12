import { createRoot } from 'react-dom/client';
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
    sampleText = pangrams[Math.floor(Math.random() * pangrams.length)];
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

export default function Index(families: Map<string, Font[]>, text: string) {
  return (
    <div>
      <ul>
        {Array.from(families.entries()).map((family, index) => (
          <li key={index}>
            <h4>{family[0]}</h4>
            <ul>
              {family[1].map((font, index) => (
                <li key={index}>
                  {font.subfamilyName}
                  <style>
                    {`@font-face {
                      font-family: "${font.fullName}";
                      src: url("font://${font.file}");
                    }`}
                  </style>
                  <div style={{ fontFamily: `"${font.fullName}"` }}>{text}</div>
                  <details>
                    <summary>Features</summary>
                    <ul>
                      {font.availableFeatures.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </details>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
