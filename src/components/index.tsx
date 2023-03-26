import { useState, useMemo, useEffect } from "react";
import { FontBrowser } from "../types/defs";
import { FontBrowserContexts } from "./contexts";
import featureSpecification from '../resource/features.json';
import getSampleText from '../frontendlogic/samples';
import Layout from "./layout";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    'api': {
      families: () => Promise<[string, Font[]][]>,
      details: (fileName: string) => Promise<FontDetails>,
      getSettings: () => Promise<Settings>,
      setSettings: (settings: Settings) => Promise<void>
    }
  }
}

export default function Index() {
  const location = useLocation();
  const [settings, setSettings] = useState<Settings>(null);
  const [families, setFamilies] = useState<[string, Font[]][]>([]);
  const [fontDetails, setFontDetails] = useState<Map<string, FontDetails>>(new Map());
  const [sampleOptions, setSampleOptions] = useState(new FontBrowser.SampleTextOptions(FontBrowser.SampleType.Pangram));
  const [searchOptions, setSearchOptions] = useState<SearchAndFilterOptions>(null);
  const [displayedFonts, setDisplayedFonts] = useState([]);
  const [activeFeatures, setActiveFeatures] = useState([]);
  const sampleText: string = useMemo(() => getSampleText(sampleOptions), [sampleOptions]);
  const features: Map<string, Feature> = useMemo(() => new Map(Object.entries(featureSpecification)), []);
  useEffect(() => {
    window.api.getSettings().then(result => setSettings(result));
  }, [location]);
  useEffect(() => {
    if (settings) {
      window.api.setSettings(settings);
    }
  }, [settings]);
  useEffect(() => {
    window.api.families().then(result => setFamilies(result));
  }, [settings]);
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
                    <FontBrowserContexts.SettingsContext.Provider value={[settings, setSettings]}>
                      <Layout />
                    </FontBrowserContexts.SettingsContext.Provider>
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
