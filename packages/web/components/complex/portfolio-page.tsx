import { Tab } from "@headlessui/react";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useCallback } from "react";

import { AssetBalancesTable } from "~/components/table/asset-balances";
import { EventName } from "~/config";
import {
  useAmplitudeAnalytics,
  useDimension,
  useDisclosure,
  useNavBar,
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
  const { startBridge, bridgeAsset } = useBridge();
  const { logEvent } = useAmplitudeAnalytics({
    onLoadEvent: [EventName.Assets.pageViewed],
  });

  // set nav bar ctas
  useNavBar({
    ctas: [
      {
        label: t("assets.table.depositButton"),
        onClick: () => {
          startBridge("deposit");
          logEvent([EventName.Assets.depositClicked]);
        },
      },
      {
        label: t("assets.table.withdrawButton"),
        onClick: () => {
          startBridge("withdraw");
          logEvent([EventName.Assets.withdrawClicked]);
        },
      },
    ],
  });

  const [heroRef, { height: heroHeight }] = useDimension<HTMLDivElement>();

  return (
    <main className="mx-auto flex max-w-container flex-col gap-20 bg-osmoverse-900 p-8 pt-4 md:gap-8 md:p-4">
      <section className="flex gap-5" ref={heroRef}>
        <AssetsOverview />
      </section>

      <section className="flex flex-col gap-2 py-3">
        <Tab.Group>
          <Tab.List className="flex gap-6">
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
          <Tab.Panels>
            <Tab.Panel>
              <AssetBalancesTable
                tableTopPadding={heroHeight}
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
          </Tab.Panels>
        </Tab.Group>
      </section>
    </main>
  );
};

const AssetsOverview: FunctionComponent<CustomClasses> = observer(() => {
  const { accountStore } = useStore();
  const wallet = accountStore.getWallet(accountStore.osmosisChainId);

  const { isLoading: isWalletLoading } = useWalletSelect();

  return (
    <div className="relative flex h-48 w-full place-content-between items-center">
      <SkeletonLoader
        className="rounded-5xl 1.5lg:w-full"
        isLoaded={!isWalletLoading}
      >
        {wallet && wallet.isWalletConnected && wallet.address ? (
          <Hero userOsmoAddress={wallet.address} />
        ) : (
          <GetStartedWithOsmosis />
        )}
      </SkeletonLoader>
    </div>
  );
});

const Hero: FunctionComponent<{ userOsmoAddress: string }> = ({
  userOsmoAddress,
}) => {
  const { t } = useTranslation();
  const { isMobile } = useWindowSize();

  const { data: totalValue, isFetched } =
    api.edge.assets.getUserAssetsTotalValue.useQuery(
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

  if (totalValue && totalValue.toDec().isZero()) {
    return <UserZeroBalanceCta currencySymbol={totalValue.symbol} />;
  }

  return (
    <div className="flex items-center gap-8 p-5 1.5lg:w-full 1.5lg:place-content-between">
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
