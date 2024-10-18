import { Dec } from "@keplr-wallet/unit";
import { BridgeAsset } from "@osmosis-labs/bridge";
import { superjson } from "@osmosis-labs/server";
import { getBitcoinExplorerUrl, shorten } from "@osmosis-labs/utils";
import classnames from "classnames";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

import { Icon } from "~/components/assets";
import { ChainLogo } from "~/components/assets/chain-logo";
import { QueryRemainingTime } from "~/components/bridge/query-remaining-time";
import { Spinner } from "~/components/loaders";
import { buttonVariants, IconButton } from "~/components/ui/button";
import { ProgressBar } from "~/components/ui/progress-bar";
import { IS_TESTNET } from "~/config";
import { useTranslation } from "~/hooks";
import { useClipboard } from "~/hooks/use-clipboard";
import { ModalBase } from "~/modals";
import { BridgeChainWithDisplayInfo } from "~/server/api/routers/bridge-transfer";
import { useStore } from "~/stores";
import { humanizeTime } from "~/utils/date";
import { api, RouterOutputs } from "~/utils/trpc";

interface NomicPendingTransfersProps {
  fromChain: BridgeChainWithDisplayInfo;
  toChain: BridgeChainWithDisplayInfo;
  toAsset: BridgeAsset;
}

interface TransactionStore {
  transactions: Map<
    RouterOutputs["bridgeTransfer"]["getNomicPendingDeposits"]["pendingDeposits"][number]["transactionId"],
    RouterOutputs["bridgeTransfer"]["getNomicPendingDeposits"]["pendingDeposits"][number]
  >;
  upsertTransaction: (
    transactions: RouterOutputs["bridgeTransfer"]["getNomicPendingDeposits"]["pendingDeposits"]
  ) => void;
}

const useNomicTransactionsStore = create(
  persist<TransactionStore>(
    (set) => ({
      transactions: new Map(),
      upsertTransaction: (transactions) => {
        set((state) => {
          const nextTransactions = state.transactions;
          transactions.forEach((transaction) => {
            nextTransactions.set(transaction.transactionId, transaction);
          });

          const transactionIds: Record<string, boolean> = {};
          transactions.forEach((transaction) => {
            transactionIds[transaction.transactionId] = true;
          });

          state.transactions.forEach((transaction) => {
            if (transactionIds[transaction.transactionId]) return;
            const existingTransaction = nextTransactions.get(
              transaction.transactionId
            );
            /**
             * If the transaction is in our history but not in pending transfers then
             * it means it has been completed.
             */
            if (existingTransaction) {
              nextTransactions.set(transaction.transactionId, {
                ...existingTransaction,
                confirmations: successThreshold,
              });
            }
          });

          if (
            superjson.stringify(nextTransactions) ===
            superjson.stringify(state.transactions)
          ) {
            return {};
          }

          return { transactions: nextTransactions };
        });
      },
    }),
    {
      name: "nomic-txs",
      storage: createJSONStorage(() => localStorage, {
        reviver: (_key, value) => superjson.parse(value as string),
        replacer: (_key, value) => superjson.stringify(value),
      }),
    }
  )
);

const successThreshold = 6;
const refetchInterval = 30000;

