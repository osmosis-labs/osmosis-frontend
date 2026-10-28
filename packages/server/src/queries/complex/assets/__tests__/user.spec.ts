import { CoinPretty, Dec } from "@osmosis-labs/unit";

import { AssetLists as assetLists } from "../../../__tests__/mock-asset-lists";
import { MockChains as chainList } from "../../../__tests__/mock-chains";
import { queryBalances } from "../../../cosmos";
import { getPriceFromSidecar } from "../price/providers/sidecar";
import { getUserAssetsTotal } from "../user";

jest.mock("../../../cosmos", () => ({
  queryBalances: jest.fn(),
}));
jest.mock("../../../osmosis/lockup/account-locked-coins", () => ({
  queryAccountLockedCoins: jest.fn().mockResolvedValue({ coins: [] }),
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
  getPriceFromSidecar: jest.fn(),
}));

const mockedQueryBalances = jest.mocked(queryBalances);
const mockedGetPrice = jest.mocked(getPriceFromSidecar);

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
});
