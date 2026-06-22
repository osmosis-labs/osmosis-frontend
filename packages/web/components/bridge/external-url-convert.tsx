import { CoinPretty } from "@osmosis-labs/unit";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useCallback, useMemo, useState } from "react";

import { SwapTool } from "~/components/swap-tool";
import { useTranslation } from "~/hooks";
import { ModalBase } from "~/modals";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";
import { api } from "~/utils/trpc";

/** Variant a third-party external-interface site recognises in place of the
 *  alloy. Resolved server-side in `getExternalUrls` from the alloy's
 *  variantGroupKey family; see bridge-transfer.ts. */
export interface ConvertToVariant {
  coinMinimalDenom: string;
  decimals: number;
  symbol: string;
}

/**
 * Hand-off for an alloy withdrawal whose external-interface site (e.g.
 * Sologenic for allXRP, Picasso for allSOL) only recognises a bridge *variant*,
 * not the alloy denom the user holds. Opening the URL directly would strand the
 * user on a site that rejects the alloy.
 *
 * When the user holds the alloy this renders a convert step instead of a plain
 * link: a modal embedding the swap tool defaulted to alloy → variant (1:1 via
 * the transmuter). The third-party URL is opened only from `onSwapSuccess`, so a
 * failed, rejected, or transmuter-cap-blocked convert never redirects (the swap
 * tool surfaces the error in place).
 *
 * The convert is offered whenever the user holds the alloy, even if they also
 * already hold some of the variant: a dust/partial variant balance must not
 * suppress the chance to convert the alloy they're trying to withdraw. The swap
 * tool surfaces the alloy (input) balance but not the variant (output) balance,
 * so the modal additionally shows the user's current variant balance to inform
 * how much to convert. Only when the user holds no alloy at all does the link
 * open directly.
 */
export const ExternalUrlConvertOption: FunctionComponent<{
  url: URL;
  providerName: string;
  /** The alloy being withdrawn (the swap input). */
  alloyMinimalDenom: string;
  convertToVariant: ConvertToVariant;
  /** Render prop for the clickable surface (splash CTA or list row). Receives
   *  `href` when the link should open directly, or `onClick` when a convert
   *  must run first. */
  children: (props: { href?: string; onClick?: () => void }) => React.ReactNode;
}> = observer(
  ({ url, providerName, alloyMinimalDenom, convertToVariant, children }) => {
    const { accountStore } = useStore();
    const { t } = useTranslation();
    const account = accountStore.getWallet(accountStore.osmosisChainId);

    const [isConvertOpen, setIsConvertOpen] = useState(false);

    const openUrl = useCallback(() => {
      window.open(url.toString(), "_blank", "noopener,noreferrer");
    }, [url]);

    // Use the full balance set (every denom), not the portfolio's top-N
    // allocations — the alloy/variant may be a long-tail holding.
    const { data: userBalances, isLoading: isLoadingBalances } =
      api.local.balances.getUserBalances.useQuery(
        { bech32Address: account?.address ?? "" },
        { enabled: !!account?.address }
      );

    const holdsAlloy = useMemo(() => {
      const coin = userBalances?.find(
        ({ denom }) => denom === alloyMinimalDenom
      )?.coin;
      return Boolean(coin?.toDec().isPositive());
    }, [userBalances, alloyMinimalDenom]);

    // The user's existing balance of the variant the site accepts. Shown in the
    // convert modal so a user who already holds some (e.g. dust) can see it and
    // decide how much more to convert — the swap tool itself does not surface
    // the output-token balance.
    const variantBalance = useMemo(
      () =>
        userBalances?.find(
          ({ denom }) => denom === convertToVariant.coinMinimalDenom
        )?.coin as CoinPretty | undefined,
      [userBalances, convertToVariant.coinMinimalDenom]
    );

    // While a connected wallet's balances are still loading we cannot tell
    // whether a convert is required, so we must NOT emit a direct href — a fast
    // click would strand the user on a site that rejects the alloy. Render an
    // inert surface until balances resolve.
    const balancesPending =
      !!account?.address && (isLoadingBalances || !userBalances);

    // Offer the convert whenever the user holds the alloy. We deliberately do
    // NOT also require "doesn't hold the variant": a dust/partial variant
    // balance must not suppress converting the alloy. The swap modal shows both
    // balances and lets the user choose the amount.
    const needsConvert = holdsAlloy;

    return (
      <>
        {balancesPending
          ? children({})
          : needsConvert
          ? children({ onClick: () => setIsConvertOpen(true) })
          : children({ href: url.toString() })}
        {needsConvert && (
          <ModalBase
            isOpen={isConvertOpen}
            onRequestClose={() => setIsConvertOpen(false)}
            title={
              <div className="md:subtitle1 mx-auto text-h6 font-h6">
                {t("transfer.moreBridgeOptions.convertBeforeWithdraw.title", {
                  variant: convertToVariant.symbol,
                  provider: providerName,
                })}
              </div>
            }
            className="!max-w-[30rem]"
          >
            <p className="body2 py-4 text-center text-osmoverse-300">
              {t(
                "transfer.moreBridgeOptions.convertBeforeWithdraw.description",
                { variant: convertToVariant.symbol, provider: providerName }
              )}
            </p>
            {variantBalance?.toDec().isPositive() && (
              <div className="body2 flex items-center justify-center gap-1 pb-2 text-osmoverse-400">
                <span>
                  {t(
                    "transfer.moreBridgeOptions.convertBeforeWithdraw.currentVariantBalance",
                    { variant: convertToVariant.symbol }
                  )}
                </span>
                <span className="text-osmoverse-200">
                  {formatPretty(variantBalance)}
                </span>
              </div>
            )}
            {/*
             * useQueryParams={false}: the bridge flow owns the page query
             * params; controlled mode keeps the swap state in local React state
             * so it never writes them. The third-party URL opens only on a
             * successful convert, so a failed/rejected/cap-blocked swap never
             * redirects.
             */}
            <SwapTool
              useQueryParams={false}
              useOtherCurrencies={false}
              page="Bridge Page"
              initialSendTokenDenom={alloyMinimalDenom}
              initialOutTokenDenom={convertToVariant.coinMinimalDenom}
              onSwapSuccess={() => {
                setIsConvertOpen(false);
                openUrl();
              }}
            />
          </ModalBase>
        )}
      </>
    );
  }
);
