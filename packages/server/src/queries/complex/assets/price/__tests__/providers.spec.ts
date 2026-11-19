import { AsyncLocalStorage } from "node:async_hooks";

import { Asset } from "@osmosis-labs/types";
import { Dec } from "@osmosis-labs/unit";

import {
  type RequestScope,
  setRequestScopeProvider,
} from "../../../../../utils/request-scope";
import { AssetLists as assetLists } from "../../../../__tests__/mock-asset-lists";
import { MockChains as chainList } from "../../../../__tests__/mock-chains";
import { querySimplePrice } from "../../../../coingecko";
import { queryPrices, QUOTE_COIN_MINIMAL_DENOM } from "../../../../sidecar";
import { getAssetPrice } from "..";
import { getCoingeckoPrice } from "../providers/coingecko";
import { getPriceFromSidecar, NoSqsPriceError } from "../providers/sidecar";

jest.mock("../../../../sidecar/prices", () => ({
  ...jest.requireActual("../../../../sidecar/prices"),
  queryPrices: jest.fn(),
}));

jest.mock("../../../../coingecko/price", () => ({
  querySimplePrice: jest.fn(),
}));

const mockedQueryPrices = jest.mocked(queryPrices);
const mockedQuerySimplePrice = jest.mocked(querySimplePrice);

const asset = (coinMinimalDenom: string) => ({ coinMinimalDenom }) as Asset;

describe("getPriceFromSidecar", () => {
  beforeEach(() => mockedQueryPrices.mockReset());

  it("queries SQS on every call and retries a denom that failed", async () => {
    mockedQueryPrices.mockResolvedValueOnce({});
    await expect(getPriceFromSidecar(asset("uretry"))).rejects.toThrow(
      "No SQS price result for uretry"
    );

    mockedQueryPrices.mockResolvedValueOnce({
      uretry: { [QUOTE_COIN_MINIMAL_DENOM]: "1.5" },
    });
    expect((await getPriceFromSidecar(asset("uretry"))).toString()).toBe(
      "1.500000000000000000"
    );

    mockedQueryPrices.mockResolvedValueOnce({
      uretry: { [QUOTE_COIN_MINIMAL_DENOM]: "2" },
    });
    expect((await getPriceFromSidecar(asset("uretry"))).toString()).toBe(
      "2.000000000000000000"
    );

    expect(mockedQueryPrices).toHaveBeenCalledTimes(3);
  });

  it("batches concurrent calls into one SQS query", async () => {
    mockedQueryPrices.mockResolvedValueOnce({
      ua: { [QUOTE_COIN_MINIMAL_DENOM]: "1" },
      ub: { [QUOTE_COIN_MINIMAL_DENOM]: "2" },
    });

    const [a, b] = await Promise.all([
      getPriceFromSidecar(asset("ua")),
      getPriceFromSidecar(asset("ub")),
    ]);

    expect(a.toString()).toBe("1.000000000000000000");
    expect(b.toString()).toBe("2.000000000000000000");
    expect(mockedQueryPrices).toHaveBeenCalledTimes(1);
    expect(mockedQueryPrices.mock.calls[0][0]).toEqual(["ua", "ub"]);
  });
});

describe("getCoingeckoPrice", () => {
  it("fails only the id CoinGecko leaves out of the response", async () => {
    mockedQuerySimplePrice.mockResolvedValueOnce({ listed: { usd: 3 } });

    const [listed, missing] = await Promise.allSettled([
      getCoingeckoPrice({ coinGeckoId: "listed", currency: "usd" }),
      getCoingeckoPrice({ coinGeckoId: "missing", currency: "usd" }),
    ]);

    expect(mockedQuerySimplePrice).toHaveBeenCalledTimes(1);
    expect(listed).toEqual({
      status: "fulfilled",
      value: expect.anything(),
    });
    expect((listed as PromiseFulfilledResult<Dec>).value.toString()).toBe(
      "3.000000000000000000"
    );
    expect(missing.status).toBe("rejected");
    expect((missing as PromiseRejectedResult).reason.message).toBe(
      "No CoinGecko price result for missing and usd"
    );
  });
});

describe("getAssetPrice", () => {
  it("keeps a 'no price' answer briefly instead of re-querying on every call", async () => {
    const priceProvider = jest
      .fn()
      .mockRejectedValue(
        new NoSqsPriceError("No SQS price result for uion and USDC")
      );
    const params = {
      assetLists,
      chainList,
      asset: { coinMinimalDenom: "uion" },
      priceProvider,
    };

    await expect(getAssetPrice(params)).rejects.toThrow("No SQS price result");
    await expect(getAssetPrice(params)).rejects.toThrow("No SQS price result");

    expect(priceProvider).toHaveBeenCalledTimes(1);
  });

  it("retries a transient failure at once instead of keeping it", async () => {
    const priceProvider = jest
      .fn()
      .mockRejectedValueOnce(new Error("SQS price batch expired while queued"))
      .mockResolvedValue(new Dec(2));
    const params = {
      assetLists,
      chainList,
      asset: { coinMinimalDenom: "uosmo" },
      priceProvider,
    };

    await expect(getAssetPrice(params)).rejects.toThrow("expired");
    await expect(getAssetPrice(params)).resolves.toEqual(new Dec(2));

    expect(priceProvider).toHaveBeenCalledTimes(2);
  });

  it("does not let a late 'no price' answer hide a price found meanwhile", async () => {
    // Two requests on one Worker isolate, each with its own in-flight fetch.
    const scopes = new AsyncLocalStorage<RequestScope>();
    setRequestScopeProvider(() => scopes.getStore());
    const inRequest = <T>(fn: () => T) =>
      scopes.run({ waitUntil: () => undefined }, fn);

    try {
      const coinMinimalDenom = assetLists[0].assets.find(
        ({ coinMinimalDenom }) =>
          coinMinimalDenom !== "uosmo" && coinMinimalDenom !== "uion"
      )!.coinMinimalDenom;
      let rejectSlow!: (e: Error) => void;
      const slow = new Promise<Dec>((_, reject) => (rejectSlow = reject));
      const params = { assetLists, chainList, asset: { coinMinimalDenom } };

      const late = inRequest(() =>
        getAssetPrice({ ...params, priceProvider: () => slow })
      );
      await expect(
        inRequest(() =>
          getAssetPrice({ ...params, priceProvider: async () => new Dec(3) })
        )
      ).resolves.toEqual(new Dec(3));
      rejectSlow(
        new NoSqsPriceError(`No SQS price result for ${coinMinimalDenom}`)
      );
      await expect(late).rejects.toThrow("No SQS price result");

      const priceProvider = jest.fn();
      await expect(
        inRequest(() => getAssetPrice({ ...params, priceProvider }))
      ).resolves.toEqual(new Dec(3));
      expect(priceProvider).not.toHaveBeenCalled();
    } finally {
      setRequestScopeProvider(() => undefined);
    }
  });
});
