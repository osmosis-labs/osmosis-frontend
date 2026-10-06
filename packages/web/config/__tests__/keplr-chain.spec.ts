import type { AssetList, Chain } from "@osmosis-labs/types";

import { getKeplrCompatibleChain, withCosmosKitFields } from "../keplr-chain";

const CW20_DENOM =
  "cw20:osmo1ctpzlr2y8s3dyc2dhxrsqjzr3qx3s3ucx3ntj7mgy2vfvjkgx73qdd4xm5";
const SECRET20_DENOM = "cw20:secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8fzek";

// Minimal fixtures: getKeplrCompatibleChain only reads the fields set here, and the full
// Chain / Asset types carry many registry fields that are irrelevant to currency typing.
const chain = {
  chain_name: "osmosis",
  chain_id: "osmosis-1",
  prettyName: "Osmosis",
  slip44: 118,
  bech32Config: {
    bech32PrefixAccAddr: "osmo",
    bech32PrefixAccPub: "osmopub",
    bech32PrefixValAddr: "osmovaloper",
    bech32PrefixValPub: "osmovaloperpub",
    bech32PrefixConsAddr: "osmovalcons",
    bech32PrefixConsPub: "osmovalconspub",
  },
  apis: {
    rpc: [{ address: "https://rpc" }],
    rest: [{ address: "https://rest" }],
  },
  explorers: [{ txPage: "https://explorer/tx/${txHash}" }],
  features: [],
  stakeCurrency: { coinMinimalDenom: "uosmo" },
  feeCurrencies: [{ coinMinimalDenom: "uosmo" }],
  currencies: [
    { coinDenom: "OSMO", coinMinimalDenom: "uosmo", coinDecimals: 6 },
    { coinDenom: "CWT", coinMinimalDenom: CW20_DENOM, coinDecimals: 6 },
    { coinDenom: "SCRT20", coinMinimalDenom: SECRET20_DENOM, coinDecimals: 6 },
  ],
} as unknown as Chain;

const assetLists = [
  {
    chain_name: "osmosis",
    chain_id: "osmosis-1",
    assets: [
      {
        coinMinimalDenom: "uosmo",
        symbol: "OSMO",
        decimals: 6,
        logoURIs: { svg: "https://img/osmo.svg" },
      },
    ],
  },
] as unknown as AssetList[];

describe("getKeplrCompatibleChain currency typing", () => {
  const keplrChain = getKeplrCompatibleChain({ chain, assetLists });
  const byBase = (base: string) =>
    keplrChain.currencies.find(
      (currency) => (currency as { base?: string }).base === base
    )!;

  it("gives native currencies no `type` key, so Keplr's rewards query reads them", () => {
    const osmo = byBase("uosmo");
    expect(osmo.coinMinimalDenom).toBe("uosmo");
    expect("type" in osmo).toBe(false);
  });

  it("keeps `type` on cw20 and secret20 contract tokens", () => {
    const cw20 = byBase(CW20_DENOM);
    expect("type" in cw20 && cw20.type).toBe("cw20");
    expect(cw20.coinMinimalDenom).toBe(`${CW20_DENOM}:CWT`);

    const secret20 = byBase(SECRET20_DENOM);
    expect("type" in secret20 && secret20.type).toBe("secret20");
  });

  it("gives native fee currencies no `type` key", () => {
    const [osmoFee] = keplrChain.feeCurrencies;
    expect(osmoFee.coinMinimalDenom).toBe("uosmo");
    expect("type" in osmoFee).toBe(false);
  });
});

