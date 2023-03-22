import React, { Context, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { FontBrowser } from '../src/defs';
import getSampleText from './samples';
import featureSpecification from './resource/features.json';

declare global {
  interface Window {
    'api': {
      families: () => Promise<[string, Font[]][]>,
      details: (fileName: string) => Promise<FontDetails>
    }
  }
}

const maxTextAreaHeight = 500;
const SearchTermContext: Context<[SearchAndFilterOptions, React.Dispatch<React.SetStateAction<SearchAndFilterOptions>>]> = createContext(null);
const SampleTypeContext: Context<[FontBrowser.SampleTextOptions, React.Dispatch<React.SetStateAction<FontBrowser.SampleTextOptions>>]> = createContext(null);
const SampleTextContext: Context<string> = createContext(null);
const FontDetailsContext: Context<Map<string, FontDetails>> = createContext(null);
const DisplayedFontsContext: Context<[string[], React.Dispatch<React.SetStateAction<string[]>>]> = createContext(null);
const ActiveFeaturesContext: Context<[string[], React.Dispatch<React.SetStateAction<string[]>>]> = createContext(null);
const FeatureSpecificationContext: Context<Map<string, Feature>> = createContext(null);

export function ErrorMessage(props: { message: string }) {
  return <div>{props.message}</div>
}

export function Index(props: { families: [string, Font[]][] }) {
  const [fontDetails, setFontDetails] = useState<Map<string, FontDetails>>(new Map());
  const [sampleOptions, setSampleOptions] = useState(new FontBrowser.SampleTextOptions(FontBrowser.SampleType.Pangram));
  const [searchOptions, setSearchOptions] = useState<SearchAndFilterOptions>(null);
  const [displayedFonts, setDisplayedFonts] = useState([]);
  const [activeFeatures, setActiveFeatures] = useState([]);
  const sampleText: string = useMemo(() => getSampleText(sampleOptions), [sampleOptions]);
  const features: Map<string, Feature> = useMemo(() => new Map(Object.entries(featureSpecification)), []);
  useEffect(() => {
    props.families.forEach(family => family[1].forEach(async font => {
      const details = await window.api.details(font.file);
      const newMap = new Map(fontDetails.set(font.fullName, details));
      setFontDetails(newMap);
    }));
  }, []);
  return (
    <FontDetailsContext.Provider value={fontDetails}>
      <DisplayedFontsContext.Provider value={[displayedFonts, setDisplayedFonts]}>
        <ActiveFeaturesContext.Provider value={[activeFeatures, setActiveFeatures]}>
          <SearchTermContext.Provider value={[searchOptions, setSearchOptions]}>
            <SampleTypeContext.Provider value={[sampleOptions, setSampleOptions]} >
              <SampleTextContext.Provider value={sampleText}>
                <FeatureSpecificationContext.Provider value={features}>
                  <ContextWrapper families={props.families} />
                </FeatureSpecificationContext.Provider>
              </SampleTextContext.Provider>
            </SampleTypeContext.Provider>
          </SearchTermContext.Provider >
        </ActiveFeaturesContext.Provider>
      </DisplayedFontsContext.Provider>
    </FontDetailsContext.Provider>
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
  const fontDetails = useContext(FontDetailsContext);
  return (
    <details>
      <summary>All Features</summary>
      <ul>
        {[...new Set([...fontDetails]
          .filter(x => displayedFonts.includes(x[0]))
          .map(x => x[1].features).flat())]
          .sort((a, b) => a.localeCompare(b))
          .map(x =>
            <FeatureCheckbox key={x} feature={x} />
          )}
      </ul>
    </details>
  );
}

function getFeatureInfo(feature: string, context: Map<string, Feature>): Feature {
  // I don't love this special-casing but I also don't want to duplicate
  // the character variant entry in the resource file one hundred times
  if (feature.startsWith('cv')) {
    const featureInfo = context.get('cvXX');
    const friendlyName = featureInfo.friendlyName.replace('%NUMBER%', feature.slice(2));
    return { ...featureInfo, friendlyName: friendlyName }
  }
  if (feature.startsWith('ss')) {
    const featureInfo = context.get('ssXX');
    const friendlyName = featureInfo.friendlyName.replace('%NUMBER%', feature.slice(2));
    return { ...featureInfo, friendlyName: friendlyName }
  }
  return context.get(feature);
}

function FeatureInfo(props: { feature: string }) {
  const context = useContext(FeatureSpecificationContext);
  const featureInfo = getFeatureInfo(props.feature, context);
  return <span>{featureInfo?.friendlyName ?? props.feature}</span>;
}

function FeatureDescription(props: { feature: string }) {
  const context = useContext(FeatureSpecificationContext);
  const featureInfo = getFeatureInfo(props.feature, context);
  const featureDescription = featureInfo?.function ?? 'No available information';
  const handleClick = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) =>
    e.currentTarget.querySelector('aside').classList.toggle('hidden');
  return <span onClick={handleClick}> (info)<aside dangerouslySetInnerHTML={{ __html: featureDescription }} className='feature-description hidden'></aside></span>
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
        <FeatureInfo feature={props.feature} />
      </label>
      <FeatureDescription feature={props.feature} />
    </li>
  );
}

