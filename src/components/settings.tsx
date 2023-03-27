import { useContext, useState } from "react";
import { FontBrowserContexts } from "./contexts";

export default function Settings() {
  const [settings, setSettings] = useContext(FontBrowserContexts.SettingsContext);
  const [folderInput, setFolderInput] = useState<FontFolder>({ folderPath: '', subfolders: false });
  const handleFolderPathInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFolderInput({ ...folderInput, folderPath: e.target.value });
  const handleSubfolderInput = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFolderInput({ ...folderInput, subfolders: e.target.checked });
  const handleFolderSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // do some validation on the folder path?
    e.preventDefault();
    const newFolderList = [...settings?.fontFolders || []];
    newFolderList.push(folderInput);
    const sorted = [...new Set(newFolderList)].sort((a, b) => a.folderPath.localeCompare(b.folderPath));
    setSettings({ ...settings, fontFolders: sorted });
    setFolderInput({ folderPath: '', subfolders: false });
  }
  const handleRemoveFolder = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, folder: string) =>
  {
    e.preventDefault();
    const newFolderList = [...settings.fontFolders].filter(x => x.folderPath != folder);
    setSettings({...settings, fontFolders: newFolderList});
  }
  return (
    <>
      <h3 className='font-bold'>Folders to load fonts from:</h3>
      <ul>
        {settings?.fontFolders?.map(x => {
          return (
            <li key={x.folderPath}>
              {x.folderPath} {x.subfolders ? '(and subfolders)' : '(no subfolders)'}
              <button onClick={(e) => handleRemoveFolder(e, x.folderPath)}>Remove from list</button>
            </li>);
        })}
      </ul>
      <h3 className='font-bold'>Add a folder</h3>
      <form onSubmit={handleFolderSubmit}>
        <label>
          <input onChange={handleFolderPathInput} type={'text'} value={folderInput.folderPath} />
          Add font folder
        </label>
        <label>
          <input onChange={handleSubfolderInput} type={'checkbox'} checked={folderInput.subfolders} />
          Also get fonts from subfolders of this folder
        </label>
        <button type='submit'>Add</button>
      </form>
    </>
  );
}
