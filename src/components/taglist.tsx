import { Disclosure, Transition } from "@headlessui/react";
import { useContext } from "react";
import { FontBrowserContexts } from "./contexts";

export default function TagList(props: { fullName: string, tagList: string[] }) {
  const [settings, setSettings] = useContext(FontBrowserContexts.SettingsContext);
  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, tagName: string) => {
    e.preventDefault();
    const fontIndex = settings?.tags?.findIndex(x => x[0] == props.fullName);
    if (fontIndex >= 0) {
      const tagList = settings.tags;
      const newTags = tagList[fontIndex][1].filter(x => x != tagName);
      tagList[fontIndex][1] = newTags;
      setSettings({ ...settings, tags: [...tagList] });
    }
  }
  return (
    <Disclosure>
      <td className='align-top'>
        <Disclosure.Button>
          Tags
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
            {props.tagList.map(tag =>
              <span key={tag}>
                {`“${tag}”`}
                <button onClick={(e) => handleClick(e, tag)}>x</button>
              </span>
            )}
          </Disclosure.Panel>
        </Transition>
      </td>
    </Disclosure>
  )
}
