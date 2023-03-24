import { Context, createContext } from "react";
import { FontBrowser } from "../types/defs";

export namespace FontBrowserContexts {
  export const SampleTextContext: Context<string> = createContext(null);
  export const SearchTermContext: Context<[SearchAndFilterOptions, React.Dispatch<React.SetStateAction<SearchAndFilterOptions>>]> = createContext(null);
  export const SampleTypeContext: Context<[FontBrowser.SampleTextOptions, React.Dispatch<React.SetStateAction<FontBrowser.SampleTextOptions>>]> = createContext(null);
  export const FontDetailsContext: Context<Map<string, FontDetails>> = createContext(null);
  export const FontFamiliesContext: Context<[string, Font[]][]> = createContext(null);
  export const DisplayedFontsContext: Context<[string[], React.Dispatch<React.SetStateAction<string[]>>]> = createContext(null);
  export const ActiveFeaturesContext: Context<[string[], React.Dispatch<React.SetStateAction<string[]>>]> = createContext(null);
  export const FeatureSpecificationContext: Context<Map<string, Feature>> = createContext(null); 
}