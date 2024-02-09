import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import React from "react";

import { Icon } from "~/components/assets";
import SkeletonLoader from "~/components/loaders/skeleton-loader";
import { useTranslation, useWalletSelect } from "~/hooks";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

export const YourTotalBalance = observer(() => {
  const { t } = useTranslation();
  const { accountStore, chainStore } = useStore();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);
  const { isLoading: isWalletLoading, onOpenWalletSelect } = useWalletSelect();

  const { data: value, isLoading } =
    api.edge.assets.getUserAssetsBreakdown.useQuery(
      {
        userOsmoAddress: account?.address ?? "",
      },
      {
        enabled: account?.address !== undefined && !isWalletLoading,

        // expensive query
        trpc: {
          context: {
            skipBatch: true,
          },
        },
      }
    );

  const isZero = value?.aggregatedValue.toDec().isZero();
  const isWalletConnected = account?.isWalletConnected;

  return (
    <>
      {isWalletConnected ? (
        <div className="flex flex-col gap-3">
          <span className="text-subtitle1 text-osmoverse-300">
            {t("homePage.yourTotalBalance")}
          </span>
          <SkeletonLoader isLoaded={!isLoading}>
            <h3
              className={classNames({
                "text-osmoverse-600": isZero,
              })}
            >
              {value?.aggregatedValue.toString() ?? "N.D."}
            </h3>
          </SkeletonLoader>
          {isZero ? (
            <button className="text-subtitle1 text-wosmongton-200">
              {t("homePage.addFundsToGetStarted")}
            </button>
          ) : (
            <span className="inline-flex items-center gap-3">
              {/* <span className="text-subititle1 text-bullish-500">
        ↗️ $1,863.96 &#40;5.6%&#41;
      </span> */}
              <Link
                href={"/assets"}
                className="text-subititle1 inline-flex items-center gap-1 text-wosmongton-200"
              >
                {isZero
                  ? t("homePage.addFundsToGetStarted")
                  : t("homePage.viewAssets")}
                <Icon id="arrow-right" color="#B3B1FD" className="h-4 w-4" />
              </Link>
            </span>
          )}
        </div>
      ) : (
        <div className="flex flex-col">
          <h6>{t("homePage.welcomeToOsmosis")}</h6>
          <p className="mt-2 max-w-xs text-body2 text-osmoverse-300">
            {t("homePage.connectAndFund")}
          </p>
          <span className="mt-4 inline-flex items-center gap-3">
            <button
              onClick={() => onOpenWalletSelect(chainStore.osmosis.chainId)}
              className="text-subititle1 inline-flex items-center gap-2 text-wosmongton-200"
            >
              {t("homePage.getStarted")}
              <Icon id="chevron-right" color="#B3B1FD" className="h-3 w-2" />
            </button>
          </span>
        </div>
      )}
    </>
  );
});
