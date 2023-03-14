export default function index(families: [string, Font[]][], sampleText: string) {
  return Families({ families, sampleText });
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
