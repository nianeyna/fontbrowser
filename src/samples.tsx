import { LoremIpsum } from "lorem-ipsum";
import { FontBrowser } from "./defs";
import pangrams from './resource/pangrams.json';

export default function getSampleText(options: FontBrowser.SampleTextOptions) {
  switch (options.sampleType) {
    case FontBrowser.SampleType.Pangram:
      return pangram();
    case FontBrowser.SampleType.LoremIpsum:
      return loremIpsum();
    case FontBrowser.SampleType.Custom:
      const customTextOptions = options as FontBrowser.CustomTextOptions;
      const customText = customTextOptions.customText;
      return customText ? customText : 'Your text here';
    default:
      throw new TypeError('Invalid SampleType');
  }
}

function pangram(): string {
  try {
    return pangrams[Math.floor(Math.random() * pangrams.length)];
  }
  catch (e) {
    throw new FontBrowser.PangramAccessError('Problem getting sample text.');
  }
}

function loremIpsum(): string {
  try {
    const lorem = new LoremIpsum();
    return lorem.generateParagraphs(1);
  }
  catch (e) {
    throw new FontBrowser.LoremIpsumError('Problem getting sample text.');
  }
}
