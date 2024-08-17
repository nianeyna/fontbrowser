import { Context, createContext } from 'react';
import { FontBrowser } from '../types/defs';

export namespace FontBrowserContexts {
  export const SettingsContext: Context<[Settings, React.Dispatch<React.SetStateAction<Settings>>]> = createContext(null);
  export const SampleTextContext: Context<string> = createContext(null);
  export const SearchTermContext: Context<[SearchAndFilterOptions, React.Dispatch<React.SetStateAction<SearchAndFilterOptions>>]> = createContext(null);
  export const SampleTypeContext: Context<[FontBrowser.SampleTextOptions, React.Dispatch<React.SetStateAction<FontBrowser.SampleTextOptions>>]> = createContext(null);
  export const FontDetailsContext: Context<Map<string, FontDetails>> = createContext(null);
  export const LoadedFontsContext: Context<string[]> = createContext([]);
  export const FontFamiliesContext: Context<Family[]> = createContext(null);
  export const DisplayedFontsContext: Context<[string[], React.Dispatch<React.SetStateAction<string[]>>]> = createContext(null);
  export const ActiveFeaturesContext: Context<[Map<string, boolean>, React.Dispatch<React.SetStateAction<Map<string, boolean>>>]> = createContext(null);
  export const FeatureSpecificationContext: Context<Map<string, Feature>> = createContext(null);
}
