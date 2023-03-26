import { useContext } from "react";
import { FontBrowserContexts } from "./contexts";

export default function SearchOptions() {
  const [searchOptions, setSearchOptions] = useContext(FontBrowserContexts.SearchTermContext);
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchOptions({ ...searchOptions, searchTerm: e.target.value });
  const handleGlyphInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchOptions({ ...searchOptions, characters: e.target.value });
  const handleSelectedTypeInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchOptions({ ...searchOptions, selectedFeaturesOnly: e.target.checked });
  const handleSecretTypeInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchOptions({ ...searchOptions, secretOpenTypeFeatures: e.target.checked });
  return (
    <form>
      <div>
        <label>
          <input onChange={handleSearchInput} type={'text'} value={searchOptions?.searchTerm ?? ''} />
          Font name search
        </label>
      </div>
      <div>
        <label>
          <input onChange={handleGlyphInput} type={'text'} value={searchOptions?.characters ?? ''} />
          Character search
        </label>
      </div>
      <div>
        <label>
          <input onChange={handleSelectedTypeInput} type={'checkbox'} checked={searchOptions?.selectedFeaturesOnly ?? false} />
          Only show fonts that support selected OpenType features
        </label>
      </div>
      <div>
        <label>
          <input onChange={handleSecretTypeInput} type={'checkbox'} checked={searchOptions?.secretOpenTypeFeatures ?? false} />
          Reveal OpenType features that are not meant to be adjustable
        </label>
      </div>
    </form>
  );
}
