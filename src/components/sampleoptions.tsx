import { useContext } from 'react';
import { FontBrowser } from '../types/defs';
import { FontBrowserContexts } from './contexts';

export default function SampleOptions() {
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
          <CustomTextOptions />}
      </div>
    </form>
  )
}

function CustomTextOptions() {
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
