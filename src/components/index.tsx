import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FontBrowser } from "../types/defs";
import { FontBrowserContexts } from "./contexts";
import featureSpecification from '../resource/features.json';
import getSampleText from '../frontendlogic/samples';
import Layout from "./layout";
import FontFaceObserver from 'fontfaceobserver';

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

export default function Index(props: { linkedFonts: string[] }) {
  const location = useLocation();
  const [settings, setSettings] = useState<Settings>(null);
  const [families, setFamilies] = useState<[string, Font[]][]>([]);
  const [loadedFonts, setLoadedFonts] = useState([]);
  const [fontDetails, setFontDetails] = useState<Map<string, FontDetails>>(new Map());
  const [sampleOptions, setSampleOptions] = useState(new FontBrowser.SampleTextOptions(FontBrowser.SampleType.Pangram));
  const [searchOptions, setSearchOptions] = useState<SearchAndFilterOptions>(null);
  const [displayedFonts, setDisplayedFonts] = useState([]);
  const [activeFeatures, setActiveFeatures] = useState(new Map());
  const sampleText: string = useMemo(() => getSampleText(sampleOptions), [sampleOptions]);
  const features: Map<string, Feature> = useMemo(() => new Map(Object.entries(featureSpecification)), []);
  useEffect(() => {
    window.api.getSettings().then(result => setSettings(result));
  }, [location]);
  useEffect(() => {
    window.api.families().then(result => setFamilies(result));
    if (settings) {
      window.api.setSettings(settings);
      if (settings.searchOptions && !searchOptions) {
        setSearchOptions(settings.searchOptions);
      }
    }
  }, [settings]);
  useEffect(() => {
    families.forEach(family => family[1].forEach(async font => {
      const details = await window.api.details(font.file);
      const newMap = new Map(fontDetails.set(font.fullName, details));
      setFontDetails(newMap);
      if (!font.fullName || props.linkedFonts.includes(font.fullName)) return;
      const linkTag = document.createElement('link');
      linkTag.rel = 'preload';
      linkTag.href = `font://${font.file}`;
      linkTag.as = 'font';
      linkTag.crossOrigin = 'anonymous';
      document.head.appendChild(linkTag);
      props.linkedFonts.push(font.fullName);
      const observer = new FontFaceObserver(font.fullName);
      observer.load(details.characterString[0], 100000).then(function () {
        setLoadedFonts(x => [...x, font.fullName]);
      }).catch(function (e) { // todo retries
        console.log('could not load font ' + font.fullName, e);
      });
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
                      <FontBrowserContexts.LoadedFontsContext.Provider value={loadedFonts}>
                        <Layout />
                      </FontBrowserContexts.LoadedFontsContext.Provider>
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
