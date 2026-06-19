import type { Asset } from "@osmosis-labs/types";

import { resolveExternalUrlConvertVariant } from "../external-url-convert-variant";

const ALLOY_DENOM =
  "factory/osmo1qnglc04tmhg32uc4kxlxh55a5cmhj88cpa3rmtly484xqu82t79sfv94w0/alloyed/allXRP";
const VARIANT_DENOM =
  "ibc/63A7CA0B6838AD8CAD6B5103998FF9B9B6A6F06FBB9638BFF51E63E0142339F3";
const SOLOGENIC = "Sologenic TX Bridge";

/** Minimal Asset fixture; only the fields the resolver reads matter. */
function asset(overrides: Partial<Asset>): Asset {
  return {
    chainName: "osmosis",
    sourceDenom: overrides.coinMinimalDenom ?? "",
    coinMinimalDenom: "",
    symbol: "",
    name: "",
    decimals: 6,
    isAlloyed: false,
    verified: true,
    preview: false,
    unstable: false,
    disabled: false,
    categories: [],
    transferMethods: [],
    counterparty: [],
    relative_image_url: "",
    ...overrides,
  } as Asset;
}

const alloyAsset = asset({
  coinMinimalDenom: ALLOY_DENOM,
  symbol: "XRP",
  isAlloyed: true,
  variantGroupKey: ALLOY_DENOM,
  // The alloy entry itself carries the Sologenic external_interface.
  transferMethods: [
    {
      name: SOLOGENIC,
      type: "external_interface",
      depositUrl: "https://sologenic.org/bridge/coreum-bridge",
      withdrawUrl: "https://sologenic.org/bridge/coreum-bridge",
    },
  ],
});

const variantAsset = asset({
  coinMinimalDenom: VARIANT_DENOM,
  symbol: "XRP.coreum",
  decimals: 6,
  variantGroupKey: ALLOY_DENOM,
  transferMethods: [
    {
      name: SOLOGENIC,
      type: "external_interface",
      depositUrl: "https://sologenic.org/bridge/coreum-bridge",
      withdrawUrl: "https://sologenic.org/bridge/coreum-bridge",
    },
    {
      name: "Osmosis IBC Transfer",
      type: "ibc",
      counterparty: {
        chainName: "coreum",
        chainId: "coreum-mainnet-1",
        sourceDenom: "drop",
        port: "transfer",
        channelId: "channel-2",
      },
      chain: {
        port: "transfer",
        channelId: "channel-2188",
        path: "transfer/channel-2188/drop",
      },
    },
  ],
});

const assets = [alloyAsset, variantAsset];

describe("resolveExternalUrlConvertVariant", () => {
  it("resolves the sibling variant whose external_interface matches the provider", () => {
    expect(
      resolveExternalUrlConvertVariant({
        urlProviderName: SOLOGENIC,
        alloy: alloyAsset,
        assets,
      })
    ).toEqual({
      coinMinimalDenom: VARIANT_DENOM,
      decimals: 6,
      symbol: "XRP.coreum",
    });
  });

  it("returns undefined when the from-asset is not an alloy", () => {
    expect(
      resolveExternalUrlConvertVariant({
        urlProviderName: SOLOGENIC,
        alloy: { ...variantAsset, isAlloyed: false },
        assets,
      })
    ).toBeUndefined();
  });

  it("returns undefined when from-asset is null (e.g. a deposit, no osmosis source)", () => {
    expect(
      resolveExternalUrlConvertVariant({
        urlProviderName: SOLOGENIC,
        alloy: null,
        assets,
      })
    ).toBeUndefined();
  });

  it("returns undefined when no sibling variant carries that provider's external_interface", () => {
    expect(
      resolveExternalUrlConvertVariant({
        urlProviderName: "Some Other Bridge",
        alloy: alloyAsset,
        assets,
      })
    ).toBeUndefined();
  });

  it("does not match the alloy's own external_interface (must be a sibling variant)", () => {
    // Only the alloy entry is present; its own Sologenic method must not match.
    expect(
      resolveExternalUrlConvertVariant({
        urlProviderName: SOLOGENIC,
        alloy: alloyAsset,
        assets: [alloyAsset],
      })
    ).toBeUndefined();
  });

  it("matches on the variant's own decimals, not the alloy's", () => {
    const alloy9 = { ...alloyAsset, decimals: 9 };
    const variant8 = { ...variantAsset, decimals: 8 };
    expect(
      resolveExternalUrlConvertVariant({
        urlProviderName: SOLOGENIC,
        alloy: alloy9,
        assets: [alloy9, variant8],
      })
    ).toEqual({
      coinMinimalDenom: VARIANT_DENOM,
      decimals: 8,
      symbol: "XRP.coreum",
    });
  });

  it("ignores assets from a different variant group", () => {
    const otherGroupVariant = asset({
      coinMinimalDenom: "ibc/OTHER",
      symbol: "FOO.coreum",
      variantGroupKey: "factory/.../alloyed/allFOO",
      transferMethods: [
        {
          name: SOLOGENIC,
          type: "external_interface",
          withdrawUrl: "https://sologenic.org/bridge/coreum-bridge",
        },
      ],
    });
    expect(
      resolveExternalUrlConvertVariant({
        urlProviderName: SOLOGENIC,
        alloy: alloyAsset,
        assets: [alloyAsset, otherGroupVariant],
      })
    ).toBeUndefined();
  });
});
