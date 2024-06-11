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

  const [families, setFamilies] = useState<[string, Font[]][]>([]);
  const [filteredFamilies, setFilteredFamilies] = useState<[string, Font[]][]>([]);
  const [pagedFamilies, setPagedFamilies] = useState<[string, Font[]][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastIndex, setLastIndex] = useState(20);
  const [settings, setSettings] = useState<Settings>(null);
  const [loadedFonts, setLoadedFonts] = useState([]);
  const [erroredFonts, setErroredFonts] = useState([]);
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
    }
  }, [settings]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
      const scrollHeight = (document.documentElement && document.documentElement.scrollHeight) || document.body.scrollHeight;
      if (scrollTop + window.innerHeight + 50 >= scrollHeight && !isLoading) {
        setLastIndex(x => x + 20);
      }
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading]);

  useEffect(() => {
    const searchTerm = searchOptions?.searchTerm?.toLowerCase();
    const newFontList: [string, Font[]][] = families.map(family => {
      const familyName = family[0];
      const filteredFonts = family[1]
        .filter(subfamily => searchTerm
          ? subfamily.fullName.toLowerCase().includes(searchTerm)
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
      return [familyName, filteredFonts];
    });
    setDisplayedFonts(newFontList.map(family => family[1]).flat().map(font => font.fullName));
    setFilteredFamilies(newFontList);
  }, [searchOptions, activeFeatures, families]);

  useEffect(() => {
    setIsLoading(true);
    setPagedFamilies(filteredFamilies.filter(family => family[1].length > 0).slice(0, lastIndex));
    setIsLoading(false);
  }, [filteredFamilies, lastIndex]);

  useEffect(() => {
    pagedFamilies.forEach(family => family[1].forEach(async font => {
      if (!font.fullName || props.linkedFonts.includes(font.fullName)) return;
      const details = await window.api.details(font.file);
      const newMap = new Map(fontDetails.set(font.fullName, details));
      setFontDetails(newMap);
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
        setErroredFonts(x => [...x, font.fullName]);
      });
    }));
  }, [pagedFamilies]);

  return (
    <FontBrowserContexts.FontDetailsContext.Provider value={fontDetails}>
      <FontBrowserContexts.DisplayedFontsContext.Provider value={[displayedFonts, setDisplayedFonts]}>
        <FontBrowserContexts.ActiveFeaturesContext.Provider value={[activeFeatures, setActiveFeatures]}>
          <FontBrowserContexts.SearchTermContext.Provider value={[searchOptions, setSearchOptions]}>
            <FontBrowserContexts.SampleTypeContext.Provider value={[sampleOptions, setSampleOptions]} >
              <FontBrowserContexts.SampleTextContext.Provider value={sampleText}>
                <FontBrowserContexts.FontFamiliesContext.Provider value={pagedFamilies}>
                  <FontBrowserContexts.FeatureSpecificationContext.Provider value={features}>
                    <FontBrowserContexts.SettingsContext.Provider value={[settings, setSettings]}>
                      <FontBrowserContexts.LoadedFontsContext.Provider value={[loadedFonts, erroredFonts]}>
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

function getCodePointsFromString(searchString: string): number[] {
  const codePoints: number[] = [];
  for (const codePoint of searchString) {
    codePoints.push(codePoint.codePointAt(0));
  }
  return codePoints;
}
