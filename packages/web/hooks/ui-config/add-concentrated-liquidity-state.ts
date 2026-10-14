/**
 * Pure state and math behind the add/increase concentrated liquidity config.
 * No React, no MobX: `useAddConcentratedLiquidityConfig` wires these into hooks.
 */
import {
  BigDec,
  calcAmount0,
  calcAmount1,
  maxSpotPrice,
  maxTick,
  minSpotPrice,
  minTick,
  priceToTick,
  roundPriceToNearestTick,
  roundToNearestDivisible,
} from "@osmosis-labs/math";
import type { ConcentratedPoolRawResponse, Pool } from "@osmosis-labs/server";
import {
  AppCurrency,
  CoinPretty,
  Dec,
  DecUtils,
  Int,
  PricePretty,
  RatePretty,
} from "@osmosis-labs/unit";
import { isValidNumericalRawInput } from "@osmosis-labs/utils";

import {
  ConcentratedDepositAmount,
  DepositInputState,
  INITIAL_DEPOSIT_INPUT,
  setDepositFraction,
  typeDepositAmount,
} from "./concentrated-deposit-amount";

export const MODERATE_STRATEGY_MULTIPLIER = 0.25;
export const AGGRESSIVE_STRATEGY_MULTIPLIER = 0.05;

export type DepositSide = "base" | "quote";

export class InvalidRangeError extends Error {
  constructor(m: string) {
    super(m);
    Object.setPrototypeOf(this, InvalidRangeError.prototype);
  }
}

// ---------------------------------------------------------------------------
// Price input (mirrors `PriceConfig` of packages/stores)
// ---------------------------------------------------------------------------

/** Multiply a price (without currency decimals) by this to include them, divide to remove them. */
export function getQuoteOverBaseMultiplier(
  baseCurrency: Pick<AppCurrency, "coinDecimals">,
  quoteCurrency: Pick<AppCurrency, "coinDecimals">
): Dec {
  return DecUtils.getTenExponentN(
    baseCurrency.coinDecimals - quoteCurrency.coinDecimals
  );
}

/** Raw price input after the user typed `value`: invalid input is ignored, empty resets to "0". */
export function reducePriceInput(prev: string, value: string): string {
  const trimmed = value.trim();
  if (trimmed === "") return "0";
  if (!isValidNumericalRawInput(trimmed)) return prev;
  return trimmed.startsWith(".") ? "0" + trimmed : trimmed;
}

function safeInputToDecString(input: string): string {
  const trimmed = input.trim();
  if (trimmed === "" || trimmed === ".") return "0";
  return trimmed;
}

function stripTrailingDot(raw: string): string {
  return raw.endsWith(".") ? raw.slice(0, -1) : raw;
}

/** Raw input (with currency decimals) as a Dec without currency decimals. For computation. */
export function priceInputToDec(raw: string, quoteOverBase: Dec): Dec {
  return new Dec(safeInputToDecString(stripTrailingDot(raw))).quo(
    quoteOverBase
  );
}

/** Raw input as a Dec, including currency decimals. For display. */
export function priceInputToDecWithCurrencyDecimals(raw: string): Dec {
  return new Dec(safeInputToDecString(stripTrailingDot(raw)));
}

// ---------------------------------------------------------------------------
// Pool
// ---------------------------------------------------------------------------

/** The parts of a concentrated pool the config depends on. */
export interface ConcentratedPoolParams {
  baseCurrency: AppCurrency;
  quoteCurrency: AppCurrency;
  currentSqrtPrice: BigDec;
  tickSpacing: number;
}

/** Inactive pool: has TVL but no in-range liquidity at current price.
 *  This happens when all liquidity positions are out of range. */
export function isInactiveConcentratedPool(pool: Pool | undefined): boolean {
  if (!pool || pool.type !== "concentrated") return false;

  const poolRaw = pool.raw as ConcentratedPoolRawResponse;
  const currentTickLiquidity = poolRaw?.current_tick_liquidity;
  const isTickLiquidityZero = currentTickLiquidity
    ? parseFloat(currentTickLiquidity) === 0
    : false;
  const hasTVL =
    pool.tvlUnknown || pool.totalFiatValueLocked.toDec().gt(new Dec(0));

  return isTickLiquidityZero && hasTVL;
}

// ---------------------------------------------------------------------------
// Range
// ---------------------------------------------------------------------------

