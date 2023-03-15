import { FontBrowser } from '../src/defs'

export default function index(families: [string, Font[]][], sampleType: FontBrowser.SampleType, sampleText: string, onSelectSampleType: (x: FontBrowser.SampleType) => void) {
  return (
    <>
      <SampleTextOptions selected={sampleType} onSelectSampleType={onSelectSampleType} />
      <Families families={families} sampleText={sampleText} />
    </>
  );
}

export function SampleTextOptions(props: {selected: FontBrowser.SampleType, onSelectSampleType: (x: FontBrowser.SampleType) => void }) {
  const handleChanged = (e: React.ChangeEvent<HTMLInputElement>) => props.onSelectSampleType(Number(e.target.value));
  return (
    <form>
      <label>
        <input onChange={handleChanged} type={'radio'} name={'sample-type'} value={FontBrowser.SampleType.Pangram} checked={props.selected == FontBrowser.SampleType.Pangram} />
        Pangram
      </label>
      <label>
        <input onChange={handleChanged} type={'radio'} name={'sample-type'} value={FontBrowser.SampleType.LoremIpsum} checked={props.selected == FontBrowser.SampleType.LoremIpsum} />
        Lorem Ipsum
      </label>
    </form>
  )
}

export function Families(props: { families: [string, Font[]][], sampleText: string }) {
  return (
    <ul>
      {props.families.map(family =>
        <li key={family[0]}>
          <h3>{family[0]}</h3>
          <Subfamilies fonts={family[1]} sampleText={props.sampleText} />
        </li>)}
    </ul>
  );
}

export function Subfamilies(props: { fonts: Font[], sampleText: string }) {
  return (
    <ul>{props.fonts.map(font =>
      <li key={font.fullName}>
        <h4>{font.subfamilyName}</h4>
        <Features features={font.availableFeatures} />
        <Sample fontName={font.fullName} filePath={font.file} sampleText={props.sampleText} />
      </li>)}
    </ul>)
}

export function Features(props: { features: string[] }): JSX.Element {
  return (
    <details>
      <summary>Features</summary>
      <ul>
        {props.features.map((feature: string) =>
          <li key={feature}>{feature}</li>)}
      </ul>
    </details>
  );
}

export function Sample(props: { fontName: string, filePath: string, sampleText: string }) {
  return (
    <div>
      <style>
        {`@font-face {
            font-family: "${props.fontName}";
            src: url("font://${props.filePath}");
          }`}
      </style>
      <div style={{ fontFamily: `"${props.fontName}"` }}>{props.sampleText}</div>
    </div>
  );
}

export function ErrorMessage(props: { message: string }) {
  return <div>{props.message}</div>
}