describe("getKeplrCompatibleChain golden cases", () => {
  it("substitutes a placeholder stake currency when the staking denom is not in the asset list", () => {
    const noStakeAssetChain = {
      ...chain,
      stakeCurrency: { coinMinimalDenom: "ustake" },
    } as unknown as Chain;

    const keplrChain = getKeplrCompatibleChain({
      chain: noStakeAssetChain,
      assetLists,
    });

    expect(keplrChain.stakeCurrency).toEqual({
      coinDenom: "STAKE",
      coinMinimalDenom: "tempStakePlaceholder",
      coinDecimals: 0,
    });
  });

  it("resolves the stake currency from the asset list when present", () => {
    const keplrChain = getKeplrCompatibleChain({ chain, assetLists });

    expect(keplrChain.stakeCurrency).toMatchObject({
      coinDenom: "OSMO",
      coinMinimalDenom: "uosmo",
      coinDecimals: 6,
      base: "uosmo",
      coinImageUrl: "/tokens/generated/osmo.svg",
    });
  });

  it("drops gasPriceStep unless low, average and high are all set and non-zero", () => {
    const gasChain = {
      ...chain,
      feeCurrencies: [
        {
          coinMinimalDenom: "uosmo",
          gasPriceStep: { low: 0, average: 0.025, high: 0.04 },
        },
        {
          coinMinimalDenom: "uion",
          gasPriceStep: { low: 0.0025, average: 0.025, high: 0.04 },
        },
      ],
    } as unknown as Chain;
    const gasAssetLists = [
      {
        ...assetLists[0],
        assets: [
          ...assetLists[0].assets,
          { coinMinimalDenom: "uion", symbol: "ION", decimals: 6 },
        ],
      },
    ] as unknown as AssetList[];

    const keplrChain = getKeplrCompatibleChain({
      chain: gasChain,
      assetLists: gasAssetLists,
    });

    const [osmoFee, ionFee] = keplrChain.feeCurrencies;
    expect(osmoFee.coinMinimalDenom).toBe("uosmo");
    expect(osmoFee.gasPriceStep).toBeUndefined();

    expect(ionFee.coinMinimalDenom).toBe("uion");
    expect(ionFee.gasPriceStep).toEqual({
      low: 0.0025,
      average: 0.025,
      high: 0.04,
    });
  });

  it("omits fee currencies that have no asset list entry", () => {
    const unknownFeeChain = {
      ...chain,
      feeCurrencies: [
        { coinMinimalDenom: "uosmo" },
        { coinMinimalDenom: "unotlisted" },
      ],
    } as unknown as Chain;

    const keplrChain = getKeplrCompatibleChain({
      chain: unknownFeeChain,
      assetLists,
    });

    expect(keplrChain.feeCurrencies.map((fee) => fee.coinMinimalDenom)).toEqual(
      ["uosmo"]
    );
  });

  it("rewrites the explorer txPage placeholder and falls back to an empty string", () => {
    const keplrChain = getKeplrCompatibleChain({ chain, assetLists });
    expect(keplrChain.explorerUrlToTx).toBe("https://explorer/tx/{txHash}");

    const noExplorerChain = { ...chain, explorers: [] } as unknown as Chain;
    expect(
      getKeplrCompatibleChain({ chain: noExplorerChain, assetLists })
        .explorerUrlToTx
    ).toBe("");
  });

  it("throws when the chain has no asset list", () => {
    expect(() => getKeplrCompatibleChain({ chain, assetLists: [] })).toThrow(
      "Missing asset list for chain osmosis-1"
    );
  });
});

describe("withCosmosKitFields", () => {
  it("maps feeCurrencies to chain-registry fee_tokens", () => {
    const cosmosKitChain = withCosmosKitFields({
      ...chain,
      feeCurrencies: [
        {
          coinMinimalDenom: "uosmo",
          gasPriceStep: { low: 0.0025, average: 0.025, high: 0.04 },
        },
        { coinMinimalDenom: "uion" },
      ],
    } as unknown as Chain);

    expect(cosmosKitChain.fees.fee_tokens).toEqual([
      expect.objectContaining({
        denom: "uosmo",
        coinMinimalDenom: "uosmo",
        fixed_min_gas_price: 0.0025,
        low_gas_price: 0.0025,
        average_gas_price: 0.025,
        high_gas_price: 0.04,
      }),
      expect.objectContaining({
        denom: "uion",
        coinMinimalDenom: "uion",
        fixed_min_gas_price: 0,
        low_gas_price: undefined,
        average_gas_price: undefined,
        high_gas_price: undefined,
      }),
    ]);
  });

  it("maps stakeCurrency to staking_tokens, empty when the chain has none", () => {
    expect(withCosmosKitFields(chain).staking).toEqual({
      staking_tokens: [{ coinMinimalDenom: "uosmo" }],
    });

    const noStakeChain = {
      ...chain,
      stakeCurrency: undefined,
    } as unknown as Chain;
    expect(withCosmosKitFields(noStakeChain).staking).toEqual({
      staking_tokens: [],
    });

    const noFeeChain = {
      ...chain,
      feeCurrencies: undefined,
    } as unknown as Chain;
    expect(withCosmosKitFields(noFeeChain).fees).toEqual({ fee_tokens: [] });
  });

  it("preserves the original chain fields", () => {
    const cosmosKitChain = withCosmosKitFields(chain);
    expect(cosmosKitChain.chain_id).toBe("osmosis-1");
    expect(cosmosKitChain.bech32Config).toBe(chain.bech32Config);
  });
});
