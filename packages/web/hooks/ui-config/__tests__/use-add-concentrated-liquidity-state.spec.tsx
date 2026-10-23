import type { Pool } from "@osmosis-labs/server";
import { CoinPretty, Dec, PricePretty } from "@osmosis-labs/unit";
import { act, renderHook } from "@testing-library/react";

import {
  AddConcentratedLiquidityInputs,
  useAddConcentratedLiquidityState,
} from "../use-add-concentrated-liquidity-config";

const osmo = { coinDenom: "OSMO", coinMinimalDenom: "uosmo", coinDecimals: 6 };
const atom = { coinDenom: "ATOM", coinMinimalDenom: "uatom", coinDecimals: 6 };
const usd = {
  currency: "usd",
  symbol: "$",
  maxDecimals: 2,
  locale: "en-US",
};

function makePool(
  overrides: { sqrtPrice?: string; tickLiquidity?: string; tvl?: number } = {}
): Pool {
  return {
    type: "concentrated",
    id: "1",
    reserveCoins: [new CoinPretty(osmo, 0), new CoinPretty(atom, 0)],
    tvlUnknown: false,
    totalFiatValueLocked: new PricePretty(usd, new Dec(overrides.tvl ?? 1000)),
    raw: {
      current_sqrt_price: overrides.sqrtPrice ?? "1.000000000000000000",
      tick_spacing: "100",
      current_tick_liquidity: overrides.tickLiquidity ?? "1000",
    },
  } as unknown as Pool;
}

const price = (n: number) => new PricePretty(usd, new Dec(n));

function inputs(
  overrides: Partial<AddConcentratedLiquidityInputs> = {}
): AddConcentratedLiquidityInputs {
  return {
    poolId: "1",
    chain: {
      placeholderCurrency: osmo,
      feeCurrency: osmo,
      stakeCurrency: osmo,
    },
    pool: makePool(),
    balances: [
      { denom: "uosmo", amount: "10000000" },
      { denom: "uatom", amount: "10000000" },
    ],
    baseDepositPrice: price(1),
    quoteDepositPrice: price(1),
    historicalPriceMinMax: undefined,
    ...overrides,
  };
}

function setup(initial: AddConcentratedLiquidityInputs) {
  return renderHook(
    (props: AddConcentratedLiquidityInputs) =>
      useAddConcentratedLiquidityState(props),
    { initialProps: initial }
  );
}

