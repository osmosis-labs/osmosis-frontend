import type {
  Asset,
  ExternalInterfaceBridgeTransferMethod,
} from "@osmosis-labs/types";

import { getAlloyConstituentExternalInterfaceMethods } from "../external-url-constituents";

/** Minimal Asset factory: only the fields the helper reads are meaningful. */
function asset(
  partial: Pick<
    Asset,
    "coinMinimalDenom" | "isAlloyed" | "variantGroupKey" | "transferMethods"
  > &
    Partial<
      Pick<Asset, "haltWithdrawals" | "haltDeposits" | "disabled" | "unstable">
    >
): Asset {
  return {
    chainName: "test",
    sourceDenom: partial.coinMinimalDenom,
    symbol: "TEST",
    name: "Test",
    decimals: 6,
    verified: true,
    preview: false,
    unstable: false,
    disabled: false,
    categories: [],
    counterparty: [],
    relative_image_url: "",
    ...partial,
  };
}

const externalInterface = (
  name: string,
  urls?: { depositUrl?: string; withdrawUrl?: string }
): ExternalInterfaceBridgeTransferMethod => ({
  name,
  type: "external_interface",
  ...urls,
});

const ibcMethod = {
  type: "ibc" as const,
  counterparty: {
    chainName: "test",
    chainId: "test-1",
    sourceDenom: "utest",
    port: "transfer",
    channelId: "channel-0",
  },
  chain: { port: "transfer", channelId: "channel-1", path: "" },
};

// Real denoms from the asset list (allXRP family) so the test pins the actual
// `variantGroupKey === alloy.coinMinimalDenom` relationship.
const ALL_XRP =
  "factory/osmo1qnglc04tmhg32uc4kxlxh55a5cmhj88cpa3rmtly484xqu82t79sfv94w0/alloyed/allXRP";
const ALL_BTC =
  "factory/osmo1z6r6qdknhgsc0zeracktgpcxf43j6sekq07nw8sxduc9lg0qjjlqfu25e3/alloyed/allBTC";

