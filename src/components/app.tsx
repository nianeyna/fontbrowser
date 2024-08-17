import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import Index from '.';
import ErrorPage from './error';
import Home from './home';
import Settings from './settings';

declare global {
  interface Window {
    'api': {
      families: () => Promise<Family[]>,
      details: (fileName: string) => Promise<FontDetails>,
      getSettings: () => Promise<Settings>,
      setSettings: (settings: Settings) => Promise<void>;
    };
  }
}

const router = createHashRouter([
  {
    path: '/',
    element: <Index linkedFonts={[]} />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: 'settings',
        element: <Settings />
      }
    ]
  },
]);

createRoot(document.getElementById('root')).render(<RouterProvider router={router} />);
