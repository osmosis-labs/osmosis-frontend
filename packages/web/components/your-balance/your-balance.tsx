import { CoinPretty, Dec, IntPretty } from "@keplr-wallet/unit";
import {
  ObservableConcentratedPoolDetail,
  ObservableQueryPool,
  ObservableSharePoolDetail,
} from "@osmosis-labs/stores";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import Link from "next/link";
import { ComponentProps } from "react";
import { useState } from "react";
import { useCallback } from "react";
import { ReactElement, useMemo } from "react";

import { CreditCardIcon } from "~/components/assets/credit-card-icon";
import { Button } from "~/components/buttons";
import SkeletonLoader from "~/components/skeleton-loader";
import { EventName } from "~/config";
import { ChainList } from "~/config/generated/chain-list";
import {
  useAmplitudeAnalytics,
  useCurrentLanguage,
  useDisclosure,
  useFakeFeeConfig,
  useFeatureFlags,
  useHideDustUserSetting,
  useStakedAmountConfig,
  useTransferConfig,
  useTranslation,
  useWalletSelect,
  useWindowSize,
} from "~/hooks";
import {
  BridgeTransferV1Modal,
  BridgeTransferV2Modal,
  FiatOnrampSelectionModal,
  IbcTransferModal,
  PreTransferModal,
  SelectAssetSourceModal,
  TransferAssetSelectModal,
} from "~/modals";
import { TokenCMSData } from "~/server/queries/external";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";
import { api } from "~/utils/trpc";

interface YourBalanceProps {
  denom: string;
  tokenDetailsByLanguage?: {
    [key: string]: TokenCMSData;
  } | null;
  className?: string;
}

