import { Disclosure, Transition } from "@headlessui/react";
import { useContext, useMemo } from "react";
import { FontBrowserContexts } from "./contexts";

export function AllFeatures(): JSX.Element {
  const [displayedFonts] = useContext(FontBrowserContexts.DisplayedFontsContext);
  const fontDetails = useContext(FontBrowserContexts.FontDetailsContext);
  const featureList = useMemo(() => {
    return [...new Set([...fontDetails]
      .filter(x => displayedFonts.includes(x[0]))
      .map(x => x[1].features).flat())]
      .sort((a, b) => a?.toString()?.localeCompare(b?.toString()))
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
              <Transition as='table' width={'100%'}
                enter="transition duration-500 ease-out"
                enterFrom="transform scale-95 opacity-0"
                enterTo="transform scale-100 opacity-100"
                leave="transition duration-400 ease-out"
                leaveFrom="transform scale-100 opacity-100"
                leaveTo="transform scale-95 opacity-0">
                <Disclosure.Panel as='tbody'>
                  {(featureList?.length ?? 0) > 0 && featureList?.map(x =>
                    <FeatureCheckbox key={x} feature={x} />) ||
                    <tr><td>No features available</td></tr>}
                </Disclosure.Panel>
              </Transition>
            </td>
          </tr>
        </Disclosure>
      </tbody>
    </table>
  );
}

export function FontFeatures(props: { fullName: string }): JSX.Element {
  const fontDetails = useContext(FontBrowserContexts.FontDetailsContext);
  const featureList = fontDetails.get(props.fullName)?.features
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
          <Transition as='table' width={'100%'}
            enter="transition duration-500 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-400 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0">
            <Disclosure.Panel as='tbody'>
              {(featureList?.length ?? 0) > 0 && featureList?.map(x =>
                <FeatureCheckbox key={x} feature={x} />) ||
                <tr><td>No features available</td></tr>}
            </Disclosure.Panel>
          </Transition>
        </td>
      </tr>
    </Disclosure>
  );
}

function FeatureCheckbox(props: { feature: string }): JSX.Element {
  const featureSpecification = useContext(FontBrowserContexts.FeatureSpecificationContext);
  const [activeFeatures, setActiveFeatures] = useContext(FontBrowserContexts.ActiveFeaturesContext);
  const [searchOptions] = useContext(FontBrowserContexts.SearchTermContext);
  const featureInfo = getFeatureInfo(props.feature, featureSpecification);
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
  if (
    searchOptions?.secretOpenTypeFeatures == true ||
    !featureSpecification.get(props.feature)?.suggestion
      .includes('Control of the feature should not generally be exposed to the user.')) {
    return (
      <Disclosure>
        <tr>
          <td className='align-top'>
            <label>
              <input onChange={handleChanged} type={'checkbox'} checked={activeFeatures.includes(props.feature)} />
              <span>{featureInfo.friendlyName}</span>
            </label>
            <Disclosure.Button className='float-right'>
              info
            </Disclosure.Button>
          </td>
          <td width={'60%'}>
            <Transition
              enter="transition duration-500 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-400 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0">
              <Disclosure.Panel
                dangerouslySetInnerHTML={{ __html: featureInfo.function ?? 'No available information' }}>
              </Disclosure.Panel>
            </Transition>
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
    return { ...featureInfo, friendlyName: friendlyName }
  }
  if (feature?.startsWith('ss')) {
    const featureInfo = context.get('ssXX');
    const friendlyName = featureInfo.friendlyName.replace('%NUMBER%', feature.slice(2));
    return { ...featureInfo, friendlyName: friendlyName }
  }
  // handle feature codes that aren't in the spec
  const featureInfo = context.get(feature);
  if (!featureInfo) return { friendlyName: feature }
  return featureInfo;
}
