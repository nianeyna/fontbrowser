import { Disclosure } from '@headlessui/react';
import path from 'path';
import { useContext, useState } from 'react';
import { FadeLoader } from 'react-spinners';
import { FontBrowser } from '../types/defs';
import { FontBrowserContexts } from './contexts';
import { FontFeatures } from './features';
import TagAdd from './tagadd';
import TagList from './taglist';
import FontBrowserTransition from './transition';

export default function Families() {
  const families = useContext(FontBrowserContexts.FontFamiliesContext);
  return (
    <ul>
      {families.map(family => {
        if (family[1].length > 0) {
          return <li key={family[0]}>
            <h3 className='text-lg font-bold'>{family[0]}</h3>
            <Subfamilies fonts={family[1]} />
          </li>;
        }
      }
      )}
    </ul>
  );
}

function Subfamilies(props: { fonts: Font[]; }) {
  return (
    <ul className='ml-3'>{props.fonts.map(font => {
      const fontsWithSameName = props.fonts.filter(x => x.fullName == font.fullName);
      if (fontsWithSameName.length > 1 && fontsWithSameName.findIndex(x => x.file == font.file) > 0) return;
      const fileList = fontsWithSameName.map(x => x.file);
      const fontType = getFontDescriptorFromExtension(path.parse(font.file).ext);
      return (
        <li key={font.fullName}>
          <style>
            {`@font-face {
            font-family: '${font.fullName}';
            src: url('font://${font.file}') format(${fontType});
          }`}
          </style>
          <div className='border rounded p-1 my-1'>
            <table width={'100%'}>
              <tbody>
                <tr>
                  <td className='align-top font-bold'>
                    <h4 title={`${font.fullName}\n${fileList.join('\n')}`}>{font.subfamilyName}</h4>
                  </td>
                  <td width={'60%'}>
                    <Sample fullName={font.fullName} />
                  </td>
                </tr>
                <CodePoints fullName={font.fullName} />
                <FontFeatures fullName={font.fullName} />
                <TagList fullName={font.fullName} />
                <TagAdd fullName={font.fullName} />
              </tbody>
            </table>
          </div>
        </li>
      );
    })}
    </ul>);
}

function Sample(props: { fullName: string; }) {
  const sampleText = useContext(FontBrowserContexts.SampleTextContext);
  const loadedFonts = useContext(FontBrowserContexts.LoadedFontsContext);
  const [activeFeatures] = useContext(FontBrowserContexts.ActiveFeaturesContext);

  if (loadedFonts[1].includes(props.fullName)) {
    return <div className='text-lg font-bold text-red-700 dark:text-nia-accent'>Could not load font.</div>;
  }

  if (!loadedFonts[0].includes(props.fullName)) {
    return <FadeLoader cssOverride={{ display: 'inline' }} />;
  }

  return (
    <div>
      <div className='text-lg' style={{
        fontFamily: `"${props.fullName}"`,
        whiteSpace: 'pre-wrap',
        fontFeatureSettings: Array.from(activeFeatures.entries()).map(x => `'${x[0]}' ${x[1] ? 'on' : 'off'}`).join(', ')
      }}>
        {sampleText}
      </div>
    </div>
  );
}

function CodePoints(props: { fullName: string; }): JSX.Element {
  const [characterString, setCharacterString] = useState('');
  const fontDetails = useContext(FontBrowserContexts.FontDetailsContext);
  const [activeFeatures] = useContext(FontBrowserContexts.ActiveFeaturesContext);
  const handleClick = () => {
    setCharacterString(fontDetails.get(props.fullName)?.characterString);
  };
  return (
    <tr>
      <Disclosure>
        <td className='align-top'>
          <Disclosure.Button onClick={handleClick}>
            View all code points
          </Disclosure.Button>
        </td>
        <td>
          <FontBrowserTransition children={
            <Disclosure.Panel className='text-lg' style={{
              fontFamily: `'${props.fullName}'`,
              fontFeatureSettings: Array.from(activeFeatures.entries()).map(x => `'${x[0]}' ${x[1] ? 'on' : 'off'}`).join(', ')
            }}>
              {characterString}
            </Disclosure.Panel>
          } />
        </td>
      </Disclosure>
    </tr>
  );
}

function getFontDescriptorFromExtension(ext: string): string {
  switch (ext.toLowerCase()) {
    case '.ttf':
      return 'truetype';
    case '.otf':
      return 'opentype';
    case '.woff':
      return 'woff';
    case '.woff2':
      return 'woff2';
    default:
      console.log(ext);
      throw new FontBrowser.FontBrowserError('Invalid font extension.');
  }
}
