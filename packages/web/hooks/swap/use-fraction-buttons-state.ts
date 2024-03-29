import { useState } from "react";

export type FractionButtonState = ReturnType<typeof useFractionButtonState>;

export function useFractionButtonState() {
  // fraction is of type number | undefined,
  // where undefined represents the absence of a value.
  // Although in JS You want to explicitly indicate that a variable or property does not have a value with null,
  // testing for not will not work with TS inference.
  // Because we want to make the code less fragile, we ignore the js convention, because it is easy to slip.
  //
  const [fraction, setFraction] = useState<number | undefined>();
  return {
    isHalf: fraction === 0.5,
    isMax: fraction === 1,
    value: fraction,
    reset() {
      setFraction(undefined);
    },
    toggleHalf() {
      setFraction((current) => (!current ? 0.5 : undefined));
    },
    toggleMax() {
      setFraction((current) => (!current ? 1 : undefined));
    },
  };
}
