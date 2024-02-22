import { Dec, PricePretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import type { SeriesPieOptions } from "highcharts";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { FunctionComponent, useMemo } from "react";

import {
  useDimension,
  useDisclosure,
  useTranslation,
  useWalletSelect,
} from "~/hooks";
import { FiatOnrampSelectionModal } from "~/modals";
import { useStore } from "~/stores";
import { theme } from "~/tailwind.config";
import { api } from "~/utils/trpc";

import { PieChart } from "../chart";
import SkeletonLoader from "../loaders/skeleton-loader";
import { AssetsInfoTable } from "../table/asset-info";
import { CustomClasses } from "../types";
import { Button } from "../ui/button";

export const AssetsPageV2: FunctionComponent = () => {
  const [heroRef, { height: heroHeight }] = useDimension<HTMLDivElement>();

  return (
    <main className="mx-auto flex max-w-container flex-col gap-20 bg-osmoverse-900 p-8 pt-4 md:gap-8 md:p-4">
      <section className="flex gap-5" ref={heroRef}>
        <AssetsOverview />
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
};

const AssetsOverview: FunctionComponent<CustomClasses> = observer(() => {
  const { accountStore, chainStore } = useStore();
  const wallet = accountStore.getWallet(chainStore.osmosis.chainId);

  return (
    <div className="relative flex h-48 w-full place-content-between items-center rounded-5xl bg-osmoverse-800">
      {wallet && wallet.isWalletConnected && wallet.address ? (
        <UserAssetsBreakdown userOsmoAddress={wallet.address} />
      ) : (
        <GetStartedWithOsmosis />
      )}

      <div className="absolute right-3 bottom-0  overflow-clip align-baseline">
        <Image
          alt="vials"
          src="/images/osmosis-home-fg.png"
          height={320}
          width={320}
        />
      </div>
    </div>
  );
});

const UserAssetsBreakdown: FunctionComponent<{ userOsmoAddress: string }> = ({
  userOsmoAddress,
}) => {
  const { t } = useTranslation();

  const { data: userAssets, isFetched } =
    api.edge.assets.getUserAssetsBreakdown.useQuery(
      {
        userOsmoAddress,
      },
      {
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
                label: t("assets.stakedAssets"),
                price: userAssets.delegatedValue,
                color: theme.colors.ion[400],
              },
              {
                label: t("assets.pooledAssets"),
                price: userAssets.pooledValue,
                color: theme.colors.ammelia[600],
              },
              {
                label: t("assets.unbondedAssets"),
                price: userAssets.availableValue,
                color: theme.colors.wosmongton[400],
              },
            ]),
          }
        : undefined,
    [userAssets, t]
  );

  if (userAssets && userAssets.aggregatedValue.toDec().isZero()) {
    return (
      <UserZeroBalanceCta currencySymbol={userAssets.aggregatedValue.symbol} />
    );
  }

  return (
    <div className="flex items-center gap-8 p-5">
      <div className="flex flex-col gap-2">
        <span className="subtitle1 text-osmoverse-300">
          {t("assets.totalBalance")}
        </span>
        <SkeletonLoader
          className={classNames(isFetched ? null : "h-14 w-48")}
          isLoaded={isFetched}
        >
          <h3>{userAssets?.aggregatedValue.toString()}</h3>
        </SkeletonLoader>
      </div>

      <div className="flex gap-4">
        {pieChartOptions && (
          <PieChart options={pieChartOptions} height={138} width={138} />
        )}

        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="h-full w-1 rounded-full bg-ion-400" />
            <div className="flex flex-col text-left">
              <span className="caption text-osmoverse-400">
                {t("assets.stakedAssets")}
              </span>
              <SkeletonLoader
                className={classNames(isFetched ? null : "h-5 w-20")}
                isLoaded={isFetched}
              >
                <span className="subtitle1 text-osmoverse-100">
                  {userAssets?.delegatedValue.toString()}
                </span>
              </SkeletonLoader>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="h-full w-1 rounded-full bg-ammelia-600" />
            <div className="flex flex-col text-left">
              <span className="caption text-osmoverse-400">
                {t("assets.pooledAssets")}
              </span>
              <SkeletonLoader
                className={classNames(isFetched ? null : "h-5 w-20")}
                isLoaded={isFetched}
              >
                <span className="subtitle1 text-osmoverse-100">
                  {userAssets?.pooledValue.toString()}
                </span>
              </SkeletonLoader>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="h-full w-1 rounded-full bg-wosmongton-400" />
            <div className="flex flex-col text-left">
              <span className="caption text-osmoverse-400">
                {t("assets.unbondedAssets")}
              </span>
              <SkeletonLoader
                className={classNames(isFetched ? null : "h-5 w-20")}
                isLoaded={isFetched}
              >
                <span className="subtitle1 text-osmoverse-100">
                  {userAssets?.availableValue.toString()}
                </span>
              </SkeletonLoader>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserZeroBalanceCta: FunctionComponent<{ currencySymbol: string }> = ({
  currencySymbol,
}) => {
  const { t } = useTranslation();

  const {
    isOpen: isFiatOnrampSelectionOpen,
    onClose: onCloseFiatOnrampSelection,
    onOpen: onOpenFiatOnrampSelection,
  } = useDisclosure();

  return (
    <div className="flex flex-col gap-2 px-6">
      <span className="subtitle1 text-osmoverse-300">
        {t("assets.totalBalance")}
      </span>
      <h3 className="text-osmoverse-600">{currencySymbol}0.00</h3>
      <Button
        className="!w-fit"
        onClick={() => {
          onOpenFiatOnrampSelection();
        }}
        variant="link"
        size="icon"
      >
        <h6 className="text-wosmongton-200">
          {t("assets.getStarted.addFunds")}
        </h6>
      </Button>
      <FiatOnrampSelectionModal
        isOpen={isFiatOnrampSelectionOpen}
        onRequestClose={onCloseFiatOnrampSelection}
      />
    </div>
  );
};

const GetStartedWithOsmosis: FunctionComponent = () => {
  const { chainStore } = useStore();
  const { t } = useTranslation();

  const { onOpenWalletSelect } = useWalletSelect();

  return (
    <div className="flex max-w-sm flex-col gap-4 px-6">
      <h5>{t("assets.getStarted.title", { osmosis: "Osmosis" })}</h5>
      <p className="body2 text-osmoverse-300">
        {t("assets.getStarted.description")}
      </p>
      <Button
        className="w-fit px-0"
        onClick={() => {
          onOpenWalletSelect(chainStore.osmosis.chainId);
        }}
        variant="link"
      >
        <h6 className="text-wosmongton-200">{t("connectWallet")}</h6>
      </Button>
    </div>
  );
};

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
      y: d.price.toDec().isZero()
        ? 0
        : Number(d.price.toDec().quo(total).mul(new Dec(100)).toString()),
      x: d.price.toDec().isZero() ? 0 : Number(d.price.toDec().toString()),
      color: d.color,
    })),
  };
  return [series];
};
