import { createRoot } from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router';
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

createRoot(document.getElementById('root')).render(
<HashRouter>
  <Routes>
    <Route path='/' element={<Index linkedFonts={[]} />} errorElement={<ErrorPage />}>
      <Route path='settings' element={<Settings />} />
      <Route path='/' element={<Home />} />
    </Route>
  </Routes>
</HashRouter>
);
