import { useState } from "react";

import { useCallbackRef } from "./use-callback-ref";

export interface UseOverridableStateProps<T> {
  value?: T;
  defaultValue?: T | (() => T);
  onChange?: (value: T) => void;
  shouldUpdate?: (prev: T, next: T) => boolean;
}

/**
 * The `useOverridableState` hook returns the state and function that updates the state, just like React.useState does.
 * It allows components to handle both overridden and controlled modes, providing control over its internal state
 * when needed.
 *
 * Example:
 * A modal that allows the developer to send a `isOpen` prop
 * when the modal should be controlled by the parent. If the prop is not
 * sent, the modal will handle `isOpen` on its own.
 *
 * ```
 *  import React from "react";
 *  import { useOverridableState } from "use-overridable-state";
 *
 *  interface ModalProps {
 *    isOpen?: boolean;
 *    onToggle?: (open: boolean) => void;
 *  }
 *
 *  const Modal: React.FC<ModalProps> = ({ isOpen, onToggle }) => {
 *    const [open, setOpen] = useOverridableState({
 *      value: isOpen,
 *      defaultValue: false,
 *      onChange: onToggle,
 *    });
 *
 *    const handleToggle = () => {
 *      setOpen((prev) => !prev);
 *    };
 *
 *    return (
 *      <div>
 *        <button onClick={handleToggle}>Toggle Modal</button>
 *        {open && (
 *          <div className="modal">
 *            <h2>Modal Content</h2>
 *            <button onClick={handleToggle}>Close Modal</button>
 *          </div>
 *        )}
 *      </div>
 *    );
 *  };
 *
 *  export default Modal;
 *  ```
 *
 *  To let the component handle its own state, just don't send the `isOpen` prop:
 *  ```
 *  <Modal />
 *  ```
 *
 *  To manage the state from the parent, send the `isOpen` and `onToggle` prop:
 *  ```
 *  const [isOpen, setIsOpen] = useState(false);
 *
 *  const handleToggle = (open: boolean) => {
 *    setIsOpen(open);
 *  };
 *
 *  <Modal isOpen={isOpen} onToggle={handleToggle} />
 * ```
 */
export function useOverridableState<T = boolean>(
  props: UseOverridableStateProps<T>
) {
  const {
    value: valueProp,
    defaultValue,
    onChange,
    shouldUpdate = (prev, next) => prev !== next,
  } = props;

  const onChangeProp = useCallbackRef(onChange);
  const shouldUpdateProp = useCallbackRef(shouldUpdate);

  const [uncontrolledState, setUncontrolledState] = useState(defaultValue as T);
  const controlled = valueProp !== undefined;
  const value = controlled ? valueProp : uncontrolledState;

  const setValue = useCallbackRef(
    (next: React.SetStateAction<T>) => {
      const setter = next as (prevState?: T) => T;
      const nextValue = typeof next === "function" ? setter(value) : next;

      if (!shouldUpdateProp(value, nextValue)) {
        return;
      }

      if (!controlled) {
        setUncontrolledState(nextValue);
      }

      onChangeProp(nextValue);
    },
    [controlled, onChangeProp, value, shouldUpdateProp]
  );

  return [value, setValue] as [T, React.Dispatch<React.SetStateAction<T>>];
}
