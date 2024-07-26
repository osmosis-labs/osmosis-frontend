import { PricePretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";

import { Icon } from "~/components/assets";
import { GetStartedWithOsmosis } from "~/components/complex/portfolio/get-started-with-osmosis";
import { useTranslation, useWalletSelect, useWindowSize } from "~/hooks";
import { useBridge } from "~/hooks/bridge";
import { useStore } from "~/stores";

import { CreditCardIcon } from "../../assets/credit-card-icon";
import { SkeletonLoader } from "../../loaders/skeleton-loader";
import { CustomClasses } from "../../types";
import { Button } from "../../ui/button";

export const AssetsOverview: FunctionComponent<
  {
    totalValue?: PricePretty;
    isTotalValueFetched?: boolean;
    isPortfolioOverTimeDataIsFetched?: boolean;
    portfolioPerformance: React.ReactNode;
  } & CustomClasses
> = observer(
  ({
    totalValue,
    isTotalValueFetched,
    portfolioPerformance,
    isPortfolioOverTimeDataIsFetched,
  }) => {
    const { accountStore } = useStore();
    const wallet = accountStore.getWallet(accountStore.osmosisChainId);
    const { t } = useTranslation();
    const { startBridge, fiatRampSelection } = useBridge();
    const { isLoading: isWalletLoading } = useWalletSelect();
    const { isMobile } = useWindowSize();

    if (isWalletLoading) return null;

    return (
      <div className="flex w-full flex-col gap-4">
        {wallet && wallet.isWalletConnected && wallet.address ? (
          <>
            <div className="flex flex-col gap-2">
              <span className="body1 md:caption text-osmoverse-300">
                {t("assets.totalBalance")}
              </span>

              <SkeletonLoader
                className={classNames(isTotalValueFetched ? null : "h-14 w-48")}
                isLoaded={isTotalValueFetched}
              >
                {isMobile ? (
                  <h5>{totalValue?.toString()}</h5>
                ) : (
                  <h3>{totalValue?.toString()}</h3>
                )}
              </SkeletonLoader>
              <SkeletonLoader
                className={classNames(
                  isPortfolioOverTimeDataIsFetched ? null : "h-6 w-16"
                )}
                isLoaded={isPortfolioOverTimeDataIsFetched}
              >
                {portfolioPerformance}
              </SkeletonLoader>
            </div>
            <div className="flex items-center gap-3 py-3">
              <Button
                className="flex items-center gap-2 !rounded-full"
                onClick={() => startBridge({ direction: "deposit" })}
              >
                <Icon
                  id="deposit"
                  className=" h-4 w-4"
                  height={16}
                  width={16}
                />
                <div className="subtitle1">
                  {t("assets.table.depositButton")}
                </div>
              </Button>
              <Button
                className="group flex items-center gap-2 !rounded-full !bg-osmoverse-825 text-wosmongton-200 hover:bg-gradient-positive hover:text-black hover:shadow-[0px_0px_30px_4px_rgba(57,255,219,0.2)]"
                onClick={fiatRampSelection}
              >
                <CreditCardIcon
                  isAnimated
                  classes={{
                    backCard: "group-hover:stroke-[2]",
                    frontCard:
                      "group-hover:fill-[#71B5EB] group-hover:stroke-[2]",
                  }}
                />
                <span className="subtitle1">{t("portfolio.buy")}</span>
              </Button>
              <Button
                className="flex items-center gap-2 !rounded-full !bg-osmoverse-825 text-wosmongton-200"
                onClick={() => startBridge({ direction: "withdraw" })}
                disabled={totalValue && totalValue.toDec().isZero()}
              >
                <Icon id="withdraw" height={16} width={16} />
                <div className="subtitle1">
                  {t("assets.table.withdrawButton")}
                </div>
              </Button>
            </div>
          </>
        ) : (
          <GetStartedWithOsmosis />
        )}
      </div>
    );
  }
);
