import type { NextPage } from "next";
import { observer } from "mobx-react-lite";
import {
  FunctionComponent,
  useState,
  ComponentProps,
  useCallback,
} from "react";
import { IBCCurrency } from "@keplr-wallet/types";
import { ObservablePool } from "@osmosis-labs/stores";
import { useStore } from "../../stores/";
import { Overview } from "../../components/overview";
import { AssetsTable } from "../../components/table/assets-table";
import { ShowMoreButton } from "../../components/buttons/show-more";
import { PoolCard } from "../../components/cards/";
import { PoolMetric } from "../../components/cards/types";
import { IbcTransferModal } from "../../modals/ibc-transfer";

const INIT_POOL_CARD_COUNT = 6;

const Assets: NextPage = observer(() => (
  <main>
    <AssetsOverview />
    <PoolAssets />
    <ChainAssets />
  </main>
));

const AssetsOverview: FunctionComponent = observer(() => {
  const { assetsStore } = useStore();

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
      title={<h4>My Osmosis Assets</h4>}
      primaryOverviewLabels={[
        {
          label: "Total Assets",
          value: totalAssetsValue.toString(),
        },
        {
          label: "Available Assets",
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
  const { chainStore, accountStore, queriesOsmosisStore } = useStore();
  const { chainId } = chainStore.osmosis;
  const { bech32Address } = accountStore.getAccount(chainId);
  let ownedPoolIds = queriesOsmosisStore
    .get(chainId)
    .queryGammPoolShare.getOwnPools(bech32Address);
  const [showAllPools, setShowAllPools] = useState(() => false);

  return (
    <section className="bg-background">
      <div className="max-w-container mx-auto px-10 py-5">
        <h5>My Pools</h5>
        <PoolCards {...{ showAllPools, ownedPoolIds, setShowAllPools }} />
      </div>
    </section>
  );
});

const ChainAssets: FunctionComponent = observer(() => {
  const {
    assetsStore: { nativeBalances, ibcBalances },
  } = useStore();
  const [transferModal, setTransferModal] = useState<ComponentProps<
    typeof IbcTransferModal
  > | null>(null);

  const openTransferModal = useCallback(
    (mode: "deposit" | "withdraw", chainId: string) => {
      const balance = ibcBalances.find(
        (bal) => bal.chainInfo.chainId === chainId
      );

      if (!balance) {
        setTransferModal(null);
        return;
      }

      const {
        balance: { currency },
        chainInfo: { chainId: counterpartyChainId },
        sourceChannelId,
        destChannelId,
      } = balance;

      setTransferModal({
        isOpen: true,
        onRequestClose: () => setTransferModal(null),
        currency: currency as IBCCurrency,
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
    [ibcBalances, setTransferModal]
  );

  return (
    <>
      {transferModal && <IbcTransferModal {...transferModal} />}
      <AssetsTable
        nativeBalances={nativeBalances}
        ibcBalances={ibcBalances}
        onDeposit={(chainId) => openTransferModal("deposit", chainId)}
        onWithdraw={(chainId) => openTransferModal("withdraw", chainId)}
      />
    </>
  );
});

const PoolCards: FunctionComponent<{
  showAllPools: boolean;
  ownedPoolIds: string[];
  setShowAllPools: (show: boolean) => void;
}> = observer(({ showAllPools, ownedPoolIds, setShowAllPools }) => (
  <>
    <div className="grid gap-10 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 py-5 justify-items-center">
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
    const { chainStore, queriesOsmosisStore, priceStore, accountStore } =
      useStore();
    const queriesOsmosis = queriesOsmosisStore.get(chainStore.osmosis.chainId);
    const { bech32Address } = accountStore.getAccount(
      chainStore.osmosis.chainId
    );

    const pools = poolIds
      .map((poolId) => {
        const pool = queriesOsmosis.queryGammPools.getPool(poolId);

        if (!pool) {
          return undefined;
        }
        const fiatCurrency = priceStore.getFiatCurrency("usd")!;
        const tvl = pool.computeTotalValueLocked(priceStore, fiatCurrency);
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
        const actualLockedShareRatio = lockedShareRatio.moveDecimalPointLeft(2);

        return [
          pool,
          [
            queriesOsmosis.queryIncentivizedPools.isIncentivized(poolId)
              ? {
                  label: "APR",
                  value: `${queriesOsmosis.queryIncentivizedPools
                    .computeMostAPY(poolId, priceStore, fiatCurrency)
                    .toString()}%`,
                  isLoading:
                    queriesOsmosis.queryIncentivizedPools.isAprFetching,
                }
              : {
                  label: "Fee APR",
                  value: "",
                },
            {
              label: "Pool Liquidity",
              value: pool
                .computeTotalValueLocked(priceStore, fiatCurrency)
                .toString(),
            },
            queriesOsmosis.queryIncentivizedPools.isIncentivized(poolId)
              ? {
                  label: "Bonded",
                  value: tvl.mul(actualLockedShareRatio).toString(),
                }
              : {
                  label: "My Liquidity",
                  value: tvl.mul(actualShareRatio).toString(),
                },
          ],
        ] as [ObservablePool, PoolMetric[]];
      })
      .filter((p): p is [ObservablePool, PoolMetric[]] => p !== undefined);

    return (
      <>
        {pools.map(([pool, metrics]) => (
          <PoolCard key={pool.id} pool={pool} poolMetrics={metrics} />
        ))}
      </>
    );
  }
);

export default Assets;