export const NomicPendingTransfers = ({
  fromChain,
  toChain,
  toAsset,
}: NomicPendingTransfersProps) => {
  const { t } = useTranslation();
  const { accountStore } = useStore();
  const { upsertTransaction, transactions } = useNomicTransactionsStore(
    useShallow((state) => ({
      upsertTransaction: state.upsertTransaction,
      transactions: state.transactions,
    }))
  );

  const osmosisAddress = accountStore.getWallet(
    accountStore.osmosisChainId
  )?.address;

  const {
    data: pendingDepositsData,
    isLoading: isPendingDepositsLoading,
    dataUpdatedAt: nomicDepositsDataUpdatedAt,
  } = api.bridgeTransfer.getNomicPendingDeposits.useQuery(
    {
      userOsmoAddress: osmosisAddress!,
    },
    {
      enabled: !!osmosisAddress,
      refetchInterval,
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

  useEffect(() => {
    if (pendingDepositsData) {
      upsertTransaction(pendingDepositsData.pendingDeposits);
    }
  }, [pendingDepositsData, upsertTransaction]);

  return (
    <>
      <div className="body1 md:body2 flex w-full items-center justify-between gap-2 py-3">
        <p>{t("transfer.nomic.depositStatus")}</p>
        {(pendingDepositsData?.pendingDeposits?.length ?? 0) > 0 ? (
          <div className="flex items-center gap-2">
            <Spinner className="text-wosmongton-500" />
            <p className="text-white-full">
              {t("transfer.nomic.transferringYourBtc")}
            </p>
          </div>
        ) : (
          <>
            {isPendingDepositsLoading ? (
              <Spinner className="text-wosmongton-500" />
            ) : (
              <div className="flex items-center gap-2">
                <QueryRemainingTime
                  refetchInterval={refetchInterval}
                  dataUpdatedAt={nomicDepositsDataUpdatedAt}
                />
                <p className="text-white-full">
                  {t("transfer.nomic.awaitingBtc")}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex w-full flex-col gap-2">
        {Array.from(transactions.values()).map((deposit) => {
          const confirmationPercentage =
            (deposit.confirmations / successThreshold) * 100;
          const isSuccess = deposit.confirmations === successThreshold;

          return (
            <div
              key={deposit.transactionId}
              className="flex items-center justify-between py-1.5"
            >
              <div className="flex w-full flex-col">
                <p className="text-osmoverse-100">
                  {deposit.fiatValue
                    ?.sub(deposit.networkFee.fiatValue ?? new Dec(0))
                    .sub(deposit.providerFee.fiatValue ?? new Dec(0))
                    .toString()}{" "}
                  <span className="text-osmoverse-300">
                    (
                    {deposit.amount
                      .sub(deposit.networkFee.amount)
                      .sub(deposit.providerFee.amount)
                      .toString()}
                    )
                  </span>
                </p>
                <TransactionDetailsModal
                  confirmationPercentage={confirmationPercentage}
                  depositData={deposit}
                  fromChain={fromChain}
                  toChain={toChain}
                  toAsset={toAsset}
                />
              </div>
              {isSuccess ? (
                <p className="caption flex-shrink-0 rounded-xl border border-bullish-500 py-1 px-2 text-bullish-500">
                  {t("transfer.nomic.depositSuccess")}
                </p>
              ) : (
                <ProgressBar
                  classNames="h-[8px] w-[96px]"
                  segments={[
                    {
                      percentage: confirmationPercentage.toString(),
                      classNames: "bg-bullish-500",
                    },
                    {
                      percentage: (100 - confirmationPercentage).toString(),
                      classNames: "bg-osmoverse-600",
                    },
                  ]}
                />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

interface TransactionDetailsModalProps {
  fromChain: BridgeChainWithDisplayInfo;
  toChain: BridgeChainWithDisplayInfo;
  toAsset: BridgeAsset;
  confirmationPercentage: number;
  depositData: RouterOutputs["bridgeTransfer"]["getNomicPendingDeposits"]["pendingDeposits"][number];
}

const TransactionDetailsModal = ({
  confirmationPercentage,
  fromChain,
  toChain,
  toAsset,
  depositData,
}: TransactionDetailsModalProps) => {
  const { t } = useTranslation();
  const { accountStore } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  const { onCopy, hasCopied } = useClipboard(depositData.transactionId, 1000);

  const isComplete = successThreshold === depositData.confirmations;

  const osmosisAddress = accountStore.getWallet(
    accountStore.osmosisChainId
  )?.address;
  const humanizedEstimatedTime = humanizeTime(
    dayjs().add((successThreshold - depositData.confirmations) * 10, "minutes")
  );

  return (
    <>
      <button
        className="self-start text-wosmongton-300 hover:text-wosmongton-400"
        onClick={() => {
          setIsOpen(true);
        }}
      >
        {t("transfer.transactionDetails")}
      </button>

      <ModalBase
        className="!max-w-[512px]"
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
      >
        <div className="flex flex-col gap-3 p-4">
          <div className="flex flex-col items-center justify-center gap-2 pb-6 pt-2">
            {isComplete ? (
              <h2 className="text-h5 font-h5 text-white-full">
                {t("transfer.nomic.depositSuccess")}
              </h2>
            ) : (
              <>
                <Spinner className="!h-12 !w-12 text-wosmongton-500" />
                <h2 className="text-h5 font-h5 text-white-full">
                  {t("transfer.nomic.pendingDeposit")}
                </h2>
                <p className="body1 text-osmoverse-300">
                  {t("transfer.nomic.estimatedAboutTime", {
                    time: `${humanizedEstimatedTime.value} ${t(
                      humanizedEstimatedTime.unitTranslationKey
                    )}`,
                  })}
                </p>
                <ProgressBar
                  classNames="h-[8px] w-[96px]"
                  segments={[
                    {
                      percentage: confirmationPercentage.toString(),
                      classNames: "bg-bullish-500",
                    },
                    {
                      percentage: (100 - confirmationPercentage).toString(),
                      classNames: "bg-osmoverse-600",
                    },
                  ]}
                />
              </>
            )}
          </div>

          <div className="flex w-full flex-col items-center justify-between gap-3 rounded-2xl border border-osmoverse-700 p-3">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <ChainLogo
                  color={fromChain.color}
                  logoUri={fromChain.logoUri}
                  prettyName={fromChain.prettyName}
                  size="lg"
                />

                <div className="flex flex-col">
                  <p className="subtitle1 text-white-full">
                    {t("transfer.nomic.from")}
                  </p>
                  <p className="body1 text-osmoverse-300">
                    {fromChain.prettyName}
                  </p>
                </div>
              </div>
              <p className="body1 text-osmoverse-300">bc0123ab...456def</p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center self-start">
              <Icon id="arrow-down" className="text-osmoverse-400" />
            </div>

            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <ChainLogo
                  color={toChain.color}
                  logoUri={toChain.logoUri}
                  prettyName={toChain.prettyName}
                  size="lg"
                />

                <div className="flex flex-col">
                  <p className="subtitle1 text-white-full">
                    {t("transfer.nomic.to")}
                  </p>
                  <p className="body1 text-osmoverse-300">
                    {toChain.prettyName}
                  </p>
                </div>
              </div>
              <p className="body1 text-osmoverse-300">
                {shorten(osmosisAddress ?? "", {
                  prefixLength: 8,
                  suffixLength: 6,
                })}
              </p>
            </div>
          </div>
          <div className="py-4">
            <div className="flex items-center justify-between py-2">
              <p className="body2 text-white-full">
                {t("transfer.nomic.asset")}
              </p>
              <p className="body2 text-osmoverse-300">nBTC</p>
            </div>
            <div className="flex items-center justify-between py-2">
              <p className="body2 text-white-full">
                {t("transfer.nomic.amountBtc")}
              </p>
              <p className="body2 text-osmoverse-300">
                {depositData.fiatValue.toString()} (
                {depositData.amount.toString()})
              </p>
            </div>
            <div className="flex items-center justify-between py-2">
              <p className="body2 text-white-full">
                {t("transfer.nomic.totalFees")}
              </p>
              <p className="body2 text-osmoverse-300">
                {depositData.networkFee.fiatValue
                  ?.add(depositData.providerFee.fiatValue ?? new Dec(0))
                  .toString()}{" "}
                (
                {depositData.networkFee.amount
                  .add(depositData.providerFee.amount)
                  .toString()}
                )
              </p>
            </div>
            <div className="flex items-center justify-between py-2">
              <p className="body2 text-white-full">
                {t("transfer.nomic.totalValue")}
              </p>
              <p className="body2 text-osmoverse-300">
                {depositData.fiatValue
                  ?.sub(depositData.networkFee.fiatValue ?? new Dec(0))
                  .sub(depositData.providerFee.fiatValue ?? new Dec(0))
                  .toString()}{" "}
                (
                {depositData.amount
                  .sub(depositData.networkFee.amount)
                  .sub(depositData.providerFee.amount)
                  .toString()}
                )
              </p>
            </div>
            <div className="flex items-center justify-between py-2">
              <p className="body2 text-white-full">
                {t("transfer.nomic.transactionHash")}
              </p>
              <div className="flex items-center gap-2">
                <a
                  className="body2 text-wosmongton-300 hover:text-wosmongton-400"
                  href={getBitcoinExplorerUrl({
                    txHash: depositData.transactionId,
                    isTestnet: IS_TESTNET,
                  })}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {shorten(depositData.transactionId, {
                    prefixLength: 6,
                    suffixLength: 6,
                  })}
                </a>
                <IconButton
                  icon={<Icon id={hasCopied ? "check-mark" : "copy"} />}
                  aria-label="Copy"
                  onClick={onCopy}
                  className={classnames(
                    "!h-auto !w-6 !bg-transparent",
                    hasCopied
                      ? "text-white-full"
                      : "text-wosmongton-300 hover:text-wosmongton-400"
                  )}
                />
              </div>
            </div>
          </div>
          <a
            className={buttonVariants({
              variant: "secondary",
              className: "gap-3 text-h6 font-h6",
            })}
            rel="noopener noreferrer"
            target="_blank"
            href={getBitcoinExplorerUrl({
              txHash: depositData.transactionId,
              isTestnet: IS_TESTNET,
            })}
          >
            <span>{t("transfer.nomic.viewOnExplorer")}</span>{" "}
            <Icon id="arrow-up-right" />
          </a>
        </div>
      </ModalBase>
    </>
  );
};
