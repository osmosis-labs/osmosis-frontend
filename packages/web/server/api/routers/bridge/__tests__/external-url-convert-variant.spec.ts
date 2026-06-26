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

/** Default member set: every non-alloy asset is treated as a true pool member.
 *  Membership-gating tests pass a restricted set explicitly. */
const allMembers = (list: Asset[]): Set<string> =>
  new Set(list.filter((a) => !a.isAlloyed).map((a) => a.coinMinimalDenom));

describe("resolveExternalUrlConvertVariant", () => {
  it("resolves the sibling variant whose external_interface matches the provider", () => {
    expect(
      resolveExternalUrlConvertVariant({
        urlProviderName: SOLOGENIC,
        alloy: alloyAsset,
        assets,
        memberDenoms: allMembers(assets),
      })
    ).toEqual({
      coinMinimalDenom: VARIANT_DENOM,
      symbol: "XRP.coreum",
    });
  });

  it("returns undefined when the from-asset is not an alloy", () => {
    expect(
      resolveExternalUrlConvertVariant({
        urlProviderName: SOLOGENIC,
        alloy: { ...variantAsset, isAlloyed: false },
        assets,
        memberDenoms: allMembers(assets),
      })
    ).toBeUndefined();
  });

  it("returns undefined when from-asset is null (e.g. a deposit, no osmosis source)", () => {
    expect(
      resolveExternalUrlConvertVariant({
        urlProviderName: SOLOGENIC,
        alloy: null,
        assets,
        memberDenoms: allMembers(assets),
      })
    ).toBeUndefined();
  });

  it("returns undefined when no sibling variant carries that provider's external_interface", () => {
    expect(
      resolveExternalUrlConvertVariant({
        urlProviderName: "Some Other Bridge",
        alloy: alloyAsset,
        assets,
        memberDenoms: allMembers(assets),
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
        memberDenoms: allMembers([alloyAsset]),
      })
    ).toBeUndefined();
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
        memberDenoms: allMembers([alloyAsset, otherGroupVariant]),
      })
    ).toBeUndefined();
  });

  it("returns undefined when the matching sibling is not a pool member", () => {
    // The variant carries the matching provider AND shares the group key, but
    // is NOT in the alloy's transmuter pool, so it is not a valid convert
    // target (the alloy cannot be redeemed into it).
    expect(
      resolveExternalUrlConvertVariant({
        urlProviderName: SOLOGENIC,
        alloy: alloyAsset,
        assets,
        memberDenoms: new Set(), // variantAsset is not a member
      })
    ).toBeUndefined();
  });

  it("does not match a sibling that is itself an alloy", () => {
    const nestedAlloy = asset({
      coinMinimalDenom: "factory/.../alloyed/allNested",
      symbol: "XRP.nested",
      isAlloyed: true,
      variantGroupKey: ALLOY_DENOM,
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
        assets: [alloyAsset, nestedAlloy],
        // Even if (wrongly) listed as a member, the isAlloyed guard excludes it.
        memberDenoms: new Set([nestedAlloy.coinMinimalDenom]),
      })
    ).toBeUndefined();
  });

  it("does not target a withdrawal-halted member (convert precedes a withdraw)", () => {
    const haltedVariant = { ...variantAsset, haltWithdrawals: true };
    expect(
      resolveExternalUrlConvertVariant({
        urlProviderName: SOLOGENIC,
        alloy: alloyAsset,
        assets: [alloyAsset, haltedVariant],
        memberDenoms: allMembers([alloyAsset, haltedVariant]),
      })
    ).toBeUndefined();
  });

  it("skips an earlier halted member sharing the provider name and picks the live one", () => {
    // The exact divergence case: a halted and a live member share the provider
    // name; the convert target must be the live one, not the first-listed halted
    // one (which the surfaced link would never have come from).
    const haltedVariant = {
      ...variantAsset,
      coinMinimalDenom: "ibc/HALTED_XRP_VARIANT",
      symbol: "XRP.halted",
      haltWithdrawals: true,
    };
    const liveVariant = {
      ...variantAsset,
      coinMinimalDenom: "ibc/LIVE_XRP_VARIANT",
      symbol: "XRP.live",
      haltWithdrawals: false,
    };
    expect(
      resolveExternalUrlConvertVariant({
        urlProviderName: SOLOGENIC,
        alloy: alloyAsset,
        // halted listed first to prove order does not select it
        assets: [alloyAsset, haltedVariant, liveVariant],
        memberDenoms: allMembers([alloyAsset, haltedVariant, liveVariant]),
      })
    ).toEqual({
      coinMinimalDenom: "ibc/LIVE_XRP_VARIANT",
      symbol: "XRP.live",
    });
  });
});
