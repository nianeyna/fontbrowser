import { Combobox, Transition } from "@headlessui/react";
import { useContext, useMemo } from "react";
import { FontBrowserContexts } from "./contexts";

export default function TagSelect(props: {
  tagName: string,
  setTagName: React.Dispatch<React.SetStateAction<string>>,
  handleClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}) {
  const [settings] = useContext(FontBrowserContexts.SettingsContext);
  const tagList = useMemo(() => {
    return [...new Set(settings?.tags?.map(x => x[1]).flat())].sort((a, b) => a.localeCompare(b)) ?? [];
  }, [settings]);
  const filteredTagList = props.tagName ? tagList.filter(tag => {
    const processedTag = tag.toLowerCase();
    const processedTagName = props.tagName.toLowerCase();
    return processedTag.includes(processedTagName);
  }) : tagList;
  return (
    <Combobox value={props.tagName} onChange={props.setTagName}>
      <div className='flex'>
        <div className='w-max'>
          <Combobox.Button as='div'>
            <Combobox.Input onChange={(e) => props.setTagName(e.target.value)} />
          </Combobox.Button>
          <Transition
            enter="transition duration-500 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-400 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0">
            <Combobox.Options static style={{ minWidth: 'calc(100% - .5rem)' }} className='w-0 max-h-40 m-1 px-1 overflow-auto rounded border dark:border-none dark:bg-nia-primary'>
              {filteredTagList.map(tag => (
                <Combobox.Option key={tag} value={tag}>
                  {tag}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </Transition>
        </div>
        <button className='self-start' onClick={props.handleClick}>Add</button>
      </div>
    </Combobox>
  );
}
