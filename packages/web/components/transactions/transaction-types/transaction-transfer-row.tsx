import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { TxSnapshot } from "@osmosis-labs/bridge";
import { shorten } from "@osmosis-labs/utils";
import classNames from "classnames";
import React from "react";

import { FallbackImg, Icon } from "~/components/assets";
import { ChainLogo } from "~/components/assets/chain-logo";
import { SkeletonLoader, Spinner } from "~/components/loaders";
import {
  LargeTransactionContainer,
  SmallTransactionContainer,
} from "~/components/transactions/transaction-types/transaction-containers";
import { useWindowSize } from "~/hooks";
import { useTranslation } from "~/hooks/language/context";
import { useCoinFiatValue } from "~/hooks/queries/assets/use-coin-fiat-value";
import { useTransactionChain } from "~/hooks/use-transaction-chain";
import { formatPretty } from "~/utils/formatter";

interface TransactionTransferRowProps {
  size: "sm" | "lg";
  transaction: TxSnapshot;
  isSelected?: boolean;
  onClick?: () => void;
  hash?: string;
}

export const TransactionTransferRow = ({
  transaction,
  size: sizeProp,
  isSelected,
  onClick,
  hash,
}: TransactionTransferRowProps) => {
  const { t } = useTranslation();
  const { isMobile, width } = useWindowSize();

  const size = isMobile ? "sm" : sizeProp;

  const chain =
    transaction.direction === "withdraw"
      ? transaction.toChain
      : transaction.fromChain;

  const { chainPrettyName, chainLogoUri, chainColor } = useTransactionChain({
    chain,
  });

  const text =
    transaction.direction === "withdraw"
      ? t("transfer.to").toLowerCase()
      : t("transfer.from").toLowerCase();

  const simplifiedStatus = (() => {
    if (transaction.status === "success") return "success";
    if (["refunded", "connection-error", "failed"].includes(transaction.status))
      return "failed";
    return "pending";
  })();

  const fromAsset = new CoinPretty(
    {
      coinDecimals: transaction.fromAsset.decimals,
      coinDenom: transaction.fromAsset.denom,
      coinMinimalDenom: transaction.fromAsset.address,
      coinImageUrl: transaction.fromAsset.imageUrl,
    },
    new Dec(transaction.fromAsset.amount)
  );
  const toAsset = new CoinPretty(
    {
      coinDecimals: transaction.toAsset.decimals,
      coinDenom: transaction.toAsset.denom,
      coinMinimalDenom: transaction.toAsset.address,
      coinImageUrl: transaction.toAsset.imageUrl,
    },
    new Dec(transaction.fromAsset.amount)
  );

  const leftComponent = (
    <div className="caption flex gap-1 text-osmoverse-300">
      {formatPretty(fromAsset, { maxDecimals: 6 })} {text} {chainPrettyName}
    </div>
  );

  const rightSmallComponentList = [
    <div
      key="fallback-img"
      className="relative w-8 h-8 flex justify-center items-center"
    >
      {simplifiedStatus === "pending" &&
        transaction?.direction === "deposit" && (
          <Spinner className="absolute inset-0 !w-full !h-full text-wosmongton-500" />
        )}
      <FallbackImg
        alt={fromAsset.denom}
        src={fromAsset.currency.coinImageUrl}
        fallbacksrc="/icons/question-mark.svg"
        height={
          simplifiedStatus === "pending" && transaction?.direction === "deposit"
            ? 24
            : 32
        }
        width={
          simplifiedStatus === "pending" && transaction?.direction === "deposit"
            ? 24
            : 32
        }
        className={
          simplifiedStatus !== "success" && transaction?.direction === "deposit"
            ? "opacity-50"
            : undefined
        }
      />
    </div>,
    <Icon
      key="icon-arrow-right"
      id="arrow-right"
      width={16}
      height={16}
      className={classNames("my-[8px] mx-[4px]", {
        "text-osmoverse-500": simplifiedStatus !== "pending",
        "text-rust-400": simplifiedStatus === "failed",
      })}
    />,
    <div
      key="chain-logo"
      className={classNames(
        "relative w-8 h-8 flex items-center justify-center",
        simplifiedStatus !== "success" && transaction?.direction === "withdraw"
          ? "opacity-60"
          : undefined
      )}
    >
      {simplifiedStatus === "pending" &&
        transaction?.direction === "withdraw" && (
          <Spinner className="absolute inset-0 !w-full !h-full text-wosmongton-500" />
        )}
      <ChainLogo
        prettyName={chainPrettyName}
        color={
          simplifiedStatus !== "success" &&
          transaction?.direction === "withdraw"
            ? "transparent"
            : chainColor
        }
        logoUri={chainLogoUri}
        size="md"
      />
    </div>,
  ];

  const rightLargeComponentList = [
    <div
      key="fallback-img"
      className={classNames("flex items-center gap-4 w-60", {
        "justify-end": transaction.direction === "withdraw",
      })}
    >
      {transaction.direction === "withdraw" && (
        <div className="flex flex-col text-right">
          <p className="subtitle1 lg:subtitle2 text-osmoverse-100">
            {formatPretty(fromAsset)}
          </p>
          <Price amount={fromAsset} />
        </div>
      )}
      <div className="relative w-8 h-8 flex justify-center items-center">
        {simplifiedStatus === "pending" &&
          transaction?.direction === "deposit" && (
            <Spinner className="absolute inset-0 !w-full !h-full text-wosmongton-500" />
          )}
        <FallbackImg
          alt={fromAsset.denom}
          src={fromAsset.currency.coinImageUrl}
          fallbacksrc="/icons/question-mark.svg"
          height={
            simplifiedStatus === "pending" &&
            transaction?.direction === "deposit"
              ? 24
              : 32
          }
          width={
            simplifiedStatus === "pending" &&
            transaction?.direction === "deposit"
              ? 24
              : 32
          }
          className={
            simplifiedStatus !== "success" &&
            transaction?.direction === "deposit"
              ? "opacity-50"
              : undefined
          }
        />
      </div>
      {transaction.direction === "deposit" && (
        <div className="flex flex-col">
          <p className="subtitle1 lg:subtitle2 text-osmoverse-100">
            {formatPretty(toAsset)}
          </p>
          <Price amount={toAsset} />
        </div>
      )}
    </div>,
    <Icon
      key="icon-arrow-right"
      id="arrow-right"
      width={24}
      height={24}
      className={classNames("block text-osmoverse-600 md:hidden", {
        "text-osmoverse-500": simplifiedStatus !== "pending",
        "text-rust-400": simplifiedStatus === "failed",
      })}
    />,
    <div
      key="chain-logo"
      className={classNames("flex items-center gap-4 w-60", {
        "justify-end": transaction.direction === "deposit",
      })}
    >
      {transaction.direction === "deposit" && (
        <div className="flex flex-col text-right">
          <p className="subtitle1 lg:subtitle2 text-osmoverse-100">
            {t("transfer.from")} {chainPrettyName}
          </p>
          <p className="body2 lg:caption text-osmoverse-300">
            {shorten(transaction.toAddress, {
              prefixLength: width < 924 ? 4 : 10,
              suffixLength: width < 924 ? 4 : 8,
            })}
          </p>
        </div>
      )}
      <div
        className={classNames(
          "relative w-8 h-8 flex items-center justify-center",
          simplifiedStatus !== "success" &&
            transaction?.direction === "withdraw"
            ? "opacity-60"
            : undefined
        )}
      >
        {simplifiedStatus === "pending" &&
          transaction?.direction === "withdraw" && (
            <Spinner className="absolute inset-0 !w-full !h-full text-wosmongton-500" />
          )}
        <ChainLogo
          prettyName={chainPrettyName}
          color={
            simplifiedStatus !== "success" &&
            transaction?.direction === "withdraw"
              ? "transparent"
              : chainColor
          }
          logoUri={chainLogoUri}
          size="md"
        />
      </div>
      {transaction.direction === "withdraw" && (
        <div className="flex flex-col">
          <p className="subtitle1 lg:subtitle2 text-osmoverse-100">
            {t("transfer.to")} {chainPrettyName}
          </p>
          <p className="body2 lg:caption text-osmoverse-300">
            {shorten(transaction.toAddress, {
              prefixLength: width < 924 ? 4 : 10,
              suffixLength: width < 924 ? 4 : 8,
            })}
          </p>
        </div>
      )}
    </div>,
  ];

  const rightComponent =
    size === "lg" ? (
      <div className="w-2/3 justify-end gap-4 flex items-center">
        {transaction?.direction === "withdraw"
          ? rightLargeComponentList
          : rightLargeComponentList.reverse()}
      </div>
    ) : (
      <>
        {transaction?.direction === "withdraw"
          ? rightSmallComponentList
          : rightSmallComponentList.reverse()}
      </>
    );

  const pendingText =
    transaction.direction === "withdraw"
      ? t("transactions.historyTable.pendingWithdraw")
      : t("transactions.historyTable.pendingDeposit");
  const successText =
    transaction.direction === "withdraw"
      ? t("transactions.historyTable.successWithdraw")
      : t("transactions.historyTable.successDeposit");
  const failedText =
    transaction.direction === "withdraw"
      ? t("transactions.historyTable.failWithdraw")
      : t("transactions.historyTable.failDeposit");

  if (size === "sm") {
    return (
      <SmallTransactionContainer
        status={simplifiedStatus}
        title={{
          pending: pendingText,
          success: successText,
          failed: failedText,
        }}
        leftComponent={leftComponent}
        rightComponent={rightComponent}
        isSelected={isSelected}
        onClick={onClick}
      />
    );
  }

  return (
    <LargeTransactionContainer
      iconId={transaction.direction === "withdraw" ? "withdraw" : "deposit"}
      status={simplifiedStatus}
      title={{
        pending: pendingText,
        success: successText,
        failed: failedText,
      }}
      rightComponent={rightComponent}
      isSelected={isSelected}
      onClick={onClick}
      hash={hash}
    />
  );
};

const Price = ({ amount }: { amount: CoinPretty }) => {
  const { fiatValue, isLoading } = useCoinFiatValue(amount);

  if (!fiatValue && !isLoading) return null;

  return (
    <SkeletonLoader
      className={!isLoading ? undefined : "w-14 h-4"}
      isLoaded={!isLoading}
    >
      <p className="body2 lg:subtitle2 text-osmoverse-300">
        {fiatValue?.toString()}
      </p>
    </SkeletonLoader>
  );
};