const YourBalance = observer(
  ({ denom, tokenDetailsByLanguage, className }: YourBalanceProps) => {
    const {
      queriesStore,
      chainStore,
      accountStore,
      derivedDataStore,
      priceStore,
    } = useStore();
    const featureFlags = useFeatureFlags();
    const { t } = useTranslation();
    const language = useCurrentLanguage();
    const osmosisChainId = chainStore.osmosis.chainId;
    const account = accountStore.getWallet(osmosisChainId);
    const address = account?.address ?? "";
    const osmo = chainStore.osmosis.stakeCurrency;
    const isOsmo = useMemo(
      () =>
        denom.toLowerCase() ===
        chainStore.osmosis.stakeCurrency.coinDenom.toLowerCase(),
      [chainStore.osmosis.stakeCurrency.coinDenom, denom]
    );

    const feeConfig = useFakeFeeConfig(
      chainStore,
      osmosisChainId,
      account?.osmosis.msgOpts.delegateToValidatorSet.gas || 0
    );

    const { data } = api.edge.assets.getAssetInfo.useQuery({
      findMinDenomOrSymbol: denom,
      userOsmoAddress: account?.address,
    });

    const chain = useMemo(
      () =>
        ChainList.find((chain) =>
          chain.keplrChain.currencies.find(
            (currency) => currency.coinDenom === denom.toUpperCase()
          )
        ),
      [denom]
    );

    const inflationApr = chain
      ? queriesStore.get(chain.chain_id).cosmos.queryInflation.inflation
      : new IntPretty(0);

    const details = useMemo(() => {
      return tokenDetailsByLanguage
        ? tokenDetailsByLanguage[language]
        : undefined;
    }, [language, tokenDetailsByLanguage]);

    const { logEvent } = useAmplitudeAnalytics();

    const { balance } = useStakedAmountConfig(
      chainStore,
      queriesStore,
      osmosisChainId,
      address,
      feeConfig,
      osmo
    );

    const hasStakingBalance = useMemo(
      () => isOsmo && balance.toDec().gt(new Dec(0)),
      [balance, isOsmo]
    );

    const currency = useMemo(() => {
      const currencies = ChainList.map(
        (info) => info.keplrChain.currencies
      ).reduce((a, b) => [...a, ...b]);

      const currency = currencies.find(
        (el) => el.coinDenom.toUpperCase() === denom.toUpperCase()
      );

      return currency;
    }, [denom]);

    const queryOsmosis = queriesStore.get(chainStore.osmosis.chainId).osmosis!;

    const myPoolIds = queryOsmosis.queryGammPoolShare.getOwnPools(
      account?.address ?? ""
    );

    const myPoolDetails = myPoolIds
      .map<
        | {
            queryPool: ObservableQueryPool;
            poolDetail:
              | ObservableSharePoolDetail
              | ObservableConcentratedPoolDetail;
          }
        | undefined
      >((myPoolId) => {
        const queryPool = queryOsmosis.queryPools.getPool(myPoolId);

        if (!queryPool) return undefined;

        return {
          queryPool,
          poolDetail:
            queryPool.type === "concentrated"
              ? derivedDataStore.concentratedPoolDetails.get(myPoolId)
              : derivedDataStore.sharePoolDetails.get(myPoolId),
        };
      })
      .filter(
        (
          pool
        ): pool is {
          queryPool: ObservableQueryPool;
          poolDetail:
            | ObservableSharePoolDetail
            | ObservableConcentratedPoolDetail;
        } => {
          if (pool === undefined) return false;

          // concentrated liquidity liquidity feature flag
          if (
            !featureFlags.concentratedLiquidity &&
            pool.poolDetail instanceof ObservableConcentratedPoolDetail
          )
            return false;

          return true;
        }
      );

    const dustFilteredPools = useHideDustUserSetting(
      myPoolDetails,
      useCallback(
        (myPool) => {
          const pool = myPool.poolDetail;
          // user share value
          if (pool instanceof ObservableSharePoolDetail) {
            return pool.totalValueLocked.mul(
              queryOsmosis.queryGammPoolShare.getAllGammShareRatio(
                account?.address ?? "",
                (pool as ObservableSharePoolDetail).querySharePool!.pool.id
              )
            );
          }
          // user positions' assets value
          if (pool instanceof ObservableConcentratedPoolDetail) {
            return priceStore.calculateTotalPrice(
              pool.userPoolAssets.map(({ asset }) => asset)
            );
          }
        },
        [queryOsmosis, account, priceStore]
      )
    ).filter((pool) =>
      pool.queryPool.poolAssetDenoms.includes(currency?.base ?? "")
    );

    const assetPoolBalance = useMemo(() => {
      if (!currency) {
        return undefined;
      }

      return dustFilteredPools.reduce((total, nextPool) => {
        const userPool = nextPool.poolDetail.userPoolAssets.find(
          ({ asset }) => asset.currency.coinDenom === denom
        );

        if (userPool) {
          return userPool.asset.add(total);
        }

        return total;
      }, new CoinPretty(currency, 0));
    }, [currency, denom, dustFilteredPools]);

    const fiatAssetPoolBalance = useMemo(() => {
      return data?.currentPrice?.mul(assetPoolBalance ?? new Dec(0));
    }, [assetPoolBalance, data?.currentPrice]);

    return (
      <section
        className={`${className} flex flex-col items-start gap-12 self-stretch rounded-5xl bg-osmoverse-850 p-8`}
      >
        <BalanceStats
          denom={denom}
          tokenDetailsByLanguage={tokenDetailsByLanguage}
        />
        <div className="flex flex-col gap-6 self-stretch">
          <header>
            <h6 className="text-lg font-h6 leading-6 tracking-wide">
              {t("tokenInfos.earnWith", { denom })}
            </h6>
          </header>
          <div className="flex gap-6 self-stretch 1.5md:flex-col md:flex-row sm:flex-col">
            {details?.stakingURL && (
              <Link
                href={isOsmo ? "/stake" : details?.stakingURL}
                target="_blank"
                className="flex flex-[0.5]"
                passHref
                onClick={() =>
                  logEvent([
                    EventName.TokenInfo.cardClicked,
                    { tokenName: denom, title: "Stake" },
                  ])
                }
              >
                <ActionButton
                  title={
                    hasStakingBalance
                      ? t("tokenInfos.staking")
                      : t("menu.stake")
                  }
                  largeTitle={
                    hasStakingBalance
                      ? formatPretty(
                          data?.currentPrice?.mul(balance) || balance
                        )
                      : undefined
                  }
                  shrinkTitle={!Boolean(data?.currentPrice)}
                  sub={
                    hasStakingBalance
                      ? formatPretty(balance)
                      : inflationApr.toDec().isZero()
                      ? t("tokenInfos.stakeYourDenomToEarnNoAPR", { denom })
                      : t("tokenInfos.stakeYourDenomToEarn", {
                          denom,
                          apr: inflationApr.maxDecimals(1).toString(),
                        })
                  }
                  image={
                    <Image
                      src={"/images/staking-apr-full.svg"}
                      alt={`Stake image`}
                      className={`-rotate-[75deg] overflow-visible object-cover 2xl:object-contain`}
                      width={224}
                      height={140}
                    />
                  }
                />
              </Link>
            )}
            <Link
              href="/pools"
              passHref
              className="flex flex-[0.5]"
              onClick={() =>
                logEvent([
                  EventName.TokenInfo.cardClicked,
                  { tokenName: denom, title: "Explore Pools" },
                ])
              }
            >
              <ActionButton
                title={
                  dustFilteredPools.length > 0
                    ? t("tokenInfos.liquidityInOSMOPools", {
                        number: dustFilteredPools.length.toString(),
                        denom,
                      })
                    : t("tokenInfos.explorePools")
                }
                largeTitle={
                  dustFilteredPools.length > 0
                    ? formatPretty(
                        fiatAssetPoolBalance ?? assetPoolBalance ?? new Dec(0)
                      )
                    : undefined
                }
                shrinkTitle={!Boolean(data?.currentPrice)}
                sub={
                  dustFilteredPools.length > 0 && assetPoolBalance
                    ? formatPretty(assetPoolBalance)
                    : t("tokenInfos.provideLiquidity")
                }
                image={
                  <Image
                    src={"/images/explore-pools.svg"}
                    alt={`Explore pools image`}
                    className={`overflow-visible object-cover 2xl:object-contain`}
                    width={189}
                    height={126}
                  />
                }
                needsPadding
              />
            </Link>
          </div>
        </div>
      </section>
    );
  }
);

