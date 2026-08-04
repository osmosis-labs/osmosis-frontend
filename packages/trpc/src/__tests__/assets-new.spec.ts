import {
  DEFAULT_VS_CURRENCY,
  getAssetListingDate,
  getAssetMarketActivity,
  getAssets,
} from "@osmosis-labs/server";
import type { MinimalAsset } from "@osmosis-labs/types";
import { Dec, PricePretty, RatePretty } from "@osmosis-labs/unit";

import {
  createCallerFactory,
  createInnerTRPCContext,
  createTRPCRouter,
} from "..";
import { assetsRouter } from "../assets";

jest.mock("@osmosis-labs/server", () => {
  const actual = jest.requireActual("@osmosis-labs/server");

  return {
    ...actual,
    getAssetListingDate: jest.fn(),
    getAssetMarketActivity: jest.fn(),
    getAssets: jest.fn(),
  };
});

const mockedGetAssetListingDate = jest.mocked(getAssetListingDate);
const mockedGetAssetMarketActivity = jest.mocked(getAssetMarketActivity);
const mockedGetAssets = jest.mocked(getAssets);

const makeAsset = ({
  coinMinimalDenom,
  variantGroupKey,
}: {
  coinMinimalDenom: string;
  variantGroupKey?: string;
}): MinimalAsset => ({
  coinDenom: coinMinimalDenom,
  coinMinimalDenom,
  coinDecimals: 6,
  coinGeckoId: undefined,
  coinName: coinMinimalDenom,
  isUnstable: false,
  areTransfersDisabled: false,
  areDepositsHalted: false,
  areWithdrawalsHalted: false,
  isVerified: true,
  isAlloyed: variantGroupKey === coinMinimalDenom,
  variantGroupKey,
});

const makeCaller = () => {
  const router = createTRPCRouter({ assets: assetsRouter });
  return createCallerFactory(router)(
    createInnerTRPCContext({ assetLists: [], chainList: [] })
  );
};

describe("getTopNewAssets", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("excludes non-canonical variants before fetching market activity", async () => {
    const canonicalAsset = makeAsset({
      coinMinimalDenom: "factory/alloy",
      variantGroupKey: "factory/alloy",
    });
    const variantAsset = makeAsset({
      coinMinimalDenom: "ibc/variant",
      variantGroupKey: canonicalAsset.coinMinimalDenom,
    });

    mockedGetAssets.mockReturnValue([canonicalAsset, variantAsset]);
    mockedGetAssetMarketActivity.mockResolvedValue({
      price: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(1)),
      denom: canonicalAsset.coinMinimalDenom,
      symbol: canonicalAsset.coinDenom,
      liquidity: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(1_000)),
      liquidity24hChange: undefined,
      marketCap: undefined,
      volume24h: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(1_000)),
      volume24hChange: undefined,
      name: canonicalAsset.coinName,
      price1hChange: undefined,
      price24hChange: new RatePretty(new Dec("0.1")),
      price7dChange: undefined,
      exponent: canonicalAsset.coinDecimals,
      display: canonicalAsset.coinDenom,
    });
    mockedGetAssetListingDate.mockReturnValue(
      new Date("2026-08-01T00:00:00.000Z")
    );

    const result = await makeCaller().assets.getTopNewAssets({ topN: 3 });

    expect(result.map(({ coinMinimalDenom }) => coinMinimalDenom)).toEqual([
      canonicalAsset.coinMinimalDenom,
    ]);
    expect(mockedGetAssetMarketActivity).toHaveBeenCalledTimes(1);
    expect(mockedGetAssetMarketActivity).toHaveBeenCalledWith(canonicalAsset);
    expect(mockedGetAssetListingDate).toHaveBeenCalledTimes(1);
    expect(mockedGetAssetListingDate).toHaveBeenCalledWith({
      assetLists: [],
      coinMinimalDenom: canonicalAsset.coinMinimalDenom,
    });
  });
});
