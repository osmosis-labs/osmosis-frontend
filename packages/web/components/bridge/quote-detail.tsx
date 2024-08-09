import { DecUtils } from "@keplr-wallet/unit";
import { isNil, shorten } from "@osmosis-labs/utils";
import classNames from "classnames";
import { FunctionComponent, PropsWithChildren } from "react";

import { Icon } from "~/components/assets";
import { Tooltip } from "~/components/tooltip";
import { t } from "~/hooks";
import { trimPlaceholderZeros } from "~/utils/number";

import { BridgeProviderDropdown } from "./bridge-provider-dropdown";
import { BridgeQuoteRemainingTime } from "./bridge-quote-remaining-time";
import { BridgeQuote } from "./use-bridge-quotes";

export const BridgeProviderDropdownRow: FunctionComponent<{
  selectedQuote: NonNullable<BridgeQuote["selectedQuote"]>;
  successfulQuotes: BridgeQuote["successfulQuotes"];
  setSelectedBridgeProvider: BridgeQuote["setSelectedBridgeProvider"];
  isRefetchingQuote: boolean;
}> = ({
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

export const EstimatedTimeRow: FunctionComponent<{
  selectedQuote: NonNullable<BridgeQuote["selectedQuote"]>;
  isRefetchingQuote: boolean;
}> = ({ selectedQuote, isRefetchingQuote }) => (
  <QuoteDetailRow
    label={t("transfer.estimatedTime")}
    isLoading={isRefetchingQuote}
  >
    <div className="flex items-center gap-1">
      <Icon id="stopwatch" className="h-4 w-4 text-osmoverse-400" />{" "}
      <p className="text-osmoverse-100 first-letter:capitalize">
        {selectedQuote.estimatedTime.humanize()}
      </p>
    </div>
  </QuoteDetailRow>
);

export const ProviderFeesRow: FunctionComponent<{
  selectedQuote: NonNullable<BridgeQuote["selectedQuote"]>;
  isRefetchingQuote: boolean;
}> = ({ selectedQuote, isRefetchingQuote }) => {
  const gasElement = `${trimPlaceholderZeros(
    selectedQuote.transferFee.hideDenom(true).maxDecimals(4).toString()
  )} ${shorten(selectedQuote.transferFee.denom, {
    prefixLength: 8,
    suffixLength: 3,
  })}`;

  return (
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
              <span
                title={selectedQuote.transferFee.maxDecimals(4).toString()}
                className="text-osmoverse-300"
              >
                ({gasElement})
              </span>
            </>
          ) : (
            <span title={selectedQuote.transferFee.maxDecimals(4).toString()}>
              {gasElement}
            </span>
          )}
        </p>
      )}
    </QuoteDetailRow>
  );
};

export const NetworkFeeRow: FunctionComponent<{
  selectedQuote: NonNullable<BridgeQuote["selectedQuote"]>;
  isRefetchingQuote: boolean;
  fromChainName?: string;
}> = ({ selectedQuote, isRefetchingQuote, fromChainName }) => (
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
            <span
              title={selectedQuote.gasCost.maxDecimals(4).toString()}
              className="text-osmoverse-300"
            >
              {" "}
              (
              {trimPlaceholderZeros(
                selectedQuote.gasCost.hideDenom(true).maxDecimals(4).toString()
              )}{" "}
              <span>
                {shorten(selectedQuote.gasCost.denom, {
                  prefixLength: 8,
                  suffixLength: 3,
                })}
              </span>
              )
            </span>
          ) : (
            ""
          )}
        </>
      )}
    </p>
  </QuoteDetailRow>
);

export const TotalFeesRow: FunctionComponent<{
  selectedQuote: NonNullable<BridgeQuote["selectedQuote"]>;
  isRefetchingQuote: boolean;
}> = ({ selectedQuote, isRefetchingQuote }) => {
  const totalCost = selectedQuote.quote.totalFeeFiatValue;
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

export const ExpectedOutputRow: FunctionComponent<{
  selectedQuote: NonNullable<BridgeQuote["selectedQuote"]>;
  isRefetchingQuote: boolean;
  warnUserOfSlippage: boolean;
}> = ({ selectedQuote, isRefetchingQuote, warnUserOfSlippage }) => (
  <QuoteDetailRow
    label={t("transfer.estimatedAmountReceived")}
    isLoading={isRefetchingQuote}
  >
    <p className={warnUserOfSlippage ? "text-rust-300" : "text-osmoverse-100"}>
      {selectedQuote.expectedOutputFiat.toString()}{" "}
      <span
        title={selectedQuote.expectedOutput
          .maxDecimals(4)
          .trim(true)
          .toString()}
        className={classNames({
          "text-osmoverse-300": !warnUserOfSlippage,
        })}
      >
        (
        {trimPlaceholderZeros(
          selectedQuote.expectedOutput
            .maxDecimals(4)
            .trim(true)
            .hideDenom(true)
            .toString()
        )}{" "}
        {shorten(selectedQuote.expectedOutput.denom, {
          prefixLength: 8,
          suffixLength: 3,
        })}
        )
      </span>
    </p>
  </QuoteDetailRow>
);

export const ExpandDetailsControlContent: FunctionComponent<{
  selectedQuote: NonNullable<BridgeQuote["selectedQuote"]>;
  warnUserOfPriceImpact: boolean | undefined;
  warnUserOfSlippage: boolean | undefined;
  selectedQuoteUpdatedAt: number | undefined;
  refetchInterval: number;
  open: boolean;
  isRemainingTimePaused: boolean;
  showRemainingTime?: boolean;
}> = ({
  selectedQuote,
  warnUserOfPriceImpact,
  warnUserOfSlippage,
  selectedQuoteUpdatedAt,
  refetchInterval,
  open,
  isRemainingTimePaused,
  showRemainingTime = false,
}) => {
  const totalFees = selectedQuote.quote.totalFeeFiatValue;
  const showTotalFeeIneqSymbol = totalFees
    ? totalFees
        .toDec()
        .lt(DecUtils.getTenExponentN(totalFees.fiatCurrency.maxDecimals))
    : false;

  return (
    <div className="flex items-center gap-2 md:gap-1">
      {!isNil(selectedQuoteUpdatedAt) && showRemainingTime && (
        <BridgeQuoteRemainingTime
          dataUpdatedAt={selectedQuoteUpdatedAt}
          refetchInterval={refetchInterval}
          isPaused={isRemainingTimePaused}
        />
      )}
      <div className="flex items-center gap-2 md:gap-1">
        {!open && totalFees && (
          <span className="subtitle1 md:body2">
            {!showTotalFeeIneqSymbol && "~"}{" "}
            {totalFees.inequalitySymbol(showTotalFeeIneqSymbol).toString()}{" "}
            {t("transfer.fees")}
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
  <div className="body2 md:caption flex justify-between">
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
