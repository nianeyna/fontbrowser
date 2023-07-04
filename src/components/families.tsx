import { useContext, useEffect, useMemo, useState } from 'react';
import { Disclosure, Transition } from '@headlessui/react';
import { FontBrowserContexts } from './contexts';
import { FontFeatures } from './features';
import { FontBrowser } from '../types/defs';
import { FadeLoader } from 'react-spinners';
import path from 'path';
import TagList from './taglist';
import TagAdd from './tagadd';

export default function Families() {
  const families = useContext(FontBrowserContexts.FontFamiliesContext);
  const [settings] = useContext(FontBrowserContexts.SettingsContext);
  const fontDetails = useContext(FontBrowserContexts.FontDetailsContext);
  const [activeFeatures] = useContext(FontBrowserContexts.ActiveFeaturesContext);
  const [searchOptions] = useContext(FontBrowserContexts.SearchTermContext);
  const [_, setDisplayedFonts] = useContext(FontBrowserContexts.DisplayedFontsContext);
  const searchTerm = searchOptions?.searchTerm?.toLowerCase();
  const filteredFamilies = useMemo(() => {
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
          : true)
        .filter(subfamily => {
          const fontEntry = settings?.tags?.find(x => x[0] == subfamily.fullName);
          const includedTags = searchOptions?.includedTags;
          const excludedTags = searchOptions?.excludedTags;
          if (Array.isArray(fontEntry) && fontEntry[1].length > 0) { // font has any tags at all
            const tags = fontEntry[1];
            return (!includedTags || includedTags.length <= 0 || tags.some(tag => includedTags.includes(tag)))
              && (!excludedTags || excludedTags.length <= 0 || tags.every(tag => !excludedTags.includes(tag)))
          }
          else if (includedTags && includedTags.length > 0) { // included tags specified
            return false;
          }
          return true;
        });
      return [familyName, filteredFonts];
    });

    return filtered;
  }, [searchOptions, activeFeatures, families]);

  useEffect(() => {
    setDisplayedFonts(filteredFamilies.map(family => family[1]).flat().map(font => font.fullName));
  }, [filteredFamilies]);

  return (
    <ul>
      {filteredFamilies.map(family => {
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

function Subfamilies(props: { fonts: Font[] }) {
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
            font-family: "${font.fullName}";
            src: url("font://${font.file}") format(${fontType});
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
    </ul>)
}

function Sample(props: { fullName: string }) {
  const sampleText = useContext(FontBrowserContexts.SampleTextContext);
  const loadedFonts = useContext(FontBrowserContexts.LoadedFontsContext);
  const [activeFeatures] = useContext(FontBrowserContexts.ActiveFeaturesContext);

  if (!loadedFonts.includes(props.fullName)) {
    return <FadeLoader cssOverride={{ display: 'inline' }} />;
  }

  return (
    <div>
      <div className='text-lg' style={{
        fontFamily: `"${props.fullName}"`,
        whiteSpace: 'pre-wrap',
        fontFeatureSettings: activeFeatures.map(x => `"${x}"`).join(', ')
      }}>
        {sampleText}
      </div>
    </div>
  );
}

function CodePoints(props: { fullName: string }): JSX.Element {
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
          <Transition
            enter="transition duration-500 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-400 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0">
            <Disclosure.Panel className='text-lg' style={{
              fontFamily: `"${props.fullName}"`,
              fontFeatureSettings: activeFeatures.map(x => `"${x}"`).join(', ')
            }}>
              {characterString}
            </Disclosure.Panel>
          </Transition>
        </td>
      </Disclosure>
    </tr>
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
      throw new FontBrowser.FontBrowserError('Invalid font extension.')
  }
}
