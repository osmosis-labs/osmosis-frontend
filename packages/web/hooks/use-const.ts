import { useRef } from "react";

import { isFunction } from "~/utils/assertion";

type InitFn<T> = () => T;

/**
 * Creates a constant value over the lifecycle of a component.
 *
 * Even if `useMemo` is provided an empty array as its final argument, it doesn't offer
 * a guarantee that it won't re-run for performance reasons later on. By using `useConst`
 * you can ensure that initializers don't execute twice or more.
 */
export function useConst<T extends any>(init: T | InitFn<T>): T {
  const ref = useRef<T | null>(null);

  if (ref.current === null) {
    ref.current = isFunction(init) ? (init as InitFn<T>)() : init;
  }

  return ref.current as T;
}
