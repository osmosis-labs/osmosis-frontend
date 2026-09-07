import type {
  Bridge,
  BridgeChain,
  BridgeSupportedAsset,
} from "@osmosis-labs/bridge";
import { MinimalAsset } from "@osmosis-labs/types";
import { isNil } from "@osmosis-labs/utils";
import { useEffect, useMemo, useRef } from "react";

import { api, RouterOutputs } from "~/utils/trpc";

const supportedAssetsBridges: Bridge[] = [
  "Skip",
  "Squid",
  "IBC",
  "Nomic",
  // Wormhole returns ["external-url"], so the recommended SOL withdraw is an
  // external-url hand-off rather than an in-app quote. That is now the only SOL
  // withdraw path: Int3face was the last in-app SOL quote and is gone.
  "Wormhole",
  // include nomic, nitro, and penumbra for suggesting BTC + SOL + TRX assets and chains
  // as external URL transfer options, even though they are not supported by the bridge providers natively yet.
  // Once bridging is natively supported, we can add these to the `useBridgeQuotes` provider list.
  "Nitro",
  "Penumbra",
];

export type SupportedAsset = ReturnType<
  typeof useBridgesSupportedAssets
>["supportedAssetsByChainId"][string][number];

export type SupportedChain = ReturnType<
  typeof useBridgesSupportedAssets
>["supportedChains"][number];

