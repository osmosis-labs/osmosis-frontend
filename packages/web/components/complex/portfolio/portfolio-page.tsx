import { Tab } from "@headlessui/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { FunctionComponent, useCallback } from "react";

import { Icon } from "~/components/assets";
import { CreditCardIcon } from "~/components/assets/credit-card-icon";
import { MyPoolsCardsGrid } from "~/components/complex/my-pools-card-grid";
import { MyPositionsSection } from "~/components/complex/my-positions-section";
import { AssetsOverview } from "~/components/complex/portfolio/assets-overview";
import { WalletDisconnectedSplash } from "~/components/complex/portfolio/wallet-disconnected-splash";
import { Spinner } from "~/components/loaders";
import { AssetBalancesTable } from "~/components/table/asset-balances";
import { RecentTransfers } from "~/components/transactions/recent-transfers";
import { Button } from "~/components/ui/button";
import { useDimension, useTranslation, useWalletSelect } from "~/hooks";
import { useBridge } from "~/hooks/bridge";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

export const PortfolioPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const { bridgeAsset } = useBridge();
  const { accountStore } = useStore();
  const wallet = accountStore.getWallet(accountStore.osmosisChainId);
  const { isLoading: isWalletLoading } = useWalletSelect();

  const { data: totalValueData, isFetched: isTotalValueFetched } =
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
  const userHasNoAssets = totalValueData && totalValueData.toDec().isZero();

  const [overviewRef, { height: overviewHeight }] =
    useDimension<HTMLDivElement>();
  const [tabsRef, { height: tabsHeight }] = useDimension<HTMLDivElement>();

  const onDeposit = useCallback(
    (coinMinimalDenom: string) => {
      bridgeAsset({ anyDenom: coinMinimalDenom, direction: "deposit" });
    },
    [bridgeAsset]
  );
  const onWithdraw = useCallback(
    (coinMinimalDenom: string) => {
      bridgeAsset({ anyDenom: coinMinimalDenom, direction: "withdraw" });
    },
    [bridgeAsset]
  );

  const address = wallet?.address ?? "";

  return (
    <main className="mx-auto flex w-full max-w-container flex-col gap-8 bg-osmoverse-900 p-8 pt-4 md:gap-8 md:p-4">
      <section className="flex gap-5" ref={overviewRef}>
        <AssetsOverview
          totalValue={totalValueData}
          isTotalValueFetched={isTotalValueFetched}
        />
      </section>

      <section className="w-full py-3">
        {wallet && wallet.isWalletConnected && wallet.address ? (
          <Tab.Group>
            <Tab.List className="flex gap-6" ref={tabsRef}>
              <Tab disabled={userHasNoAssets} className="disabled:opacity-80">
                {({ selected }) => (
                  <h6 className={!selected ? "text-osmoverse-500" : undefined}>
                    {t("portfolio.yourAssets")}
                  </h6>
                )}
              </Tab>
              <Tab disabled={userHasNoAssets} className="disabled:opacity-80">
                {({ selected }) => (
                  <h6 className={!selected ? "text-osmoverse-500" : undefined}>
                    {t("portfolio.yourPositions")}
                  </h6>
                )}
              </Tab>
              <Tab disabled={userHasNoAssets} className="disabled:opacity-80">
                {({ selected }) => (
                  <h6 className={!selected ? "text-osmoverse-500" : undefined}>
                    {t("portfolio.recentTransfers")}
                  </h6>
                )}
              </Tab>
            </Tab.List>
            {!isTotalValueFetched ? (
              <div className="mx-auto my-6 w-fit">
                <Spinner />
              </div>
            ) : userHasNoAssets ? (
              <UserZeroBalanceTableSplash />
            ) : (
              <Tab.Panels className="py-6">
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
      <section className="mx-auto my-6 w-fit">
        <Spinner />
      </section>
    );
  }

  if (hasPositions || hasPools)
    return (
      <>
        {hasPositions && (
          <section>
            <span className="body2 text-osmoverse-200">
              {t("portfolio.yourSuperchargedPositions")}
            </span>
            <MyPositionsSection />
          </section>
        )}
        {hasPools && (
          <section>
            <span className="body2 text-osmoverse-200">
              {t("portfolio.yourLiquidityPools")}
            </span>
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
          onClick={() => startBridge({ direction: "deposit" })}
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
