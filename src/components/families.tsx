import { useContext, useEffect, useMemo, useState } from 'react';
import { Disclosure, Transition } from '@headlessui/react';
import { FontBrowserContexts } from './contexts';
import { FontFeatures } from './features';
import { FontBrowser } from '../types/defs';
import path from 'path';
import TagList from './taglist';
import TagAdd from './tagadd';

export default function Families() {
  const families = useContext(FontBrowserContexts.FontFamiliesContext);
  const fontDetails = useContext(FontBrowserContexts.FontDetailsContext);
  const [activeFeatures] = useContext(FontBrowserContexts.ActiveFeaturesContext);
  const [searchOptions] = useContext(FontBrowserContexts.SearchTermContext);
  const [_, setDisplayedFonts] = useContext(FontBrowserContexts.DisplayedFontsContext);
  const [filteredFamilies, setFilteredFamilies] = useState<[string, Font[]][]>([]);
  const searchTerm = searchOptions?.searchTerm?.toLowerCase();
  useEffect(() => {
    const filtered: [string, Font[]][] = families.map(family => {
      const familyName = family[0];
      const filteredFonts = family[1]
        .filter(subfamily => searchTerm
          ? subfamily.fullName.toLowerCase().includes(searchTerm)
          : true) // don't filter if there is no search term
        .filter(subfamily => searchOptions?.selectedFeaturesOnly == true && activeFeatures.length > 0
          ? (fontDetails.get(subfamily.fullName)?.features ?? [])
            .some(feature => activeFeatures.includes(feature))
          : true)
        .filter(subfamily => searchOptions?.characters
          ? getCodePointsFromString(searchOptions.characters)
            .every(point => fontDetails.get(subfamily.fullName).characters.includes(point))
          : true);
      return [familyName, filteredFonts];
    });
    setFilteredFamilies(filtered);
    setDisplayedFonts(filtered.map(family => family[1]).flat().map(font => font.fullName));
  }, [searchOptions, activeFeatures, families]);
  return (
    <ul>
      {filteredFamilies.map(family => {
        const familyName = family[0];
        const filteredFonts = family[1]
          .filter(subfamily => searchTerm
            ? subfamily.fullName.toLowerCase().includes(searchTerm)
            : true); // don't filter if there is no search term
        if (filteredFonts.length > 0) {
          return <li key={familyName}>
            <h3 className='text-lg font-bold'>{familyName}</h3>
            <Subfamilies fonts={filteredFonts} />
          </li>;
        }
      })}
    </ul>
  );
}

function Subfamilies(props: { fonts: Font[] }) {
  const [settings] = useContext(FontBrowserContexts.SettingsContext);
  const allTags = useMemo(() => { return settings?.tags }, [settings]);
  return (
    <ul className='ml-3'>{props.fonts.map(font => {
      const fontsWithSameName = props.fonts.filter(x => x.subfamilyName == font.subfamilyName);
      if (fontsWithSameName.length > 1 && fontsWithSameName.findIndex(x => x.file == font.file) > 0) return;
      const fileList = fontsWithSameName.map(x => x.file);
      const fontType = getFontDescriptorFromExtension(path.parse(font.file).ext);
      const tagList = allTags?.find(x => x[0] == font.fullName);
      return (
        <li key={font.file}>
          <style>
            {`@font-face {
            font-family: "${font.fullName}";
            src: url("font://${font.file}") format(${fontType});
          }`}
          </style>
          <div className='border rounded p-1 my-1'>
            <table width={'100%'}>
              <tbody>
                <tr>
                  <td className='align-top font-bold'>
                    <h4 title={fileList.join('\n')}>{font.subfamilyName}</h4>
                  </td>
                  <td width={'60%'}>
                    <Sample fontName={font.fullName} filePath={font.file} />
                  </td>
                </tr>
                <tr>
                  <CodePoints fontName={font.fullName} />
                </tr>
                <FontFeatures fullName={font.fullName} />
                {!!tagList && tagList[1].length > 0 &&
                  <tr>
                    <TagList fullName={font.fullName} tagList={tagList[1]} />
                  </tr>
                }
                <tr>
                  <TagAdd fullName={font.fullName} />
                </tr>
              </tbody>
            </table>
          </div>
        </li>
      );
    })}
    </ul>)
}

function Sample(props: { fontName: string, filePath: string }) {
  const sampleText = useContext(FontBrowserContexts.SampleTextContext);
  const [activeFeatures] = useContext(FontBrowserContexts.ActiveFeaturesContext);
  return (
    <div>
      <div className='text-lg' style={{
        fontFamily: `"${props.fontName}"`,
        whiteSpace: 'pre-wrap',
        fontFeatureSettings: activeFeatures.map(x => `"${x}"`).join(', ')
      }}>
        {sampleText}
      </div>
    </div>
  );
}

function CodePoints(props: { fontName: string }): JSX.Element {
  const [characterString, setCharacterString] = useState('');
  const fontDetails = useContext(FontBrowserContexts.FontDetailsContext);
  const [activeFeatures] = useContext(FontBrowserContexts.ActiveFeaturesContext);
  const handleClick = () => {
    setCharacterString(fontDetails.get(props.fontName)?.characterString);
  };
  return (
    <Disclosure>
      <td className='align-top'>
        <Disclosure.Button onClick={handleClick}>
          View all code points
        </Disclosure.Button>
      </td>
      <td>
        <Transition
          enter="transition duration-500 ease-out"
          enterFrom="transform scale-95 opacity-0"
          enterTo="transform scale-100 opacity-100"
          leave="transition duration-400 ease-out"
          leaveFrom="transform scale-100 opacity-100"
          leaveTo="transform scale-95 opacity-0">
          <Disclosure.Panel className='text-lg' style={{
            fontFamily: `"${props.fontName}"`,
            fontFeatureSettings: activeFeatures.map(x => `"${x}"`).join(', ')
          }}>
            {characterString}
          </Disclosure.Panel>
        </Transition>
      </td>
    </Disclosure>
  );
}

function getCodePointsFromString(searchString: string): number[] {
  const codePoints: number[] = []
  for (const codePoint of searchString) {
    codePoints.push(codePoint.codePointAt(0));
  }
  return codePoints;
}

function getFontDescriptorFromExtension(ext: string): string {
  switch (ext) {
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
      throw new FontBrowser.FontBrowserError('Invalid font extension.')
  }
}
