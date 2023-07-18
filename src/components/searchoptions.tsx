import { useContext, useState } from "react";
import { FontBrowserContexts } from "./contexts";
import TagSelect from "./tagselect";

export default function SearchOptions() {
  const [settings, setSettings] = useContext(FontBrowserContexts.SettingsContext);
  const [searchOptions, setSearchOptions] = useContext(FontBrowserContexts.SearchTermContext);
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchOptions({ ...searchOptions, searchTerm: e.target.value });
  const handleGlyphInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchOptions({ ...searchOptions, characters: e.target.value });
  const handleSelectedTypeInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchOptions({ ...searchOptions, selectedFeaturesOnly: e.target.checked });
  const handleSecretTypeInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchOptions({ ...searchOptions, secretOpenTypeFeatures: e.target.checked });
  const handleSetDefault = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setSettings({ ...settings, searchOptions: { ...searchOptions } });
  };
  return (
    <form className='border-b'>
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
      <IncludedTags />
      <ExcludedTags />
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
      <button onClick={handleSetDefault}>Set these options as default</button>
    </form>
  );
}

function IncludedTags() {
  const [tagName, setTagName] = useState('');
  const [searchOptions, setSearchOptions] = useContext(FontBrowserContexts.SearchTermContext);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagName(e.target.value);
  };
  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, tagName: string) => {
    e.preventDefault();
    setSearchOptions({ ...searchOptions, includedTags: searchOptions.includedTags.filter(x => x != tagName) });
  };
  const handleAdd = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (tagName) {
      const includedTags = searchOptions?.includedTags;
      if (Array.isArray(includedTags)) {
        includedTags.push(tagName);
        setSearchOptions({ ...searchOptions, includedTags: [...new Set(includedTags.sort((a, b) => a.localeCompare(b)))] });
      }
      else {
        setSearchOptions({ ...searchOptions, includedTags: [tagName] });
      }
      setTagName('');
    }
  };
  return (
    <div>
      <label>
        <h3>Included Tags</h3>
        <TagSelect tagName={tagName} setTagName={setTagName} handleClick={handleAdd} />
      </label>
      <ul>
        {searchOptions?.includedTags?.map(tag => {
          return (
            <li className='inline' key={tag}>
              “{tag}”
              <button onClick={(e) => handleClick(e, tag)}>x</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ExcludedTags() {
  const [tagName, setTagName] = useState('');
  const [searchOptions, setSearchOptions] = useContext(FontBrowserContexts.SearchTermContext);
  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, tagName: string) => {
    e.preventDefault();
    setSearchOptions({ ...searchOptions, excludedTags: searchOptions.excludedTags.filter(x => x != tagName) });
  };
  const handleAdd = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (tagName) {
      const excludedTags = searchOptions?.excludedTags;
      if (Array.isArray(excludedTags)) {
        excludedTags.push(tagName);
        setSearchOptions({ ...searchOptions, excludedTags: [...new Set(excludedTags.sort((a, b) => a.localeCompare(b)))] });
      }
      else {
        setSearchOptions({ ...searchOptions, excludedTags: [tagName] });
      }
      setTagName('');
    }
  };
  return (
    <div>
      <label>
        <h3>Excluded Tags</h3>
        <TagSelect tagName={tagName} setTagName={setTagName} handleClick={handleAdd} />
      </label>
      <ul>
        {searchOptions?.excludedTags?.map(tag => {
          return (
            <li key={tag}>
              “{tag}”
              <button onClick={(e) => handleClick(e, tag)}>x</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