export type Strategy = "passive" | "aggressive" | "moderate" | null;

export interface RangeInputs {
  fullRange: boolean;
  minInput: string;
  maxInput: string;
  /** Pool currencies, or placeholders until the pool is available. */
  baseCurrency: AppCurrency;
  quoteCurrency: AppCurrency;
  pool: ConcentratedPoolParams | null;
  minHistoricalPrice: number | null;
  maxHistoricalPrice: number | null;
}

export interface RangeView {
  /** Current price, without currency decimals. */
  currentPrice: Dec;
  /** Current price adjusted with base and quote token decimals. */
  currentPriceWithDecimals: Dec;
  /** Moderate price range, without currency decimals. */
  moderatePriceRange: [Dec, Dec];
  moderateTickRange: [Int, Int];
  /** Initial custom price range, without currency decimals. */
  initialCustomPriceRange: [Dec, Dec];
  initialCustomTickRange: [Int, Int];
  /** Aggressive price range, without currency decimals. */
  aggressivePriceRange: [Dec, Dec];
  aggressiveTickRange: [Int, Int];
  /** User-selected price range without currency decimals, rounded to nearest tick. Within +/-50x of current tick. */
  range: [Dec, Dec];
  /** Price range with decimals adjusted based on currencies. */
  rangeWithCurrencyDecimals: [Dec, Dec];
  /** Warning: not adjusted to nearest valid tick or adjusted and **does include** currency decimals. */
  rangeRaw: [string, string];
  tickRange: [Int, Int];
  baseDepositOnly: boolean;
  quoteDepositOnly: boolean;
  currentStrategy: Strategy;
}

/** Price range around a historical min/max, widened by `multiplier` of the spread, snapped to ticks. */
export function calcHistoricalPriceRange({
  min,
  max,
  multiplier,
  quoteOverBase,
  tickSpacing,
}: {
  /** Prices as returned by the historical query: with currency decimals, for display. */
  min: number;
  max: number;
  multiplier: number;
  quoteOverBase: Dec;
  tickSpacing: number;
}): [Dec, Dec] {
  const minPrice = new Dec(min).quo(quoteOverBase);
  const maxPrice = new Dec(max).quo(quoteOverBase);
  const priceDiff = maxPrice.sub(minPrice).mul(new Dec(multiplier));

  return [
    roundPriceToNearestTick(minPrice.sub(priceDiff).abs(), tickSpacing, true),
    roundPriceToNearestTick(maxPrice.add(priceDiff).abs(), tickSpacing, false),
  ];
}

function priceRangeToTickRange(
  priceRange: [Dec, Dec],
  tickDivisor: Int
): [Int, Int] {
  return [
    roundToNearestDivisible(priceToTick(priceRange[0]), tickDivisor),
    roundToNearestDivisible(priceToTick(priceRange[1]), tickDivisor),
  ];
}

const DEFAULT_PRICE_RANGE = (): [Dec, Dec] => [new Dec(0.1), new Dec(100)];

/** Tick range of a user-selected price range, padded if both ends round to the same tick. */
export function calcTickRange(range: [Dec, Dec], tickDivisor: Int): [Int, Int] {
  try {
    // account for precision issues from price <> tick conversion
    const lowerTick = priceToTick(range[0]);
    const upperTick = priceToTick(range[1]);

    let lowerTickRounded = roundToNearestDivisible(lowerTick, tickDivisor);
    let upperTickRounded = roundToNearestDivisible(upperTick, tickDivisor);

    // If they rounded to the same value, pad both to respect the
    // user's desired range.
    if (lowerTickRounded.equals(upperTickRounded)) {
      lowerTickRounded = lowerTickRounded.sub(tickDivisor);
      upperTickRounded = upperTickRounded.add(tickDivisor);
    }

    return [
      lowerTickRounded.lt(minTick) ? minTick : lowerTickRounded,
      upperTickRounded.gt(maxTick) ? maxTick : upperTickRounded,
    ];
  } catch (e) {
    console.error(e);
    return [minTick, maxTick];
  }
}

