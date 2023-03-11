import { createRoot } from 'react-dom/client';
import fontkit from 'fontkit';

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
    const element = Index(names);
    root.render(element);
  }
  catch (e) {
    console.log(e);
    root.render(<></>);
  }
})();

export default function Index(families: Map<string, Font[]>) {
  return (
    <div>
      <ul>
        {Array.from(families.entries()).map(family => {
          const listItems = family[1].map(font => {
            const features = font.availableFeatures.map(feature => {
              return <div>{feature}</div>
            })
            return (
              <li>
                {font.subfamilyName}
                <details>
                  <summary>Features</summary>
                  {features}
                </details>
              </li>
            );
          });
          return (
            <li>
              <h4>{family[0]}</h4>
              <ul>
                {listItems}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  )
}
