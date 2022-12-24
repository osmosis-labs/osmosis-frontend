import { Disclosure, Transition } from "@headlessui/react";
import classNames from "classnames";
import { Fragment, FunctionComponent, HTMLProps } from "react";
import { runIfFn } from "../../utils/function";
import { createContext } from "../../utils/react-context";

const [DrawerPropsProvider, useDrawerProps] = createContext<{
  open: boolean;
  close: () => void;
}>();

export const Drawer: FunctionComponent<Parameters<typeof Disclosure>[0]> = (
  props
) => {
  return (
    <Disclosure {...props}>
      {(ctx) => (
        <DrawerPropsProvider value={ctx}>
          {runIfFn(props.children, ctx)}
        </DrawerPropsProvider>
      )}
    </Disclosure>
  );
};

export const DrawerButton: FunctionComponent<
  Parameters<typeof Disclosure.Button>[0]
> = (props) => (
  <Disclosure.Button
    as={typeof props.children === "string" ? "button" : Fragment}
    {...props}
  />
);

export const DrawerOverlay: FunctionComponent<
  HTMLProps<HTMLDivElement>
> = () => {
  const { open, close } = useDrawerProps();
  return (
    <Transition
      as={Fragment}
      show={open}
      enter="transition duration-300 ease-inOutBack"
      enterFrom="invisible opacity-0"
      enterTo="visible opacity-100"
      leave="transition duration-300 ease-inOutBack"
      leaveFrom="visible opacity-100"
      leaveTo="visible opacity-0"
    >
      <div
        onClick={() => close()}
        className="absolute inset-0 z-40 bg-osmoverse-1000/40"
      />
    </Transition>
  );
};

export const DrawerPanel: FunctionComponent<
  Parameters<typeof Disclosure.Panel>[0]
> = (props) => (
  <Transition
    as={Fragment}
    enter="transition duration-300 ease-inOutBack"
    enterFrom="invisible opacity-0 translate-y-[15%]"
    enterTo="visible opacity-100 translate-y-0"
    leave="transition duration-300 ease-inOutBack"
    leaveFrom="visible opacity-100 translate-y-0"
    leaveTo="visible opacity-0 translate-y-[15%]"
  >
    <Disclosure.Panel
      {...props}
      className={classNames(
        "absolute left-0 right-0 bottom-0 z-50 mt-16 flex h-full w-full flex-col overflow-hidden rounded-[24px] bg-osmoverse-800 pb-16",
        props.className
      )}
    />
  </Transition>
);