export function deriveRangeView(inputs: RangeInputs): RangeView {
  const {
    fullRange,
    minInput,
    maxInput,
    baseCurrency,
    quoteCurrency,
    pool,
    minHistoricalPrice,
    maxHistoricalPrice,
  } = inputs;

  const quoteOverBase = getQuoteOverBaseMultiplier(baseCurrency, quoteCurrency);
  const tickDivisor = new Int(pool?.tickSpacing ?? 100);

  const currentPrice = pool
    ? pool.currentSqrtPrice.mul(pool.currentSqrtPrice).toDec()
    : new Dec(0);
  const currentPriceWithDecimals = pool
    ? currentPrice.mul(quoteOverBase)
    : new Dec(0);

  const historicalRange = (multiplier: number): [Dec, Dec] => {
    if (!pool || minHistoricalPrice === null || maxHistoricalPrice === null)
      return DEFAULT_PRICE_RANGE();
    return calcHistoricalPriceRange({
      min: minHistoricalPrice,
      max: maxHistoricalPrice,
      multiplier,
      quoteOverBase,
      tickSpacing: pool.tickSpacing,
    });
  };

  const moderatePriceRange = historicalRange(MODERATE_STRATEGY_MULTIPLIER);
  const aggressivePriceRange = historicalRange(AGGRESSIVE_STRATEGY_MULTIPLIER);

  const initialCustomPriceRange: [Dec, Dec] = pool
    ? [
        roundPriceToNearestTick(
          currentPrice.mul(new Dec(0.45)),
          pool.tickSpacing,
          true
        ),
        roundPriceToNearestTick(
          currentPrice.mul(new Dec(1.55)),
          pool.tickSpacing,
          false
        ),
      ]
    : DEFAULT_PRICE_RANGE();

  const moderateTickRange = priceRangeToTickRange(
    moderatePriceRange,
    tickDivisor
  );
  const aggressiveTickRange = priceRangeToTickRange(
    aggressivePriceRange,
    tickDivisor
  );
  const initialCustomTickRange = priceRangeToTickRange(
    initialCustomPriceRange,
    tickDivisor
  );

  let range: [Dec, Dec] = [minSpotPrice, maxSpotPrice];
  if (!fullRange && pool) {
    const inputMinPrice = roundPriceToNearestTick(
      priceInputToDec(minInput, quoteOverBase),
      pool.tickSpacing,
      true
    );
    const inputMaxPrice = roundPriceToNearestTick(
      priceInputToDec(maxInput, quoteOverBase),
      pool.tickSpacing,
      true
    );

    const minPrice50x = currentPrice.quo(new Dec(50));
    const maxPrice50x = currentPrice.mul(new Dec(50));

    range = [
      inputMinPrice.lt(minPrice50x) ? minPrice50x : inputMinPrice,
      inputMaxPrice.gt(maxPrice50x) ? maxPrice50x : inputMaxPrice,
    ];
  }

  const rangeWithCurrencyDecimals: [Dec, Dec] = fullRange
    ? [
        minSpotPrice.mul(quoteOverBase),
        // for display, avoid using max spot price since the price chart would get flattened
        currentPriceWithDecimals.mul(new Dec(2)),
      ]
    : [
        priceInputToDecWithCurrencyDecimals(minInput),
        priceInputToDecWithCurrencyDecimals(maxInput),
      ];

  const tickRange: [Int, Int] =
    fullRange || !pool ? [minTick, maxTick] : calcTickRange(range, tickDivisor);

  // currentPrice can be 0 if no positions in pool
  const baseDepositOnly =
    !currentPrice.isZero() &&
    !fullRange &&
    currentPrice.lt(range[0]) &&
    currentPrice.lt(range[1]);
  const quoteDepositOnly =
    !currentPrice.isZero() &&
    !fullRange &&
    currentPrice.gt(range[0]) &&
    currentPrice.gt(range[1]);

  const isRangeMatching = (preset: [Int, Int]) =>
    !fullRange &&
    tickRange[0].equals(preset[0]) &&
    tickRange[1].equals(preset[1]);
  let currentStrategy: Strategy = null;
  if (fullRange) currentStrategy = "passive";
  else if (isRangeMatching(moderateTickRange)) currentStrategy = "moderate";
  else if (isRangeMatching(aggressiveTickRange)) currentStrategy = "aggressive";

  return {
    currentPrice,
    currentPriceWithDecimals,
    moderatePriceRange,
    moderateTickRange,
    initialCustomPriceRange,
    initialCustomTickRange,
    aggressivePriceRange,
    aggressiveTickRange,
    range,
    rangeWithCurrencyDecimals,
    rangeRaw: [minInput, maxInput],
    tickRange,
    baseDepositOnly,
    quoteDepositOnly,
    currentStrategy,
  };
}

