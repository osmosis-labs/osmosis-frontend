import { Dec, DecUtils } from "@osmosis-labs/unit";
import { observer } from "mobx-react-lite";
import type { NextPage } from "next";
import { NextSeo } from "next-seo";
import { useCallback, useState } from "react";

import { AllPoolsTable } from "~/components/complex/all-pools-table";
import { MyPoolsCardsGrid } from "~/components/complex/my-pools-card-grid";
import { MyPositionsSection } from "~/components/complex/my-positions-section";
import { PoolType } from "~/components/complex/pools-table";
import { EventName } from "~/config";
import {
  useAmplitudeAnalytics,
  useCreatePoolConfig,
  useDimension,
  useTranslation,
  useWalletSelect,
} from "~/hooks";
import { AddLiquidityModal, CreatePoolModal } from "~/modals";
import { useStore } from "~/stores";

const Pools: NextPage = observer(function () {
  const { chainStore, accountStore, queriesStore } = useStore();
  const { t } = useTranslation();
  useAmplitudeAnalytics({
    onLoadEvent: [EventName.Pools.pageViewed],
  });

  const { chainId } = chainStore.osmosis;
  const account = accountStore.getWallet(accountStore.osmosisChainId);
  const { onOpenWalletSelect } = useWalletSelect();

  const [myPoolsRef, { height: myPoolsHeight }] =
    useDimension<HTMLDivElement>();

  const [myPositionsRef, { height: myPositionsHeight }] =
    useDimension<HTMLDivElement>();

  // create pool dialog
  const [isCreatingPool, setIsCreatingPool] = useState(false);
  const openCreatePool = useCallback(() => {
    if (!account?.address) {
      onOpenWalletSelect({
        walletOptions: [{ walletType: "cosmos", chainId }],
        // Auto-open the create-pool modal once the wallet connects, so a
        // disconnected user who clicks Create Pool doesn't have to click again.
        onConnect: () => setIsCreatingPool(true),
      });
      return;
    }
    setIsCreatingPool(true);
  }, [account?.address, chainId, onOpenWalletSelect]);
  const closeCreatePool = useCallback(() => setIsCreatingPool(false), []);

  const createPoolConfig = useCreatePoolConfig(
    chainStore,
    chainId,
    account?.address ?? "",
    queriesStore
  );

  // pool quick action modals
  const [addLiquidityModalPool, setAddLiquidityModalPool] = useState<{
    id: string;
    /** Known pool type, when available, to render the correct add-liquidity UI without waiting on a refetch. */
    type?: PoolType;
  } | null>(null);

  const quickActionProps = {
    quickAddLiquidity: useCallback(
      (poolId: string, poolType: PoolType) =>
        setAddLiquidityModalPool({ id: poolId, type: poolType }),
      []
    ),
  };

  const onCreatePool = useCallback(async () => {
    try {
      if (createPoolConfig.poolType === "weighted") {
        await account?.osmosis.sendCreateBalancerPoolMsg(
          createPoolConfig.swapFee,
          createPoolConfig.assets.map((asset) => {
            if (!asset.percentage)
              throw new Error(
                "Pool config with poolType of weighted doesn't include asset percentage"
              );

            return {
              weight: new Dec(asset.percentage)
                .mul(DecUtils.getTenExponentNInPrecisionRange(4))
                .truncate()
                .toString(),
              token: {
                amount: asset.amountConfig.amount,
                currency: asset.amountConfig.sendCurrency,
              },
            };
          }),
          undefined,
          () => {
            setIsCreatingPool(false);
          }
        );
      } else if (createPoolConfig.poolType === "stable") {
        const scalingFactorController =
          createPoolConfig.scalingFactorControllerAddress
            ? createPoolConfig.scalingFactorControllerAddress
            : undefined;
        await account?.osmosis.sendCreateStableswapPoolMsg(
          createPoolConfig.swapFee,
          createPoolConfig.assets.map((asset) => {
            if (!asset.scalingFactor)
              throw new Error(
                "Pool config with poolType of stable doesn't include scaling factors"
              );

            return {
              scalingFactor: asset.scalingFactor,
              token: {
                amount: asset.amountConfig.amount,
                currency: asset.amountConfig.sendCurrency,
              },
            };
          }),
          scalingFactorController,
          undefined,
          () => {
            setIsCreatingPool(false);
          }
        );
      }
    } catch (e) {
      setIsCreatingPool(false);
      console.error(e);
    }
  }, [createPoolConfig, account]);

  return (
    <main className="m-auto max-w-container px-8 pt-8 md:px-3 md:pt-4">
      <NextSeo
        title={t("seo.pools.title")}
        description={t("seo.pools.description")}
      />
      <CreatePoolModal
        isOpen={isCreatingPool}
        onRequestClose={closeCreatePool}
        title={t("pools.createPool.title")}
        createPoolConfig={createPoolConfig}
        isSendingMsg={account?.txTypeInProgress !== ""}
        onCreatePool={onCreatePool}
        onUseExistingPool={useCallback((poolId: string) => {
          setIsCreatingPool(false);
          setAddLiquidityModalPool({ id: poolId });
        }, [])}
      />
      {addLiquidityModalPool && (
        <AddLiquidityModal
          title={t("addLiquidity.titleInPool", {
            poolId: addLiquidityModalPool.id,
          })}
          poolId={addLiquidityModalPool.id}
          poolType={addLiquidityModalPool.type}
          isOpen={true}
          onRequestClose={() => setAddLiquidityModalPool(null)}
        />
      )}
      {account?.address && (
        <>
          <section className="pb-[3.75rem]" ref={myPositionsRef}>
            <h5>{t("clPositions.yourPositions")}</h5>
            <MyPositionsSection />
          </section>
          <section className="pb-[3.75rem]" ref={myPoolsRef}>
            <h5 className="md:px-3">{t("pools.myPools")}</h5>
            <MyPoolsCardsGrid />
          </section>
        </>
      )}
      <section>
        <AllPoolsTable
          topOffset={account?.address ? myPositionsHeight + myPoolsHeight : 0}
          onCreatePool={openCreatePool}
          {...quickActionProps}
        />
      </section>
    </main>
  );
});

export default Pools;
