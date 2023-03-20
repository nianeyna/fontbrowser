import React, { Context, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { FontBrowser } from '../src/defs'
import getSampleText from './samples';

declare global {
  interface Window {
    'api': {
      families: () => Promise<[string, Font[]][]>,
      features: (fileName: string) => Promise<string[]>
    }
  }
}

const maxTextAreaHeight = 500;
const SearchTermContext: Context<[FontBrowser.SearchAndFilterOptions, React.Dispatch<React.SetStateAction<FontBrowser.SearchAndFilterOptions>>]> = createContext(null);
const SampleTypeContext: Context<[FontBrowser.SampleTextOptions, React.Dispatch<React.SetStateAction<FontBrowser.SampleTextOptions>>]> = createContext(null);
const AvailableFeaturesContext: Context<Map<string, string[]>> = createContext(null);
const DisplayedFontsContext: Context<[string[], React.Dispatch<React.SetStateAction<string[]>>]> = createContext(null);

export function ErrorMessage(props: { message: string }) {
  return <div>{props.message}</div>
}

export function Index(props: { families: [string, Font[]][] }) {
  const [sampleOptions, setSampleOptions] = useState(new FontBrowser.SampleTextOptions(FontBrowser.SampleType.Pangram));
  const [searchOptions, setSearchOptions] = useState<FontBrowser.SearchAndFilterOptions>(null);
  const [availableFeatures, setAvailableFeatures] = useState<Map<string, string[]>>(new Map());
  const [displayedFonts, setDisplayedFonts] = useState([]);
  useEffect(() => {
    props.families.forEach(family => family[1].forEach(async font => {
      const features = await window.api.features(font.file);
      const newMap = new Map(availableFeatures.set(font.fullName, features));
      setAvailableFeatures(newMap);
    }));
  }, []);
  return (
    <AvailableFeaturesContext.Provider value={availableFeatures}>
      <DisplayedFontsContext.Provider value={[displayedFonts, setDisplayedFonts]}>
        <SearchTermContext.Provider value={[searchOptions, setSearchOptions]}>
          <SampleTypeContext.Provider value={[sampleOptions, setSampleOptions]} >
            <ContextWrapper families={props.families} />
          </SampleTypeContext.Provider>
        </SearchTermContext.Provider >
      </DisplayedFontsContext.Provider>
    </AvailableFeaturesContext.Provider>
  );
}

function ContextWrapper(props: { families: [string, Font[]][] }) {
  return (
    <>
      <SearchField />
      <SampleTypeOptions />
      <AvailableFeatures />
      <Families families={props.families} />
    </>
  )
}

function AvailableFeatures() {
  const [displayedFonts] = useContext(DisplayedFontsContext);
  const availableFeatures = useContext(AvailableFeaturesContext);
  return (
    <details>
      <summary>All Features</summary>
      <ul>
        {[...new Set([...availableFeatures]
          .filter(x => displayedFonts.includes(x[0]))
          .map(x => x[1]).flat())]
          .sort((a, b) => a.localeCompare(b))
          .map(x =>
            <li key={x}>{x}</li>
          )}
      </ul>
    </details>
  );
}

function SearchField() {
  const [options, setOptions] = useContext(SearchTermContext);
  const handleChanged = (e: React.ChangeEvent<HTMLInputElement>) => setOptions({ ...options, searchTerm: e.target.value });
  return (
    <label>
      <input onChange={handleChanged} type={'text'} value={options?.searchTerm ?? ''} />
      Search
    </label>
  );
}

function SampleTypeOptions() {
  const [sampleOptions, setSampleOptions] = useContext(SampleTypeContext);
  const handleChanged = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSampleOptions({ ...sampleOptions, sampleType: Number(e.target.value) });
  return (
    <form>
      <div>
        <label>
          <input
            type={'radio'} name={'sample-type'} onChange={handleChanged}
            value={FontBrowser.SampleType.Pangram} checked={sampleOptions.sampleType == FontBrowser.SampleType.Pangram} />
          Pangram
        </label>
      </div>
      <div>
        <label>
          <input
            type={'radio'} name={'sample-type'} onChange={handleChanged}
            value={FontBrowser.SampleType.LoremIpsum} checked={sampleOptions.sampleType == FontBrowser.SampleType.LoremIpsum} />
          Lorem Ipsum
        </label>
      </div>
      <div>
        <label>
          <input
            type={'radio'} name={'sample-type'} onChange={handleChanged}
            value={FontBrowser.SampleType.Custom} checked={sampleOptions.sampleType == FontBrowser.SampleType.Custom} />
          Custom Text
        </label>
      </div>
      <div>
        {sampleOptions.sampleType == FontBrowser.SampleType.Custom &&
          <CustomText />}
      </div>
    </form>
  )
}

function CustomText() {
  const [sampleOptions, setSampleOptions] = useContext(SampleTypeContext);
  const typedSampleOptions = sampleOptions as FontBrowser.CustomTextOptions;
  const typedSetSampleOptions = setSampleOptions as React.Dispatch<React.SetStateAction<FontBrowser.CustomTextOptions>>
  const handleChanged = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.setAttribute('style', 'height: auto');
    e.target.scrollHeight < maxTextAreaHeight
      ? e.target.setAttribute('style', `height: ${e.target.scrollHeight}px`)
      : e.target.setAttribute('style', `height: ${maxTextAreaHeight}px`);
    typedSetSampleOptions({ ...typedSampleOptions, customText: e.target.value });
  };
  return <textarea onChange={handleChanged} value={typedSampleOptions.customText ?? ''} />
}

