import { Transition } from "@headlessui/react";
import { runIfFn } from "@osmosis-labs/utils";
import classNames from "classnames";
import FocusTrap from "focus-trap-react";
import {
  Fragment,
  FunctionComponent,
  HTMLProps,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useControllableState } from "~/hooks/use-controllable-state";
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

export const DrawerButton = (
  props: PropsWithChildren<{ className?: string }>
) => {
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
export const DrawerContent = (
  props: PropsWithChildren<{ className?: string }>
) => {
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

export const DrawerOverlay: FunctionComponent = () => {
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

export const DrawerPanel = (
  props: PropsWithChildren<HTMLProps<HTMLDivElement>>
) => {
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
          "absolute bottom-0 left-0 right-0 z-50 mt-16 flex h-full w-full flex-col overflow-hidden rounded-3xl bg-osmoverse-800 pb-16",
          props.className
        )}
      />
    </Transition>
  );
};
