import React, { useContext, useEffect, useState } from 'react';
import { FontBrowserContexts } from './contexts';
import { FontBrowser } from '../types/defs';

export function AvailableFeatures() {
  const [displayedFonts] = useContext(FontBrowserContexts.DisplayedFontsContext);
  const fontDetails = useContext(FontBrowserContexts.FontDetailsContext);
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
  const context = useContext(FontBrowserContexts.FeatureSpecificationContext);
  const featureInfo = getFeatureInfo(props.feature, context);
  return <span>{featureInfo?.friendlyName ?? props.feature}</span>;
}

function FeatureDescription(props: { feature: string }) {
  const context = useContext(FontBrowserContexts.FeatureSpecificationContext);
  const featureInfo = getFeatureInfo(props.feature, context);
  const featureDescription = featureInfo?.function ?? 'No available information';
  const handleClick = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) =>
    e.currentTarget.querySelector('aside').classList.toggle('hidden');
  return <span onClick={handleClick}> (info)<aside dangerouslySetInnerHTML={{ __html: featureDescription }} className='feature-description hidden'></aside></span>
}

function FeatureCheckbox(props: { feature: string }) {
  const featureSpecification = useContext(FontBrowserContexts.FeatureSpecificationContext);
  const [activeFeatures, setActiveFeatures] = useContext(FontBrowserContexts.ActiveFeaturesContext);
  const [searchOptions] = useContext(FontBrowserContexts.SearchTermContext);
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
  if (searchOptions?.secretOpenTypeFeatures == true ||
    !featureSpecification.get(props.feature)?.suggestion
      .includes('Control of the feature should not generally be exposed to the user.')) {
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
}

export function SearchField() {
  const [searchOptions, setSearchOptions] = useContext(FontBrowserContexts.SearchTermContext);
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

export function SampleTypeOptions() {
  const [sampleOptions, setSampleOptions] = useContext(FontBrowserContexts.SampleTypeContext);
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
  const maxTextAreaHeight = 500;
  const [sampleOptions, setSampleOptions] = useContext(FontBrowserContexts.SampleTypeContext);
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

export function Families() {
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
  const fontDetails = useContext(FontBrowserContexts.FontDetailsContext);
  const features = fontDetails.get(props.fullName)?.features
  return (
    <details>
      <summary>Features</summary>
      <ul>
        {features?.map((feature: string) => <FeatureCheckbox key={feature} feature={feature} />)}
      </ul>
    </details>
  );
}

function Sample(props: { fontName: string, filePath: string }) {
  const sampleText = useContext(FontBrowserContexts.SampleTextContext);
  const fontDetails = useContext(FontBrowserContexts.FontDetailsContext);
  const [activeFeatures] = useContext(FontBrowserContexts.ActiveFeaturesContext);
  const [characterString, setCharacterString] = useState('');
  const handleClick = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    setCharacterString(fontDetails.get(props.fontName)?.characterString);
    e.currentTarget.parentElement.querySelector('aside').classList.toggle('hidden');
  };
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
        {sampleText}
        <div>
          <button onClick={handleClick}>View all code points</button>
          <aside className='feature-description hidden'>{characterString}</aside>
        </div>
      </div>
    </div>
  );
}
