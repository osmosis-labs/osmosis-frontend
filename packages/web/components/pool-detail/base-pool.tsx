import { IntPretty } from "@keplr-wallet/unit";
import type { Pool } from "@osmosis-labs/server";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { Fragment, FunctionComponent, useState } from "react";
import { useMeasure } from "react-use";

import { Icon, PoolAssetsIcon } from "~/components/assets";
import { Button } from "~/components/buttons";
import { AssetBreakdownChart } from "~/components/chart";
import { useTranslation } from "~/hooks";

export const BasePoolDetails: FunctionComponent<{
  pool: Pool;
}> = observer(({ pool }) => {
  const { t } = useTranslation();

  const [showPoolDetails, setShowPoolDetails] = useState(true);

  const poolNameAssetLinks = pool.reserveCoins.map((poolAsset, index) => (
    <Fragment key={poolAsset.denom}>
      <Link href={`/assets/${poolAsset.denom}`}>{poolAsset.denom}</Link>
      {index < pool.reserveCoins.length - 1 && " / "}
    </Fragment>
  ));

  const poolValue = pool.totalFiatValueLocked;

  const [poolDetailsContainerRef, { y: poolDetailsContainerOffset }] =
    useMeasure<HTMLDivElement>();
  const [poolHeaderRef, { height: poolHeaderHeight }] =
    useMeasure<HTMLDivElement>();
  const [poolBreakdownRef, { height: poolBreakdownHeight }] =
    useMeasure<HTMLDivElement>();

  return (
    <main className="m-auto flex min-h-screen max-w-container flex-col gap-8 px-8 py-4 md:gap-4 md:p-4">
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 rounded-4xl pb-4">
          <div
            ref={poolDetailsContainerRef}
            className={classNames(
              "flex flex-col gap-3 overflow-hidden px-8 pt-8 transition-height duration-300 ease-inOutBack md:px-5 md:pt-7"
            )}
            style={{
              height: showPoolDetails
                ? poolHeaderHeight +
                    poolDetailsContainerOffset +
                    poolBreakdownHeight +
                    12 ?? // gap between header and breakdown
                  178
                : poolHeaderHeight + poolDetailsContainerOffset ?? 100,
            }}
          >
            <div
              ref={poolHeaderRef}
              className="flex place-content-between items-start gap-2 xl:flex-col"
            >
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <PoolAssetsIcon
                    assets={pool.reserveCoins.map(({ currency }) => ({
                      coinDenom: currency.coinDenom,
                      coinImageUrl: currency.coinImageUrl,
                    }))}
                    size="sm"
                  />
                  <h5>{poolNameAssetLinks}</h5>
                </div>
              </div>
              <div className="flex items-center gap-10 xl:w-full xl:place-content-between lg:w-fit lg:flex-col lg:items-start lg:gap-3">
                <div className="space-y-2">
                  <span className="body2 gap-2 text-osmoverse-400">
                    {t("pool.liquidity")}
                  </span>
                  <h4 className="text-osmoverse-100">
                    {poolValue?.toString() ?? ""}
                  </h4>
                </div>
                <div className="space-y-2">
                  <span className="body2 gap-2 text-osmoverse-400">
                    {t("pool.swapFee")}
                  </span>
                  <h4 className="text-osmoverse-100">
                    {pool.spreadFactor.maxDecimals(2).toString()}
                  </h4>
                </div>
              </div>
            </div>
            <div ref={poolBreakdownRef}>
              <AssetBreakdownChart
                assets={pool.reserveCoins.map((coin) => ({
                  weight: new IntPretty(1),
                  amount: coin,
                }))}
                totalWeight={new IntPretty(pool.reserveCoins.length)}
              />
            </div>
          </div>
          <Button
            mode="text"
            className="subtitle2 mx-auto gap-1"
            onClick={() => {
              setShowPoolDetails(!showPoolDetails);
            }}
          >
            <span>
              {showPoolDetails
                ? t("pool.collapseDetails")
                : t("pool.showDetails")}
            </span>
            <div
              className={classNames("flex items-center transition-transform", {
                "rotate-180": showPoolDetails,
              })}
            >
              <Icon id="chevron-down" width="14" height="8" />
            </div>
          </Button>
        </div>
      </section>
    </main>
  );
});
