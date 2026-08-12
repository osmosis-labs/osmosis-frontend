import type { AssetVariant } from "@osmosis-labs/server";
import { getSwapMessages, type QuoteOutGivenIn } from "@osmosis-labs/tx";
import {
  CoinPretty,
  Dec,
  Int,
  PricePretty,
  RatePretty,
} from "@osmosis-labs/unit";

import {
  checkLargeAmountDiff,
  getConvertVariantMessages,
} from "../use-convert-variant";

jest.mock("@osmosis-labs/tx", () => ({
  ...jest.requireActual("@osmosis-labs/tx"),
  getSwapMessages: jest.fn().mockResolvedValue([]),
}));

const mockGetSwapMessages = getSwapMessages as jest.MockedFunction<
  typeof getSwapMessages
>;

describe("isLargeAmountDiff", () => {
  test("returns false when input amount is zero", () => {
    expect(checkLargeAmountDiff(new Dec("0"), new Dec("100"))).toBe(false);
  });

  test("returns false when output is 95% or more of input", () => {
    expect(checkLargeAmountDiff(new Dec("100"), new Dec("95"))).toBe(false);
    expect(checkLargeAmountDiff(new Dec("100"), new Dec("96"))).toBe(false);
    expect(checkLargeAmountDiff(new Dec("100"), new Dec("100"))).toBe(false);
  });

  test("returns true when output is less than 95% of input", () => {
    expect(checkLargeAmountDiff(new Dec("100"), new Dec("94"))).toBe(true);
    expect(checkLargeAmountDiff(new Dec("100"), new Dec("90"))).toBe(true);
    expect(checkLargeAmountDiff(new Dec("100"), new Dec("50"))).toBe(true);
  });
});

describe("getConvertVariantMessages slippage", () => {
  const VARIANT_DENOM = "ibc/VARIANT";
  const ALLOY_DENOM = "factory/osmo1alloycontract/alloyed/allTEST";

  const variantCurrency = {
    coinDenom: "TEST.variant",
    coinMinimalDenom: VARIANT_DENOM,
    coinDecimals: 6,
  };

  const alloyCurrency = {
    coinDenom: "TEST",
    coinMinimalDenom: ALLOY_DENOM,
    coinDecimals: 6,
  };

  const variant = {
    name: "Test Variant",
    amount: new CoinPretty(variantCurrency, new Dec("1000000")),
    fiatValue: new PricePretty(
      { currency: "usd", symbol: "$", maxDecimals: 2, locale: "en-US" },
      new Dec("1")
    ),
    canonicalAsset: alloyCurrency,
  } as unknown as AssetVariant;

  /** Quote shaped like the tRPC route output, i.e. post-
   *  `makeDisplayableOutGivenInSplit`. Two details matter:
   *
   *  - `type` is the CosmWasm *subtype*. That transform rewrites the raw type
   *    via `getCosmwasmPoolTypeFromCodeId`, so a bare "cosmwasm" would assert a
   *    shape production does not emit.
   *  - the displayable pool carries `spreadFactor` / `dynamicSpreadFactor` /
   *    `inCurrency` / `outCurrency`, and NOT `codeId` or `swapFee`; the code id
   *    is consumed by the transform and dropped. */
  const makeQuote = (split: { poolTypes: string[] }[]): QuoteOutGivenIn =>
    ({
      amount: new Int("1000000"),
      split: split.map(({ poolTypes }) => ({
        initialAmount: new Int("1000000"),
        pools: poolTypes.map((type, i) => ({
          id: String(i + 1),
          type,
          spreadFactor: new RatePretty(new Dec(0)),
          dynamicSpreadFactor: type === "cosmwasm-astroport-pcl",
          inCurrency: variantCurrency,
          outCurrency: alloyCurrency,
        })),
        tokenInDenom: VARIANT_DENOM,
        tokenOutDenoms: poolTypes.map(() => ALLOY_DENOM),
      })),
    } as unknown as QuoteOutGivenIn);

  const slippageForQuote = async (quote: QuoteOutGivenIn) => {
    await getConvertVariantMessages(variant, quote, "osmo1address");
    return mockGetSwapMessages.mock.calls.at(-1)?.[0].maxSlippage;
  };

  beforeEach(() => {
    mockGetSwapMessages.mockClear();
  });

  test("uses zero slippage for a single-hop alloyed pool", async () => {
    // The regression this guards: the condition previously required
    // pools.length === 0, so this case fell through to 5%.
    expect(
      await slippageForQuote(makeQuote([{ poolTypes: ["cosmwasm-alloyed"] }]))
    ).toBe("0");
  });

  test("uses zero slippage for a single-hop transmuter pool", async () => {
    expect(
      await slippageForQuote(
        makeQuote([{ poolTypes: ["cosmwasm-transmuter"] }])
      )
    ).toBe("0");
  });

  // The CosmWasm subtypes below are NOT 1:1. A prefix test on "cosmwasm" would
  // wrongly demand the exact quoted amount out and revert on normal price drift.
  test("keeps slippage for a single-hop Astroport PCL pool", async () => {
    expect(
      await slippageForQuote(
        makeQuote([{ poolTypes: ["cosmwasm-astroport-pcl"] }])
      )
    ).toBe("0.05");
  });

  test("keeps slippage for a single-hop WhiteWhale pool", async () => {
    expect(
      await slippageForQuote(
        makeQuote([{ poolTypes: ["cosmwasm-whitewhale"] }])
      )
    ).toBe("0.05");
  });

  test("keeps slippage for a single-hop orderbook pool", async () => {
    expect(
      await slippageForQuote(makeQuote([{ poolTypes: ["cosmwasm-orderbook"] }]))
    ).toBe("0.05");
  });

  test("keeps slippage for an unrecognised bare cosmwasm pool", async () => {
    // Unknown code id means unknown semantics; do not assume 1:1.
    expect(
      await slippageForQuote(makeQuote([{ poolTypes: ["cosmwasm"] }]))
    ).toBe("0.05");
  });

  test("allows slippage when the route is not a CosmWasm pool", async () => {
    expect(
      await slippageForQuote(makeQuote([{ poolTypes: ["concentrated"] }]))
    ).toBe("0.05");
  });

  test("allows slippage on a multi-hop route even via an alloyed pool", async () => {
    // Second hop is a real swap that can move against the user.
    expect(
      await slippageForQuote(
        makeQuote([{ poolTypes: ["cosmwasm-alloyed", "concentrated"] }])
      )
    ).toBe("0.05");
  });

  test("allows slippage on a split route", async () => {
    expect(
      await slippageForQuote(
        makeQuote([
          { poolTypes: ["cosmwasm-alloyed"] },
          { poolTypes: ["cosmwasm-alloyed"] },
        ])
      )
    ).toBe("0.05");
  });

  test("falls back to slippage when the route has no pools", async () => {
    // An empty pool list is malformed; it must not be read as a 1:1 alloy hop.
    // This is the exact shape the old `pools.length === 0` condition tested for.
    expect(await slippageForQuote(makeQuote([{ poolTypes: [] }]))).toBe("0.05");
  });
});
