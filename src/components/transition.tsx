import { Transition } from '@headlessui/react';

export default function FontBrowserTransition(props: { children: React.ReactNode; additionalProps?: any;}) {
  return (
    <Transition {...props.additionalProps}
      enter='transition duration-500 ease-out'
      enterFrom='transform scale-95 opacity-0'
      enterTo='transform scale-100 opacity-100'
      leave='transition duration-400 ease-out'
      leaveFrom='transform scale-100 opacity-100'
      leaveTo='transform scale-95 opacity-0'>
      {props.children}
    </Transition>
  );
}
