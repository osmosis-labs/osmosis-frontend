import type { Dec, RatePretty } from "@osmosis-labs/unit";
import { useCallback, useEffect, useMemo, useReducer } from "react";

import { DefaultSlippage } from "~/config/swap";

import {
  DefaultSelectableSlippages,
  getManualSlippage,
  getManualSlippageError,
  getSlippage,
  getSmallestSlippage,
  initialSlippageState,
  slippageReducer,
} from "./slippage-state";

export type SlippageConfig = {
  readonly slippage: RatePretty;
  readonly manualSlippage: RatePretty;
  readonly manualSlippageStr: string;
  readonly defaultManualSlippage: string;
  readonly isManualSlippage: boolean;
  /** True while the slippage is a value the user typed rather than one the
   *  app chose. */
  readonly userOverrodeSlippage: boolean;
  readonly manualSlippageError: Error | undefined;
  readonly selectableSlippages: {
    slippage: RatePretty;
    index: number;
    selected: boolean;
  }[];
  select: (index: number) => void;
  setIsManualSlippage: (value: boolean) => void;
  setManualSlippage: (str: string) => void;
  setDefaultSlippage: (value: string) => void;
  markUserOverride: () => void;
  clearUserOverride: () => void;
  getSmallestSlippage: (value: Dec) => [number, Dec];
};

/** Slippage state for the React view lifecycle. The setters are referentially stable,
 *  but the returned object changes identity whenever the slippage state changes, so
 *  effects must not list it as a dependency if they also write to it.
 */
export function useSlippageConfig({
  defaultSlippage = DefaultSlippage,
  selectedIndex = 0,
}: Partial<{
  defaultSlippage: string;
  selectedIndex: number;
}> = {}): SlippageConfig {
  const [state, dispatch] = useReducer(slippageReducer, initialSlippageState);

  const select = useCallback(
    (index: number) => dispatch({ type: "select", index }),
    []
  );
  const setIsManualSlippage = useCallback(
    (value: boolean) => dispatch({ type: "setIsManualSlippage", value }),
    []
  );
  const setManualSlippage = useCallback(
    (value: string) => dispatch({ type: "setManualSlippage", value }),
    []
  );
  const setDefaultSlippage = useCallback(
    (value: string) => dispatch({ type: "setDefaultSlippage", value }),
    []
  );
  const markUserOverride = useCallback(
    () => dispatch({ type: "setUserOverride", value: true }),
    []
  );
  const clearUserOverride = useCallback(
    () => dispatch({ type: "setUserOverride", value: false }),
    []
  );

  useEffect(() => {
    setDefaultSlippage(defaultSlippage);
    select(selectedIndex);
  }, [defaultSlippage, selectedIndex, select, setDefaultSlippage]);

  return useMemo(
    () => ({
      slippage: getSlippage(state),
      manualSlippage: getManualSlippage(state),
      manualSlippageStr: state.manualSlippage,
      defaultManualSlippage: state.defaultManualSlippage,
      isManualSlippage: state.isManualSlippage,
      userOverrodeSlippage: state.userOverrodeSlippage,
      manualSlippageError: getManualSlippageError(state),
      selectableSlippages: DefaultSelectableSlippages.map((_, i) => ({
        slippage: getSlippage({
          ...state,
          isManualSlippage: false,
          selectedIndex: i,
        }),
        index: i,
        selected: !state.isManualSlippage && i === state.selectedIndex,
      })),
      select,
      setIsManualSlippage,
      setManualSlippage,
      setDefaultSlippage,
      markUserOverride,
      clearUserOverride,
      getSmallestSlippage: (value: Dec) => getSmallestSlippage(value),
    }),
    [
      state,
      select,
      setIsManualSlippage,
      setManualSlippage,
      setDefaultSlippage,
      markUserOverride,
      clearUserOverride,
    ]
  );
}
