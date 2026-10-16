import { Dec, DecUtils, RatePretty } from "@osmosis-labs/unit";
import {
  InvalidSlippageError,
  NegativeSlippageError,
} from "@osmosis-labs/utils";

export const DefaultSelectableSlippages: ReadonlyArray<Dec> = [
  // 0.5%
  new Dec("0.005"),
  // 1%
  new Dec("0.01"),
  // 3%
  new Dec("0.03"),
  // 5%
  new Dec("0.05"),
];

export type SlippageState = {
  defaultManualSlippage: string;
  selectedIndex: number;
  isManualSlippage: boolean;
  manualSlippage: string;
};

export const initialSlippageState: SlippageState = {
  defaultManualSlippage: "0.5",
  selectedIndex: 0,
  isManualSlippage: true,
  manualSlippage: "0.5",
};

export type SlippageAction =
  | { type: "select"; index: number }
  | { type: "setIsManualSlippage"; value: boolean }
  | { type: "setManualSlippage"; value: string }
  | { type: "setDefaultSlippage"; value: string };

/** Selects a preset by index; out of range indexes are ignored. */
export function selectSlippage(
  state: SlippageState,
  index: number,
  selectable: ReadonlyArray<Dec> = DefaultSelectableSlippages
): SlippageState {
  if (index < 0 || selectable.length - 1 < index) return state;
  return { ...state, isManualSlippage: false, selectedIndex: index };
}

/** Sets the manual slippage (a percentage string, e.g. "0.5").
 *  Non numeric input, values outside [0, 100) and unparsable input are ignored. */
export function setManualSlippageStr(
  state: SlippageState,
  str: string
): SlippageState {
  if (isNaN(Number(str))) return state;
  if (str.startsWith(".")) str = "0" + str;

  let strDec: Dec;
  try {
    strDec = new Dec(str);
  } catch {
    return state;
  }
  if (strDec.gte(new Dec(100)) || strDec.lt(new Dec(0))) return state;

  return { ...state, isManualSlippage: true, manualSlippage: str };
}

export function slippageReducer(
  state: SlippageState,
  action: SlippageAction
): SlippageState {
  switch (action.type) {
    case "select":
      return selectSlippage(state, action.index);
    case "setIsManualSlippage":
      return { ...state, isManualSlippage: action.value };
    case "setManualSlippage":
      return setManualSlippageStr(state, action.value);
    case "setDefaultSlippage":
      return { ...state, defaultManualSlippage: action.value };
  }
}

/** The manual slippage as a rate: zero when not in manual mode, empty, invalid or negative. */
export function getManualSlippage(state: SlippageState): RatePretty {
  if (!state.isManualSlippage || state.manualSlippage === "") {
    return new RatePretty(new Dec(0));
  }

  try {
    const r = new RatePretty(
      new Dec(state.manualSlippage).quo(DecUtils.getTenExponentN(2))
    );
    if (r.toDec().isNegative()) return new RatePretty(new Dec(0));
    return r;
  } catch {
    return new RatePretty(new Dec(0));
  }
}

/** The effective slippage rate: the manual one in manual mode, else the selected preset. */
export function getSlippage(
  state: SlippageState,
  selectable: ReadonlyArray<Dec> = DefaultSelectableSlippages
): RatePretty {
  if (state.isManualSlippage) return getManualSlippage(state);
  return new RatePretty(selectable[state.selectedIndex]);
}

export function getManualSlippageError(
  state: SlippageState
): Error | undefined {
  if (!state.isManualSlippage) return;
  try {
    const r = new RatePretty(
      new Dec(state.manualSlippage).quo(DecUtils.getTenExponentN(2))
    );
    if (r.toDec().isNegative()) {
      return new NegativeSlippageError("Slippage can not be negative");
    }
  } catch {
    return new InvalidSlippageError("Invalid slippage");
  }
  return;
}

/** Index and value of the smallest preset that is >= `value`, or the largest preset. */
export function getSmallestSlippage(
  value: Dec,
  selectable: ReadonlyArray<Dec> = DefaultSelectableSlippages
): [number, Dec] {
  let index = selectable.findIndex((slippage) => slippage.gte(value));
  if (index === -1) index = selectable.length - 1;
  return [index, selectable[index]];
}
