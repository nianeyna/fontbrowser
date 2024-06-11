import { Disclosure } from '@headlessui/react';
import { useContext, useState } from 'react';
import { FontBrowserContexts } from './contexts';
import TagSelect from './tagselect';
import FontBrowserTransition from './transition';

export default function TagAdd(props: { fullName: string; }) {
  const [settings, setSettings] = useContext(FontBrowserContexts.SettingsContext);
  const [tagName, setTagName] = useState('');
  const handleAdd = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (!tagName) return;
    const allTags = settings?.tags;
    const fontIndex = allTags?.findIndex(x => x[0] == props.fullName);
    if (fontIndex >= 0) {
      const existingTags = allTags[fontIndex];
      existingTags[1].push(tagName);
      const newTags = [...new Set(existingTags[1])].sort((a, b) => a.localeCompare(b));
      allTags[fontIndex][1] = newTags;
    }
    else {
      const fontTags: [string, string[]] = [props.fullName, [tagName]];
      if (allTags) {
        allTags.push(fontTags);
      }
      else {
        setSettings({ ...settings, tags: [fontTags] });
        setTagName('');
        return;
      }
    }
    setSettings({ ...settings, tags: [...allTags] });
    setTagName('');
  };
  return (
    <tr>
      <Disclosure>
        <td className='align-top'>
          <Disclosure.Button>
            Add tag
          </Disclosure.Button>
        </td>
        <td width={'60%'}>
          <FontBrowserTransition children={
            <Disclosure.Panel>
              <TagSelect tagName={tagName} setTagName={setTagName} handleClick={handleAdd} />
            </Disclosure.Panel>
          } />
        </td>
      </Disclosure>
    </tr>
  );
}