// ---------------------------------------------------------------------------
// Deposit
// ---------------------------------------------------------------------------

const HALF = (): [RatePretty, RatePretty] => [
  new RatePretty(0.5),
  new RatePretty(0.5),
];

export function calcDepositPercentages({
  pool,
  baseCurrency,
  quoteCurrency,
  baseDepositPrice,
  quoteDepositPrice,
  tickRange,
  baseDepositOnly,
  quoteDepositOnly,
}: {
  pool: ConcentratedPoolParams | null;
  baseCurrency: AppCurrency;
  quoteCurrency: AppCurrency;
  baseDepositPrice: PricePretty | null;
  quoteDepositPrice: PricePretty | null;
  tickRange: [Int, Int];
  baseDepositOnly: boolean;
  quoteDepositOnly: boolean;
}): [RatePretty, RatePretty] {
  if (!pool) return [new RatePretty(0), new RatePretty(0)];
  if (baseDepositOnly) return [new RatePretty(1), new RatePretty(0)];
  if (quoteDepositOnly) return [new RatePretty(0), new RatePretty(1)];

  // Safety check: if pool has no liquidity (currentSqrtPrice is zero), return equal percentages
  if (pool.currentSqrtPrice.isZero()) return HALF();

  // Safety check: if prices are not loaded yet, return equal percentages
  if (!baseDepositPrice || !quoteDepositPrice) return HALF();

  try {
    const amount1 = new Int(1)
      .toDec()
      .mul(DecUtils.getTenExponentN(quoteCurrency.coinDecimals))
      .truncate();

    const [lowerTick, upperTick] = tickRange;

    // calculate proportional amount of other amount
    const amount0 = calcAmount0(
      amount1,
      lowerTick,
      upperTick,
      pool.currentSqrtPrice
    );

    const amount0Value = baseDepositPrice.mul(
      new CoinPretty(baseCurrency, amount0)
    );
    const amount1Value = quoteDepositPrice.mul(
      new CoinPretty(quoteCurrency, amount1)
    );

    const totalValue = amount0Value.toDec().add(amount1Value.toDec());

    if (totalValue.isZero()) return HALF();

    return [
      new RatePretty(amount0Value.toDec().quo(totalValue)),
      new RatePretty(amount1Value.toDec().quo(totalValue)),
    ];
  } catch (error) {
    // Fallback to equal percentages if calculation fails
    console.error("Error calculating deposit percentages:", error);
    return HALF();
  }
}

/** How the non-anchor deposit input follows the anchor one. */
export type CounterpartyPlan =
  | { type: "none"; warning?: string }
  /** Set the amount of `side` (typed semantics: clears its fraction). */
  | { type: "setAmount"; side: DepositSide; amount: string }
  /** Make `side` the max-anchored input. */
  | { type: "setMax"; side: DepositSide }
  /** Both overflow each other: cap both to their balances. */
  | { type: "capBoth"; baseAmount: string; quoteAmount: string };

function formatCoinAmount(coin: CoinPretty): string {
  return coin.hideDenom(true).locale(false).trim(true).toString();
}

function coinFromPriceRatio(
  value: PricePretty,
  otherPrice: PricePretty,
  currency: AppCurrency
): CoinPretty {
  return new CoinPretty(
    currency,
    value
      .toDec()
      .quo(otherPrice.toDec())
      .mul(DecUtils.getTenExponentN(currency.coinDecimals))
      .truncate()
  );
}

/** Inactive pool with the anchor on max: match the dollar value of the anchor amount
 *  on the other side. If one side overflows its balance, anchor the other side on max
 *  instead; if both overflow, cap both. Resolved in one step, so there is no re-entrant flip.
 */
