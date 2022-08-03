import type { NextPage } from "next";
import { observer } from "mobx-react-lite";
import {
  FunctionComponent,
  useState,
  ComponentProps,
  useCallback,
} from "react";
import { IBCCurrency } from "@keplr-wallet/types";
import { WalletStatus } from "@keplr-wallet/stores";
import { ObservableQueryPool } from "@osmosis-labs/stores";
import { useStore } from "../../stores/";
import { Overview } from "../../components/overview";
import { AssetsTable } from "../../components/table/assets-table";
import { DepoolingTable } from "../../components/table/depooling-table";
import { ShowMoreButton } from "../../components/buttons/show-more";
import { PoolCard } from "../../components/cards/";
import { Metric } from "../../components/types";
import { MetricLoader } from "../../components/loaders";
import { IbcTransferModal } from "../../modals/ibc-transfer";
import { BridgeTransferModal } from "../../modals/bridge-transfer";
import { TransferAssetSelectModal } from "../../modals/transfer-asset-select";
import {
  ObservableMetamask,
  ObservableWalletConnect,
} from "../../integrations/ethereum";
import { SourceChainKey } from "../../integrations/bridge-info";
import { Client, WalletKey } from "../../integrations/wallets";
import { useWindowSize } from "../../hooks";
import { makeLocalStorageKVStore } from "../../stores/kv-store";
import { WalletConnectQRModal } from "../../modals";

const INIT_POOL_CARD_COUNT = 6;

