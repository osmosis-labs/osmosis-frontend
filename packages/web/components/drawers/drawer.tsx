import { Disclosure, Transition } from "@headlessui/react";
import classNames from "classnames";
import FocusTrap from "focus-trap-react";
import {
  Fragment,
  FunctionComponent,
  HTMLProps,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useControllableState } from "~/hooks/use-controllable-state";
import { runIfFn } from "~/utils/function";
import { createContext } from "~/utils/react-context";

interface DrawerContext {
  isOpen: boolean;
  isAnimationComplete: boolean;
  setIsAnimationComplete: (value: boolean) => void;
  onClose: () => void;
  onOpen: () => void;
}

const [DrawerPropsProvider, useDrawerProps] = createContext<DrawerContext>();

/**
 * The drawer component is a UI element that can be used to display additional content in a compact, slide-out panel.
 */
export const Drawer: FunctionComponent<{
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  children: React.ReactNode | ((props: DrawerContext) => React.ReactNode);
}> = ({ onClose, onOpen, ...props }) => {
  const [isOpen, setIsOpen] = useControllableState({
    defaultValue: false,
    value: props.isOpen,
  });
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  useEffect(() => {
    if (!isOpen) setIsAnimationComplete(false);
  }, [isOpen]);

  const context = useMemo<DrawerContext>(
    () => ({
      isOpen,
      isAnimationComplete,
      setIsAnimationComplete,
      onOpen: () => {
        setIsOpen(true);
        onOpen?.();
      },
      onClose: () => {
        setIsOpen(false);
        onClose?.();
      },
    }),
    [isOpen, isAnimationComplete, setIsOpen, onOpen, onClose]
  );

  return (
    <DrawerPropsProvider value={context}>
      <div>{runIfFn(props.children, context)}</div>
    </DrawerPropsProvider>
  );
};

export const DrawerButton: FunctionComponent<{
  className?: string;
  children?: any;
}> = (props) => {
  const { onOpen, isOpen } = useDrawerProps();
  const Component = typeof props.children === "string" ? "button" : "div";
  return (
    <Component
      onClick={onOpen}
      {...props}
      className={classNames(isOpen && "", props.className)}
    />
  );
};

/**
 * Container for the content of the drawer. It's necessary to lock focus in the content.
 */
export const DrawerContent: FunctionComponent<{
  className?: string;
  children?: any;
}> = (props) => {
  const { isAnimationComplete, isOpen } = useDrawerProps();

  return (
    <FocusTrap
      focusTrapOptions={{ allowOutsideClick: true, escapeDeactivates: false }}
      active={isAnimationComplete && isOpen}
    >
      <div className={props.className}>{props.children}</div>
    </FocusTrap>
  );
};

export const DrawerOverlay: FunctionComponent<
  HTMLProps<HTMLDivElement>
> = () => {
  const { isOpen, onClose } = useDrawerProps();
  return (
    <Transition
      as={Fragment}
      show={isOpen}
      enter="transition duration-300 ease-inOutBack"
      enterFrom="invisible opacity-0"
      enterTo="visible opacity-100"
      leave="transition duration-300 ease-inOutBack"
      leaveFrom="visible opacity-100"
      leaveTo="visible opacity-0"
    >
      <div
        onClick={() => onClose()}
        className="absolute inset-0 z-40 bg-osmoverse-1000/40"
      />
    </Transition>
  );
};

export const DrawerPanel: FunctionComponent<
  Parameters<typeof Disclosure.Panel>[0] & { children: React.ReactNode }
> = ({ children, ...props }) => {
  const { isOpen, setIsAnimationComplete } = useDrawerProps();

  return (
    <Transition
      as={Fragment}
      show={isOpen}
      enter="transition duration-300 ease-inOutBack"
      enterFrom="invisible opacity-0 translate-y-[15%]"
      enterTo="visible opacity-100 translate-y-0"
      leave="transition duration-300 ease-inOutBack"
      leaveFrom="visible opacity-100 translate-y-0"
      leaveTo="visible opacity-0 translate-y-[15%]"
      afterEnter={() => setIsAnimationComplete(true)}
    >
      <div
        {...props}
        className={classNames(
          "absolute left-0 right-0 bottom-0 z-50 mt-16 flex h-full w-full flex-col overflow-hidden rounded-[24px] bg-osmoverse-800 pb-16",
          props.className
        )}
      >
        {children}
      </div>
    </Transition>
  );
};
