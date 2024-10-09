import { QueryRemainingTime } from "~/components/bridge/bridge-quote-remaining-time";
import { Spinner } from "~/components/loaders";
import { ProgressBar } from "~/components/ui/progress-bar";
import { useTranslation } from "~/hooks";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

export const NomicPendingTransfers = () => {
  const { t } = useTranslation();
  const { accountStore } = useStore();

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
      refetchInterval: 30000,
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

  return (
    <>
      <div className="body1 md:body2 flex w-full items-center justify-between gap-2 py-3">
        <p>Deposit status</p>
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
                  refetchInterval={30000}
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
        {pendingDepositsData?.pendingDeposits?.map((deposit) => {
          const successThreshold = 6;
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
                  {deposit.fiatValue.toString()}{" "}
                  <span className="text-osmoverse-300">
                    ({deposit.amount} BTC)
                  </span>
                </p>
                <button className="self-start text-wosmongton-300 hover:text-wosmongton-400">
                  {t("transfer.transactionDetails")}
                </button>
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