const Assets: NextPage = observer(() => {
  const { isMobile } = useWindowSize();
  const {
    assetsStore: { nativeBalances, ibcBalances },
    chainStore: {
      osmosis: { chainId },
    },
    accountStore,
  } = useStore();
  const account = accountStore.getAccount(chainId);

  // bridge transfer modal states
  const [ibcTransferModal, setIbcTransferModal] = useState<ComponentProps<
    typeof IbcTransferModal
  > | null>(null);
  const [bridgeTransferModal, setBridgeTransferModal] = useState<ComponentProps<
    typeof BridgeTransferModal
  > | null>(null);
  const [assetSelectModal, setAssetSelectModal] = useState<ComponentProps<
    typeof TransferAssetSelectModal
  > | null>(null);

  // observable eth client wallets
  const [metamask] = useState(
    () => new ObservableMetamask(makeLocalStorageKVStore("metamask"))
  );
  const [walletConnectEth] = useState(
    () => new ObservableWalletConnect(makeLocalStorageKVStore("wc-eth"))
  );

  /** Aggregate of non-Keplr wallet clients. */
  const ibcTransfer = useCallback(
    (mode: "deposit" | "withdraw", balance: typeof ibcBalances[0]) => {
      const currency = balance.balance.currency;
      // IBC multihop currency
      const modifiedCurrency =
        mode === "deposit" && balance.depositingSrcMinDenom
          ? {
              coinDecimals: currency.coinDecimals,
              coinGeckoId: currency.coinGeckoId,
              coinImageUrl: currency.coinImageUrl,
              coinDenom: currency.coinDenom,
              coinMinimalDenom: "",
              paths: (currency as IBCCurrency).paths.slice(0, 1),
              originChainId: balance.chainInfo.chainId,
              originCurrency: {
                coinDecimals: currency.coinDecimals,
                coinImageUrl: currency.coinImageUrl,
                coinDenom: currency.coinDenom,
                coinMinimalDenom: balance.depositingSrcMinDenom,
              },
            }
          : currency;

      const {
        chainInfo: { chainId: counterpartyChainId },
        sourceChannelId,
        destChannelId,
      } = balance;

      setIbcTransferModal({
        isOpen: true,
        onRequestClose: () => setIbcTransferModal(null),
        currency: modifiedCurrency as IBCCurrency,
        counterpartyChainId: counterpartyChainId,
        sourceChannelId,
        destChannelId,
        isWithdraw: mode === "withdraw",
        ics20ContractAddress:
          "ics20ContractAddress" in balance
            ? balance.ics20ContractAddress
            : undefined,
      });
    },
    [setIbcTransferModal]
  );

  const selectAssetForTransfer = useCallback(
    (
      direction: "deposit" | "withdraw",
      denom: string,
      /** `undefined` if IBC asset. */
      walletKey?: WalletKey,
      /** `undefined` if IBC asset. */
      sourceChainKey?: SourceChainKey
    ) => {
      const assetSelectBal = ibcBalances.find(
        ({ balance }) => balance.currency.coinDenom === denom
      );
      const client = [metamask, walletConnectEth].find(
        ({ key }) => key === walletKey
      ) as Client;
      if (
        assetSelectBal &&
        assetSelectBal.originBridgeInfo &&
        client &&
        walletKey &&
        sourceChainKey
      ) {
        // bridge transfer without initial token known
        setBridgeTransferModal({
          isOpen: true,
          onRequestClose: () => setBridgeTransferModal(null),
          ...assetSelectBal.originBridgeInfo,
          isWithdraw: direction === "withdraw",
          client,
          balance: assetSelectBal,
          sourceChainKey,
        });
      } else if (assetSelectBal) {
        ibcTransfer(direction, assetSelectBal);
      }
      setAssetSelectModal(null);
    },
    [
      ibcBalances,
      metamask,
      walletConnectEth,
      setBridgeTransferModal,
      ibcTransfer,
    ]
  );

  const openTransferModal = useCallback(
    (direction: "deposit" | "withdraw", chainId: string, coinDenom: string) => {
      const balance = ibcBalances.find(
        (bal) =>
          bal.chainInfo.chainId === chainId &&
          bal.balance.currency.coinDenom === coinDenom
      );

      if (!balance) {
        setIbcTransferModal(null);
        setBridgeTransferModal(null);
        console.error(
          "Chain ID and coin denom couldn't be used to find IBC asset"
        );
        return;
      }

      if (balance.originBridgeInfo) {
        // bridge integration
        const walletClients = [metamask, walletConnectEth] as Client[];
        const applicableWallets = walletClients.filter(({ key }) =>
          balance.originBridgeInfo!.wallets.includes(key)
        );
        const dependentConnectedWallet = applicableWallets.find(
          (wallet) => wallet.isConnected
        );

        console.log("chainid", dependentConnectedWallet?.chainId);

        if (
          dependentConnectedWallet &&
          dependentConnectedWallet.chainId &&
          account.walletStatus === WalletStatus.Loaded
        ) {
          setBridgeTransferModal({
            isOpen: true,
            onRequestClose: () => setBridgeTransferModal(null),
            isWithdraw: direction === "withdraw",
            balance,
            client: dependentConnectedWallet,
            // assume selected chain is desired source/dest network
            sourceChainKey: dependentConnectedWallet.chainId as SourceChainKey,
          });
        } else if (applicableWallets.length > 0) {
          setAssetSelectModal({
            isOpen: true,
            isWithdraw: direction === "withdraw",
            onRequestClose: () => setAssetSelectModal(null),
            tokens: ibcBalances.map(({ balance, originBridgeInfo }) => ({
              token: balance,
              originBridgeInfo,
            })),
            initialToken: {
              token: balance.balance.currency,
              originBridgeInfo: balance.originBridgeInfo,
            },
            onSelectAsset: (denom, walletKey, networkKey) =>
              selectAssetForTransfer(direction, denom, walletKey, networkKey),
            walletClients,
          });
        } else {
          console.warn(
            "No nonKeplr wallets found for this bridge asset:",
            balance.balance.currency.coinDenom
          );
        }
      } else {
        ibcTransfer(direction, balance);
      }
    },
    [
      ibcBalances,
      setIbcTransferModal,
      metamask,
      walletConnectEth,
      account.walletStatus,
      ibcTransfer,
      selectAssetForTransfer,
    ]
  );

  /** Always show the asset select modal, giving user opportunity to
   * switch wallets, or transfer the most relevant asset.
   */
  const handleTransferIntent = useCallback(
    (intent: "deposit" | "withdraw") => {
      const walletClients = [metamask, walletConnectEth] as Client[];
      setAssetSelectModal({
        isOpen: true,
        isWithdraw: intent === "withdraw",
        onRequestClose: () => setAssetSelectModal(null),
        tokens: ibcBalances.map(({ balance, originBridgeInfo }) => ({
          token: balance,
          originBridgeInfo,
        })),
        onSelectAsset: (denom, walletKey, networkKey) =>
          selectAssetForTransfer(intent, denom, walletKey, networkKey),
        walletClients,
      });
    },
    [ibcBalances, metamask, walletConnectEth, selectAssetForTransfer]
  );

  return (
    <main className="bg-background">
      <AssetsOverview
        onDepositIntent={() => handleTransferIntent("deposit")}
        onWithdrawIntent={() => handleTransferIntent("withdraw")}
      />
      {assetSelectModal && <TransferAssetSelectModal {...assetSelectModal} />}
      {ibcTransferModal && <IbcTransferModal {...ibcTransferModal} />}
      {bridgeTransferModal && <BridgeTransferModal {...bridgeTransferModal} />}
      {walletConnectEth.sessionConnectUri && (
        <WalletConnectQRModal
          isOpen={true}
          uri={walletConnectEth.sessionConnectUri || ""}
          onRequestClose={() => {}}
        />
      )}
      <AssetsTable
        nativeBalances={nativeBalances}
        ibcBalances={ibcBalances}
        onDeposit={(chainId, coinDenom) =>
          openTransferModal("deposit", chainId, coinDenom)
        }
        onWithdraw={(chainId, coinDenom) =>
          openTransferModal("withdraw", chainId, coinDenom)
        }
      />
      {!isMobile && <PoolAssets />}
      <section className="bg-surface">
        <DepoolingTable
          className="p-10 md:p-5 max-w-container mx-auto"
          tableClassName="md:w-screen md:-mx-5"
        />
      </section>
    </main>
  );
});