function planInactivePoolCounterparty({
  anchor,
  base,
  quote,
  baseDepositPrice,
  quoteDepositPrice,
}: {
  anchor: DepositSide;
  base: ConcentratedDepositAmount;
  quote: ConcentratedDepositAmount;
  baseDepositPrice: PricePretty | null;
  quoteDepositPrice: PricePretty | null;
}): CounterpartyPlan {
  // Safety check: ensure prices are loaded and valid
  if (!baseDepositPrice || !quoteDepositPrice) {
    return {
      type: "none",
      warning: "Prices not loaded for inactive pool calculation",
    };
  }

  // Safety check: ensure prices are not zero (cannot calculate dollar value)
  if (baseDepositPrice.toDec().isZero() || quoteDepositPrice.toDec().isZero()) {
    return {
      type: "none",
      warning:
        "One or both asset prices are zero - cannot calculate equal dollar value",
    };
  }

  const anchorSide = anchor === "base" ? base : quote;
  const otherSide = anchor === "base" ? quote : base;
  const anchorPrice = anchor === "base" ? baseDepositPrice : quoteDepositPrice;
  const otherPrice = anchor === "base" ? quoteDepositPrice : baseDepositPrice;
  const otherSideName: DepositSide = anchor === "base" ? "quote" : "base";

  const anchorCoin = new CoinPretty(
    anchorSide.sendCurrency,
    new Int(anchorSide.getAmountPrimitive().amount)
  );
  const otherCoin = coinFromPriceRatio(
    anchorPrice.mul(anchorCoin),
    otherPrice,
    otherSide.sendCurrency
  );
  const otherBalance = otherSide.balance;

  if (!otherCoin.toDec().gt(otherBalance.toDec())) {
    return {
      type: "setAmount",
      side: otherSideName,
      amount: formatCoinAmount(otherCoin),
    };
  }

  // The other side overflows. Pre-check whether flipping the anchor would also overflow this side.
  const anchorBalance = anchorSide.balance;
  const anchorCoinFromOtherMax = coinFromPriceRatio(
    otherPrice.mul(otherBalance),
    anchorPrice,
    anchorSide.sendCurrency
  );

  if (anchorCoinFromOtherMax.toDec().gt(anchorBalance.toDec())) {
    const toAmount = (balance: CoinPretty) =>
      balance.trim(true).hideDenom(true).locale(false).toString();
    return {
      type: "capBoth",
      baseAmount: toAmount(base.balance),
      quoteAmount: toAmount(quote.balance),
    };
  }

  // Only the other side overflows: flip the anchor to it, the counterparty is
  // then calculated from its max balance.
  return { type: "setMax", side: otherSideName };
}

/** Plan the update of the non-anchor deposit input from the anchor one (given the range and pool price).
 *  Does nothing (keeps the other amount) while the anchor amount is not positive. */
export function planCounterpartyUpdate({
  anchor,
  base,
  quote,
  pool,
  isInactivePool,
  tickRange,
  baseDepositPrice,
  quoteDepositPrice,
}: {
  anchor: DepositSide;
  base: ConcentratedDepositAmount;
  quote: ConcentratedDepositAmount;
  pool: ConcentratedPoolParams | null;
  isInactivePool: boolean;
  tickRange: [Int, Int];
  baseDepositPrice: PricePretty | null;
  quoteDepositPrice: PricePretty | null;
}): CounterpartyPlan {
  const anchorSide = anchor === "base" ? base : quote;
  const otherSide = anchor === "base" ? quote : base;
  const otherSideName: DepositSide = anchor === "base" ? "quote" : "base";

  const anchorAmount = new Int(anchorSide.getAmountPrimitive().amount);
  // TODO: check counterparty balance and subtract to not exceed that
  if (anchorAmount.lte(new Int(0))) return { type: "none" };

  // Special handling for inactive pools when Max is clicked
  if (isInactivePool && anchorSide.isMax) {
    return planInactivePoolCounterparty({
      anchor,
      base,
      quote,
      baseDepositPrice,
      quoteDepositPrice,
    });
  }

  // For active pools with no liquidity, cannot calculate proportional amounts
  if (!pool || pool.currentSqrtPrice.isZero()) return { type: "none" };

  const [lowerTick, upperTick] = tickRange;

  // calculate proportional amount of other amount
  const otherAmount =
    anchor === "base"
      ? calcAmount1(anchorAmount, lowerTick, upperTick, pool.currentSqrtPrice)
      : calcAmount0(anchorAmount, lowerTick, upperTick, pool.currentSqrtPrice);
  // include decimals, as is displayed to user
  const otherCoin = new CoinPretty(otherSide.sendCurrency, otherAmount);

  // set max: if the other coin is higher than its balance, set it to the balance
  if (anchorSide.isMax && otherCoin.toDec().gt(otherSide.balance.toDec())) {
    return { type: "setMax", side: otherSideName };
  }

  return {
    type: "setAmount",
    side: otherSideName,
    amount: formatCoinAmount(otherCoin),
  };
}

// ---------------------------------------------------------------------------
// User input state
// ---------------------------------------------------------------------------

