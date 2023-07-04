import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import Index from './components';
import ErrorPage from './components/error';
import Home from './components/home';
import Settings from './components/settings';

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