export default YourBalance;

interface ActionButtonProps {
  title: string;
  sub: string;
  image: ReactElement;
  needsPadding?: boolean;
  largeTitle?: string;
  shrinkTitle?: boolean;
}

const ActionButton = ({
  title,
  sub,
  image,
  needsPadding,
  largeTitle,
  shrinkTitle,
}: ActionButtonProps) => {
  return (
    <div
      className={`relative flex flex-1 flex-row justify-between overflow-hidden rounded-[20px] bg-yourBalanceActionButton 2xl:items-center 2xl:pl-10 xs:pl-6`}
    >
      <div className="relative z-10 flex flex-col gap-1.5 py-9 pl-10 2xl:pl-0">
        {largeTitle && <p className="font-subtitle1">{title}</p>}
        {largeTitle ? (
          <h4
            className={classNames("text-osmoverse-100", {
              "text-h5 font-h5": shrinkTitle,
            })}
          >
            {largeTitle}
          </h4>
        ) : (
          <h6 className="text-osmoverse-100">{title}</h6>
        )}
        {!shrinkTitle && (
          <p className="max-w-[165px] text-sm font-body2 font-medium leading-5 tracking-[0.25px] text-osmoverse-200">
            {sub}
          </p>
        )}
      </div>
      <div
        className={`z-0 flex h-full overflow-hidden 2xl:absolute 2xl:bottom-0 2xl:right-0 2xl:translate-x-20 2xl:translate-y-6 ${
          needsPadding ? "mt-auto pr-5 2xl:pr-0" : ""
        }`}
      >
        {image}
      </div>
    </div>
  );
};

