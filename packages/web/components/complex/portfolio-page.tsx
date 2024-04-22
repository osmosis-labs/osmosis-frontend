import { Tab } from "@headlessui/react";
import { PricePretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { useRouter } from "next/router";
import { FunctionComponent, useCallback } from "react";

import { Icon } from "~/components/assets";
import { AssetBalancesTable } from "~/components/table/asset-balances";
import {
  useDimension,
  useTranslation,
  useWalletSelect,
  useWindowSize,
} from "~/hooks";
import { useBridge } from "~/hooks/bridge";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

import { CreditCardIcon } from "../assets/credit-card-icon";
import { Spinner } from "../loaders";
import SkeletonLoader from "../loaders/skeleton-loader";
import { RecentTransfers } from "../transactions/recent-transfers";
import { CustomClasses } from "../types";
import { Button } from "../ui/button";
import { MyPoolsCardsGrid } from "./my-pools-card-grid";
import { MyPositionsSection } from "./my-positions-section";

export const PortfolioPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const { bridgeAsset } = useBridge();
  const { accountStore } = useStore();
  const wallet = accountStore.getWallet(accountStore.osmosisChainId);
  const { isLoading: isWalletLoading } = useWalletSelect();

  const { data: totalValue, isFetched: isTotalValueFetched } =
    api.edge.assets.getUserAssetsTotal.useQuery(
      {
        userOsmoAddress: wallet?.address ?? "",
      },
      {
        enabled: Boolean(wallet?.isWalletConnected && wallet?.address),
        select: ({ value }) => value,

        // expensive query
        trpc: {
          context: {
            skipBatch: true,
          },
        },
      }
    );
  const userHasNoAssets = totalValue && totalValue.toDec().isZero();

  const [overviewRef, { height: overviewHeight }] =
    useDimension<HTMLDivElement>();
  const [tabsRef, { height: tabsHeight }] = useDimension<HTMLDivElement>();

  const onDeposit = useCallback(
    (coinMinimalDenom) => {
      bridgeAsset(coinMinimalDenom, "deposit");
    },
    [bridgeAsset]
  );
  const onWithdraw = useCallback(
    (coinMinimalDenom) => {
      bridgeAsset(coinMinimalDenom, "withdraw");
    },
    [bridgeAsset]
  );

  return (
    <main className="mx-auto flex w-full max-w-container flex-col gap-8 bg-osmoverse-900 p-8 pt-4 md:gap-8 md:p-4">
      <section className="flex gap-5" ref={overviewRef}>
        <AssetsOverview
          totalValue={totalValue}
          isTotalValueFetched={isTotalValueFetched}
        />
      </section>

      <section className="w-full py-3">
        {wallet && wallet.isWalletConnected && wallet.address ? (
          <Tab.Group>
            <Tab.List className="flex gap-6" ref={tabsRef}>
              <Tab disabled={userHasNoAssets} className="disabled:opacity-80">
                {({ selected }) => (
                  <h5 className={!selected ? "text-osmoverse-500" : undefined}>
                    {t("portfolio.yourAssets")}
                  </h5>
                )}
              </Tab>
              <Tab disabled={userHasNoAssets} className="disabled:opacity-80">
                {({ selected }) => (
                  <h5 className={!selected ? "text-osmoverse-500" : undefined}>
                    {t("portfolio.yourPositions")}
                  </h5>
                )}
              </Tab>
              <Tab disabled={userHasNoAssets} className="disabled:opacity-80">
                {({ selected }) => (
                  <h5 className={!selected ? "text-osmoverse-500" : undefined}>
                    {t("portfolio.recentTransfers")}
                  </h5>
                )}
              </Tab>
            </Tab.List>
            {!isTotalValueFetched ? (
              <div className="mx-auto w-fit py-3">
                <Spinner />
              </div>
            ) : userHasNoAssets ? (
              <UserZeroBalanceTableSplash />
            ) : (
              <Tab.Panels className="py-3">
                <Tab.Panel>
                  <AssetBalancesTable
                    tableTopPadding={overviewHeight + tabsHeight}
                    onDeposit={onDeposit}
                    onWithdraw={onWithdraw}
                  />
                </Tab.Panel>
                <Tab.Panel>
                  <UserPositionsSection address={wallet.address} />
                </Tab.Panel>
                <Tab.Panel>
                  <section>
                    <RecentTransfers />
                  </section>
                </Tab.Panel>
              </Tab.Panels>
            )}
          </Tab.Group>
        ) : isWalletLoading ? null : (
          <WalletDisconnectedSplash />
        )}
      </section>
    </main>
  );
};

const AssetsOverview: FunctionComponent<
  { totalValue?: PricePretty; isTotalValueFetched?: boolean } & CustomClasses
> = observer(({ totalValue, isTotalValueFetched }) => {
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
          </div>
          <div className="flex items-center gap-3 py-3">
            <Button
              className="flex items-center gap-2 !rounded-full"
              onClick={() => startBridge("deposit")}
            >
              <Icon id="deposit" height={16} width={16} />
              <div className="subtitle1">{t("assets.table.depositButton")}</div>
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
              onClick={() => startBridge("withdraw")}
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
});

