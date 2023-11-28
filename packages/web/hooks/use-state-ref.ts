import { Dispatch, SetStateAction, useCallback, useRef, useState } from "react";

import { isFunction } from "~/utils/assertion";

type ReadOnlyRefObject<T> = {
  readonly current: T;
};

type UseStateRef = {
  <S>(initialState: S | (() => S)): [
    S,
    Dispatch<SetStateAction<S>>,
    ReadOnlyRefObject<S>
  ];
  <S = undefined>(): [
    S | undefined,
    Dispatch<SetStateAction<S | undefined>>,
    ReadOnlyRefObject<S | undefined>
  ];
};

/**
 * useState and useRef together. This is useful to get the state value
 * inside an async callback instead of that value at the time the
 * callback was created from.
 */
export const useStateRef: UseStateRef = <S>(initialState?: S | (() => S)) => {
  const [state, setState] = useState(initialState);
  const ref = useRef(state);

  const dispatch: typeof setState = useCallback((setStateAction) => {
    ref.current = isFunction(setStateAction)
      ? setStateAction(ref.current)
      : setStateAction;

    setState(ref.current);
  }, []);

  return [state, dispatch, ref];
};
