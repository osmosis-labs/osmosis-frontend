import { ObservableRemoveConcentratedLiquidityConfig } from "@osmosis-labs/stores";
import { CoinPretty, Dec, Int } from "@osmosis-labs/unit";
import { EmptyAmountError } from "@osmosis-labs/utils";
import { act, renderHook } from "@testing-library/react";

import {
  getEffectiveLiquidity,
  getEffectiveLiquidityAmounts,
  getRemoveConcentratedLiquidityError,
} from "~/hooks/ui-config/remove-concentrated-liquidity";
import { useRemoveConcentratedLiquidityConfig } from "~/hooks/ui-config/use-remove-concentrated-liquidity-config";

const mockWallet = jest.fn();
jest.mock("~/hooks/use-wallet", () => ({
  useWallet: () => ({ wallet: mockWallet() }),
}));
jest.mock("~/utils/trpc", () => ({
  api: { useUtils: () => ({}) },
}));

const osmo = { coinDenom: "OSMO", coinMinimalDenom: "uosmo", coinDecimals: 6 };
const usdc = { coinDenom: "USDC", coinMinimalDenom: "uusdc", coinDecimals: 6 };
const eth = { coinDenom: "ETH", coinMinimalDenom: "weth", coinDecimals: 18 };

const makePosition = () => ({
  id: "7",
  liquidity: new Dec("123456789.123456789"),
  currentCoins: [
    new CoinPretty(osmo, new Int("123456789")),
    new CoinPretty(eth, new Int("987654321987654321")),
  ],
});
const makeQuotePosition = () => ({
  ...makePosition(),
  currentCoins: [
    new CoinPretty(usdc, new Int("5000000")),
    new CoinPretty(osmo, new Int("1")),
  ],
});

describe("remove concentrated liquidity calculations", () => {
  it.each([0, 0.01, 0.25, 0.33, 0.5, 0.75, 1])(
    "matches the legacy config at %d of the position",
    (percentage) => {
      const position = makePosition();
      const legacy = new ObservableRemoveConcentratedLiquidityConfig(
        {} as any,
        "osmosis-1",
        "1",
        {
          liquidity: position.liquidity,
          baseAsset: position.currentCoins[0],
          quoteAsset: position.currentCoins[1],
        },
        percentage
      );
      const pos = {
        liquidity: position.liquidity,
        baseAsset: position.currentCoins[0],
        quoteAsset: position.currentCoins[1],
      };

      expect(getEffectiveLiquidity(pos, percentage)?.toString()).toBe(
        legacy.effectiveLiquidity?.toString()
      );
      const amounts = getEffectiveLiquidityAmounts(pos, percentage);
      expect(amounts?.base.toCoin()).toEqual(
        legacy.effectiveLiquidityAmounts?.base.toCoin()
      );
      expect(amounts?.quote.toCoin()).toEqual(
        legacy.effectiveLiquidityAmounts?.quote.toCoin()
      );
      expect(getRemoveConcentratedLiquidityError(percentage)?.constructor).toBe(
        legacy.error?.constructor
      );
    }
  );

  it("errors on a zero percentage only", () => {
    expect(getRemoveConcentratedLiquidityError(0)).toBeInstanceOf(
      EmptyAmountError
    );
    expect(getRemoveConcentratedLiquidityError(0.01)).toBeUndefined();
  });
});

describe("useRemoveConcentratedLiquidityConfig", () => {
  beforeEach(() => mockWallet.mockReturnValue(undefined));

  it("starts at 100% of the position and follows the percentage", () => {
    const position = makePosition();
    const { result } = renderHook(() =>
      useRemoveConcentratedLiquidityConfig("osmosis-1", "1", position as any)
    );
    expect(result.current.config.percentage).toBe(1);
    expect(result.current.config.effectiveLiquidity?.toString()).toBe(
      position.liquidity.toString()
    );
    expect(result.current.config.error).toBeUndefined();

    act(() => result.current.config.setPercentage(0.5));
    expect(
      result.current.config.effectiveLiquidityAmounts?.base.toCoin()
    ).toEqual({ denom: "uosmo", amount: "61728394" });

    act(() => result.current.config.setPercentage(0));
    expect(result.current.config.error).toBeInstanceOf(EmptyAmountError);
  });

  it("uses the latest position without resetting the percentage", () => {
    let position: any = makePosition();
    const { result, rerender } = renderHook(() =>
      useRemoveConcentratedLiquidityConfig("osmosis-1", "1", position)
    );
    act(() => result.current.config.setPercentage(0.25));
    position = makeQuotePosition();
    rerender();
    expect(result.current.config.percentage).toBe(0.25);
    expect(
      result.current.config.effectiveLiquidityAmounts?.base.currency.coinDenom
    ).toBe("USDC");
    expect(
      result.current.config.effectiveLiquidityAmounts?.base.toCoin()
    ).toEqual({ denom: "uusdc", amount: "1250000" });
  });
});