const UserPositionsSection: FunctionComponent<{ address?: string }> = ({
  address,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    hasPositions,
    hasPools,
    isLoading: isLoadingPositions,
  } = useUserPositionsData(address);

  if (isLoadingPositions) {
    return (
      <section className="">
        <Spinner />
      </section>
    );
  }

  if (hasPositions || hasPools)
    return (
      <>
        {hasPositions && (
          <section>
            <h6>{t("portfolio.yourSuperchargedPositions")}</h6>
            <MyPositionsSection />
          </section>
        )}
        {hasPools && (
          <section>
            <h6>{t("portfolio.yourLiquidityPools")}</h6>
            <MyPoolsCardsGrid />
          </section>
        )}
      </>
    );

  return (
    <div className="mx-auto my-6 flex max-w-35 flex-col gap-6 text-center">
      <Image
        className="mx-auto"
        src="/images/coin-ring.svg"
        alt="no positions"
        width={240}
        height={160}
      />
      <div className="flex flex-col gap-2">
        <h6>{t("portfolio.noPositions")}</h6>
        <p className="body1 text-osmoverse-300">
          {t("portfolio.unlockPotential")}
        </p>
        <Button
          className="mx-auto flex !h-11 w-fit items-center gap-2 !rounded-full !py-1"
          onClick={() => router.push("/pools")}
        >
          <span className="subtitle1">{t("tokenInfos.explorePools")}</span>
        </Button>
      </div>
    </div>
  );
};

const UserZeroBalanceTableSplash: FunctionComponent = () => {
  const { t } = useTranslation();
  const { startBridge, fiatRampSelection } = useBridge();

  return (
    <div className="mx-auto flex w-fit flex-col gap-4 py-3 text-center">
      <Image
        alt="no balances"
        src="/images/coins-and-vial.svg"
        width={240}
        height={160}
      />
      <h6>{t("portfolio.noAssets", { osmosis: "Osmosis" })}</h6>
      <p className="body1 text-osmoverse-300">{t("portfolio.getStarted")}</p>
      <div className="flex items-center justify-center gap-2">
        <Button
          className="flex !w-fit items-center gap-2 !rounded-full"
          onClick={() => startBridge("deposit")}
        >
          <Icon id="deposit" height={16} width={16} />
          <span className="subtitle1">{t("assets.table.depositButton")}</span>
        </Button>
        <Button
          className="group flex items-center gap-2 !rounded-full !bg-osmoverse-825 text-wosmongton-200 hover:bg-gradient-positive hover:text-black hover:shadow-[0px_0px_30px_4px_rgba(57,255,219,0.2)]"
          onClick={fiatRampSelection}
        >
          <CreditCardIcon
            isAnimated
            classes={{
              backCard: "group-hover:stroke-[2]",
              frontCard: "group-hover:fill-[#71B5EB] group-hover:stroke-[2]",
            }}
          />
          <span className="subtitle1">{t("portfolio.buy")}</span>
        </Button>
      </div>
    </div>
  );
};

const GetStartedWithOsmosis: FunctionComponent = () => {
  const { chainStore } = useStore();
  const { t } = useTranslation();

  const { onOpenWalletSelect } = useWalletSelect();

  return (
    <div className="flex max-w-sm flex-col gap-8">
      <p className="body1 text-osmoverse-400">{t("portfolio.connectWallet")}</p>
      <Button
        className="flex !h-11 w-fit items-center gap-2 !rounded-full !py-1"
        onClick={() => {
          onOpenWalletSelect(chainStore.osmosis.chainId);
        }}
      >
        {t("connectWallet")}
      </Button>
    </div>
  );
};

const WalletDisconnectedSplash: FunctionComponent = () => (
  <div className="relative w-full">
    <Image alt="home" src="/images/chart.png" fill />
    <Image
      className="relative top-10 mx-auto"
      alt="home"
      src="/images/osmosis-home-fg-coins.svg"
      width={624}
      height={298}
    />
  </div>
);

function useUserPositionsData(address: string | undefined) {
  const { data: positions, isLoading: isLoadingUserPositions } =
    api.local.concentratedLiquidity.getUserPositions.useQuery(
      {
        userOsmoAddress: address ?? "",
      },
      {
        enabled: Boolean(address),

        // expensive query
        trpc: {
          context: {
            skipBatch: true,
          },
        },
      }
    );
  const hasPositions = Boolean(positions?.length);

  const { data: allMyPoolDetails, isLoading: isLoadingMyPoolDetails } =
    api.edge.pools.getUserPools.useQuery(
      {
        userOsmoAddress: address ?? "",
      },
      {
        enabled: Boolean(address),

        // expensive query
        trpc: {
          context: {
            skipBatch: true,
          },
        },
      }
    );
  const hasPools = Boolean(allMyPoolDetails?.length);

  return {
    hasPositions,
    hasPools,
    isLoading: isLoadingUserPositions || isLoadingMyPoolDetails,
  };
}
