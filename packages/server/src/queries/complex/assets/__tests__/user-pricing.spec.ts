import type { MinimalAsset } from "@osmosis-labs/types";
import { CoinPretty, Dec, PricePretty } from "@osmosis-labs/unit";

import { AssetLists as MockAssetLists } from "../../../__tests__/mock-asset-lists";
import { queryBalances } from "../../../cosmos";
import { queryAccountLockedCoins } from "../../../osmosis/lockup/account-locked-coins";
import { getUserUnderlyingCoinsFromClPositions } from "../../concentrated-liquidity";
import {
  getUserTotalDelegatedCoin,
  getUserTotalUndelegations,
} from "../../staking/user";
import { DEFAULT_VS_CURRENCY } from "../config";
import { getAssetMarketActivity } from "../market";
import { calcAssetValue } from "../price";
import { getUserAssetsTotal, mapGetAssetsWithUserBalances } from "../user";

jest.mock("../../../cosmos", () => ({
  queryBalances: jest.fn(),
}));
jest.mock("../market", () => ({
  getAssetMarketActivity: jest.fn(),
}));
jest.mock("../price", () => ({
  calcAssetValue: jest.fn(),
}));

jest.mock("../../concentrated-liquidity", () => ({
  getUserUnderlyingCoinsFromClPositions: jest.fn(),
}));
jest.mock("../../staking/user", () => ({
  getUserTotalDelegatedCoin: jest.fn(),
  getUserTotalUndelegations: jest.fn(),
}));
jest.mock("../../../osmosis/lockup/account-locked-coins", () => ({
  queryAccountLockedCoins: jest.fn(),
}));

const makeAsset = (i: number): MinimalAsset => ({
  coinDenom: `Token ${i}`,
  coinMinimalDenom: `asset-${i}`,
  coinDecimals: i === 1 ? 18 : 6,
  isAlloyed: false,
  variantGroupKey: undefined,
  coinName: `Token ${i}`,
  coinGeckoId: undefined,
  isUnstable: false,
  areTransfersDisabled: false,
  areDepositsHalted: false,
  areWithdrawalsHalted: false,
  isVerified: i !== 2,
});
const money = (n: number) => new PricePretty(DEFAULT_VS_CURRENCY, new Dec(n));

describe("wallet list market valuations", () => {
  beforeEach(() => jest.clearAllMocks());

  it("sorts 800 holdings using market prices without SQS, preserving decimal units and missing prices", async () => {
    const assets = Array.from({ length: 800 }, (_, i) => makeAsset(i));
    jest.mocked(queryBalances).mockResolvedValue({
      balances: assets.map((asset, i) => ({
        denom: asset.coinMinimalDenom,
        amount: i === 1 ? "2000000000000000000" : i === 3 ? "0" : "1000000",
      })),
    } as Awaited<ReturnType<typeof queryBalances>>);
    jest
      .mocked(getAssetMarketActivity)
      .mockImplementation(async ({ coinMinimalDenom }) => {
        if (coinMinimalDenom === "asset-0") return undefined;
        return { price: money(2), liquidity: money(100) } as NonNullable<
          Awaited<ReturnType<typeof getAssetMarketActivity>>
        >;
      });
    const result = await mapGetAssetsWithUserBalances({
      assetLists: [],
      chainList: [],
      assets,
      userOsmoAddress: "osmo-test",
      sortFiatValueDirection: "desc",
    });
    expect(result).toHaveLength(800);
    expect(result[0].coinMinimalDenom).toBe("asset-1");
    expect(result[0].usdValue!.toDec().equals(new Dec(4))).toBe(true);
    expect(
      result.find((a) => a.coinMinimalDenom === "asset-0")!.usdValue
    ).toBeUndefined();
    expect(
      result.find((a) => a.coinMinimalDenom === "asset-0")!.amount
    ).toBeInstanceOf(CoinPretty);
    expect(
      result
        .find((a) => a.coinMinimalDenom === "asset-2")!
        .usdValue!.toDec()
        .equals(new Dec(2))
    ).toBe(true);
    expect(
      result
        .find((a) => a.coinMinimalDenom === "asset-3")!
        .usdValue!.toDec()
        .isZero()
    ).toBe(true);
    expect(calcAssetValue).not.toHaveBeenCalled();
  });

  it("retains balances when market data fails without falling back to SQS", async () => {
    jest.mocked(queryBalances).mockResolvedValue({
      balances: [{ denom: "asset-0", amount: "1000000" }],
    } as Awaited<ReturnType<typeof queryBalances>>);
    jest
      .mocked(getAssetMarketActivity)
      .mockRejectedValue(new Error("market unavailable"));
    const result = await mapGetAssetsWithUserBalances({
      assetLists: [],
      chainList: [],
      assets: [makeAsset(0)],
      userOsmoAddress: "osmo-test",
    });
    expect(result[0].amount!.toDec().equals(new Dec(1))).toBe(true);
    expect(result[0].usdValue).toBeUndefined();
    expect(calcAssetValue).not.toHaveBeenCalled();
  });
  it("includes all holdings in totals without route searches or a page-size cutoff", async () => {
    const rawAssets = Array.from({ length: 800 }, (_, i) => ({
      ...MockAssetLists[0].assets[0],
      coinMinimalDenom: `asset-${i}`,
      coinDecimals: 6,
      preview: false,
    }));
    jest.mocked(queryBalances).mockResolvedValue({
      balances: rawAssets.map((asset) => ({
        denom: asset.coinMinimalDenom,
        amount: "1000000",
      })),
    } as Awaited<ReturnType<typeof queryBalances>>);
    jest.mocked(getAssetMarketActivity).mockResolvedValue({
      price: money(2),
      liquidity: money(100),
    } as NonNullable<Awaited<ReturnType<typeof getAssetMarketActivity>>>);
    jest.mocked(getUserUnderlyingCoinsFromClPositions).mockResolvedValue([]);
    jest
      .mocked(queryAccountLockedCoins)
      .mockResolvedValue({ coins: [] } as unknown as Awaited<
        ReturnType<typeof queryAccountLockedCoins>
      >);
    jest
      .mocked(getUserTotalDelegatedCoin)
      .mockResolvedValue(new CoinPretty(makeAsset(0), "1000000"));
    jest
      .mocked(getUserTotalUndelegations)
      .mockResolvedValue(new CoinPretty(makeAsset(0), "1000000"));
    const result = await getUserAssetsTotal({
      assetLists: [{ ...MockAssetLists[0], assets: rawAssets }],
      chainList: [],
      userOsmoAddress: "osmo-test",
    });
    expect(result.value.toDec().equals(new Dec(1604))).toBe(true);
    expect(calcAssetValue).not.toHaveBeenCalled();
  });
});
