import React, { Context, createContext, useContext, useEffect, useState } from 'react';
import { FontBrowser } from '../src/defs'
import getSampleText from './samples';
import slugify from 'slugify';

const SampleTextContext: Context<string> = createContext(null);

export function Index(props: { families: [string, Font[]][] }) {
  const [sampleType, setSampleType] = useState(FontBrowser.SampleType.Pangram);
  return (
    <SampleTextContext.Provider value={getSampleText(sampleType)} >
      <SampleTextOptions sampleType={sampleType} setSampleType={setSampleType} />
      <Families families={props.families} />
    </SampleTextContext.Provider>
  );
}

export function SampleTextOptions(props: { sampleType: FontBrowser.SampleType, setSampleType: React.Dispatch<React.SetStateAction<FontBrowser.SampleType>> }) {
  const handleChanged = (e: React.ChangeEvent<HTMLInputElement>) => props.setSampleType(Number(e.target.value));
  return (
    <form>
      <label>
        <input onChange={handleChanged} type={'radio'} name={'sample-type'} value={FontBrowser.SampleType.Pangram} checked={props.sampleType == FontBrowser.SampleType.Pangram} />
        Pangram
      </label>
      <label>
        <input onChange={handleChanged} type={'radio'} name={'sample-type'} value={FontBrowser.SampleType.LoremIpsum} checked={props.sampleType == FontBrowser.SampleType.LoremIpsum} />
        Lorem Ipsum
      </label>
    </form>
  )
}

export function Families(props: { families: [string, Font[]][] }) {
  return (
    <ul>
      {props.families.map(family =>
        <li key={family[0]}>
          <h3>{family[0]}</h3>
          <Subfamilies fonts={family[1]} />
        </li>)}
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
          <li key={feature}>{feature}</li>)}
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
