import { useContext } from 'react';
import { FontBrowserContexts } from './contexts';
import Families from './families';
import { AllFeatures } from './features';
import SampleOptions from './sampleoptions';
import SearchOptions from './searchoptions';

export default function Home() {
  const [settings, setSettings] = useContext(FontBrowserContexts.SettingsContext);
  const [searchOptions] = useContext(FontBrowserContexts.SearchTermContext);
  const [sampleOptions] = useContext(FontBrowserContexts.SampleTypeContext);
  const handleSetDefault = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setSettings({ ...settings, searchOptions: { ...searchOptions }, sampleOptions: { ...sampleOptions } });
  };
  return (
    <>
      <div className='border rounded p-2 mb-3'>
        <SearchOptions />
        <SampleOptions />
        <button onClick={handleSetDefault}>Set these options as default</button>
        <AllFeatures />
      </div>
      <Families />
    </>
  );
}