const AssetsOverview: FunctionComponent<{
  onWithdrawIntent: () => void;
  onDepositIntent: () => void;
}> = observer(({ onDepositIntent, onWithdrawIntent }) => {
  const { assetsStore } = useStore();
  const { isMobile } = useWindowSize();

  const totalAssetsValue = assetsStore.calcValueOf([
    ...assetsStore.availableBalance,
    ...assetsStore.lockedCoins,
    assetsStore.stakedBalance,
    assetsStore.unstakingBalance,
  ]);
  const availableAssetsValue = assetsStore.calcValueOf(
    assetsStore.availableBalance
  );
  const bondedAssetsValue = assetsStore.calcValueOf(assetsStore.lockedCoins);
  const stakedAssetsValue = assetsStore.calcValueOf([
    assetsStore.stakedBalance,
    assetsStore.unstakingBalance,
  ]);

  return (
    <Overview
      title={isMobile ? "My Osmosis Assets" : <h4>My Osmosis Assets</h4>}
      titleButtons={
        isMobile
          ? undefined
          : [
              {
                label: "Deposit",
                onClick: onDepositIntent,
              },
              {
                label: "Withdraw",
                type: "outline",
                className: "bg-primary-200/30",
                onClick: onWithdrawIntent,
              },
            ]
      }
      primaryOverviewLabels={[
        {
          label: "Total Assets",
          value: totalAssetsValue.toString(),
        },
        {
          label: "Unbonded Assets",
          value: availableAssetsValue.toString(),
        },
        {
          label: "Bonded Assets",
          value: bondedAssetsValue.toString(),
        },
        {
          label: "Staked OSMO",
          value: stakedAssetsValue.toString(),
        },
      ]}
    />
  );
});

const PoolAssets: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore } = useStore();

  const { chainId } = chainStore.osmosis;
  const { bech32Address } = accountStore.getAccount(chainId);
  const ownedPoolIds = queriesStore
    .get(chainId)
    .osmosis!.queryGammPoolShare.getOwnPools(bech32Address);
  const [showAllPools, setShowAllPools] = useState(false);

  if (ownedPoolIds.length === 0) {
    return null;
  }

  return (
    <section className="bg-background">
      <div className="max-w-container mx-auto md:px-4 p-10">
        <h5>My Pools</h5>
        <PoolCards {...{ showAllPools, ownedPoolIds, setShowAllPools }} />
      </div>
    </section>
  );
});

