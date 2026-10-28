import { CoinPretty, Dec } from "@osmosis-labs/unit";

import { AssetLists as assetLists } from "../../../__tests__/mock-asset-lists";
import { MockChains as chainList } from "../../../__tests__/mock-chains";
import { queryBalances } from "../../../cosmos";
import { getGammShareUnderlyingCoins } from "../../pools/share";
import { getPriceFromSidecar } from "../price/providers/sidecar";
import { getUserAssetsTotal } from "../user";

jest.mock("../../../cosmos", () => ({
  queryBalances: jest.fn(),
}));
jest.mock("../../../osmosis/lockup/account-locked-coins", () => ({
  queryAccountLockedCoins: jest.fn().mockResolvedValue({ coins: [] }),
}));
jest.mock("../../pools/share", () => ({
  getGammShareUnderlyingCoins: jest.fn(),
}));
jest.mock("../../concentrated-liquidity", () => ({
  getUserUnderlyingCoinsFromClPositions: jest.fn().mockResolvedValue([]),
}));
jest.mock("../../staking/user", () => {
  const osmo = {
    coinDenom: "OSMO",
    coinMinimalDenom: "uosmo",
    coinDecimals: 6,
  };
  return {
    getUserTotalDelegatedCoin: jest.fn(() =>
      Promise.resolve(new CoinPretty(osmo, 0))
    ),
    getUserTotalUndelegations: jest.fn(() =>
      Promise.resolve(new CoinPretty(osmo, 0))
    ),
  };
});
jest.mock("../price/providers/sidecar", () => ({
  ...jest.requireActual("../price/providers/sidecar"),
  getPriceFromSidecar: jest.fn(),
}));

const mockedQueryBalances = jest.mocked(queryBalances);
const mockedGetPrice = jest.mocked(getPriceFromSidecar);
const mockedGetShareCoins = jest.mocked(getGammShareUnderlyingCoins);

describe("getUserAssetsTotal", () => {
  beforeEach(() => {
    mockedQueryBalances.mockResolvedValue({
      balances: [
        { denom: "uosmo", amount: "1000000" },
        { denom: "uion", amount: "1000000" },
      ],
      pagination: { next_key: null, total: "2" },
    } as Awaited<ReturnType<typeof queryBalances>>);
  });

  it("is unknown, not understated, when a listed asset has no price", async () => {
    mockedGetPrice.mockImplementation(async ({ coinMinimalDenom }) => {
      if (coinMinimalDenom === "uosmo") return new Dec(2);
      throw new Error(`No SQS price result for ${coinMinimalDenom} and USDC`);
    });

    const { value } = await getUserAssetsTotal({
      assetLists,
      chainList,
      userOsmoAddress: "osmo1unknowntotal",
    });

    expect(value).toBeUndefined();
  });

  it("is unknown, not understated, when a GAMM share lookup fails", async () => {
    mockedQueryBalances.mockResolvedValue({
      balances: [
        { denom: "uosmo", amount: "1000000" },
        { denom: "gamm/pool/1", amount: "1000000000000000000" },
      ],
      pagination: { next_key: null, total: "2" },
    } as Awaited<ReturnType<typeof queryBalances>>);
    mockedGetPrice.mockResolvedValue(new Dec(2));
    mockedGetShareCoins.mockRejectedValue(new Error("pool not found"));
    jest.spyOn(console, "error").mockImplementation(() => {});

    const { value } = await getUserAssetsTotal({
      assetLists,
      chainList,
      userOsmoAddress: "osmo1sharelookupfailed",
    });

    expect(value).toBeUndefined();
  });

  it("doesn't read a non-share denom containing 'gamm' as a pool share", async () => {
    mockedQueryBalances.mockResolvedValue({
      balances: [
        { denom: "uosmo", amount: "1000000" },
        { denom: "factory/osmo1abc/gamm", amount: "1" },
      ],
      pagination: { next_key: null, total: "2" },
    } as Awaited<ReturnType<typeof queryBalances>>);
    mockedGetPrice.mockResolvedValue(new Dec(2));
    mockedGetShareCoins.mockClear();

    const { value } = await getUserAssetsTotal({
      assetLists,
      chainList,
      userOsmoAddress: "osmo1tokenfactorygamm",
    });

    expect(mockedGetShareCoins).not.toHaveBeenCalled();
    expect(value).toBeDefined();
  });
});
