import { createRoot } from 'react-dom/client';

declare global {
  interface Window {
    'api': {
      families: () => Promise<Map<string, Font[]>>
    }
  }
}

(async () => {
  const root = createRoot(document.getElementById('root'));
  try {
    const names = await window.api.families();
    const text = 'The Quick Brown Fox Jumped Over The Lazy Dog';
    const element = Index(names, text);
    root.render(element);
  }
  catch (e) {
    console.log(e);
    root.render(<div>Problem getting fonts</div>);
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
                  <div style={{fontFamily: `"${font.fullName}"`}}>{text}</div>
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
