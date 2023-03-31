import { Disclosure, Transition } from "@headlessui/react";
import { useContext, useState } from "react";
import { FontBrowserContexts } from "./contexts";

export default function TagAdd(props: { fullName: string }) {
  const [settings, setSettings] = useContext(FontBrowserContexts.SettingsContext);
  const [tagName, setTagName] = useState('');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagName(e.target.value);
  }
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
  }
  return (
    <tr>
      <Disclosure>
        <td className='align-top'>
          <Disclosure.Button>
            Add tag
          </Disclosure.Button>
        </td>
        <td width={'60%'}>
          <Transition
            enter="transition duration-500 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-400 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0">
            <Disclosure.Panel>
              <input onChange={handleChange} type={'text'} value={tagName} />
              <button onClick={handleAdd}>Add</button>
            </Disclosure.Panel>
          </Transition>
        </td>
      </Disclosure>
    </tr>
  );
}