function SearchField() {
  const [searchOptions, setSearchOptions] = useContext(SearchTermContext);
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchOptions({ ...searchOptions, searchTerm: e.target.value });
  const handleGlyphInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchOptions({ ...searchOptions, characters: e.target.value });
  const handleSelectedTypeInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchOptions({ ...searchOptions, selectedFeaturesOnly: e.target.checked });
  const handleSecretTypeInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchOptions({ ...searchOptions, secretOpenTypeFeatures: e.target.checked });
  return (
    <form>
      <div>
        <label>
          <input onChange={handleSearchInput} type={'text'} value={searchOptions?.searchTerm ?? ''} />
          Font name search
        </label>
      </div>
      <div>
        <label>
          <input onChange={handleGlyphInput} type={'text'} value={searchOptions?.characters ?? ''} />
          Character search
        </label>
      </div>
      <div>
        <label>
          <input onChange={handleSelectedTypeInput} type={'checkbox'} checked={searchOptions?.selectedFeaturesOnly ?? false} />
          Only show fonts that support selected OpenType features
        </label>
      </div>
      <div>
        <label>
          <input onChange={handleSecretTypeInput} type={'checkbox'} checked={searchOptions?.secretOpenTypeFeatures ?? false} />
          Reveal OpenType features that are not meant to be adjustable
        </label>
      </div>
    </form>
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
            value={FontBrowser.SampleType.Glyphs} checked={sampleOptions.sampleType == FontBrowser.SampleType.Glyphs} />
          Glyphs
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
  const fontDetails = useContext(FontDetailsContext);
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

function getCodePointsFromString(searchString: string): number[] {
  const codePoints: number[] = []
  for (const codePoint of searchString) {
    codePoints.push(codePoint.codePointAt(0));
  }
  return codePoints;
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
  const context = useContext(FeatureSpecificationContext);
  const fontDetails = useContext(FontDetailsContext);
  const [searchOptions] = useContext(SearchTermContext);
  const [activeFeatures] = useContext(ActiveFeaturesContext);
  const features = fontDetails.get(props.fullName)?.features
  return (
    <details>
      <summary>Features</summary>
      <ul>
        {features?.map((feature: string) =>
          <li style={{ fontWeight: activeFeatures.includes(feature) ? 'bold' : 'normal' }} key={feature}>
            <FeatureInfo feature={feature} />
          </li>)}
      </ul>
    </details>
  );
}

function Sample(props: { fontName: string, filePath: string }) {
  const sampleText = useContext(SampleTextContext);
  const fontDetails = useContext(FontDetailsContext);
  const [sampleOptions] = useContext(SampleTypeContext);
  const [activeFeatures] = useContext(ActiveFeaturesContext);
  const [realSampleText, setRealSampleText] = useState(sampleText);
  useEffect(() => {
    const fontInfo = fontDetails.get(props.fontName);
    if (sampleOptions.sampleType == FontBrowser.SampleType.Glyphs && fontInfo) {
      setRealSampleText(fontInfo.characterString);
    }
    else {
      setRealSampleText(sampleText);
    }
  }, [sampleOptions, fontDetails]);
  return (
    <div>
      <style>
        {`@font-face {
            font-family: "${props.fontName}";
            src: url("font://${props.filePath}");
          }`}
      </style>
      <div style={{
        fontFamily: `"${props.fontName}"`,
        whiteSpace: 'pre-wrap',
        fontFeatureSettings: activeFeatures.map(x => `"${x}"`).join(', ')
      }}>
        {realSampleText}
      </div>
    </div>
  );
}