const BalanceStats = observer((props: YourBalanceProps) => {
  const { denom } = props;

  const [preTransferModalProps, setPreTransferModalProps] =
    useState<ComponentProps<typeof PreTransferModal> | null>(null);
  const { t } = useTranslation();
  const transferConfig = useTransferConfig();
  const featureFlags = useFeatureFlags();
  const { isMobile } = useWindowSize();
  const { chainStore, accountStore, assetsStore } = useStore();
  const { logEvent } = useAmplitudeAnalytics();
  const { onOpenWalletSelect } = useWalletSelect();
  const {
    isOpen: isFiatOnrampSelectionOpen,
    onOpen: onOpenFiatOnrampSelection,
    onClose: onCloseFiatOnrampSelection,
  } = useDisclosure();

  const { ibcBalances } = assetsStore;
  const account = accountStore.getWallet(chainStore.osmosis.chainId);
  const tokenChain = chainStore.getChainFromCurrency(denom);
  const chainName = tokenChain?.chainName;

  const { data, isLoading: isCoinDataLoading } =
    api.edge.assets.getAssetInfo.useQuery({
      findMinDenomOrSymbol: denom,
      userOsmoAddress: account?.address,
    });

  const isOsmosis = useMemo(
    () =>
      denom.toLowerCase() ===
      chainStore.osmosis.stakeCurrency.coinDenom.toLowerCase(),
    [chainStore.osmosis.stakeCurrency.coinDenom, denom]
  );

  const isNativeAsset = useMemo(
    () => tokenChain?.chainId === chainStore.osmosis.chainId,
    [chainStore.osmosis.chainId, tokenChain?.chainId]
  );

  const ibcBalance = useMemo(
    () =>
      ibcBalances.find(
        (ibcBalance) =>
          ibcBalance.balance.denom.toLowerCase() === denom.toLowerCase()
      ),
    [ibcBalances, denom]
  );

  const isChainSupported = Boolean(
    accountStore.connectedWalletSupportsChain(tokenChain?.chainId ?? "")
      ?.value ?? true
  );

  const isDepositSupported =
    (isChainSupported && ibcBalance?.isVerified) ||
    Boolean(ibcBalance?.depositUrlOverride);
  const isWithdrawSupported =
    (isChainSupported && ibcBalance?.isVerified) ||
    Boolean(ibcBalance?.withdrawUrlOverride);

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

  const onDeposit = useCallback(
    (chainId: string, coinDenom: string, externalDepositUrl?: string) => {
      if (!externalDepositUrl) {
        isMobile
          ? launchPreTransferModal(coinDenom)
          : transferConfig?.transferAsset("deposit", chainId, coinDenom);
      }
    },
    [isMobile, launchPreTransferModal, transferConfig]
  );

  const onWithdraw = useCallback(
    (chainId: string, coinDenom: string, externalWithdrawUrl?: string) => {
      if (!externalWithdrawUrl) {
        transferConfig?.transferAsset("withdraw", chainId, coinDenom);
      }
    },
    [transferConfig]
  );

  return (
    <div className="flex items-stretch justify-between gap-12 self-stretch 1.5xl:flex-col 1.5xl:gap-6 xl:flex-row 1.5md:flex-col">
      <div
        className={classNames("flex flex-col items-start", {
          "gap-3": account?.isWalletConnected,
        })}
      >
        <h6 className="text-subtitle1 font-subtitle1 leading-6">
          {t("tokenInfos.yourBalance")}
        </h6>
        {account?.isWalletConnected ? (
          <SkeletonLoader isLoaded={!isCoinDataLoading}>
            <div className="flex flex-col items-start gap-1">
              {data?.currentPrice && data.amount ? (
                <>
                  <h4 className="text-h4 font-h4 leading-9 text-osmoverse-100">
                    {formatPretty(data.currentPrice.mul(data.amount))}
                  </h4>
                  <p className="text-subtitle1 font-subtitle1 leading-6 text-osmoverse-300">
                    {data?.amount ? formatPretty(data?.amount) : `0 ${denom}`}
                  </p>
                </>
              ) : (
                <h4 className="text-h4 font-h4 leading-9 text-osmoverse-100">
                  {data?.amount ? formatPretty(data?.amount) : `0 ${denom}`}
                </h4>
              )}
            </div>
          </SkeletonLoader>
        ) : (
          <button
            onClick={() => onOpenWalletSelect(chainName!)}
            className="text-subtitle1 font-subtitle1 leading-6 text-wosmongton-300 transition-colors duration-200 ease-in-out hover:text-wosmongton-200"
          >
            {t("connectWallet")}
          </button>
        )}
      </div>
      <div className="flex flex-nowrap items-start gap-3 sm:flex-wrap">
        {!isNativeAsset ? (
          <>
            {ibcBalance?.depositUrlOverride ? (
              <Link href={ibcBalance.depositUrlOverride} target="_blank">
                <Button
                  size="sm"
                  className="!px-10 !text-base"
                  disabled={
                    !isDepositSupported || Boolean(ibcBalance?.isUnstable)
                  }
                >
                  {t("assets.historyTable.colums.deposit")}
                </Button>
              </Link>
            ) : (
              <Button
                size="sm"
                className="!px-10 !text-base"
                disabled={
                  !tokenChain?.chainId ||
                  !isDepositSupported ||
                  Boolean(ibcBalance?.isUnstable)
                }
                onClick={() => {
                  if (tokenChain?.chainId) {
                    onDeposit(
                      tokenChain.chainId,
                      denom,
                      ibcBalance?.depositUrlOverride
                    );
                  }
                }}
              >
                {t("assets.historyTable.colums.deposit")}
              </Button>
            )}
            {ibcBalance?.withdrawUrlOverride ? (
              <Link href={ibcBalance.withdrawUrlOverride} target="_blank">
                <Button
                  size="sm"
                  className="!px-10 !text-base"
                  mode="secondary"
                  disabled={
                    !isWithdrawSupported || Boolean(ibcBalance?.isUnstable)
                  }
                >
                  {t("assets.historyTable.colums.withdraw")}
                </Button>
              </Link>
            ) : (
              <Button
                size="sm"
                className="!px-10 !text-base"
                disabled={
                  !tokenChain?.chainId ||
                  !isWithdrawSupported ||
                  Boolean(ibcBalance?.isUnstable)
                }
                mode="secondary"
                onClick={() => {
                  if (tokenChain?.chainId) {
                    onWithdraw(
                      tokenChain.chainId,
                      denom,
                      ibcBalance?.withdrawUrlOverride
                    );
                  }
                }}
              >
                {t("assets.historyTable.colums.withdraw")}
              </Button>
            )}
          </>
        ) : (
          false
        )}
        {isOsmosis ? (
          <Button
            mode={"unstyled"}
            onClick={onOpenFiatOnrampSelection}
            className="subtitle1 group flex items-center gap-2.5 rounded-lg border-2 border-osmoverse-500 bg-osmoverse-700 py-1.5 px-3.5 hover:border-transparent hover:bg-gradient-positive hover:bg-origin-border hover:text-black hover:shadow-[0px_0px_30px_4px_rgba(57,255,219,0.2)] 1.5xs:self-start"
          >
            <CreditCardIcon
              isAnimated
              classes={{
                backCard: "group-hover:stroke-[2]",
                frontCard: "group-hover:fill-[#71B5EB] group-hover:stroke-[2]",
              }}
            />
            <span className="whitespace-nowrap">
              {t("tokenInfos.buyToken", { coinDenom: denom })}
            </span>
          </Button>
        ) : null}
      </div>
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
        (!featureFlags.multiBridgeProviders ||
        transferConfig?.bridgeTransferModal?.balance.originBridgeInfo // Show V1 for Nomic
          ?.bridge === "nomic" ? (
          <BridgeTransferV1Modal {...transferConfig.bridgeTransferModal} />
        ) : (
          <BridgeTransferV2Modal {...transferConfig.bridgeTransferModal} />
        ))}
      <FiatOnrampSelectionModal
        isOpen={isFiatOnrampSelectionOpen}
        onRequestClose={onCloseFiatOnrampSelection}
        onSelectRamp={(ramp) => {
          if (ramp !== "transak") return;
          const fiatValue = data?.usdValue;
          const coinValue = data?.amount;

          logEvent([
            EventName.ProfileModal.buyTokensClicked,
            {
              tokenName: denom,
              tokenAmount: Number(
                (fiatValue ?? coinValue)?.maxDecimals(4).toString()
              ),
            },
          ]);
        }}
      />
    </div>
  );
});
