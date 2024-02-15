import { Dec, PricePretty } from "@keplr-wallet/unit";
import type { SeriesPieOptions } from "highcharts";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useMemo } from "react";

import { useDimension, useTranslation, useWalletSelect } from "~/hooks";
import { useStore } from "~/stores";
import { theme } from "~/tailwind.config";
import { api } from "~/utils/trpc";

import { PieChart } from "../chart";
import { AssetsInfoTable } from "../table/asset-info";
import { CustomClasses } from "../types";

export const AssetsPageV2: FunctionComponent = observer(() => {
  const [heroRef, { height: heroHeight }] = useDimension<HTMLDivElement>();

  return (
    <main className="mx-auto flex max-w-container flex-col gap-20 bg-osmoverse-900 p-8 pt-4 md:gap-8 md:p-4">
      <section className="flex gap-5" ref={heroRef}>
        <AssetsBreakdown />
      </section>

      <AssetsInfoTable
        tableTopPadding={heroHeight}
        onDeposit={(coinDenom) => {
          console.log("deposit", coinDenom);
        }}
        onWithdraw={(coinDenom) => {
          console.log("withdraw", coinDenom);
        }}
      />
    </main>
  );
});

const AssetsBreakdown: FunctionComponent<CustomClasses> = observer(() => {
  const { accountStore, chainStore } = useStore();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);
  const { isLoading: isWalletLoading } = useWalletSelect();
  const { t } = useTranslation();

  const { data: userAssets } = api.edge.assets.getUserAssetsBreakdown.useQuery(
    {
      userOsmoAddress: account?.address ?? "",
    },
    {
      enabled: !!account && !isWalletLoading,

      // expensive query
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

  const pieChartOptions = useMemo(
    () =>
      userAssets
        ? {
            series: generatePriceProportionSeries([
              {
                label: "Staked",
                price: userAssets.delegatedValue,
                color: theme.colors.ion[400],
              },
              {
                label: "Pooled",
                price: userAssets.pooledValue,
                color: theme.colors.ammelia[600],
              },
              {
                label: "Available",
                price: userAssets.availableValue,
                color: theme.colors.wosmongton[400],
              },
            ]),
          }
        : undefined,
    [userAssets]
  );

  return (
    <div className="flex gap-8">
      <div className="flex flex-col gap-2">
        <span className="subtitle1 text-osmoverse-300">
          {t("assets.totalBalance")}
        </span>
        <h3>{userAssets?.aggregatedValue.toString()}</h3>
      </div>

      <div className="flex gap-4">
        {pieChartOptions && (
          <PieChart options={pieChartOptions} height={138} width={138} />
        )}

        <div className="flex flex-col gap-2">
          <div className="flex gap-3">
            <div className="h-full w-1 rounded-full bg-ion-400" />
            <div className="flex flex-col text-left">
              <span className="caption text-osmoverse-400">
                {t("assets.stakedAssets")}
              </span>
              <span className="subtitle1 text-wosmongton-100">
                {userAssets?.delegatedValue.toString()}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="h-full w-1 rounded-full bg-ammelia-600" />
            <div className="flex flex-col text-left">
              <span className="caption text-osmoverse-400">
                {t("assets.pooledAssets")}
              </span>
              <span className="subtitle1 text-wosmongton-100">
                {userAssets?.pooledValue.toString()}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="h-full w-1 rounded-full bg-wosmongton-400" />
            <div className="flex flex-col text-left">
              <span className="caption text-osmoverse-400">
                {t("assets.unbondedAssets")}
              </span>
              <span className="subtitle1 text-wosmongton-100">
                {userAssets?.availableValue.toString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

/** Generates a series for representing a list of prices. */
export const generatePriceProportionSeries = (
  data: {
    label: string;
    price: PricePretty;
    color: string;
  }[]
): SeriesPieOptions[] => {
  const total = data.reduce((acc, d) => acc.add(d.price.toDec()), new Dec(0));
  const series: SeriesPieOptions = {
    type: "pie",
    dataLabels: {
      enabled: false,
    },
    innerSize: "80%",
    states: { hover: { enabled: false } },
    data: data.map((d) => ({
      y: Number(d.price.toDec().quo(total).mul(new Dec(100)).toString()),
      x: Number(d.price.toDec().toString()),
      color: d.color,
    })),
  };
  return [series];
};
