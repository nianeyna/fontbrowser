import FontFaceObserver from 'fontfaceobserver';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import getSampleText from '../frontendlogic/samples';
import featureSpecification from '../resource/features.json';
import { FontBrowser } from '../types/defs';
import { FontBrowserContexts } from './contexts';
import Layout from './layout';

export default function Index(props: { linkedFonts: string[]; }) {
  const location = useLocation();

  const [families, setFamilies] = useState<Family[]>([]);
  const [filteredFamilies, setFilteredFamilies] = useState<Family[]>([]);
  const [settings, setSettings] = useState<Settings>(null);
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
    window.api.getSettings().then(previous => {
      if (families.length === 0 || previous?.fontFolders?.toString() !== settings?.fontFolders?.toString()) {
        window.api.families().then(result => setFamilies(result));
      }
    });
    if (settings) {
      window.api.setSettings(settings);
      if (settings.searchOptions && !searchOptions) {
        setSearchOptions(settings.searchOptions);
      }
      if (settings.sampleOptions) {
        setSampleOptions(settings.sampleOptions);
      }
    }
  }, [settings]);

  useEffect(() => {
    const searchTerm = searchOptions?.searchTerm?.toLowerCase();
    const newFontList: Family[] = families.map(family => {
      const filteredFonts = family.fonts
        .filter(subfamily => searchTerm
          ? subfamily.fullName.toString().toLowerCase().includes(searchTerm)
          : true) // don't filter if there is no search term
        .filter(subfamily => searchOptions?.selectedFeaturesOnly == true && activeFeatures.size > 0
          ? (fontDetails.get(subfamily.fullName)?.features ?? [])
            .some(feature => activeFeatures.has(feature))
          : true)
        .filter(subfamily => searchOptions?.characters
          ? getCodePointsFromString(searchOptions.characters)
            .every(point => fontDetails.get(subfamily.fullName).characters.includes(point))
          : true)
        .filter(subfamily => {
          const fontEntry = settings?.tags?.find(x => x[0] == subfamily.fullName);
          const includedTags = searchOptions?.includedTags;
          const excludedTags = searchOptions?.excludedTags;
          if (Array.isArray(fontEntry) && fontEntry[1].length > 0) { // font has any tags at all
            const tags = fontEntry[1];
            return (!includedTags || includedTags.length <= 0 || tags.some(tag => includedTags.includes(tag)))
              && (!excludedTags || excludedTags.length <= 0 || tags.every(tag => !excludedTags.includes(tag)));
          }
          else if (includedTags && includedTags.length > 0) { // included tags specified
            return false;
          }
          return true;
        });
      return { name: family.name, fonts: filteredFonts };
    });
    setDisplayedFonts(newFontList.flatMap(family => family.fonts).map(font => font.fullName));
    setFilteredFamilies(newFontList.filter(family => family.fonts.length > 0));
  }, [searchOptions, activeFeatures, families]);

  useEffect(() => {
    families.forEach(family => family.fonts.forEach(async font => {
      if (!font.fullName || props.linkedFonts.includes(font.fullName)) return;
      const details = await window.api.details(font.file);
      setFontDetails(new Map(fontDetails.set(font.fullName, details)));
      props.linkedFonts.push(font.fullName);
      const observer = new FontFaceObserver(font.fullName);
      loadFont(observer, font, details.characterString[0], setLoadedFonts);
    }));
  }, [families]);

  return (
    <FontBrowserContexts.FontDetailsContext.Provider value={fontDetails}>
      <FontBrowserContexts.DisplayedFontsContext.Provider value={[displayedFonts, setDisplayedFonts]}>
        <FontBrowserContexts.ActiveFeaturesContext.Provider value={[activeFeatures, setActiveFeatures]}>
          <FontBrowserContexts.SearchTermContext.Provider value={[searchOptions, setSearchOptions]}>
            <FontBrowserContexts.SampleTypeContext.Provider value={[sampleOptions, setSampleOptions]} >
              <FontBrowserContexts.SampleTextContext.Provider value={sampleText}>
                <FontBrowserContexts.FontFamiliesContext.Provider value={filteredFamilies}>
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

function loadFont(observer: FontFaceObserver, font: Font, character: string, setLoadedFonts: React.Dispatch<React.SetStateAction<any[]>>) {
  observer.load(character, 100000).then(function () {
    setLoadedFonts(x => [...x, font.fullName]);
  }).catch(function (e) {
    loadFont(observer, font, character, setLoadedFonts);
  });
}

function getCodePointsFromString(searchString: string): number[] {
  const codePoints: number[] = [];
  for (const codePoint of searchString) {
    codePoints.push(codePoint.codePointAt(0));
  }
  return codePoints;
}