function Families(props: { families: [string, Font[]][] }) {
  const [searchOptions] = useContext(SearchTermContext);
  const [_, setDisplayedFonts] = useContext(DisplayedFontsContext);
  const [filteredFamilies, setFilteredFamilies] = useState<[string, Font[]][]>([]);
  const searchTerm = searchOptions?.searchTerm?.toLowerCase();
  useEffect(() => {
    const filtered: [string, Font[]][] = props.families.map(family => {
      const familyName = family[0];
      const filteredFonts = family[1]
        .filter(subfamily => searchTerm
          ? subfamily.fullName.toLowerCase().includes(searchTerm)
          : true); // don't filter if there is no search term
      return [familyName, filteredFonts];
    });
    setFilteredFamilies(filtered);
    setDisplayedFonts(filtered.map(family => family[1]).flat().map(font => font.fullName));
  }, [searchOptions]);
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
            <h3>{familyName}</h3>
            <Subfamilies fonts={filteredFonts} />
          </li>;
        }
      })}
    </ul>
  );
}

function Subfamilies(props: { fonts: Font[] }) {
  return (
    <ul>{props.fonts.map(font =>
      <li key={font.fullName}>
        <h4>{font.subfamilyName}</h4>
        <Features fullName={font.fullName} />
        <Sample fontName={font.fullName} filePath={font.file} />
      </li>)}
    </ul>)
}

function Features(props: { fullName: string }): JSX.Element {
  const availableFeatures = useContext(AvailableFeaturesContext);
  return (
    <details>
      <summary>Features</summary>
      <ul>
        {availableFeatures.get(props.fullName)?.map((feature: string) =>
          <li className='feature' key={feature}>{feature}</li>)}
      </ul>
    </details>
  );
}

function Sample(props: { fontName: string, filePath: string }) {
  const [sampleOptions] = useContext(SampleTypeContext);
  const sampleText = useMemo(() => getSampleText(sampleOptions), [sampleOptions]);
  return (
    <div>
      <style>
        {`@font-face {
            font-family: "${props.fontName}";
            src: url("font://${props.filePath}");
          }`}
      </style>
      <div style={{ fontFamily: `"${props.fontName}"` }}>{sampleText}</div>
    </div>
  );
}
