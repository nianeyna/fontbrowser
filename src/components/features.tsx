import { Disclosure } from '@headlessui/react';
import { useContext, useMemo } from 'react';
import { FontBrowserContexts } from './contexts';
import FontBrowserTransition from './transition';

export function AllFeatures(): JSX.Element {
  const [displayedFonts] = useContext(FontBrowserContexts.DisplayedFontsContext);
  const fontDetails = useContext(FontBrowserContexts.FontDetailsContext);
  const featureList = useMemo(() => {
    return [...new Set([...fontDetails]
      .filter(x => displayedFonts.includes(x[0]))
      .map(x => x[1].features).flat())]
      .sort((a, b) => a?.toString()?.localeCompare(b?.toString()));
  }, [displayedFonts, fontDetails]);
  return (
    <table width={'100%'}>
      <tbody>
        <Disclosure>
          <tr>
            <td>
              <Disclosure.Button className='align-top'>
                All Features
              </Disclosure.Button>
            </td>
          </tr>
          <tr>
            <td colSpan={2}>
              <FontBrowserTransition additionalProps={{as: 'table', width: '100%'}} children={
                <Disclosure.Panel as='tbody'>
                  {(featureList?.length ?? 0) > 0 && featureList?.map(x =>
                    <FeatureCheckbox key={x} feature={x} context='fontbrowser-all-features' />) ||
                    <tr><td>No features available</td></tr>}
                </Disclosure.Panel>
              } />
            </td>
          </tr>
        </Disclosure>
      </tbody>
    </table>
  );
}

export function FontFeatures(props: { fullName: string; }): JSX.Element {
  const fontDetails = useContext(FontBrowserContexts.FontDetailsContext);
  const featureList = fontDetails.get(props.fullName)?.features;
  return (
    <Disclosure>
      <tr>
        <td>
          <Disclosure.Button className='align-top'>
            Features
          </Disclosure.Button>
        </td>
      </tr>
      <tr>
        <td colSpan={2}>
          <FontBrowserTransition additionalProps={{as: 'table', width: '100%'}} children={
            <Disclosure.Panel as='tbody'>
              {(featureList?.length ?? 0) > 0 && featureList?.map(x =>
                <FeatureCheckbox key={x} feature={x} context={props.fullName} />) ||
                <tr><td>No features available</td></tr>}
            </Disclosure.Panel>
          } />
        </td>
      </tr>
    </Disclosure>
  );
}

function FeatureCheckbox(props: { feature: string, context: string; }): JSX.Element {
  const featureSpecification = useContext(FontBrowserContexts.FeatureSpecificationContext);
  const [activeFeatures, setActiveFeatures] = useContext(FontBrowserContexts.ActiveFeaturesContext);
  const [searchOptions] = useContext(FontBrowserContexts.SearchTermContext);
  const featureInfo = getFeatureInfo(props.feature, featureSpecification);
  const checked = useMemo(() => {
    const entry = activeFeatures.get(props.feature);
    if (entry == undefined) {
      return 'default';
    }
    return entry ? 'on' : 'off';
  }, [activeFeatures]);
  const handleChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      if (e.target.value == 'off') {
        setActiveFeatures(new Map(activeFeatures.set(props.feature, false)));
      }
      else if (e.target.value == 'on') {
        setActiveFeatures(new Map(activeFeatures.set(props.feature, true)));
      }
      else {
        activeFeatures.delete(props.feature);
        setActiveFeatures(new Map(activeFeatures));
      }
    }
  };
  if (
    searchOptions?.secretOpenTypeFeatures == true ||
    !featureSpecification.get(props.feature)?.suggestion
      .includes('Control of the feature should not generally be exposed to the user.')) {
    return (
      <Disclosure>
        <tr>
          <td className='align-top'>
            <div className='flex flex-row justify-between'>
              <label>
                <div className='inline rounded m-1 border dark:border-none dark:bg-nia-primary'>
                  <label className='toggle-box rounded px-1'>
                    <input className='hidden' type='radio' name={`feature-${props.feature}-${props.context}`} onChange={handleChanged} value='off' checked={checked == 'off'} />
                    <span aria-label='off'>✗</span>
                  </label>
                  <label className='toggle-box rounded px-1'>
                    <input className='hidden' type='radio' name={`feature-${props.feature}-${props.context}`} onChange={handleChanged} value='default' checked={checked == 'default'} />
                    <span aria-label='default'>○</span>
                  </label>
                  <label className='toggle-box rounded px-1'>
                    <input className='hidden' type='radio' name={`feature-${props.feature}-${props.context}`} onChange={handleChanged} value='on' checked={checked == 'on'} />
                    <span aria-label='on'>✓</span>
                  </label>
                </div>
                <span className='pl-1'>{featureInfo.friendlyName}</span>
              </label>
              <Disclosure.Button>
                info
              </Disclosure.Button>
            </div>
          </td>
          <td width={'60%'}>
            <FontBrowserTransition children={
              <Disclosure.Panel
                dangerouslySetInnerHTML={{ __html: featureInfo.function ?? 'No available information' }}>
              </Disclosure.Panel>
            } />
          </td>
        </tr>
      </Disclosure>
    );
  }
}

function getFeatureInfo(feature: string, context: Map<string, Feature>): Feature {
  // I don't love this special-casing but I also don't want to duplicate
  // the character variant entry in the resource file one hundred times
  if (feature?.startsWith('cv')) {
    const featureInfo = context.get('cvXX');
    const friendlyName = featureInfo.friendlyName.replace('%NUMBER%', feature.slice(2));
    return { ...featureInfo, friendlyName: friendlyName };
  }
  if (feature?.startsWith('ss')) {
    const featureInfo = context.get('ssXX');
    const friendlyName = featureInfo.friendlyName.replace('%NUMBER%', feature.slice(2));
    return { ...featureInfo, friendlyName: friendlyName };
  }
  // handle feature codes that aren't in the spec
  const featureInfo = context.get(feature);
  if (!featureInfo) return { friendlyName: feature };
  return featureInfo;
}