export const useBridgesSupportedAssets = ({
  assets,
  variantAssets,
  chain,
  direction,
}: {
  assets: MinimalAsset[] | undefined;
  /**
   * The full variant family of the selected asset (alloy + every constituent /
   * wrapped variant), used only to detect a halted route variant for the
   * default-selection hoist. On withdraw, `assets` is scoped to the single
   * selected variant (the alloy), so it cannot see a sibling variant's halt
   * flag; this carries the whole family so the halt check is accurate. Falls
   * back to `assets` when not provided.
   */
  variantAssets?: MinimalAsset[] | undefined;
  chain: BridgeChain;
  direction: "deposit" | "withdraw";
}) => {
  const supportedAssetsResults = api.useQueries((t) =>
    supportedAssetsBridges.flatMap((bridge) =>
      (assets ?? []).map((asset) =>
        t.bridgeTransfer.getSupportedAssetsByBridge(
          {
            bridge,
            asset: {
              address: asset.coinMinimalDenom,
              decimals: asset.coinDecimals,
              denom: asset.coinDenom,
            },
            direction,
            chain,
          },
          {
            enabled: !isNil(assets),
            staleTime: 30_000,
            cacheTime: 30_000,
            // Retry transient provider failures a couple of times. While
            // retries run, the query counts as loading, so the modal keeps
            // its loading state instead of settling into the external-only
            // fallback screen: a single provider hiccup (e.g. a rate-limited
            // Skip response) must not make an asset look unsupported for
            // quoting. Bounded so a provider that is truly down still
            // settles within a few seconds.
            retry: 2,
            // Refocus refetches would re-trigger the fetching hold below
            // (a brief skeleton) on assets with no in-app routes; supported
            // chains change rarely, so mount refetches are enough.
            refetchOnWindowFocus: false,
            // NOTE: no refetchInterval — react-query v4 never interval-
            // refetches a query that settled into an error without data
            // (verified against the installed version), so the self-heal
            // re-poll of failed queries is driven manually below.
          }
        )
      )
    )
  );

  const successfulQueries = useMemo(
    () =>
      supportedAssetsResults.filter(
        (data): data is NonNullable<Required<typeof data>> =>
          !isNil(data) && data.isSuccess
      ),
    [supportedAssetsResults]
  );

  const isFetchingAny = useMemo(
    () =>
      supportedAssetsResults.some(
        (data) =>
          isNil(data) ||
          // isFetching (not isLoading): background refetches of already-
          // settled data must also count. The query cache is persisted to
          // localStorage, so a previous session's results (including a
          // degraded success-with-empty) hydrate as settled truth and
          // immediately refetch on mount; treating that refetch as "not
          // fetching" let the modal commit a default chain from stale data
          // before the fresh response corrected it (observed as USDC
          // defaulting to Wormhole's Solana suggestion). Note the hold this
          // feeds is still released the moment any provider shows an in-app
          // route, so healthy hydrated data still renders instantly.
          //
          // Dataless re-polls are excluded: a query re-polling after
          // failures also reports isFetching, but must not drop the whole
          // modal back to a skeleton on every poll cycle when other
          // providers already returned usable chains. errorUpdateCount is
          // the discriminator for those: unlike failureCount, which
          // react-query resets to 0 at the start of every fetch, it
          // increments on each settled error and never resets. A refetch
          // that HAS data still counts even after past errors (a query that
          // errored, then recovered with empty data, refetches with
          // errorUpdateCount > 0, and its stale empty result must not
          // settle the modal mid-refetch). Failing queries are handled
          // below.
          (data.isFetching &&
            (data.errorUpdateCount === 0 || !isNil(data.data)))
      ),
    [supportedAssetsResults]
  );

  /** A provider's query failed (retries exhausted) or is re-attempting
   *  after failures. Remote providers (Skip, Squid) reject on
   *  infrastructure failures rather than returning an empty result, so
   *  this is the "provider down" signal. */
  const hasFailingQueries = useMemo(
    () =>
      supportedAssetsResults.some(
        (data) =>
          !isNil(data) &&
          (data.isError || (data.isLoading && data.errorUpdateCount > 0))
      ),
    [supportedAssetsResults]
  );

  // Self-heal: while any provider query is failing, re-ask the errored ones
  // on a gentle backoff (5s, 10s, 20s, then every 30s) so a short blip
  // doesn't cost the user half a minute of skeleton, while a sustained
  // outage isn't hammered (the original failure mode was a rate-limited
  // upstream). Driven manually because react-query v4 never interval-
  // refetches a query that settled into an error without data. The results
  // ref keeps the timer chain stable across render-to-render result churn;
  // the chain resets to the short delays whenever failures clear and later
  // reappear.
  const resultsRef = useRef(supportedAssetsResults);
  resultsRef.current = supportedAssetsResults;
  useEffect(() => {
    if (!hasFailingQueries) return;
    const delaysMs = [5_000, 10_000, 20_000];
    let attempt = 0;
    let timeoutId: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const delay = delaysMs[attempt] ?? 30_000;
      attempt++;
      timeoutId = setTimeout(() => {
        resultsRef.current.forEach((result) => {
          // !isFetching: a query stays isError while its recovery refetch
          // is in flight, and refetch()'s default cancelRefetch would
          // cancel that active request, so a response slower than the
          // backoff delay could never complete.
          if (!isNil(result) && result.isError && !result.isFetching)
            result.refetch();
        });
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(timeoutId);
  }, [hasFailingQueries]);

  /**
   * Whether any successful provider returned a chain the app itself can
   * transfer through (a quote or deposit-address route). External-url-only
   * results (e.g. Wormhole's Solana suggestion) don't count: they exist for
   * assets that ALSO have in-app routes, and must not release the failing-
   * provider hold below — otherwise a Skip outage on a Skip-only asset
   * settles the modal on the external-url chain (observed as a withdraw
   * "defaulting to Solana" and landing on the external-providers view).
   */
  const hasInAppTransferSupport = useMemo(
    () =>
      successfulQueries.some(({ data }) =>
        Object.values(data?.supportedAssets.assetsByChainId ?? {}).some(
          (assets) =>
            assets.some((asset) =>
              asset.transferTypes.some(
                (type) => type === "quote" || type === "deposit-address"
              )
            )
        )
      ),
    [successfulQueries]
  );

  /**
   * Aggregate supported assets from all successful queries.
   * This would be an object with chain id as key and an array of supported Osmosis variants as value.
   *
   * Example:
   * {
   *   1: [
   *     {
   *       "chainId": 1,
   *       "chainType": "evm",
   *       "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
   *       "denom": "USDC",
   *       "decimals": 6,
   *       "supportedVariants": {
   *         "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4": { Skip: ["quote"], Squid: ["quote"], Axelar: ["quote", "deposit-address"], IBC: ["quote"] },
   *         "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858": { Skip: ["quote"], Squid: ["quote"], Axelar: ["quote", "deposit-address"] },
   *         "ibc/231FD77ECCB2DB916D314019DA30FE013202833386B1908A191D16989AD80B5A": { Skip: ["quote"], Squid: ["quote"], Axelar: ["quote", "deposit-address"] },
   *         "ibc/F17C9CA112815613C5B6771047A093054F837C3020CBA59DFFD9D780A8B2984C": { Skip: ["quote"], Axelar: ["quote"] },
   *         "ibc/9F9B07EF9AD291167CF5700628145DE1DEB777C2CFC7907553B24446515F6D0E": { Skip: ["quote"], Squid: ["quote"], Axelar: ["quote", "deposit-address"] },
   *         "ibc/6B99DB46AA9FF47162148C1726866919E44A6A5E0274B90912FD17E19A337695": { Skip: ["quote"], Squid: ["quote"], Axelar: ["quote", "deposit-address"] },
   *         "ibc/F08DE332018E8070CC4C68FE06E04E254F527556A614F5F8F9A68AF38D367E45": { Skip: ["quote"] }
   *       }
   *     }
   *   ]
   * }
   */
  const supportedAssetsByChainId = useMemo(() => {
    /**
     * Map of supported assets by asset address, chain, and variant. This is used to
     * merge the supported variants and providers for each input asset.
     */
    type Address = string;
    type ChainId = string;
    const assetAddress_chainId_supportedVariants_bridges: Record<
      Address,
      Record<
        ChainId,
        Record<
          Address,
          Partial<
            Record<Bridge, Set<BridgeSupportedAsset["transferTypes"][number]>>
          >
        >
      >
    > = {};

    type AssetsByChainId =
      RouterOutputs["bridgeTransfer"]["getSupportedAssetsByBridge"]["supportedAssets"]["assetsByChainId"];

    /** Assets aggregated by chain across all provider returned chain assets. */
    const allAssetsByChainId = successfulQueries.reduce((acc, { data }) => {
      if (!data) return acc;

      // Merge all assets from providers by chain id
      Object.entries(data.supportedAssets.assetsByChainId).forEach(
        ([chainId, assets]) => {
          assets.forEach((asset) => {
            const { address: rawAddress } = asset;
            // Use toLowerCase since some providers return addresses in different cases. E.g. Skip and Squid
            const address = rawAddress.toLowerCase();

            const inputAssetAddress = data.supportedAssets.inputAssetAddress;

            if (!assetAddress_chainId_supportedVariants_bridges[address]) {
              assetAddress_chainId_supportedVariants_bridges[address] = {};
            }
            if (
              !assetAddress_chainId_supportedVariants_bridges[address][chainId]
            ) {
              assetAddress_chainId_supportedVariants_bridges[address][chainId] =
                {};
            }

            if (
              !assetAddress_chainId_supportedVariants_bridges[address][chainId][
                inputAssetAddress
              ]
            ) {
              assetAddress_chainId_supportedVariants_bridges[address][chainId][
                inputAssetAddress
              ] = {};
            }

            if (
              !assetAddress_chainId_supportedVariants_bridges[address][chainId][
                inputAssetAddress
              ][data.supportedAssets.providerName]
            ) {
              assetAddress_chainId_supportedVariants_bridges[address][chainId][
                inputAssetAddress
              ][data.supportedAssets.providerName] = new Set();
            }

            asset.transferTypes.forEach((type) => {
              assetAddress_chainId_supportedVariants_bridges[address][chainId][
                inputAssetAddress
              ][data.supportedAssets.providerName]!.add(type);
            });
          });

          acc[chainId] = acc[chainId] ? [...acc[chainId], ...assets] : assets;
        }
      );

      return acc;
    }, {} as AssetsByChainId);

    const assetEntriesByChainId = Object.entries(allAssetsByChainId).map(
      ([chainId, assets]) => [
        chainId,
        assets
          .filter(
            // Remove Duplicates
            (asset, index, originalArray) =>
              index ===
              originalArray.findIndex(
                // Use toLowerCase since some providers return addresses in different cases. E.g. Skip and Squid
                (t) => t.address.toLowerCase() === asset.address.toLowerCase()
              )
          )
          .map(({ providerName, ...asset }) => ({
            ...asset,
            supportedVariants: Object.fromEntries(
              Object.entries(
                assetAddress_chainId_supportedVariants_bridges[
                  asset.address.toLowerCase()
                ][chainId]
              ).map(([variant, bridgesByTransferType]) => {
                const formattedBridgesByTransferType = Object.fromEntries(
                  Object.entries(bridgesByTransferType).map(
                    ([bridge, transferTypes]) => [
                      bridge,
                      Array.from(transferTypes),
                    ]
                  )
                );

                return [variant, formattedBridgesByTransferType];
              })
            ),
          })),
      ]
    );

    return Object.fromEntries(assetEntriesByChainId) as Record<
      keyof AssetsByChainId,
      Omit<
        AssetsByChainId[string][number] & {
          supportedVariants: Record<
            string,
            Partial<Record<Bridge, BridgeSupportedAsset["transferTypes"]>>
          >;
        },
        "providerName"
      >[]
    >;
  }, [successfulQueries]);

  const supportedChains = useMemo(() => {
    // Positional default hoists: for certain assets we prefer a specific
    // destination chain as the "Recommended" (index 0) route. Each hoist is only
    // applied while its destination route is actually usable, otherwise the
    // default would land the user on a dead route.
    //
    // A hoist is suppressed when the family variant that *represents its
    // destination route* is kill-switch halted in the active direction. Details:
    //
    // - Scan the full variant family (`variantAssets`), not `assets`: on withdraw
    //   `assets` is the single selected variant (e.g. the alloy), which never
    //   carries the destination variant's halt flag, so the guard would miss it.
    // - Halt is direction-specific: a withdraw-halted variant must not block the
    //   deposit hoist and vice versa.
    // - Gate on the kill-switch halt flags only, not `isUnstable`: the kill
    //   switch already suppresses routing elsewhere (e.g. the external link-out
    //   in amount-screen.tsx), whereas `isUnstable` is warning-only and does not
    //   gate the UI.
    //
    // `matchesAsset` selects the assets this hoist applies to; `matchesRouteVariant`
    // selects the single family member whose halt flags represent the hoisted
    // destination route (undefined => the same predicate as `matchesAsset`, used
    // when the asset and its destination route are the same entry).
    // `chainId` is a string for Cosmos chains and a number for EVM ones, so it
    // is compared by identity below rather than assumed to be a string.
    type HoistRule = {
      chainId: string | number;
      matchesAsset: (asset: MinimalAsset) => boolean | undefined;
      matchesRouteVariant?: (asset: MinimalAsset) => boolean | undefined;
    };

    // Asset matchers select which transfers a hoist applies to (broad: any
    // family member). They are intentionally wide.
    const isUsdcAsset = (asset: MinimalAsset) =>
      asset.coinDenom?.toUpperCase().includes("USDC") ||
      asset.coinGeckoId === "usd-coin";
    const isXrpAsset = (asset: MinimalAsset) =>
      asset.coinDenom?.toUpperCase().includes("XRP") ||
      asset.coinGeckoId === "ripple";
    const isAtomAsset = (asset: MinimalAsset) =>
      asset.coinMinimalDenom ===
        "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2" ||
      asset.coinGeckoId === "cosmos";

    const hoistRules: HoistRule[] = [
      // USDC -> Ethereum, which holds the large majority of USDC supply.
      // Routing is left to the bridge providers (Skip may use CCTP, Axelar or
      // another path), so the route variant is the canonical `USDC` alloy that
      // a routed transfer settles in, not any single bridge's wrapped variant.
      // Gating on e.g. USDC.eth.axl would suppress the default whenever Axelar
      // was halted, even with other Ethereum routes healthy.
      {
        chainId: 1,
        matchesAsset: isUsdcAsset,
        matchesRouteVariant: (asset) =>
          asset.coinDenom?.toUpperCase() === "USDC",
      },
      // XRP -> XRPL EVM. The destination route is the chain-qualified xrplevm
      // variant (e.g. XRP.xrplevm), not the selected alloy, so it needs its own
      // route-variant matcher.
      {
        chainId: "xrplevm_1440000-1",
        matchesAsset: isXrpAsset,
        matchesRouteVariant: (asset) =>
          isXrpAsset(asset) &&
          asset.coinDenom?.toLowerCase().includes("xrplevm"),
      },
      // ATOM -> Cosmos Hub. The destination route is native ATOM. `isAtomAsset`
      // is already narrow (exact native denom / `cosmos` CoinGecko id, which no
      // bridged ATOM variant shares), so it is safe to reuse as the route-variant
      // matcher.
      {
        chainId: "cosmoshub-4",
        matchesAsset: isAtomAsset,
        matchesRouteVariant: isAtomAsset,
      },
    ];

    // A hoist is active when the current transfer involves the hoist's asset AND
    // the destination route variant is not halted in the active direction.
    const activeHoistChainIds = new Set(
      hoistRules
        .filter((rule) => {
          if (!assets?.some(rule.matchesAsset)) return false;
          const matchesRouteVariant =
            rule.matchesRouteVariant ?? rule.matchesAsset;
          const routeVariants = (variantAssets ?? assets)?.filter(
            matchesRouteVariant
          );
          const isHalted = Boolean(
            routeVariants?.some((asset) =>
              direction === "withdraw"
                ? asset.areWithdrawalsHalted
                : asset.areDepositsHalted
            )
          );
          return !isHalted;
        })
        .map((rule) => rule.chainId)
    );

    return Array.from(
      // Remove duplicate chains
      new Map(
        successfulQueries
          .flatMap(({ data }) => data!.supportedAssets.availableChains)
          .sort((a, b) => {
            // Apply each active positional hoist: pin its destination chain
            // first. Only hoists whose destination route is usable are present.
            for (const chainId of activeHoistChainIds) {
              if (a.chainId === chainId && b.chainId !== chainId) return -1;
              if (a.chainId !== chainId && b.chainId === chainId) return 1;
            }

            // prioritize bitcoin and doge chains first, then evm
            if (a.chainType === "bitcoin" && b.chainType !== "bitcoin")
              return -1;
            if (a.chainType === "doge" && b.chainType !== "doge") return -1;
            if (
              a.chainType === "evm" &&
              b.chainType !== "evm" &&
              b.chainType !== "bitcoin"
            )
              return -1;
            if (
              a.chainType === "solana" &&
              b.chainType !== "solana" &&
              b.chainType !== "evm" &&
              b.chainType !== "bitcoin"
            )
              return -1;
            return 0;
          })
          .map((chain) => [chain.chainId, chain])
      ).values()
    );
  }, [successfulQueries, direction, assets, variantAssets]);

  /**
   * Loading until any provider has produced a chain the app itself can
   * transfer through. While that's missing, both first fetches and failing
   * providers hold the state: a failing provider must not be mistaken for
   * "asset unsupported for quoting", which would settle the modal onto its
   * external-providers fallback. Once ANY in-app route is available, the
   * flow proceeds with it immediately — one provider's slow first fetch or
   * retries must not hide another provider's usable route. The manual
   * re-poll above keeps re-asking failed providers, so a held state
   * resolves either into supported chains or a genuine all-settled empty
   * result.
   *
   * By design, a full outage of every quote-capable provider holds this
   * screen in its loading state indefinitely (re-polling with backoff)
   * rather than degrading to the external-providers view: misrepresenting
   * a quotable asset as external-only routes users to third-party sites
   * for transfers the app itself supports, which is worse than a visible
   * wait.
   */
  const isLoading =
    (isFetchingAny || hasFailingQueries) && !hasInAppTransferSupport;

  return { supportedAssetsByChainId, supportedChains, isLoading };
};