export interface AddConcentratedLiquidityState {
  /** Raw price inputs, with currency decimals included. */
  minInput: string;
  maxInput: string;
  fullRange: boolean;
  base: DepositInputState;
  quote: DepositInputState;
  anchor: DepositSide;
  superfluidStakingElected: boolean;
  /** The initial range (moderate) was applied once historical prices loaded. */
  rangeInitialized: boolean;
}

export const INITIAL_ADD_CL_STATE: AddConcentratedLiquidityState = {
  minInput: "0",
  maxInput: "0",
  fullRange: false,
  base: INITIAL_DEPOSIT_INPUT,
  quote: INITIAL_DEPOSIT_INPUT,
  anchor: "base",
  superfluidStakingElected: false,
  rangeInitialized: false,
};

export type AddConcentratedLiquidityAction =
  | { type: "setMinRange"; value: string }
  | { type: "setMaxRange"; value: string }
  | { type: "initRange"; min: string; max: string }
  | { type: "setFullRange"; value: boolean }
  | { type: "setAnchor"; anchor: DepositSide }
  /** Typed amount: clears the fraction of that side. */
  | { type: "setAmount"; side: DepositSide; amount: string }
  | { type: "setFraction"; side: DepositSide; fraction: number | undefined }
  /** Anchor on `side` at max, releasing the other side's max. */
  | { type: "setMax"; side: DepositSide }
  | { type: "setSuperfluid"; elected: boolean };

function updateSide(
  state: AddConcentratedLiquidityState,
  side: DepositSide,
  next: DepositInputState
): AddConcentratedLiquidityState {
  if (state[side] === next) return state;
  return { ...state, [side]: next };
}

export function addConcentratedLiquidityReducer(
  state: AddConcentratedLiquidityState,
  action: AddConcentratedLiquidityAction
): AddConcentratedLiquidityState {
  switch (action.type) {
    // A range set by the user (or for an existing position) counts as
    // initialized, so historical prices loading later don't replace it.
    case "setMinRange": {
      const minInput = reducePriceInput(state.minInput, action.value);
      if (
        !state.fullRange &&
        minInput === state.minInput &&
        state.rangeInitialized
      )
        return state;
      return { ...state, fullRange: false, minInput, rangeInitialized: true };
    }
    case "setMaxRange": {
      const maxInput = reducePriceInput(state.maxInput, action.value);
      if (
        !state.fullRange &&
        maxInput === state.maxInput &&
        state.rangeInitialized
      )
        return state;
      return { ...state, fullRange: false, maxInput, rangeInitialized: true };
    }
    case "initRange":
      return {
        ...state,
        fullRange: false,
        minInput: reducePriceInput(state.minInput, action.min),
        maxInput: reducePriceInput(state.maxInput, action.max),
        rangeInitialized: true,
      };
    case "setFullRange":
      if (state.fullRange === action.value && state.rangeInitialized)
        return state;
      return { ...state, fullRange: action.value, rangeInitialized: true };
    case "setAnchor":
      if (state.anchor === action.anchor) return state;
      return { ...state, anchor: action.anchor };
    case "setAmount":
      return updateSide(
        state,
        action.side,
        typeDepositAmount(state[action.side], action.amount)
      );
    case "setFraction":
      return updateSide(
        state,
        action.side,
        setDepositFraction(state[action.side], action.fraction)
      );
    case "setMax": {
      const other: DepositSide = action.side === "base" ? "quote" : "base";
      return {
        ...state,
        anchor: action.side,
        [other]: setDepositFraction(state[other], undefined),
        [action.side]: setDepositFraction(state[action.side], 1),
      };
    }
    case "setSuperfluid":
      if (state.superfluidStakingElected === action.elected) return state;
      return { ...state, superfluidStakingElected: action.elected };
  }
}

/** Reducer actions that apply a counterparty plan. */
export function counterpartyPlanToActions(
  plan: CounterpartyPlan
): AddConcentratedLiquidityAction[] {
  switch (plan.type) {
    case "none":
      return [];
    case "setAmount":
      return [{ type: "setAmount", side: plan.side, amount: plan.amount }];
    case "setMax":
      return [{ type: "setMax", side: plan.side }];
    case "capBoth":
      return [
        { type: "setAmount", side: "base", amount: plan.baseAmount },
        { type: "setAmount", side: "quote", amount: plan.quoteAmount },
      ];
  }
}