describe("getAlloyConstituentExternalInterfaceMethods", () => {
  it("collects external_interface methods from an alloy's constituents", () => {
    const alloy = asset({
      coinMinimalDenom: ALL_BTC,
      isAlloyed: true,
      variantGroupKey: ALL_BTC,
      transferMethods: [], // allBTC carries no methods of its own
    });
    const assets: Asset[] = [
      alloy,
      asset({
        coinMinimalDenom: "ibc/WBTC",
        isAlloyed: false,
        variantGroupKey: ALL_BTC,
        transferMethods: [externalInterface("WBTC Bridge"), ibcMethod],
      }),
      asset({
        coinMinimalDenom: "ibc/NBTC",
        isAlloyed: false,
        variantGroupKey: ALL_BTC,
        transferMethods: [externalInterface("Nomic")],
      }),
    ];

    const result = getAlloyConstituentExternalInterfaceMethods({
      alloy,
      assets,
      direction: "withdraw",
    });

    // Order is incidental (asset-list iteration order); assert membership, not
    // sequence, since the helper makes no ordering guarantee.
    expect(result.map((m) => m.name).sort()).toEqual(["Nomic", "WBTC Bridge"]);
    expect(result.every((m) => m.type === "external_interface")).toBe(true);
  });

  it("excludes a nested alloy constituent (only true variants contribute)", () => {
    const alloy = asset({
      coinMinimalDenom: ALL_BTC,
      isAlloyed: true,
      variantGroupKey: ALL_BTC,
      transferMethods: [],
    });
    // A hypothetical nested alloy whose variantGroupKey points at the outer
    // alloy. It must NOT be treated as a plain variant.
    const nestedAlloy = asset({
      coinMinimalDenom: "factory/osmo.../alloyed/allNestedBTC",
      isAlloyed: true,
      variantGroupKey: ALL_BTC,
      transferMethods: [externalInterface("Should Not Appear")],
    });
    const realVariant = asset({
      coinMinimalDenom: "ibc/WBTC",
      isAlloyed: false,
      variantGroupKey: ALL_BTC,
      transferMethods: [externalInterface("WBTC Bridge")],
    });

    const result = getAlloyConstituentExternalInterfaceMethods({
      alloy,
      assets: [alloy, nestedAlloy, realVariant],
      direction: "withdraw",
    });

    expect(result.map((m) => m.name)).toEqual(["WBTC Bridge"]);
  });

  it("excludes the alloy's own entry (variantGroupKey === own coinMinimalDenom)", () => {
    // An alloy's variantGroupKey equals its own coinMinimalDenom, so a naive
    // `variantGroupKey === alloyDenom` match would include the alloy itself.
    const alloy = asset({
      coinMinimalDenom: ALL_XRP,
      isAlloyed: true,
      variantGroupKey: ALL_XRP,
      transferMethods: [externalInterface("Sologenic TX Bridge")],
    });
    const variant = asset({
      coinMinimalDenom: "ibc/XRP_COREUM",
      isAlloyed: false,
      variantGroupKey: ALL_XRP,
      transferMethods: [externalInterface("Sologenic TX Bridge")],
    });

    const result = getAlloyConstituentExternalInterfaceMethods({
      alloy,
      assets: [alloy, variant],
      direction: "withdraw",
    });

    // Only the variant's method, not the alloy's own (caller adds the alloy's
    // own separately).
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Sologenic TX Bridge");
  });

  it("returns nothing when the asset is not an alloy", () => {
    const variant = asset({
      coinMinimalDenom: "ibc/XRP_COREUM",
      isAlloyed: false,
      variantGroupKey: ALL_XRP,
      transferMethods: [externalInterface("Sologenic TX Bridge")],
    });

    expect(
      getAlloyConstituentExternalInterfaceMethods({
        alloy: variant,
        assets: [variant],
        direction: "withdraw",
      })
    ).toEqual([]);
  });

  it("returns nothing for null / undefined alloy", () => {
    expect(
      getAlloyConstituentExternalInterfaceMethods({
        alloy: null,
        assets: [],
        direction: "withdraw",
      })
    ).toEqual([]);
    expect(
      getAlloyConstituentExternalInterfaceMethods({
        alloy: undefined,
        assets: [],
        direction: "withdraw",
      })
    ).toEqual([]);
  });

  it("filters out non-external_interface transfer methods", () => {
    const alloy = asset({
      coinMinimalDenom: ALL_XRP,
      isAlloyed: true,
      variantGroupKey: ALL_XRP,
      transferMethods: [],
    });
    const variant = asset({
      coinMinimalDenom: "ibc/XRP_EVM",
      isAlloyed: false,
      variantGroupKey: ALL_XRP,
      transferMethods: [ibcMethod], // IBC-only, no external_interface (XRP.xrplevm)
    });

    expect(
      getAlloyConstituentExternalInterfaceMethods({
        alloy,
        assets: [alloy, variant],
        direction: "withdraw",
      })
    ).toEqual([]);
  });

  it("does not cross variant-group boundaries", () => {
    const alloy = asset({
      coinMinimalDenom: ALL_XRP,
      isAlloyed: true,
      variantGroupKey: ALL_XRP,
      transferMethods: [],
    });
    const xrpVariant = asset({
      coinMinimalDenom: "ibc/XRP_COREUM",
      isAlloyed: false,
      variantGroupKey: ALL_XRP,
      transferMethods: [externalInterface("Sologenic TX Bridge")],
    });
    // A BTC variant must not leak into the XRP alloy's result.
    const btcVariant = asset({
      coinMinimalDenom: "ibc/WBTC",
      isAlloyed: false,
      variantGroupKey: ALL_BTC,
      transferMethods: [externalInterface("WBTC Bridge")],
    });

    const result = getAlloyConstituentExternalInterfaceMethods({
      alloy,
      assets: [alloy, xrpVariant, btcVariant],
      direction: "withdraw",
    });

    expect(result.map((m) => m.name)).toEqual(["Sologenic TX Bridge"]);
  });

  it("preserves deposit and withdraw URLs verbatim for the caller to dedup", () => {
    const alloy = asset({
      coinMinimalDenom: ALL_XRP,
      isAlloyed: true,
      variantGroupKey: ALL_XRP,
      transferMethods: [],
    });
    const variant = asset({
      coinMinimalDenom: "ibc/XRP_INT3",
      isAlloyed: false,
      variantGroupKey: ALL_XRP,
      transferMethods: [
        externalInterface("Int3face Bridge", {
          depositUrl:
            "https://app.int3face.zone/bridge?fromChain=xrpl&toChain=osmosis&fromToken=XRP",
          withdrawUrl:
            "https://app.int3face.zone/bridge?fromChain=osmosis&toChain=xrpl&fromToken=XRP.int3",
        }),
      ],
    });

    const [method] = getAlloyConstituentExternalInterfaceMethods({
      alloy,
      assets: [alloy, variant],
      direction: "withdraw",
    });

    expect(method.depositUrl).toBe(
      "https://app.int3face.zone/bridge?fromChain=xrpl&toChain=osmosis&fromToken=XRP"
    );
    expect(method.withdrawUrl).toBe(
      "https://app.int3face.zone/bridge?fromChain=osmosis&toChain=xrpl&fromToken=XRP.int3"
    );
  });

  describe("halt awareness", () => {
    const alloy = asset({
      coinMinimalDenom: ALL_BTC,
      isAlloyed: true,
      variantGroupKey: ALL_BTC,
      transferMethods: [],
    });

    it("skips a withdraw-halted constituent on a withdraw", () => {
      const haltedVariant = asset({
        coinMinimalDenom: "ibc/RBTC_RT",
        isAlloyed: false,
        variantGroupKey: ALL_BTC,
        haltWithdrawals: true,
        unstable: true,
        transferMethods: [externalInterface("Nitro Router")],
      });
      const liveVariant = asset({
        coinMinimalDenom: "ibc/CKBTC",
        isAlloyed: false,
        variantGroupKey: ALL_BTC,
        transferMethods: [externalInterface("Omnity Bridge")],
      });

      const result = getAlloyConstituentExternalInterfaceMethods({
        alloy,
        assets: [alloy, haltedVariant, liveVariant],
        direction: "withdraw",
      });

      expect(result.map((m) => m.name)).toEqual(["Omnity Bridge"]);
    });

    it("does not skip a withdraw-halted constituent on a deposit (only the active direction gates)", () => {
      const withdrawHalted = asset({
        coinMinimalDenom: "ibc/RBTC_RT",
        isAlloyed: false,
        variantGroupKey: ALL_BTC,
        haltWithdrawals: true,
        haltDeposits: false,
        transferMethods: [
          externalInterface("Nitro Router", {
            depositUrl: "https://nitro.example/deposit",
          }),
        ],
      });

      const result = getAlloyConstituentExternalInterfaceMethods({
        alloy,
        assets: [alloy, withdrawHalted],
        direction: "deposit",
      });

      expect(result.map((m) => m.name)).toEqual(["Nitro Router"]);
    });

    it("skips a deposit-halted constituent on a deposit", () => {
      const depositHalted = asset({
        coinMinimalDenom: "ibc/DEP_HALT",
        isAlloyed: false,
        variantGroupKey: ALL_BTC,
        haltDeposits: true,
        transferMethods: [externalInterface("Down Bridge")],
      });

      const result = getAlloyConstituentExternalInterfaceMethods({
        alloy,
        assets: [alloy, depositHalted],
        direction: "deposit",
      });

      expect(result).toEqual([]);
    });

    it("keeps a disabled constituent (disabled often routes through the external flow)", () => {
      const disabledVariant = asset({
        coinMinimalDenom: "ibc/NBTC",
        isAlloyed: false,
        variantGroupKey: ALL_BTC,
        disabled: true,
        transferMethods: [externalInterface("Nomic")],
      });

      const result = getAlloyConstituentExternalInterfaceMethods({
        alloy,
        assets: [alloy, disabledVariant],
        direction: "withdraw",
      });

      expect(result.map((m) => m.name)).toEqual(["Nomic"]);
    });

    it("keeps an unstable (warning-only) constituent", () => {
      const unstableVariant = asset({
        coinMinimalDenom: "ibc/BTC_INT3",
        isAlloyed: false,
        variantGroupKey: ALL_BTC,
        unstable: true,
        transferMethods: [externalInterface("Int3face Bridge")],
      });

      const result = getAlloyConstituentExternalInterfaceMethods({
        alloy,
        assets: [alloy, unstableVariant],
        direction: "withdraw",
      });

      expect(result.map((m) => m.name)).toEqual(["Int3face Bridge"]);
    });
  });
});
