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
const SampleTextContext: Context<string> = createContext(null);
const AvailableFeaturesContext: Context<Map<string, string[]>> = createContext(null);
const DisplayedFontsContext: Context<[string[], React.Dispatch<React.SetStateAction<string[]>>]> = createContext(null);
const ActiveFeaturesContext: Context<[string[], React.Dispatch<React.SetStateAction<string[]>>]> = createContext(null);

export function ErrorMessage(props: { message: string }) {
  return <div>{props.message}</div>
}

export function Index(props: { families: [string, Font[]][] }) {
  const [sampleOptions, setSampleOptions] = useState(new FontBrowser.SampleTextOptions(FontBrowser.SampleType.Pangram));
  const [searchOptions, setSearchOptions] = useState<FontBrowser.SearchAndFilterOptions>(null);
  const [availableFeatures, setAvailableFeatures] = useState<Map<string, string[]>>(new Map());
  const [displayedFonts, setDisplayedFonts] = useState([]);
  const [activeFeatures, setActiveFeatures] = useState([]);
  const sampleText = useMemo(() => getSampleText(sampleOptions), [sampleOptions]);
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
        <ActiveFeaturesContext.Provider value={[activeFeatures, setActiveFeatures]}>
          <SearchTermContext.Provider value={[searchOptions, setSearchOptions]}>
            <SampleTypeContext.Provider value={[sampleOptions, setSampleOptions]} >
              <SampleTextContext.Provider value={sampleText}>
                <ContextWrapper families={props.families} />
              </SampleTextContext.Provider>
            </SampleTypeContext.Provider>
          </SearchTermContext.Provider >
        </ActiveFeaturesContext.Provider>
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
            <FeatureCheckbox key={x} feature={x} />
          )}
      </ul>
    </details>
  );
}

function FeatureCheckbox(props: { feature: string }) {
  const [activeFeatures, setActiveFeatures] = useContext(ActiveFeaturesContext);
  const handleChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked && !activeFeatures.includes(props.feature)) {
      activeFeatures.push(props.feature);
    }
    else if (!e.target.checked) {
      const index = activeFeatures.indexOf(props.feature);
      if (index >= 0) {
        activeFeatures.splice(index);
      }
    }
    setActiveFeatures([...activeFeatures]);
  }
  return (
    <li>
      <label>
        <input onChange={handleChanged} type={'checkbox'} checked={activeFeatures.includes(props.feature)} />
        {props.feature}
      </label>
    </li>
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
  const availableFeatures = useContext(AvailableFeaturesContext);
  const [activeFeatures] = useContext(ActiveFeaturesContext);
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
          : true) // don't filter if there is no search term
        .filter(subfamily => activeFeatures.length > 0
          ? (availableFeatures.get(subfamily.fullName) ?? []).some(feature => activeFeatures.includes(feature))
          : true);
      return [familyName, filteredFonts];
    });
    setFilteredFamilies(filtered);
    setDisplayedFonts(filtered.map(family => family[1]).flat().map(font => font.fullName));
  }, [searchOptions, activeFeatures]);
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
  const [activeFeatures] = useContext(ActiveFeaturesContext);
  return (
    <details>
      <summary>Features</summary>
      <ul>
        {availableFeatures.get(props.fullName)?.map((feature: string) =>
          <li style={{ fontWeight: activeFeatures.includes(feature) ? 'bold' : 'normal' }} key={feature}>{feature}</li>)}
      </ul>
    </details>
  );
}

function Sample(props: { fontName: string, filePath: string }) {
  const sampleText = useContext(SampleTextContext);
  const [activeFeatures] = useContext(ActiveFeaturesContext);
  return (
    <div>
      <style>
        {`@font-face {
            font-family: "${props.fontName}";
            src: url("font://${props.filePath}");
          }`}
      </style>
      <div style={{ fontFamily: `"${props.fontName}"`, fontFeatureSettings: activeFeatures.map(x => `"${x}"`).join(', ') }}>{sampleText}</div>
    </div>
  );
}
