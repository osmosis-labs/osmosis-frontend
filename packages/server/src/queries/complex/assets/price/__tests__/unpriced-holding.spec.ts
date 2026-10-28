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
  coingecko:
    "factory/osmo1mlng7pz4pnyxtpq0akfwall37czyk9lukaucsrn30ameplhhshtqdvfm5c/ulvn",
};

const sum = (denom: string) =>
  calcSumCoinsValueOrUnknown({
    assetLists,
    chainList,
    // 1 whole token
    coins: [
      new CoinPretty(getAsset({ assetLists, anyDenom: denom }), "1000000"),
    ],
  });

const poolsOf = (denom: string, balances: string[]) => ({
  data: balances.map((amount) => ({ balances: [{ denom, amount }] })),
  meta: { next_cursor: undefined },
});

beforeEach(() => {
  jest.clearAllMocks();
  sqsPrice.mockRejectedValue(new NoSqsPriceError("No SQS price result for x"));
  marketAvailable.mockResolvedValue(true);
  marketActivity.mockResolvedValue({ price: undefined });
  coingecko.mockRejectedValue(new Error("No CoinGecko price result for x"));
});

describe("holding SQS has no price for", () => {
  it("is a known $0 when every pool is drained and no fallback has a price", async () => {
    pools.mockResolvedValue(poolsOf(DENOMS.drained, ["0", "0"]));

    expect((await sum(DENOMS.drained))?.toString()).toBe(new Dec(0).toString());
  });

  it("uses the data services' price when there is one", async () => {
    pools.mockResolvedValue(poolsOf(DENOMS.numia, ["0"]));
    marketActivity.mockResolvedValue({
      price: new PricePretty({ currency: "usd" } as never, new Dec(3)),
    });

    expect((await sum(DENOMS.numia))?.toString()).toBe(new Dec(3).toString());
  });

  it("uses CoinGecko's price when there is one", async () => {
    pools.mockResolvedValue(poolsOf(DENOMS.coingecko, ["0"]));
    coingecko.mockResolvedValue(new Dec("2.5"));

    expect((await sum(DENOMS.coingecko))?.toString()).toBe(
      new Dec("2.5").toString()
    );
  });

  it("stays unknown on a transport error from SQS", async () => {
    sqsPrice.mockRejectedValue(
      new Error("SQS price batch expired while queued")
    );
    pools.mockResolvedValue(poolsOf(DENOMS.transport, ["0"]));

    expect(await sum(DENOMS.transport)).toBeUndefined();
    expect(pools).not.toHaveBeenCalled();
  });

  it("stays unknown while a pool still has liquidity", async () => {
    pools.mockResolvedValue(poolsOf(DENOMS.liquid, ["0", "1500000"]));

    expect(await sum(DENOMS.liquid)).toBeUndefined();
  });
});
