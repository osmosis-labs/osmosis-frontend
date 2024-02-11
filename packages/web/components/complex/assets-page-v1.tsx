import { PricePretty } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import {
  ComponentProps,
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";

import { MyPoolsSection } from "~/components/complex/pool";
import { AssetsTableV1 } from "~/components/table/assets-table-v1";
import { Metric } from "~/components/types";
import { DesktopOnlyPrivateText } from "~/components/your-balance/privacy";
import { EventName } from "~/config";
import { useTranslation } from "~/hooks";
import {
  useAmplitudeAnalytics,
  useNavBar,
  useTransferConfig,
  useWindowSize,
} from "~/hooks";
import { useFeatureFlags } from "~/hooks/use-feature-flags";
import {
  BridgeTransferV1Modal,
  BridgeTransferV2Modal,
  FiatRampsModal,
  IbcTransferModal,
  PreTransferModal,
  SelectAssetSourceModal,
  TransferAssetSelectModal,
} from "~/modals";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";
import { removeQueryParam } from "~/utils/url";

const INIT_POOL_CARD_COUNT = 6;
const TransactionTypeQueryParamKey = "transaction_type";
const DenomQueryParamKey = "denom";

export const AssetsPageV1: FunctionComponent = observer(() => {
  const { isMobile } = useWindowSize();
  const { assetsStore } = useStore();
  const {
    nativeBalances,
    ibcBalances,
    unverifiedIbcBalances,
    unverifiedNativeBalances,
  } = assetsStore;
  const { t } = useTranslation();
  const flags = useFeatureFlags();

  const router = useRouter();

  const { setUserProperty, logEvent } = useAmplitudeAnalytics({
    onLoadEvent: [EventName.Assets.pageViewed],
  });
  const transferConfig = useTransferConfig();

  // mobile only
  const [preTransferModalProps, setPreTransferModalProps] =
    useState<ComponentProps<typeof PreTransferModal> | null>(null);
  const launchPreTransferModal = useCallback(
    (coinDenom: string) => {
      const ibcBalance = ibcBalances.find(
        (ibcBalance) => ibcBalance.balance.denom === coinDenom
      );

      if (!ibcBalance) {
        console.error("launchPreTransferModal: ibcBalance not found");
        return;
      }

      setPreTransferModalProps({
        isOpen: true,
        selectedToken: ibcBalance,
        tokens: ibcBalances.map(({ balance }) => balance),
        externalDepositUrl: ibcBalance.depositUrlOverride,
        externalWithdrawUrl: ibcBalance.withdrawUrlOverride,
        isUnstable: ibcBalance.isUnstable,
        onSelectToken: launchPreTransferModal,
        onWithdraw: () => {
          transferConfig?.transferAsset(
            "withdraw",
            ibcBalance.chainInfo.chainId,
            coinDenom
          );
          setPreTransferModalProps(null);
        },
        onDeposit: () => {
          transferConfig?.transferAsset(
            "deposit",
            ibcBalance.chainInfo.chainId,
            coinDenom
          );
          setPreTransferModalProps(null);
        },
        onRequestClose: () => setPreTransferModalProps(null),
      });
    },
    [ibcBalances, transferConfig]
  );

  useEffect(() => {
    setUserProperty(
      "osmoBalance",
      Number(
        nativeBalances[0].balance.maxDecimals(6).hideDenom(true).toString()
      )
    );
  }, [nativeBalances, setUserProperty]);

  // set nav bar ctas
  useNavBar({
    ctas: [
      {
        label: t("assets.table.depositButton"),
        onClick: () => {
          transferConfig?.startTransfer("deposit");
          logEvent([EventName.Assets.depositClicked]);
        },
      },
      {
        label: t("assets.table.withdrawButton"),
        onClick: () => {
          transferConfig?.startTransfer("withdraw");
          logEvent([EventName.Assets.withdrawClicked]);
        },
      },
    ],
  });

  const onTableDeposit = useCallback(
    (chainId: string, coinDenom: string, externalDepositUrl?: string) => {
      if (!externalDepositUrl) {
        isMobile
          ? launchPreTransferModal(coinDenom)
          : transferConfig?.transferAsset("deposit", chainId, coinDenom);
      }
    },
    [isMobile, launchPreTransferModal, transferConfig]
  );
  const onTableWithdraw = useCallback(
    (chainId: string, coinDenom: string, externalWithdrawUrl?: string) => {
      if (!externalWithdrawUrl) {
        transferConfig?.transferAsset("withdraw", chainId, coinDenom);
      }
    },
    [transferConfig]
  );

  /** Trigger transfer modal when `transaction_type` and `denom` search params are provided */
  useEffect(() => {
    const transactionType = router.query[TransactionTypeQueryParamKey];
    const denom = router.query[DenomQueryParamKey];

    if (typeof transactionType !== "string" || typeof denom !== "string") {
      return;
    }

    if (transactionType !== "deposit" && transactionType !== "withdraw") {
      console.warn("Invalid transaction type ", transactionType);
      return;
    }

    const asset = unverifiedIbcBalances.find(
      ({ balance }) =>
        balance.currency.coinDenom?.toLowerCase() === denom?.toLowerCase() ||
        balance.currency.coinMinimalDenom?.toLowerCase() ===
          denom?.toLowerCase()
    );

    if (!asset) {
      console.warn(
        `Provided denom ${denom} for transaction type ${transactionType} is not found.}`
      );
      return;
    }

    if (transactionType === "deposit") {
      onTableDeposit(
        asset.chainInfo.chainId,
        asset.balance.denom,
        asset.depositUrlOverride
      );
    } else if (transactionType === "withdraw") {
      onTableWithdraw(
        asset.chainInfo.chainId,
        asset.balance.denom,
        asset.withdrawUrlOverride
      );
    }
    removeQueryParam(TransactionTypeQueryParamKey);
    removeQueryParam(DenomQueryParamKey);
  }, [onTableDeposit, onTableWithdraw, router.query, unverifiedIbcBalances]);

  return (
    <main className="mx-auto flex max-w-container flex-col gap-20 bg-osmoverse-900 p-8 pt-4 md:gap-8 md:p-4">
      {isMobile && preTransferModalProps && (
        <PreTransferModal {...preTransferModalProps} />
      )}
      {transferConfig?.assetSelectModal && (
        <TransferAssetSelectModal {...transferConfig.assetSelectModal} />
      )}
      {transferConfig?.selectAssetSourceModal && (
        <SelectAssetSourceModal {...transferConfig.selectAssetSourceModal} />
      )}
      {transferConfig?.ibcTransferModal && (
        <IbcTransferModal {...transferConfig.ibcTransferModal} />
      )}
      {transferConfig?.bridgeTransferModal &&
        (!flags.multiBridgeProviders ||
        transferConfig?.bridgeTransferModal?.balance.originBridgeInfo // Show V1 for Nomic
          ?.bridge === "nomic" ? (
          <BridgeTransferV1Modal {...transferConfig.bridgeTransferModal} />
        ) : (
          <BridgeTransferV2Modal {...transferConfig.bridgeTransferModal} />
        ))}
      {transferConfig?.fiatRampsModal && (
        <FiatRampsModal
          transakModalProps={{
            onCreateOrder: (data) => {
              logEvent([
                EventName.Assets.buyOsmoStarted,
                {
                  tokenName: data.status.cryptoCurrency,
                  tokenAmount: Number(
                    data.status?.fiatAmountInUsd ?? data.status.cryptoAmount
                  ),
                },
              ]);
            },
            onSuccessfulOrder: (data) => {
              logEvent([
                EventName.Assets.buyOsmoCompleted,
                {
                  tokenName: data.status.cryptoCurrency,
                  tokenAmount: Number(
                    data.status?.fiatAmountInUsd ?? data.status.cryptoAmount
                  ),
                },
              ]);
            },
          }}
          {...transferConfig.fiatRampsModal}
        />
      )}
      <AssetsOverview />

      <AssetsTableV1
        nativeBalances={nativeBalances}
        unverifiedNativeBalances={unverifiedNativeBalances}
        ibcBalances={ibcBalances}
        unverifiedIbcBalances={unverifiedIbcBalances}
        onDeposit={onTableDeposit}
        onWithdraw={onTableWithdraw}
      />
      {!isMobile && <MyPoolsSection />}
    </main>
  );
});

const AssetsOverview: FunctionComponent = observer(() => {
  const { assetsStore, queriesStore, chainStore, priceStore } = useStore();
  const { width } = useWindowSize();
  const { t } = useTranslation();

  const osmosisQueries = queriesStore.get(chainStore.osmosis.chainId).osmosis!;

  const queryAccountsPositions = osmosisQueries.queryAccountsPositions.get(
    assetsStore.address ?? ""
  );

  const totalAssetsValue = priceStore.calculateTotalPrice([
    ...assetsStore.availableBalance,
    ...assetsStore.lockedCoins,
    assetsStore.stakedBalance,
    assetsStore.unstakingBalance,
    ...queryAccountsPositions.totalPositionsAssets,
  ]);
  const availableAssetsValue = priceStore.calculateTotalPrice(
    assetsStore.availableBalance
  );
  const bondedAssetsValue = priceStore.calculateTotalPrice(
    assetsStore.lockedCoins
  );
  const stakedAssetsValue = priceStore.calculateTotalPrice([
    assetsStore.stakedBalance,
    assetsStore.unstakingBalance,
  ]);

  // set up user analytics
  const { setUserProperty } = useAmplitudeAnalytics();
  useEffect(() => {
    if (totalAssetsValue) {
      setUserProperty(
        "totalAssetsPrice",
        Number(totalAssetsValue.trim(true).toDec().toString(2))
      );
    }
    if (availableAssetsValue) {
      setUserProperty(
        "unbondedAssetsPrice",
        Number(availableAssetsValue.trim(true).toDec().toString(2))
      );
    }
    if (bondedAssetsValue) {
      setUserProperty(
        "bondedAssetsPrice",
        Number(bondedAssetsValue.trim(true).toDec().toString(2))
      );
    }
    if (stakedAssetsValue) {
      setUserProperty(
        "stakedOsmoPrice",
        Number(stakedAssetsValue.trim(true).toDec().toString(2))
      );
    }
  }, [
    availableAssetsValue,
    bondedAssetsValue,
    setUserProperty,
    stakedAssetsValue,
    totalAssetsValue,
  ]);

  const format = (price?: PricePretty): string => {
    if (!price) {
      return "0";
    }

    if (width < 1100) {
      return formatPretty(price);
    }
    return price.toString();
  };

  return (
    <div className="flex w-full place-content-between items-center gap-8 overflow-x-auto rounded-3xl bg-osmoverse-1000 px-8 py-9 2xl:gap-4 xl:gap-3 1.5lg:px-4 md:flex-col md:items-start md:gap-3 md:px-5 md:py-5">
      <Metric
        label={t("assets.totalAssets")}
        value={<DesktopOnlyPrivateText text={format(totalAssetsValue)} />}
      />
      <Metric
        label={t("assets.bondedAssets")}
        value={<DesktopOnlyPrivateText text={format(bondedAssetsValue)} />}
      />
      <Metric
        label={t("assets.unbondedAssets")}
        value={<DesktopOnlyPrivateText text={format(availableAssetsValue)} />}
      />
      <Metric
        label={t("assets.stakedAssets")}
        value={<DesktopOnlyPrivateText text={format(stakedAssetsValue)} />}
      />
    </div>
  );
});

const Metric: FunctionComponent<Metric> = ({ label, value }) => (
  <div className="flex shrink-0 flex-col gap-1 md:gap-2">
    <h6 className="md:text-subtitle1 md:font-subtitle1">{label}</h6>
    <h2 className="text-h3 font-h3 text-wosmongton-100 md:text-h4 md:font-h4">
      {value}
    </h2>
  </div>
);