describe("useAddConcentratedLiquidityState", () => {
  it("ignores range setters until the pool is available", () => {
    const { result, rerender } = setup(inputs({ pool: undefined }));
    act(() => result.current.setMinRange("0.5"));
    expect(result.current.rangeRaw[0]).toBe("0");

    rerender(inputs());
    act(() => result.current.setMinRange("0.5"));
    expect(result.current.rangeRaw[0]).toBe("0.5");
  });

  it("applies the pool fee only to the stake currency max", () => {
    const { result } = setup(inputs());
    act(() => result.current.setBaseDepositAmountMax());
    // 10 OSMO less the 0.12 OSMO high gas fee
    expect(result.current.baseDepositAmountIn.amount).toBe("9.88");
  });

  it("follows balances and reads zero while they are not loaded", () => {
    const { result, rerender } = setup(inputs({ balances: undefined }));
    act(() => result.current.setFullRange(true));
    act(() => result.current.baseDepositAmountIn.setIsMax(true));
    expect(result.current.baseDepositAmountIn.amount).toBe("0");
    rerender(
      inputs({
        balances: [
          { denom: "uosmo", amount: "5120000" },
          { denom: "uatom", amount: "900000000000" },
        ],
      })
    );
    expect(result.current.baseDepositAmountIn.amount).toBe("5");
    expect(result.current.baseDepositAmountIn.error).toBeUndefined();
  });

  it("calculates the quote amount from a typed base amount, and back", () => {
    const { result } = setup(inputs());
    act(() => result.current.setFullRange(true));
    act(() => {
      result.current.setAnchorAsset("base");
      result.current.baseDepositAmountIn.setAmount("1");
    });
    const quote = result.current.quoteDepositAmountIn.amount;
    expect(new Dec(quote).gt(new Dec(0))).toBe(true);

    act(() => {
      result.current.setAnchorAsset("quote");
      result.current.quoteDepositAmountIn.setAmount(quote);
    });
    expect(
      new Dec(result.current.baseDepositAmountIn.amount)
        .sub(new Dec(1))
        .abs()
        .lt(new Dec(0.001))
    ).toBe(true);
  });

  it("keeps the other amount when the anchor amount is cleared", () => {
    const { result } = setup(inputs());
    act(() => result.current.setFullRange(true));
    act(() => result.current.baseDepositAmountIn.setAmount("1"));
    const quote = result.current.quoteDepositAmountIn.amount;
    act(() => result.current.baseDepositAmountIn.setAmount(""));
    expect(result.current.quoteDepositAmountIn.amount).toBe(quote);
  });

  it("max of one side flips the anchor when the counterparty would exceed its balance", () => {
    const { result } = setup(
      inputs({
        balances: [
          { denom: "uosmo", amount: "100000000" },
          { denom: "uatom", amount: "1000000" },
        ],
      })
    );
    act(() => result.current.setFullRange(true));
    act(() => result.current.setBaseDepositAmountMax());
    // quote is capped at its balance (1 ATOM) and base follows it
    expect(result.current.quoteDepositAmountIn.isMax).toBe(true);
    expect(result.current.baseDepositAmountIn.isMax).toBe(false);
    expect(result.current.quoteDepositAmountIn.amount).toBe("1");
    expect(
      new Dec(result.current.baseDepositAmountIn.amount)
        .sub(new Dec(1))
        .abs()
        .lt(new Dec(0.001))
    ).toBe(true);
  });

  it.each([
    ["no", [{ denom: "uosmo", amount: "27750000" }]],
    [
      "some",
      [
        { denom: "uosmo", amount: "27750000" },
        { denom: "uatom", amount: "1000000" },
      ],
    ],
  ])(
    "max on a single-sided range ignores the counterparty balance (%s quote balance)",
    (_, balances) => {
      const { result } = setup(inputs({ balances }));
      // range above the current price: base only
      act(() => {
        result.current.setMinRange("1.5");
        result.current.setMaxRange("2");
      });
      act(() => result.current.baseDepositAmountIn.setAmount("30"));
      act(() => result.current.setBaseDepositAmountMax());
      // 27.75 OSMO less the 0.12 OSMO high gas fee
      expect(result.current.baseDepositAmountIn.isMax).toBe(true);
      expect(result.current.baseDepositAmountIn.amount).toBe("27.63");
      expect(result.current.error).toBeUndefined();
    }
  );

  it("max with a zero counterparty balance zeroes both sides", () => {
    const { result } = setup(
      inputs({ balances: [{ denom: "uosmo", amount: "27750000" }] })
    );
    act(() => result.current.setFullRange(true));
    act(() => result.current.baseDepositAmountIn.setAmount("1"));
    act(() => result.current.setBaseDepositAmountMax());
    expect(result.current.quoteDepositAmountIn.isMax).toBe(true);
    expect(result.current.quoteDepositAmountIn.amount).toBe("0");
    expect(result.current.baseDepositAmountIn.amount).toBe("0");
  });

  it("only validates the deposited side when out of range", () => {
    const { result } = setup(inputs());
    // range above the current price: base only
    act(() => {
      result.current.setMinRange("1.5");
      result.current.setMaxRange("2");
    });
    expect(result.current.baseDepositOnly).toBe(true);
    expect(
      result.current.depositPercentages[0].toDec().equals(new Dec(1))
    ).toBe(true);
    act(() => result.current.baseDepositAmountIn.setAmount("1"));
    expect(result.current.error).toBeUndefined();
  });

  it("reports an invalid range", () => {
    const { result } = setup(inputs());
    act(() => {
      result.current.setMinRange("2");
      result.current.setMaxRange("1");
    });
    expect(result.current.error?.constructor.name).toBe("InvalidRangeError");
  });

  it("initializes the range to the moderate preset once historical prices load", () => {
    const { result, rerender } = setup(inputs());
    expect(result.current.rangeRaw).toEqual(["0", "0"]);
    rerender(inputs({ historicalPriceMinMax: { min: 0.9, max: 1.1 } }));
    expect(result.current.currentStrategy).toBe("moderate");

    // later changes by the user are not overwritten when the data refetches
    act(() => result.current.setFullRange(true));
    rerender(inputs({ historicalPriceMinMax: { min: 0.8, max: 1.2 } }));
    expect(result.current.fullRange).toBe(true);
  });

  it("waits for real prices when the price history is unavailable", () => {
    // The price history endpoint returns no-data bounds when it fails.
    const { result, rerender } = setup(
      inputs({ historicalPriceMinMax: { min: Infinity, max: -Infinity } })
    );
    expect(result.current.rangeRaw).toEqual(["0", "0"]);

    rerender(inputs({ historicalPriceMinMax: { min: 0.9, max: 1.1 } }));
    expect(result.current.currentStrategy).toBe("moderate");
  });

  it("does not initialize the range for inactive pools", () => {
    const { result } = setup(
      inputs({
        pool: makePool({ tickLiquidity: "0" }),
        historicalPriceMinMax: { min: 0.9, max: 1.1 },
      })
    );
    expect(result.current.isInactivePool).toBe(true);
    expect(result.current.rangeRaw).toEqual(["0", "0"]);
  });

  it("superfluid staking requires full range", () => {
    const { result } = setup(inputs());
    act(() => result.current.setElectSuperfluidStaking(true));
    expect(result.current.shouldBeSuperfluidStaked).toBe(false);
    act(() => result.current.setFullRange(true));
    expect(result.current.shouldBeSuperfluidStaked).toBe(true);
  });

  it("matches dollar values on max for inactive pools, capping when both overflow", () => {
    const { result } = setup(
      inputs({
        pool: makePool({ tickLiquidity: "0" }),
        quoteDepositPrice: price(2),
        balances: [
          { denom: "uosmo", amount: "10000000" },
          { denom: "uatom", amount: "100000000" },
        ],
      })
    );
    act(() => result.current.setFullRange(true));
    act(() => result.current.setBaseDepositAmountMax());
    // base max 9.88 OSMO at $1 -> 4.94 ATOM at $2
    expect(result.current.baseDepositAmountIn.amount).toBe("9.88");
    expect(result.current.quoteDepositAmountIn.amount).toBe("4.94");
  });
});
