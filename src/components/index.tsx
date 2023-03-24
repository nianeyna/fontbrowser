import { useState, useMemo, useEffect } from "react";
import { FontBrowser } from "../types/defs";
import { AvailableFeatures, Families, SampleTypeOptions, SearchField } from "./components";
import { FontBrowserContexts } from "./contexts";
import featureSpecification from '../resource/features.json';
import getSampleText from '../frontendlogic/samples';

declare global {
  interface Window {
    'api': {
      families: () => Promise<[string, Font[]][]>,
      details: (fileName: string) => Promise<FontDetails>
    }
  }
}

export function Index() {
  const [families, setFamilies] = useState<[string, Font[]][]>([]);
  const [fontDetails, setFontDetails] = useState<Map<string, FontDetails>>(new Map());
  const [sampleOptions, setSampleOptions] = useState(new FontBrowser.SampleTextOptions(FontBrowser.SampleType.Pangram));
  const [searchOptions, setSearchOptions] = useState<SearchAndFilterOptions>(null);
  const [displayedFonts, setDisplayedFonts] = useState([]);
  const [activeFeatures, setActiveFeatures] = useState([]);
  const sampleText: string = useMemo(() => getSampleText(sampleOptions), [sampleOptions]);
  const features: Map<string, Feature> = useMemo(() => new Map(Object.entries(featureSpecification)), []);
  useEffect(() => {
    window.api.families().then(result => setFamilies(result));
  }, []);
  useEffect(() => {
    families.forEach(family => family[1].forEach(async font => {
      const details = await window.api.details(font.file);
      const newMap = new Map(fontDetails.set(font.fullName, details));
      setFontDetails(newMap);
    }));
  }, [families]);
  return (
    <FontBrowserContexts.FontDetailsContext.Provider value={fontDetails}>
      <FontBrowserContexts.DisplayedFontsContext.Provider value={[displayedFonts, setDisplayedFonts]}>
        <FontBrowserContexts.ActiveFeaturesContext.Provider value={[activeFeatures, setActiveFeatures]}>
          <FontBrowserContexts.SearchTermContext.Provider value={[searchOptions, setSearchOptions]}>
            <FontBrowserContexts.SampleTypeContext.Provider value={[sampleOptions, setSampleOptions]} >
              <FontBrowserContexts.SampleTextContext.Provider value={sampleText}>
                <FontBrowserContexts.FontFamiliesContext.Provider value={families}>
                  <FontBrowserContexts.FeatureSpecificationContext.Provider value={features}>
                    <SearchField />
                    <SampleTypeOptions />
                    <AvailableFeatures />
                    <Families />
                  </FontBrowserContexts.FeatureSpecificationContext.Provider>
                </FontBrowserContexts.FontFamiliesContext.Provider>
              </FontBrowserContexts.SampleTextContext.Provider>
            </FontBrowserContexts.SampleTypeContext.Provider>
          </FontBrowserContexts.SearchTermContext.Provider >
        </FontBrowserContexts.ActiveFeaturesContext.Provider>
      </FontBrowserContexts.DisplayedFontsContext.Provider>
    </FontBrowserContexts.FontDetailsContext.Provider>
  );
}
