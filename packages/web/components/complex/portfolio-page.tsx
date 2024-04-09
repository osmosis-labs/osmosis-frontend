import { Tab } from "@headlessui/react";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import { FunctionComponent, useCallback } from "react";

import { Icon } from "~/components/assets";
import { MyPoolsCardsGrid } from "~/components/complex/my-pools-card-grid";
import { MyPositionsSection } from "~/components/complex/my-positions-section";
import { AssetBalancesTable } from "~/components/table/asset-balances";
import {
  useDimension,
  useDisclosure,
  useTranslation,
  useWalletSelect,
  useWindowSize,
} from "~/hooks";
import { useBridge } from "~/hooks/bridge";
import { FiatOnrampSelectionModal } from "~/modals";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

import SkeletonLoader from "../loaders/skeleton-loader";
import { CustomClasses } from "../types";
import { Button } from "../ui/button";

export const PortfolioPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const { bridgeAsset } = useBridge();

  const [overviewRef, { height: overviewHeight }] =
    useDimension<HTMLDivElement>();
  const [tabsRef, { height: tabsHeight }] = useDimension<HTMLDivElement>();

  return (
    <main className="mx-auto flex max-w-container flex-col gap-8 bg-osmoverse-900 p-8 pt-4 md:gap-8 md:p-4">
      <section className="flex gap-5" ref={overviewRef}>
        <AssetsOverview />
      </section>

      <section className="py-3">
        <Tab.Group>
          <Tab.List className="flex gap-6" ref={tabsRef}>
            <Tab>
              {({ selected }) => (
                <h5 className={!selected ? "text-osmoverse-500" : undefined}>
                  {t("portfolio.yourAssets")}
                </h5>
              )}
            </Tab>
            <Tab>
              {({ selected }) => (
                <h5 className={!selected ? "text-osmoverse-500" : undefined}>
                  {t("portfolio.yourPositions")}
                </h5>
              )}
            </Tab>
            <Tab>
              {({ selected }) => (
                <h5 className={!selected ? "text-osmoverse-500" : undefined}>
                  {t("portfolio.recentTransfers")}
                </h5>
              )}
            </Tab>
          </Tab.List>
          <Tab.Panels className="py-3">
            <Tab.Panel>
              <AssetBalancesTable
                tableTopPadding={overviewHeight + tabsHeight}
                onDeposit={useCallback(
                  (coinMinimalDenom) => {
                    bridgeAsset(coinMinimalDenom, "deposit");
                  },
                  [bridgeAsset]
                )}
                onWithdraw={useCallback(
                  (coinMinimalDenom) => {
                    bridgeAsset(coinMinimalDenom, "withdraw");
                  },
                  [bridgeAsset]
                )}
              />
            </Tab.Panel>
            <Tab.Panel>
              <section>
                <h6>{t("portfolio.yourSuperchargedPositions")}</h6>
                <MyPositionsSection />
              </section>
              <section>
                <h6>{t("portfolio.yourLiquidityPools")}</h6>
                <MyPoolsCardsGrid />
              </section>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </section>
    </main>
  );
};

const AssetsOverview: FunctionComponent<CustomClasses> = observer(() => {
  const { accountStore } = useStore();
  const wallet = accountStore.getWallet(accountStore.osmosisChainId);
  const { t } = useTranslation();
  const router = useRouter();
  const { startBridge } = useBridge();

  const { isLoading: isWalletLoading } = useWalletSelect();

  if (isWalletLoading) return null;

  return (
    <div className="flex w-full flex-col gap-4">
      {wallet && wallet.isWalletConnected && wallet.address ? (
        <UserAssetsTotal userOsmoAddress={wallet.address} />
      ) : (
        <GetStartedWithOsmosis />
      )}
      <div className="flex items-center gap-3 py-3">
        <Button
          className="flex items-center gap-2 !rounded-full"
          onClick={() => router.push("/")}
        >
          <Icon id="swap-horizontal" height={16} width={16} />
          <span className="subtitle1">{t("portfolio.trade")}</span>
        </Button>
        <Button
          className="flex items-center gap-2 !rounded-full !bg-osmoverse-825 text-wosmongton-200"
          onClick={() => startBridge("deposit")}
        >
          <Icon id="deposit" height={16} width={16} />
          <span className="subtitle1">{t("assets.table.depositButton")}</span>
        </Button>
        <Button
          className="flex items-center gap-2 !rounded-full !bg-osmoverse-825 text-wosmongton-200"
          onClick={() => startBridge("withdraw")}
        >
          <Icon id="withdraw" height={16} width={16} />
          <span className="subtitle1">{t("assets.table.withdrawButton")}</span>
        </Button>
      </div>
    </div>
  );
});

const UserAssetsTotal: FunctionComponent<{ userOsmoAddress: string }> = ({
  userOsmoAddress,
}) => {
  const { t } = useTranslation();
  const { isMobile } = useWindowSize();

  const { data: totalValue, isFetched } =
    api.edge.assets.getUserAssetsTotal.useQuery(
      {
        userOsmoAddress,
      },
      {
        select: ({ value }) => value,

        // expensive query
        trpc: {
          context: {
            skipBatch: true,
          },
        },
      }
    );

  if (totalValue && totalValue.toDec().isZero()) {
    return <UserZeroBalanceCta currencySymbol={totalValue.symbol} />;
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="body1 md:caption text-osmoverse-300">
        {t("assets.totalBalance")}
      </span>
      <SkeletonLoader
        className={classNames(isFetched ? null : "h-14 w-48")}
        isLoaded={isFetched}
      >
        {isMobile ? (
          <h5>{totalValue?.toString()}</h5>
        ) : (
          <h3>{totalValue?.toString()}</h3>
        )}
      </SkeletonLoader>
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
