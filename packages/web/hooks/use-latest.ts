import { useRef } from "react";

/**
 * Return the latest state. This is useful to get the latest
 * value of a prop or state inside an async callback instead of
 * that value at the time the callback was created from.
 * */
const useLatest = <T>(value: T): { readonly current: T } => {
  const ref = useRef(value);
  ref.current = value;
  return ref;
};

export default useLatest;
