import React, { Context, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { FontBrowser } from '../src/defs'
import getSampleText from './samples';
import slugify from 'slugify';

const maxTextAreaHeight = 500;
const SampleTextContext: Context<string> = createContext(null);
const SearchTermContext: Context<[FontBrowser.SearchAndFilterOptions, React.Dispatch<React.SetStateAction<FontBrowser.SearchAndFilterOptions>>]> = createContext(null);
const AvailableFeaturesContext: Context<[string[], React.Dispatch<React.SetStateAction<string[]>>]> = createContext(null);

export function Index(props: { families: [string, Font[]][] }) {
  const [options, setOptions] = useState(new FontBrowser.SampleTextOptions(FontBrowser.SampleType.Pangram));
  const [searchOptions, setSearchOptions] = useState<FontBrowser.SearchAndFilterOptions>(null);
  const [availableFeatures, setAvailableFeatures] = useState<string[]>([]);
  const sampleText = useMemo(() => getSampleText(options), [options])
  return (
    <AvailableFeaturesContext.Provider value={[availableFeatures, setAvailableFeatures]}>
      <ul>{availableFeatures.sort((a, b) => a.localeCompare(b)).map(x => <li className='feature' key={x}>{x}</li>)}</ul>
      <SearchTermContext.Provider value={[searchOptions, setSearchOptions]}>
        <SampleTextContext.Provider value={sampleText} >
          <SearchField />
          <SampleTypeOptions options={options} setOptions={setOptions} />
          <Families families={props.families} />
        </SampleTextContext.Provider>
      </SearchTermContext.Provider >
    </AvailableFeaturesContext.Provider>
  );
}

export function SearchField() {
  const [options, setOptions] = useContext(SearchTermContext);
  const handleChanged = (e: React.ChangeEvent<HTMLInputElement>) => setOptions({ ...options, searchTerm: e.target.value });
  return (
    <label>
      <input onChange={handleChanged} type={'text'} value={options?.searchTerm ?? ''} />
      Search
    </label>
  );
}

export function SampleTypeOptions(props: {
  options: FontBrowser.SampleTextOptions,
  setOptions: React.Dispatch<React.SetStateAction<FontBrowser.SampleTextOptions>>
}) {
  const handleChanged = (e: React.ChangeEvent<HTMLInputElement>) =>
    props.setOptions({ ...props.options, sampleType: Number(e.target.value) });
  return (
    <form>
      <div>
        <label>
          <input
            type={'radio'} name={'sample-type'} onChange={handleChanged}
            value={FontBrowser.SampleType.Pangram} checked={props.options.sampleType == FontBrowser.SampleType.Pangram} />
          Pangram
        </label>
      </div>
      <div>
        <label>
          <input
            type={'radio'} name={'sample-type'} onChange={handleChanged}
            value={FontBrowser.SampleType.LoremIpsum} checked={props.options.sampleType == FontBrowser.SampleType.LoremIpsum} />
          Lorem Ipsum
        </label>
      </div>
      <div>
        <label>
          <input
            type={'radio'} name={'sample-type'} onChange={handleChanged}
            value={FontBrowser.SampleType.Custom} checked={props.options.sampleType == FontBrowser.SampleType.Custom} />
          Custom Text
        </label>
      </div>
      <div>
        {props.options.sampleType == FontBrowser.SampleType.Custom &&
          <CustomText options={props.options} setOptions={props.setOptions} />}
      </div>
    </form>
  )
}

export function CustomText(
  props: {
    options: FontBrowser.CustomTextOptions,
    setOptions: React.Dispatch<React.SetStateAction<FontBrowser.CustomTextOptions>>
  }) {
  const handleChanged = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.setAttribute('style', 'height: auto');
    e.target.scrollHeight < maxTextAreaHeight
      ? e.target.setAttribute('style', `height: ${e.target.scrollHeight}px`)
      : e.target.setAttribute('style', `height: ${maxTextAreaHeight}px`);
    props.setOptions({ ...props.options, customText: e.target.value });
  };
  return <textarea onChange={handleChanged} value={props.options.customText ?? ''} />
}

export function Families(props: { families: [string, Font[]][] }) {
  const [searchOptions] = useContext(SearchTermContext);
  const searchTerm = searchOptions?.searchTerm?.toLowerCase();
  return (
    <ul>
      {props.families.map(family => {
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

export function Subfamilies(props: { fonts: Font[] }) {
  return (
    <ul>{props.fonts.map(font =>
      <li key={font.fullName}>
        <h4>{font.subfamilyName}</h4>
        <Features fullName={font.fullName} />
        <Sample fontName={font.fullName} filePath={font.file} />
      </li>)}
    </ul>)
}

export function Features(props: { fullName: string }): JSX.Element {
  const [featureList, setFeatureList] = useState<string[]>([]);
  const [availableFeatures, setAvailableFeatures] = useContext(AvailableFeaturesContext);
  useEffect(() => setAvailableFeatures([...new Set([...availableFeatures, ...featureList])]), [featureList])
  useEffect(() => {
    const eventName: string = `feature-update-${slugify(props.fullName)}`;
    const handler = (event: CustomEvent<string[]>) => setFeatureList(event.detail);
    document.addEventListener(eventName, handler);
    return () => document.removeEventListener(eventName, handler);
  }, [props.fullName]);
  return (
    <details>
      <summary>Features</summary>
      <ul>
        {featureList.map((feature: string) =>
          <li className='feature' key={feature}>{feature}</li>)}
      </ul>
    </details>
  );
}

export function Sample(props: { fontName: string, filePath: string }) {
  const sampleText = useContext(SampleTextContext);
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

export function ErrorMessage(props: { message: string }) {
  return <div>{props.message}</div>
}
