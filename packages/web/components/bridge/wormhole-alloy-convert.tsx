import { CoinPretty } from "@osmosis-labs/unit";
import { getAssetFromAssetList } from "@osmosis-labs/utils";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useMemo } from "react";

import { Icon } from "~/components/assets";
import { SwapTool } from "~/components/swap-tool";
import { AssetLists } from "~/config/generated/asset-lists";
import { useTranslation } from "~/hooks";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

/**
 * Wormhole Connect bridges a specific `.wh` variant (e.g. SOL.wh / SUI.wh /
 * APT.wh), not the alloy denom (allSOL / allSUI / allAPT) the user holds. So a
 * holder of the alloy would otherwise have to manually swap to the variant
 * before bridging. For each supported destination we resolve the alloy↔variant
 * pair from the asset list (the variant's `variantGroupKey` is the alloy's own
 * coinMinimalDenom) and, when the user holds the alloy, embed the swap tool
 * defaulted to alloy → variant (1:1 via the transmuter).
 *
 * Only the variant symbol and the destination network vary per asset; both
 * denoms + decimals come from the asset list. When MTN-141's resolver lands
 * this pairing should derive from it.
 */
const WORMHOLE_CONVERT_ASSETS = [
  { whSymbol: "SOL.wh", toNetwork: "solana" },
  { whSymbol: "SUI.wh", toNetwork: "sui" },
  { whSymbol: "APT.wh", toNetwork: "aptos" },
] as const;

type ResolvedConvertAsset = {
  toNetwork: string;
  /** The page's `?token=` value this convert applies to (the base symbol, e.g.
   *  "SOL"/"SUI"/"APT" — the variant symbol without the `.wh` suffix). Used so
   *  the card only shows for the matching withdrawal, not every asset that
   *  shares the destination network (e.g. PYTH → solana must not show it). */
  pageToken: string;
  variantMinimalDenom: string;
  alloyMinimalDenom: string;
};

const resolvedConvertAssetsByNetwork: Record<string, ResolvedConvertAsset> =
  WORMHOLE_CONVERT_ASSETS.reduce((acc, { whSymbol, toNetwork }) => {
    const variant = getAssetFromAssetList({
      symbol: whSymbol,
      assetLists: AssetLists,
    });
    const variantMinimalDenom = variant?.coinMinimalDenom;
    const alloyMinimalDenom = variant?.rawAsset.variantGroupKey;
    const pageToken = whSymbol.replace(/\.wh$/, "");
    if (variantMinimalDenom && alloyMinimalDenom) {
      acc[toNetwork] = {
        toNetwork,
        pageToken,
        variantMinimalDenom,
        alloyMinimalDenom,
      };
    }
    return acc;
  }, {} as Record<string, ResolvedConvertAsset>);

/**
 * Pre-gate shown on the /wormhole page for an Osmosis → {Solana,Sui,Aptos}
 * withdrawal: when the connected user holds the alloy that Wormhole can't bridge
 * directly, embed the swap tool defaulted to alloy → `.wh` variant so they can
 * convert before bridging. Renders nothing when the destination isn't supported
 * or the user holds none of that alloy.
 */
export const WormholeAlloyConvert: FunctionComponent<{
  toNetwork?: string;
  token?: string;
}> = observer(({ toNetwork, token }) => {
  const { accountStore } = useStore();
  const { t } = useTranslation();
  const account = accountStore.getWallet(accountStore.osmosisChainId);

  // Gate on both the destination network and the page's withdrawal token, so
  // the card only shows for the alloy's own withdrawal (e.g. SOL → solana), not
  // every other asset sharing that network (e.g. PYTH → solana).
  const candidate = toNetwork
    ? resolvedConvertAssetsByNetwork[toNetwork]
    : undefined;
  const convertAsset =
    candidate && token === candidate.pageToken ? candidate : undefined;

  // Use the full balance set (every denom), not the portfolio's top-N
  // allocations — the alloy may be a long-tail holding for the user.
  const { data: userBalances } = api.local.balances.getUserBalances.useQuery(
    { bech32Address: account?.address ?? "" },
    { enabled: !!account?.address }
  );

  const alloyBalance = useMemo<CoinPretty | undefined>(() => {
    if (!convertAsset) return undefined;
    const coin = userBalances?.find(
      ({ denom }) => denom === convertAsset.alloyMinimalDenom
    )?.coin;
    // Only surface the convert card when the user actually holds the alloy.
    return coin?.toDec().isPositive() ? coin : undefined;
  }, [convertAsset, userBalances]);

  // Unsupported destination, or the user holds none of this alloy.
  if (!convertAsset || !alloyBalance) return null;

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-osmoverse-700 bg-osmoverse-850 p-5">
      <h2 className="subtitle1 text-white-full">
        {t("wormhole.convertAlloy.stepTitle", {
          symbol: alloyBalance.currency.coinDenom,
        })}
      </h2>

      <div className="flex items-start gap-3 rounded-2xl bg-osmoverse-800 p-4">
        <Icon
          id="alert-triangle"
          className="h-5 w-5 shrink-0 text-wosmongton-300"
        />
        <p className="body2 text-osmoverse-200">
          {t("wormhole.convertAlloy.description", {
            balance: alloyBalance
              .trim(true)
              .maxDecimals(6)
              .hideDenom(true)
              .toString(),
            symbol: alloyBalance.currency.coinDenom,
          })}
        </p>
      </div>

      {/*
       * useQueryParams={false} is mandatory: the wormhole page uses ?from= and
       * ?to= for the Connect widget's network defaults, and the swap tool reads
       * the same query keys for its from/to denoms. Controlled mode keeps the
       * swap state in local React state so it never writes those params.
       */}
      <SwapTool
        useQueryParams={false}
        useOtherCurrencies={false}
        page="Wormhole Page"
        initialSendTokenDenom={convertAsset.alloyMinimalDenom}
        initialOutTokenDenom={convertAsset.variantMinimalDenom}
      />
    </div>
  );
});
