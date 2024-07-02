import { isNil } from "@osmosis-labs/utils";
import classNames from "classnames";
import { FunctionComponent, PropsWithChildren } from "react";

import { Icon } from "~/components/assets";
import { Tooltip } from "~/components/tooltip";
import { t } from "~/hooks";

import { BridgeProviderDropdown } from "./bridge-provider-dropdown";
import { BridgeQuoteRemainingTime } from "./bridge-quote-remaining-time";
import { BridgeQuotes } from "./use-bridge-quotes";

/** Bridge quotes result type, but with some modifications to require a quote to be selected. */
export type BridgeQuotesDetails = Omit<BridgeQuotes, "selectedQuote"> & {
  selectedQuote: NonNullable<BridgeQuotes["selectedQuote"]>;
};

/** Selected bridge provider, with dropdown to select a different one. */
export const BridgeProviderDropdownRow: FunctionComponent<
  BridgeQuotesDetails
> = ({
  selectedQuote,
  successfulQuotes,
  setSelectedBridgeProvider,
  isRefetchingQuote,
}) => (
  <QuoteDetailRow label={t("transfer.provider")} isLoading={isRefetchingQuote}>
    <BridgeProviderDropdown
      selectedQuote={selectedQuote}
      quotes={successfulQuotes}
      onSelect={(bridgeId) => setSelectedBridgeProvider(bridgeId)}
    />
  </QuoteDetailRow>
);

export const EstimatedTimeRow: FunctionComponent<BridgeQuotesDetails> = ({
  selectedQuote,
  isRefetchingQuote,
}) => (
  <QuoteDetailRow
    label={t("transfer.estimatedTime")}
    isLoading={isRefetchingQuote}
  >
    <div className="flex items-center gap-1">
      <Icon id="stopwatch" className="h-4 w-4 text-osmoverse-400" />{" "}
      <p className="text-osmoverse-100">
        {selectedQuote.estimatedTime.humanize()}
      </p>
    </div>
  </QuoteDetailRow>
);

export const ProviderFeesRow: FunctionComponent<BridgeQuotesDetails> = ({
  selectedQuote,
  isRefetchingQuote,
}) => (
  <QuoteDetailRow
    label={t("transfer.providerFees")}
    isLoading={isRefetchingQuote}
  >
    {selectedQuote.transferFee.toDec().isZero() ? (
      <p className="text-bullish-400">{t("transfer.free")}</p>
    ) : (
      <p className="text-osmoverse-100">
        {selectedQuote.transferFeeFiat ? (
          <>
            {selectedQuote.transferFeeFiat.toString()}{" "}
            <span className="text-osmoverse-300">
              ({selectedQuote.transferFee.maxDecimals(4).toString()})
            </span>
          </>
        ) : (
          selectedQuote.transferFee.maxDecimals(4).toString()
        )}
      </p>
    )}
  </QuoteDetailRow>
);

export const NetworkFeeRow: FunctionComponent<
  BridgeQuotesDetails & { fromChainName?: string }
> = ({ selectedQuote, isRefetchingQuote, fromChainName }) => (
  <QuoteDetailRow
    label={t("transfer.networkFee", {
      networkName: fromChainName ?? "",
    })}
    isLoading={isRefetchingQuote}
  >
    <p className="text-osmoverse-100">
      {isNil(selectedQuote.gasCostFiat) && isNil(selectedQuote.gasCost) ? (
        <Tooltip
          content={t("transfer.unknownFeeTooltip", {
            networkName: fromChainName ?? "",
          })}
        >
          <div className="flex items-center gap-2">
            <Icon id="help-circle" className="h-4 w-4 text-osmoverse-400" />
            <p className="text-osmoverse-300">{t("transfer.unknown")}</p>
          </div>
        </Tooltip>
      ) : (
        <>
          {selectedQuote.gasCostFiat
            ? selectedQuote.gasCostFiat.toString()
            : selectedQuote.gasCost?.maxDecimals(4).toString()}
          {selectedQuote.gasCostFiat && selectedQuote.gasCost ? (
            <span className="text-osmoverse-300">{` (${selectedQuote.gasCost
              .maxDecimals(4)
              .toString()})`}</span>
          ) : (
            ""
          )}
        </>
      )}
    </p>
  </QuoteDetailRow>
);

