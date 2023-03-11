import { createRoot } from 'react-dom/client';

declare global {
  interface Window {
    'api': {
      fontNames: () => Promise<string[]>
    }
  }
}

(async () => {
  const root = createRoot(document.getElementById('root'));
  const names = await window.api.fontNames();
  const element = Index(names);
  root.render(element);
})();

export default function Index(names: string[]) {
  const listItems = names.map(n => <li>{n}</li>);
  return (
    <div>
      <ul>
        {listItems}
      </ul>
    </div>
  );
}