const PoolCards: FunctionComponent<{
  showAllPools: boolean;
  ownedPoolIds: string[];
  setShowAllPools: (show: boolean) => void;
}> = observer(({ showAllPools, ownedPoolIds, setShowAllPools }) => (
  <>
    <div className="my-5 grid grid-cards">
      <PoolCardsDisplayer
        poolIds={
          showAllPools
            ? ownedPoolIds
            : ownedPoolIds.slice(0, INIT_POOL_CARD_COUNT)
        }
      />
    </div>
    {ownedPoolIds.length > INIT_POOL_CARD_COUNT && (
      <ShowMoreButton
        className="m-auto"
        isOn={showAllPools}
        onToggle={() => setShowAllPools(!showAllPools)}
      />
    )}
  </>
));

const PoolCardsDisplayer: FunctionComponent<{ poolIds: string[] }> = observer(
  ({ poolIds }) => {
    const {
      chainStore,
      queriesStore,
      queriesExternalStore,
      priceStore,
      accountStore,
    } = useStore();

    const queriesOsmosis = queriesStore.get(chainStore.osmosis.chainId)
      .osmosis!;
    const { bech32Address } = accountStore.getAccount(
      chainStore.osmosis.chainId
    );

    const pools = poolIds
      .map((poolId) => {
        const pool = queriesOsmosis.queryGammPools.getPool(poolId);

        if (!pool) {
          return undefined;
        }
        const tvl = pool.computeTotalValueLocked(priceStore);
        const shareRatio =
          queriesOsmosis.queryGammPoolShare.getAllGammShareRatio(
            bech32Address,
            pool.id
          );
        const actualShareRatio = shareRatio.moveDecimalPointLeft(2);

        const lockedShareRatio =
          queriesOsmosis.queryGammPoolShare.getLockedGammShareRatio(
            bech32Address,
            pool.id
          );
        const actualLockedShareRatio =
          lockedShareRatio.moveDecimalPointRight(2);

        return [
          pool,
          [
            queriesOsmosis.queryIncentivizedPools.isIncentivized(poolId)
              ? {
                  label: "APR",
                  value: (
                    <MetricLoader
                      isLoading={
                        queriesOsmosis.queryIncentivizedPools.isAprFetching
                      }
                    >
                      {queriesOsmosis.queryIncentivizedPools
                        .computeMostAPY(poolId, priceStore)
                        .maxDecimals(2)
                        .toString()}
                    </MetricLoader>
                  ),
                }
              : {
                  label: "Fee APY",
                  value: (() => {
                    const queriesExternal = queriesExternalStore.get();
                    const poolWithFeeMetrics =
                      queriesExternal.queryGammPoolFeeMetrics.makePoolWithFeeMetrics(
                        pool,
                        priceStore
                      );
                    return queriesExternal.queryGammPoolFeeMetrics.get7dPoolFeeApy(
                      poolWithFeeMetrics,
                      priceStore
                    );
                  })()
                    .maxDecimals(2)
                    .toString(),
                },
            {
              label: "Pool Liquidity",
              value: pool.computeTotalValueLocked(priceStore).toString(),
            },
            queriesOsmosis.queryIncentivizedPools.isIncentivized(poolId)
              ? {
                  label: "Bonded",
                  value: tvl.mul(actualLockedShareRatio).toString(),
                }
              : {
                  label: "My Liquidity",
                  value: tvl
                    .mul(actualShareRatio)
                    .moveDecimalPointRight(2)
                    .toString(),
                },
          ],
        ] as [ObservableQueryPool, Metric[]];
      })
      .filter((p): p is [ObservableQueryPool, Metric[]] => p !== undefined);

    return (
      <>
        {pools.map(([pool, metrics]) => (
          <PoolCard
            key={pool.id}
            poolId={pool.id}
            poolAssets={pool.poolAssets.map((asset) => asset.amount.currency)}
            poolMetrics={metrics}
            isSuperfluid={queriesOsmosis.querySuperfluidPools.isSuperfluidPool(
              pool.id
            )}
          />
        ))}
      </>
    );
  }
);

export default Assets;
