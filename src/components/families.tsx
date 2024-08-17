import { Disclosure } from '@headlessui/react';
import path from 'path';
import { useContext, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { FontBrowser } from '../types/defs';
import { FontBrowserContexts } from './contexts';
import { FontFeatures } from './features';
import { Pin, Spinner, Unpin } from './svg';
import TagAdd from './tagadd';
import TagList from './taglist';
import FontBrowserTransition from './transition';

export default function Families() {
  const [searchoptions] = useContext(FontBrowserContexts.SearchTermContext);
  const families = useContext(FontBrowserContexts.FontFamiliesContext);
  return (
    <>
      {searchoptions?.pinnedFonts?.length > 0 && <div className='p-5'>
        <Virtuoso useWindowScroll={true} data={searchoptions?.pinnedFonts ?? []} itemContent={(index, family) => {
          return (
            <div key={index}>
              <h3 className='text-lg font-bold'>{family.name}</h3>
              <Subfamilies family={family} />
            </div>
          );
        }} />
      </div>}
      <Virtuoso useWindowScroll={true} data={families} itemContent={(index, family) => {
        return (
          <div key={index}>
            <h3 className='text-lg font-bold'>{family.name}</h3>
            <Subfamilies family={family} />
          </div>
        );
      }} />
    </>
  );
}

function Subfamilies(props: { family: Family; }) {
  const [searchOptions, setSearchOptions] = useContext(FontBrowserContexts.SearchTermContext);
  const handlePin = (font: [string, Font]) => {
    const pinnedFonts = searchOptions?.pinnedFonts;
    const isPinned = pinnedFonts?.some(family => family.name == font[0] && family.fonts.some(f => f.fullName == font[1].fullName)) ?? false;
    if (isPinned) {
      setSearchOptions({
        ...searchOptions, pinnedFonts: pinnedFonts.map(family => {
          if (family.name == font[0]) {
            return { ...family, fonts: family.fonts.filter(f => f.fullName != font[1].fullName) };
          }
          return family;
        }).filter(family => family.fonts.length > 0) ?? []
      });
    } else {
      if (pinnedFonts?.map(family => family.name).includes(font[0])) {
        setSearchOptions({
          ...searchOptions, pinnedFonts: pinnedFonts.map(family => {
            if (family.name == font[0]) {
              return { ...family, fonts: [...family.fonts, font[1]] };
            }
            return family;
          })
        });
      } else {
        setSearchOptions({
          ...searchOptions, pinnedFonts: [...(pinnedFonts ?? []), { name: font[0], fonts: [font[1]] }]
        });
      }
    }
  };
  return (
    <ul className='ml-3'>{props.family.fonts.map(font => {
      const isPinned = searchOptions?.pinnedFonts?.some(x => x.name == props.family.name && x.fonts.some(f => f.fullName == font.fullName)) ?? false;
      const fontsWithSameName = props.family.fonts.filter(x => x.fullName == font.fullName);
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
                    <span className='float-right w-6 m-1' onClick={() => handlePin([props.family.name, font])}>{isPinned ? <Unpin /> : <Pin />}</span>
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
};

function Sample(props: { fullName: string; }) {
  const sampleText = useContext(FontBrowserContexts.SampleTextContext);
  const loadedFonts = useContext(FontBrowserContexts.LoadedFontsContext);
  const [activeFeatures] = useContext(FontBrowserContexts.ActiveFeaturesContext);

  if (!loadedFonts.includes(props.fullName)) {
    return <div style={{ maxWidth: 48 }}><Spinner /></div>;
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
