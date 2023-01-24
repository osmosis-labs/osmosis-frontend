import { useState } from "react";
import { useCallbackRef } from "./use-callback-ref";

export interface UseControllableStateProps<T> {
  value?: T;
  defaultValue?: T | (() => T);
  onChange?: (value: T) => void;
  shouldUpdate?: (prev: T, next: T) => boolean;
}

/**
 * The `useControllableState` hook returns the state and function that updates the state, just like React.useState does.
 * It allows components to handle both controlled and uncontrolled modes, providing control over its internal state
 * when needed.
 *
 * @example
 * A modal that allows the developer to send a `isOpen` prop
 * when the modal should be controlled by the parent. If the prop is not
 * sent, the modal will handle `isOpen` on its own.
 */
export function useControllableState<T>(props: UseControllableStateProps<T>) {
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