export function calcSelectedQuoteTotalFee(
  quote: BridgeQuotesDetails["selectedQuote"]
) {
  let totalCost = quote.gasCostFiat;

  if (quote.transferFeeFiat) {
    if (!totalCost) totalCost = quote.transferFeeFiat;
    else totalCost = totalCost.add(quote.transferFeeFiat);
  }

  return totalCost;
}

export const TotalFeesRow: FunctionComponent<BridgeQuotesDetails> = ({
  selectedQuote,
  isRefetchingQuote,
}) => {
  const totalCost = calcSelectedQuoteTotalFee(selectedQuote);
  if (!totalCost) return null;

  return (
    <QuoteDetailRow
      label={t("transfer.totalFees")}
      isLoading={isRefetchingQuote}
    >
      <p className="text-osmoverse-100">{totalCost.toString()}</p>
    </QuoteDetailRow>
  );
};

export const ExpectedOutputRow: FunctionComponent<BridgeQuotesDetails> = ({
  selectedQuote,
  isRefetchingQuote,
  warnUserOfSlippage,
}) => (
  <QuoteDetailRow
    label={t("transfer.estimatedAmountReceived")}
    isLoading={isRefetchingQuote}
  >
    <p className={warnUserOfSlippage ? "text-rust-300" : "text-osmoverse-100"}>
      {selectedQuote.expectedOutputFiat.toString()}
      <span
        className={classNames({
          "text-osmoverse-300": !warnUserOfSlippage,
        })}
      >
        ({selectedQuote.expectedOutput.maxDecimals(4).trim(true).toString()})
      </span>
    </p>
  </QuoteDetailRow>
);

export const ExpandDetailsControlContent: FunctionComponent<
  BridgeQuotesDetails & { open: boolean }
> = ({
  selectedQuote,
  warnUserOfPriceImpact,
  warnUserOfSlippage,
  selectedQuoteUpdatedAt,
  refetchInterval,
  open,
}) => {
  const totalFees = calcSelectedQuoteTotalFee(selectedQuote);

  return (
    <div className="flex items-center gap-2">
      {!isNil(selectedQuoteUpdatedAt) && (
        <BridgeQuoteRemainingTime
          dataUpdatedAt={selectedQuoteUpdatedAt}
          refetchInterval={refetchInterval}
        />
      )}
      <div className="flex items-center gap-2">
        {!open && totalFees && (
          <span className="body1">
            ~{totalFees.toString()} {t("transfer.fees")}
          </span>
        )}
        {(warnUserOfPriceImpact || warnUserOfSlippage) && (
          <Tooltip
            content={
              warnUserOfSlippage
                ? t("transfer.slippageWarning")
                : t("transfer.priceImpactWarning", {
                    priceImpact: selectedQuote.priceImpact.toString(),
                  })
            }
          >
            <Icon id="alert-circle" className="h-6 w-6 text-rust-400" />
          </Tooltip>
        )}
        <Icon
          id="chevron-down"
          width={16}
          height={16}
          className={classNames(
            "text-osmoverse-300 transition-transform duration-150",
            {
              "rotate-180": open,
            }
          )}
        />
      </div>
    </div>
  );
};

/** Base detail row with label, and children for contents. */
export const QuoteDetailRow: FunctionComponent<
  PropsWithChildren<{
    label: string;
    isLoading: boolean;
  }>
> = ({ label, children, isLoading }) => (
  <div className="body2 flex justify-between">
    <p className="text-osmoverse-300">{label}</p>
    <span
      className={classNames({
        "animate-[deepPulse_2s_ease-in-out_infinite] cursor-progress":
          isLoading,
      })}
    >
      {children}
    </span>
  </div>
);
