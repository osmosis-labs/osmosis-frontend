import { CoinPretty, Dec, PricePretty } from "@osmosis-labs/unit";

import { AssetLists as assetLists } from "../../../../__tests__/mock-asset-lists";
import { MockChains as chainList } from "../../../../__tests__/mock-chains";
import { queryPools } from "../../../../sidecar/pools";
import { getAsset } from "../..";
import { getAssetMarketActivity, isMarketDataAvailable } from "../../market";
import { calcSumCoinsValueOrUnknown } from "..";
import { getCoingeckoPrice } from "../providers/coingecko";
import { getPriceFromSidecar, NoSqsPriceError } from "../providers/sidecar";

jest.mock("../providers/sidecar", () => ({
  ...jest.requireActual("../providers/sidecar"),
  getPriceFromSidecar: jest.fn(),
}));
jest.mock("../providers/coingecko", () => ({
  ...jest.requireActual("../providers/coingecko"),
  getCoingeckoPrice: jest.fn(),
}));
jest.mock("../../../../sidecar/pools", () => ({
  ...jest.requireActual("../../../../sidecar/pools"),
  queryPools: jest.fn(),
}));
jest.mock("../../market", () => ({
  isMarketDataAvailable: jest.fn(),
  getAssetMarketActivity: jest.fn(),
}));

const sqsPrice = getPriceFromSidecar as jest.Mock;
const coingecko = getCoingeckoPrice as jest.Mock;
const pools = queryPools as jest.Mock;
const marketAvailable = isMarketDataAvailable as jest.Mock;
const marketActivity = getAssetMarketActivity as jest.Mock;

// Each test uses its own verified, priced-by-default asset: failures and drained checks
// are cached per denom.
const DENOMS = {
  drained: "uion",
  numia: "uosmo",
  transport:
    "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt",
  liquid:
    "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/umbrn",
  zeroPrice:
    "factory/osmo1f5vfcph2dvfeqcqkhetwv75fda69z7e5c2dldm3kvgj23crkv6wqcn47a0/umilkTIA",
  coingecko:
    "factory/osmo1mlng7pz4pnyxtpq0akfwall37czyk9lukaucsrn30ameplhhshtqdvfm5c/ulvn",
  otherSide:
    "factory/osmo1z0qrq605sjgcqpylfl4aa6s90x738j7m58wyatt0tdzflg2ha26q67k743/wbtc",
  numiaNoLiquidity: "factory/osmo17fel472lgzs87ekt9dvk0zqyh5gl80sqp4sk4n/LAB",
  concurrent: "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqtia",
};

const USDC =
  "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";

const sum = (denom: string) =>
  calcSumCoinsValueOrUnknown({
    assetLists,
    chainList,
    // 1 whole token
    coins: [
      new CoinPretty(getAsset({ assetLists, anyDenom: denom }), "1000000"),
    ],
  });

/** SQS pools as `[denom balance, USDC balance]` pairs: real pools list every side. */
const poolsOf = (denom: string, balances: [string, string][]) => ({
  data: balances.map(([amount, usdc]) => ({
    balances: [
      { denom, amount },
      { denom: USDC, amount: usdc },
    ],
  })),
  meta: { next_cursor: undefined },
});

const usd = (amount: number) =>
  new PricePretty({ currency: "usd" } as never, new Dec(amount));

beforeEach(() => {
  jest.clearAllMocks();
  sqsPrice.mockRejectedValue(new NoSqsPriceError("No SQS price result for x"));
  marketAvailable.mockResolvedValue(true);
  marketActivity.mockResolvedValue({ price: undefined });
  coingecko.mockRejectedValue(new Error("No CoinGecko price result for x"));
});

describe("holding SQS has no price for", () => {
  it("is a known $0 when every pool is drained and no fallback has a price", async () => {
    pools.mockResolvedValue(
      poolsOf(DENOMS.drained, [
        ["0", "0"],
        ["0", "0"],
      ])
    );

    expect((await sum(DENOMS.drained))?.toString()).toBe(new Dec(0).toString());
  });

  it("uses the data services' price when there is one", async () => {
    pools.mockResolvedValue(poolsOf(DENOMS.numia, [["0", "0"]]));
    marketActivity.mockResolvedValue({ price: usd(3), liquidity: usd(5000) });

    expect((await sum(DENOMS.numia))?.toString()).toBe(new Dec(3).toString());
  });

  it("uses CoinGecko's price when there is one", async () => {
    pools.mockResolvedValue(poolsOf(DENOMS.coingecko, [["0", "0"]]));
    coingecko.mockResolvedValue(new Dec("2.5"));

    expect((await sum(DENOMS.coingecko))?.toString()).toBe(
      new Dec("2.5").toString()
    );
  });

  it("stays unknown on a transport error from SQS", async () => {
    sqsPrice.mockRejectedValue(
      new Error("SQS price batch expired while queued")
    );
    pools.mockResolvedValue(poolsOf(DENOMS.transport, [["0", "0"]]));

    expect(await sum(DENOMS.transport)).toBeUndefined();
    expect(pools).not.toHaveBeenCalled();
  });

  it("stays unknown while a pool still has liquidity", async () => {
    pools.mockResolvedValue(
      poolsOf(DENOMS.liquid, [
        ["0", "0"],
        ["1500000", "1500000"],
      ])
    );

    expect(await sum(DENOMS.liquid)).toBeUndefined();
  });

  it("stays unknown while a pool has none of it left but still holds other assets", async () => {
    pools.mockResolvedValue(poolsOf(DENOMS.otherSide, [["0", "1500000"]]));

    expect(await sum(DENOMS.otherSide)).toBeUndefined();
  });

  it("ignores a data services' price with no liquidity behind it", async () => {
    pools.mockResolvedValue(poolsOf(DENOMS.numiaNoLiquidity, [["0", "0"]]));
    marketActivity.mockResolvedValue({ price: usd(3), liquidity: usd(0) });

    expect((await sum(DENOMS.numiaNoLiquidity))?.toString()).toBe(
      new Dec(0).toString()
    );
  });

  it("shares one pools request between concurrent checks", async () => {
    let resolvePools: (value: unknown) => void = () => {};
    pools.mockReturnValue(new Promise((resolve) => (resolvePools = resolve)));

    const sums = Promise.all([sum(DENOMS.concurrent), sum(DENOMS.concurrent)]);
    // let both sums reach the drained check before the pools answer
    await new Promise((resolve) => setTimeout(resolve, 0));
    resolvePools(poolsOf(DENOMS.concurrent, [["0", "0"]]));

    expect((await sums).map((value) => value?.toString())).toEqual([
      new Dec(0).toString(),
      new Dec(0).toString(),
    ]);
    expect(pools).toHaveBeenCalledTimes(1);
  });

  it("doesn't take a zero fallback price for a price", async () => {
    pools.mockResolvedValue(poolsOf(DENOMS.zeroPrice, [["1500000", "0"]]));
    marketActivity.mockResolvedValue({ price: usd(0), liquidity: usd(5000) });

    expect(await sum(DENOMS.zeroPrice)).toBeUndefined();
  });
});
