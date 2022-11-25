import { useCallback, useRef, useState, SetStateAction, Dispatch } from "react";
import { isFunction } from "../utils/assertion";

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
