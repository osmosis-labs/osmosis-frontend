import { CoinPretty, Dec } from "@keplr-wallet/unit";
import {
  getBitcoinExplorerUrl,
  getEvmExplorerUrl,
  getSolanaExplorerUrl,
  shorten,
} from "@osmosis-labs/utils";
import classNames from "classnames";
import dayjs from "dayjs";
import Image from "next/image";

import { Icon } from "~/components/assets";
import { ChainLogo } from "~/components/assets/chain-logo";
import { CopyIconButton } from "~/components/buttons/copy-icon-button";
import { IconButton } from "~/components/buttons/icon-button";
import { SkeletonLoader, Spinner } from "~/components/loaders";
import { Button } from "~/components/ui/button";
import { EventName, IS_TESTNET } from "~/config";
import { useAmplitudeAnalytics, useTranslation } from "~/hooks";
import { useCoinFiatValue } from "~/hooks/queries/assets/use-coin-fiat-value";
import { useTransactionChain } from "~/hooks/use-transaction-chain";
import { useTransactionHistory } from "~/hooks/use-transaction-history";
import { theme } from "~/tailwind.config";
import { formatPretty } from "~/utils/formatter";

export const TransactionTransferDetails = ({
  onRequestClose,
  isModal,
  transaction,
}: {
  onRequestClose: () => void;
  isModal: boolean;
  transaction: Extract<
    ReturnType<typeof useTransactionHistory>["transactions"][number],
    { __type: "recentTransfer" }
  >;
}) => {
  const { t } = useTranslation();

  const formattedMonth = dayjs(transaction.createdAt)
    .format("MMMM")
    .slice(0, 3);

  const formattedDateDayYearHourMinute = dayjs(transaction.createdAt).format(
    "DD, YYYY, HH:mm"
  );

  // create a localized formatted date - example: Jan 1, 2022, 12:00
  const formattedDate = `${formattedMonth} ${formattedDateDayYearHourMinute}`;

  const counterpartyChain =
    transaction.direction === "withdraw"
      ? transaction.toChain
      : transaction.fromChain;

  const {
    chainPrettyName: counterpartyChainPrettyName,
    chainLogoUri: counterpartyChainLogoUri,
    chainColor: counterpartyChainColor,
  } = useTransactionChain({
    chain: counterpartyChain,
  });
  const { cosmosChain: cosmosFromChain } = useTransactionChain({
    chain: transaction.fromChain,
  });

  const { logEvent } = useAmplitudeAnalytics();

  const mainAsset =
    transaction.direction === "deposit"
      ? transaction.toAsset
      : transaction.fromAsset;
  const mainAssetAmount = new CoinPretty(
    {
      coinDecimals: mainAsset.decimals,
      coinDenom: mainAsset.denom,
      coinMinimalDenom: mainAsset.address,
    },
    // TODO: Determine correct amount for deposit
    new Dec(transaction.fromAsset.amount)
  );

  const { isLoading: isLoadingMainAssetPrice, fiatValue: mainAssetFiatValue } =
    useCoinFiatValue(mainAssetAmount);

  const simplifiedStatus = (() => {
    if (transaction.status === "success") return "success";
    if (["refunded", "connection-error", "failed"].includes(transaction.status))
      return "failed";
    return "pending";
  })();

  const explorerUrl = (() => {
    if (transaction.explorerUrl) return transaction.explorerUrl;

    if (transaction.fromChain.chainType === "evm") {
      return getEvmExplorerUrl({
        hash: transaction.sendTxHash,
        chainId: transaction.fromChain.chainId,
      });
    }

    if (transaction.fromChain.chainType === "cosmos") {
      return cosmosFromChain?.explorers[0].tx_page.replace(
        "{txHash}",
        transaction.sendTxHash
      );
    }

    if (transaction.fromChain.chainType === "solana") {
      return getSolanaExplorerUrl({
        hash: transaction.sendTxHash,
        env: IS_TESTNET ? "testnet" : "mainnet",
      });
    }

    if (transaction.fromChain.chainType === "bitcoin") {
      return getBitcoinExplorerUrl({
        txHash: transaction.sendTxHash,
        env: IS_TESTNET ? "testnet" : "mainnet",
      });
    }

    return undefined;
  })();

  const title = {
    pending:
      transaction.direction === "withdraw"
        ? t("transactions.historyTable.pendingWithdraw")
        : t("transactions.historyTable.pendingDeposit"),
    success:
      transaction.direction === "withdraw"
        ? t("transactions.historyTable.successWithdraw")
        : t("transactions.historyTable.successDeposit"),
    failed:
      transaction.direction === "withdraw"
        ? t("transactions.historyTable.failWithdraw")
        : t("transactions.historyTable.failDeposit"),
  };

  return (
    <div
      className={classNames("flex flex-col overflow-y-auto", {
        // 4.5rem is the height of the navbar
        "sticky top-[4.5rem] ml-4 h-[calc(100vh_-_4.5rem)] w-[480px] pl-4 pt-3":
          !isModal,
        "bg-osmoverse-850": isModal,
      })}
    >
      <div className="flex flex-col px-4 pb-8 md:p-0">
        {!isModal && (
          <div className="py-4">
            <IconButton
              aria-label="Close"
              mode="unstyled"
              size="unstyled"
              className="h-12 w-12 cursor-pointer rounded-full py-0 text-osmoverse-400 hover:rounded-full hover:bg-osmoverse-850 hover:text-white-full"
              icon={<Icon id="close-small" width={24} height={24} />}
              onClick={onRequestClose}
            />
          </div>
        )}
        <div className="flex flex-col items-center gap-4 pb-6 pt-2">
          {simplifiedStatus === "pending" ? (
            <Spinner className="text-wosmongton-500 !h-12 !w-12" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-osmoverse-825">
              <Icon
                id={
                  simplifiedStatus === "success"
                    ? transaction.direction === "deposit"
                      ? "deposit"
                      : "withdraw"
                    : "alert-circle"
                }
                width={24}
                height={24}
                aria-label="transfer icon"
                className={classNames({
                  "text-osmoverse-500": simplifiedStatus === "success",
                  "text-rust-400": simplifiedStatus === "failed",
                })}
              />
            </div>
          )}
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <div className="text-h5">{title[simplifiedStatus]}</div>
            <div className="body1 capitalize text-osmoverse-300">
              {formattedDate}
            </div>
          </div>
        </div>
        <div className="flex flex-col rounded-2xl border border-osmoverse-700 p-2">
          <div className="flex justify-between p-2">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center">
                {transaction.direction === "deposit" ? (
                  <ChainLogo
                    prettyName={counterpartyChainPrettyName}
                    color={counterpartyChainColor}
                    logoUri={counterpartyChainLogoUri}
                    classes={{
                      container: "!h-10 !w-10",
                      image: "!h-6 !w-6",
                    }}
                  />
                ) : (
                  <Image
                    height={40}
                    width={40}
                    src={"/osmosis-logo-wc.png"}
                    alt="Osmosis logo"
                  />
                )}
              </div>
              <div className="flex flex-col">
                <div className="subtitle1">{t("transfer.from")}</div>
                <div className="body1 text-osmoverse-300">
                  {transaction.fromChain.prettyName}
                </div>
              </div>
            </div>
            <CopyIconButton
              valueToCopy={transaction.fromAddress}
              label={shorten(transaction.fromAddress, {
                prefixLength: 10,
                suffixLength: 6,
              })}
              classes={{
                label: "!text-right !font-body1 !text-body1",
              }}
            />
          </div>
          <div className="flex h-10 w-14 items-center justify-center p-2">
            <Icon
              id="arrow-right"
              width={24}
              height={24}
              className="rotate-90"
              color={theme.colors.osmoverse[400]}
            />
          </div>
          <div className="flex justify-between p-2">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center">
                {transaction.direction === "withdraw" ? (
                  <ChainLogo
                    prettyName={counterpartyChainPrettyName}
                    color={counterpartyChainColor}
                    logoUri={counterpartyChainLogoUri}
                    classes={{
                      container: "!h-10 !w-10",
                      image: "!h-6 !w-6",
                    }}
                  />
                ) : (
                  <Image
                    height={40}
                    width={40}
                    src={"/osmosis-logo-wc.png"}
                    alt="Osmosis logo"
                  />
                )}
              </div>
              <div className="flex flex-col">
                <div className="subtitle1">{t("transfer.to")}</div>
                <div className="body1 text-osmoverse-300">
                  {transaction.toChain.prettyName}
                </div>
              </div>
            </div>
            <CopyIconButton
              valueToCopy={transaction.toAddress}
              label={shorten(transaction.toAddress, {
                prefixLength: 10,
                suffixLength: 6,
              })}
              classes={{
                label: "!text-right !font-body1 !text-body1",
              }}
            />
          </div>
        </div>
        <div className="flex flex-col py-3">
          <div className="body2 flex justify-between gap-3 py-3">
            <div>{t("transactions.transfer.asset")}</div>
            <p className="text-osmoverse-300">{mainAsset.denom}</p>
          </div>
          <div className="body2 flex justify-between gap-3 py-3">
            <div>
              {t("transactions.transfer.amountAsset", {
                asset: mainAsset.denom,
              })}
            </div>
            <p className="text-osmoverse-300">
              {formatPretty(mainAssetAmount)}
            </p>
          </div>

          <div className="body2 flex justify-between gap-3 py-3">
            <div>{t("transactions.transfer.totalValue")}</div>
            <SkeletonLoader
              className={!isLoadingMainAssetPrice ? undefined : "w-14 h-4"}
              isLoaded={!isLoadingMainAssetPrice}
            >
              <p className="text-osmoverse-300">
                {mainAssetFiatValue?.toString()}
              </p>
            </SkeletonLoader>
          </div>
          {transaction.networkFee && (
            <div className="body2 flex justify-between gap-3 py-3">
              <div>{t("transactions.transfer.networkFee")}</div>
              <div className="text-osmoverse-300">
                {formatPretty(
                  new CoinPretty(
                    {
                      coinDecimals: transaction.networkFee.decimals,
                      coinDenom: transaction.networkFee.denom,
                      coinMinimalDenom: transaction.networkFee.address,
                    },
                    new Dec(transaction.networkFee?.amount ?? 0)
                  )
                )}
              </div>
            </div>
          )}
          {transaction.providerFee && (
            <div className="body2 flex justify-between gap-3 py-3">
              <div>{t("transactions.transfer.providerFee")}</div>
              {transaction.providerFee.amount === "0" ? (
                <p className="text-bullish-400">{t("transfer.free")}</p>
              ) : (
                <p className="text-osmoverse-300">
                  {formatPretty(
                    new CoinPretty(
                      {
                        coinDecimals: transaction.providerFee.decimals,
                        coinDenom: transaction.providerFee.denom,
                        coinMinimalDenom: transaction.providerFee.address,
                      },
                      new Dec(transaction.providerFee?.amount)
                    )
                  )}
                </p>
              )}
            </div>
          )}
          <div className="body2 flex items-center justify-between py-3">
            <div>{t("transactions.transactionHash")}</div>
            <CopyIconButton
              valueToCopy={transaction.sendTxHash}
              label={shorten(transaction.sendTxHash)}
            />
          </div>
        </div>
        {explorerUrl && (
          <Button
            size="default"
            variant="secondary"
            asChild
            onClick={() =>
              logEvent([
                EventName.TransactionsPage.explorerClicked,
                {
                  source: "modal",
                },
              ])
            }
          >
            <a rel="noopener noreferrer" target="_blank" href={explorerUrl}>
              <span>{t("transactions.viewOnExplorer")} &#x2197;</span>
            </a>
          </Button>
        )}
      </div>
    </div>
  );
};
