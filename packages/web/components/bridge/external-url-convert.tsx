import { CoinPretty } from "@osmosis-labs/unit";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useCallback, useMemo, useState } from "react";

import { SwapTool } from "~/components/swap-tool";
import { Button } from "~/components/ui/button";
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
 * how much to convert.
 *
 * The plain direct link is used only when we can be sure no convert is needed:
 * either no wallet is connected, or a connected wallet's balance query has
 * confidently resolved (settled, no error) and shows no alloy. While balances
 * are loading, refetching, or errored, the convert path is used instead — a
 * stale or unknown balance must never produce a direct hand-off that could
 * strand a holder on a site that rejects the alloy.
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
    // Set once the alloy -> variant convert has succeeded. We do NOT auto-open
    // the third-party URL from onSwapSuccess: that runs after async wallet
    // approval, outside the user-gesture chain, so browsers block the popup.
    // Instead we surface a "Continue" button whose click is a fresh gesture.
    const [convertSucceeded, setConvertSucceeded] = useState(false);

    const openUrl = useCallback(() => {
      window.open(url.toString(), "_blank", "noopener,noreferrer");
    }, [url]);

    const closeModal = useCallback(() => {
      setIsConvertOpen(false);
      setConvertSucceeded(false);
    }, []);

    // Use the full balance set (every denom), not the portfolio's top-N
    // allocations — the alloy/variant may be a long-tail holding.
    const {
      data: userBalances,
      isFetching: isFetchingBalances,
      isError: isBalancesError,
    } = api.local.balances.getUserBalances.useQuery(
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

    // The only unsafe outcome is emitting a direct href when the user actually
    // holds the alloy — that strands them on a site that rejects the alloy
    // denom. So among *connected* wallets we emit the direct link ONLY when the
    // balance query has confidently resolved (settled, not fetching, no error)
    // and shows no alloy. Every uncertain connected case — loading, a background
    // refetch in flight (a stale "no alloy" snapshot must not clear the gate),
    // or a query error — falls through to the convert path rather than the
    // direct link; if the user turns out not to hold the alloy the modal's swap
    // tool just shows a zero balance (mild friction), nobody is stranded.
    //
    // With no connected wallet there is nothing to convert and no balance to
    // protect, so the plain link is correct (preserves middle-click / new-tab).
    const isConnected = !!account?.address;
    const balancesResolved =
      isConnected && !isFetchingBalances && !isBalancesError;

    const offerDirectLink = !isConnected || (balancesResolved && !holdsAlloy);

    return (
      <>
        {offerDirectLink
          ? children({ href: url.toString() })
          : children({ onClick: () => setIsConvertOpen(true) })}
        {/*
         * Gate the modal on `isConvertOpen`, not the balance gate: once the user
         * has opened the convert modal it must stay mounted until they close it
         * or the swap succeeds. A background balance refetch can flip the gate to
         * a direct link mid-interaction, and keying the modal on that would
         * unmount it and drop in-progress SwapTool state.
         */}
        {isConvertOpen && (
          <ModalBase
            isOpen={isConvertOpen}
            onRequestClose={closeModal}
            title={
              <div className="md:subtitle1 mx-auto text-h6 font-h6">
                {t(
                  convertSucceeded
                    ? "transfer.moreBridgeOptions.convertBeforeWithdraw.successTitle"
                    : "transfer.moreBridgeOptions.convertBeforeWithdraw.title",
                  { variant: convertToVariant.symbol, provider: providerName }
                )}
              </div>
            }
            className="!max-w-[30rem]"
          >
            {convertSucceeded ? (
              // Post-convert hand-off. Opening the URL here is driven by the
              // user's button click (a fresh gesture), so it isn't popup-blocked
              // the way an auto-open from onSwapSuccess would be.
              <div className="flex flex-col gap-4 py-4">
                <p className="body2 text-center text-osmoverse-300">
                  {t(
                    "transfer.moreBridgeOptions.convertBeforeWithdraw.successDescription",
                    { variant: convertToVariant.symbol, provider: providerName }
                  )}
                </p>
                <Button
                  onClick={() => {
                    openUrl();
                    closeModal();
                  }}
                >
                  {t(
                    "transfer.moreBridgeOptions.convertBeforeWithdraw.continueTo",
                    { provider: providerName }
                  )}
                </Button>
              </div>
            ) : (
              <>
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
                 * params; controlled mode keeps the swap state in local React
                 * state so it never writes them.
                 */}
                <SwapTool
                  useQueryParams={false}
                  useOtherCurrencies={false}
                  page="Bridge Page"
                  initialSendTokenDenom={alloyMinimalDenom}
                  initialOutTokenDenom={convertToVariant.coinMinimalDenom}
                  onSwapSuccess={({ sendTokenDenom, outTokenDenom }) => {
                    // Only hand off if the completed swap was actually
                    // alloy -> variant. The swap tool still exposes the asset
                    // switch, so a reversed swap must NOT trigger the
                    // third-party hand-off this flow exists to gate.
                    if (
                      sendTokenDenom === alloyMinimalDenom &&
                      outTokenDenom === convertToVariant.coinMinimalDenom
                    ) {
                      setConvertSucceeded(true);
                    } else {
                      // Wrong direction — just close; no hand-off.
                      closeModal();
                    }
                  }}
                />
              </>
            )}
          </ModalBase>
        )}
      </>
    );
  }
);
