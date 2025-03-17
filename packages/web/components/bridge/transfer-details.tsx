import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { FunctionComponent } from "react";
import { useMeasure } from "react-use";

import { Icon } from "~/components/assets";
import { Spinner } from "~/components/loaders";
import { useTranslation } from "~/hooks";
import { BridgeChainWithDisplayInfo } from "~/server/api/routers/bridge-transfer";

import {
  BridgeProviderDropdownRow,
  EstimatedTimeRow,
  ExpandDetailsControlContent,
  ExpectedOutputRow,
  NetworkFeeRow,
  ProviderFeesRow,
  TotalFeesRow,
} from "./quote-detail";
import { BridgeQuote } from "./use-bridge-quotes";

export const TransferDetails: FunctionComponent<{
  quote: BridgeQuote | undefined;
  fromChain: BridgeChainWithDisplayInfo;
  isLoading: boolean;
}> = ({ quote, fromChain, isLoading }) => {
  const [detailsRef, { height: detailsHeight, y: detailsOffset }] =
    useMeasure<HTMLDivElement>();
  const { t } = useTranslation();
  const successfulQuotes = quote?.successfulQuotes ?? [];

  if (!isLoading && successfulQuotes.length === 0) {
    return null;
  }

  return (
    <Disclosure>
      {({ open }) => (
        <div
          className="flex w-full flex-col gap-3 overflow-clip transition-height duration-300 ease-inOutBack"
          style={{
            height: open
              ? (detailsHeight + detailsOffset ?? 288) + 46 // collapsed height
              : 36,
          }}
        >
          <DisclosureButton>
            <div className="flex animate-[fadeIn_0.25s] items-center justify-between">
              {isLoading || !quote ? (
                <div className="flex items-center gap-2">
                  <Spinner className="text-wosmongton-500" />
                  <p className="body1 md:body2 text-osmoverse-300">
                    {t("transfer.estimatingTime")}
                  </p>
                </div>
              ) : open ? (
                <p className="subtitle1">{t("transfer.transferDetails")}</p>
              ) : null}

              {!isLoading && quote?.selectedQuote && !open && (
                <div className="flex items-center gap-1">
                  <Icon id="stopwatch" className="h-4 w-4 text-osmoverse-400" />
                  <p className="body1 md:body2 text-osmoverse-300 first-letter:capitalize">
                    {quote.selectedQuote.estimatedTime.humanize()}
                  </p>
                </div>
              )}

              {isLoading || !quote ? (
                <span className="body1 md:body2 text-osmoverse-300">
                  {t("transfer.calculatingFees")}
                </span>
              ) : null}

              {!isLoading && quote?.selectedQuote ? (
                <ExpandDetailsControlContent
                  warnUserOfPriceImpact={quote.warnUserOfPriceImpact}
                  warnUserOfSlippage={quote.warnUserOfSlippage}
                  selectedQuoteUpdatedAt={quote.selectedQuoteUpdatedAt}
                  refetchInterval={quote.refetchInterval}
                  selectedQuote={quote.selectedQuote}
                  open={open}
                  isRemainingTimePaused={
                    quote.isRefetchingQuote || quote.isTxPending
                  }
                  showRemainingTime
                />
              ) : null}
            </div>
          </DisclosureButton>
          <DisclosurePanel ref={detailsRef} className="flex flex-col gap-3">
            {quote?.selectedQuote && (
              <>
                <BridgeProviderDropdownRow
                  successfulQuotes={quote.successfulQuotes}
                  setSelectedBridgeProvider={quote.setSelectedBridgeProvider}
                  isRefetchingQuote={quote.isRefetchingQuote}
                  selectedQuote={quote.selectedQuote}
                />
                <EstimatedTimeRow
                  isRefetchingQuote={quote.isRefetchingQuote}
                  selectedQuote={quote.selectedQuote}
                />
                <ProviderFeesRow
                  isRefetchingQuote={quote.isRefetchingQuote}
                  selectedQuote={quote.selectedQuote}
                />
                <NetworkFeeRow
                  isRefetchingQuote={quote.isRefetchingQuote}
                  selectedQuote={quote.selectedQuote}
                  fromChainName={fromChain.prettyName}
                />
                <TotalFeesRow
                  isRefetchingQuote={quote.isRefetchingQuote}
                  selectedQuote={quote.selectedQuote}
                />
                <ExpectedOutputRow
                  isRefetchingQuote={quote.isRefetchingQuote}
                  selectedQuote={quote.selectedQuote}
                  warnUserOfSlippage={Boolean(quote.warnUserOfSlippage)}
                />
              </>
            )}
          </DisclosurePanel>
        </div>
      )}
    </Disclosure>
  );
};
