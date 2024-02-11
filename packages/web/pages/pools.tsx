import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { Duration } from "dayjs/plugin/duration";
import { observer } from "mobx-react-lite";
import type { NextPage } from "next";
import { NextSeo } from "next-seo";
import { ComponentProps, useCallback, useState } from "react";

import { MyPoolsSection } from "~/components/complex";
import { AllPoolsTable as AllPoolsTableV1 } from "~/components/complex/all-pools-table-v1";
import { AllPoolsTable as AllPoolsTableV2 } from "~/components/complex/all-pools-table-v2";
import { MyPositionsSection } from "~/components/complex/my-positions-section";
import { SuperchargePool } from "~/components/funnels/concentrated-liquidity/supercharge-pool";
import { ConvertToStakeAd } from "~/components/funnels/convert-to-stake/convert-to-stake-ad";
import { PoolsOverview } from "~/components/overview/pools";
import { EventName } from "~/config";
import { useTranslation } from "~/hooks";
import {
  useAmplitudeAnalytics,
  useCreatePoolConfig,
  useDimension,
  useDisclosure,
  useLockTokenConfig,
  useSuperfluidPool,
  useWindowSize,
} from "~/hooks";
import { useConvertToStakeConfig } from "~/hooks/ui-config/use-convert-to-stake-config";
import { useFeatureFlags } from "~/hooks/use-feature-flags";
import {
  AddLiquidityModal,
  CreatePoolModal,
  LockTokensModal,
  RemoveLiquidityModal,
  SuperfluidValidatorModal,
} from "~/modals";
import { ConcentratedLiquidityLearnMoreModal } from "~/modals/concentrated-liquidity-intro";
import { ConvertToStakeModal } from "~/modals/convert-to-stake";
import { UserUpgradesModal } from "~/modals/user-upgrades";
import { useStore } from "~/stores";

const Pools: NextPage = observer(function () {
  const { chainStore, accountStore, queriesStore, userUpgrades } = useStore();
  const { t } = useTranslation();
  useAmplitudeAnalytics({
    onLoadEvent: [EventName.Pools.pageViewed],
  });

  const { chainId } = chainStore.osmosis;
  const queryOsmosis = queriesStore.get(chainId).osmosis!;
  const account = accountStore.getWallet(chainId);

  const [poolsOverviewRef, { height: poolsOverviewHeight }] =
    useDimension<HTMLDivElement>();

  const [myPoolsRef, { height: myPoolsHeight }] =
    useDimension<HTMLDivElement>();

  const [myPositionsRef, { height: myPositionsHeight }] =
    useDimension<HTMLDivElement>();

  const [superchargeLiquidityRef, { height: superchargeLiquidityHeight }] =
    useDimension<HTMLDivElement>();

  const [convertToStakeRef, { height: convertToStakeHeight }] =
    useDimension<HTMLDivElement>();

  const featureFlags = useFeatureFlags();

  // create pool dialog
  const [isCreatingPool, setIsCreatingPool] = useState(false);

  const createPoolConfig = useCreatePoolConfig(
    chainStore,
    chainId,
    account?.address ?? "",
    queriesStore
  );

  // pool quick action modals
  const [addLiquidityModalPoolId, setAddLiquidityModalPoolId] = useState<
    string | null
  >(null);
  const [removeLiquidityModalPoolId, setRemoveLiquidityModalPoolId] = useState<
    string | null
  >(null);
  const [lockLpTokenModalPoolId, setLockLpTokenModalPoolId] = useState<
    string | null
  >(null);
  const [superfluidDelegateModalProps, setSuperfluidDelegateModalProps] =
    useState<ComponentProps<typeof SuperfluidValidatorModal> | null>(null);

  // TODO: add amplitude events for quick actions on pool
  const quickActionProps = {
    quickAddLiquidity: useCallback(
      (poolId: string) => setAddLiquidityModalPoolId(poolId),
      []
    ),
    quickRemoveLiquidity: useCallback(
      (poolId: string) => setRemoveLiquidityModalPoolId(poolId),
      []
    ),
    quickLockTokens: useCallback(
      (poolId: string) => setLockLpTokenModalPoolId(poolId),
      []
    ),
  };

  // lock tokens (& possibly select sfs validator) quick action state
  const { delegateSharesToValidator } = useSuperfluidPool();
  const selectedPoolShareCurrency = lockLpTokenModalPoolId
    ? queryOsmosis.queryGammPoolShare.makeShareCurrency(lockLpTokenModalPoolId)
    : undefined;
  const { config: lockLpTokenConfig, lockToken } = useLockTokenConfig(
    selectedPoolShareCurrency
  );
  const onLockToken = useCallback(
    (duration: Duration, electSuperfluid?: boolean) => {
      if (electSuperfluid && selectedPoolShareCurrency) {
        // open superfluid modal
        setSuperfluidDelegateModalProps({
          isOpen: true,
          availableBondAmount: new CoinPretty(
            selectedPoolShareCurrency,
            lockLpTokenConfig.getAmountPrimitive().amount
          ),
          onSelectValidator: (address) => {
            if (!lockLpTokenModalPoolId) {
              console.error(
                "onSelectValidator: lockLpTokenModalPoolId is undefined"
              );
              setSuperfluidDelegateModalProps(null);
              lockLpTokenConfig.setAmount("");
              return;
            }

            delegateSharesToValidator(
              lockLpTokenModalPoolId,
              address,
              lockLpTokenConfig
            ).finally(() => {
              setSuperfluidDelegateModalProps(null);
              lockLpTokenConfig.setAmount("");
            });
          },
          onRequestClose: () => setSuperfluidDelegateModalProps(null),
        });
        setLockLpTokenModalPoolId(null);
      } else {
        lockToken(duration).finally(() => {
          setLockLpTokenModalPoolId(null);
          setSuperfluidDelegateModalProps(null);
          lockLpTokenConfig.setAmount("");
        });
      }
    },
    [
      selectedPoolShareCurrency,
      lockLpTokenConfig,
      lockLpTokenModalPoolId,
      delegateSharesToValidator,
      lockToken,
    ]
  );

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

  // CL funnel
  const [showConcentratedLiqIntro, setShowConcentratedLiqIntro] =
    useState(false);
  const {
    isOpen: isUserUpgradesOpen,
    onOpen: onOpenUserUpgrades,
    onClose: onCloseUserUpgrades,
  } = useDisclosure();
  const { isMobile } = useWindowSize();

  // convert to stake funnel
  const convertToStakeConfig = useConvertToStakeConfig();
  const {
    isOpen: isConvertToStakeOpen,
    onOpen: onOpenConvertToStake,
    onClose: onCloseConvertToStake,
  } = useDisclosure();

  return (
    <main className="m-auto max-w-container bg-osmoverse-900 px-8 md:px-3">
      <NextSeo
        title={t("seo.pools.title")}
        description={t("seo.pools.description")}
      />
      <CreatePoolModal
        isOpen={isCreatingPool}
        onRequestClose={useCallback(() => setIsCreatingPool(false), [])}
        title={t("pools.createPool.title")}
        createPoolConfig={createPoolConfig}
        isSendingMsg={account?.txTypeInProgress !== ""}
        onCreatePool={onCreatePool}
      />
      {addLiquidityModalPoolId && (
        <AddLiquidityModal
          title={t("addLiquidity.titleInPool", {
            poolId: addLiquidityModalPoolId,
          })}
          poolId={addLiquidityModalPoolId}
          isOpen={true}
          onRequestClose={() => setAddLiquidityModalPoolId(null)}
        />
      )}
      {removeLiquidityModalPoolId && (
        <RemoveLiquidityModal
          title={t("removeLiquidity.titleInPool", {
            poolId: removeLiquidityModalPoolId,
          })}
          poolId={removeLiquidityModalPoolId}
          isOpen={true}
          onRequestClose={() => setRemoveLiquidityModalPoolId(null)}
        />
      )}
      {lockLpTokenModalPoolId && (
        <LockTokensModal
          title={t("lockToken.titleInPool", { poolId: lockLpTokenModalPoolId })}
          isOpen={true}
          poolId={lockLpTokenModalPoolId}
          amountConfig={lockLpTokenConfig}
          onLockToken={onLockToken}
          onRequestClose={() => setLockLpTokenModalPoolId(null)}
        />
      )}
      {superfluidDelegateModalProps && (
        <SuperfluidValidatorModal {...superfluidDelegateModalProps} />
      )}
      <section className="pt-8 pb-10 md:pt-4 md:pb-5" ref={poolsOverviewRef}>
        <PoolsOverview
          className="mx-auto"
          setIsCreatingPool={useCallback(() => setIsCreatingPool(true), [])}
        />
      </section>
      {featureFlags.convertToStake &&
        convertToStakeConfig.isConvertToStakeFeatureRelevantToUser && (
          <section
            ref={convertToStakeRef}
            className="pt-8 pb-10 md:pt-4 md:pb-5"
          >
            <ConvertToStakeAd onClickCta={onOpenConvertToStake} />
            <ConvertToStakeModal
              isOpen={isConvertToStakeOpen}
              onRequestClose={onCloseConvertToStake}
            />
          </section>
        )}
      {featureFlags.concentratedLiquidity &&
        featureFlags.upgrades &&
        userUpgrades.availableCfmmToClUpgrades.length > 0 &&
        !isMobile && (
          <section
            ref={superchargeLiquidityRef}
            className="pt-8 pb-10 md:pt-4 md:pb-5"
          >
            <SuperchargePool
              title={t("addConcentratedLiquidityeEarnMore.title")}
              caption={t("addConcentratedLiquidityeEarnMore.caption")}
              primaryCta={t("addConcentratedLiquidityeEarnMore.primaryCta")}
              secondaryCta={t("addConcentratedLiquidityeEarnMore.secondaryCta")}
              onCtaClick={onOpenUserUpgrades}
              onSecondaryClick={() => {
                setShowConcentratedLiqIntro(true);
              }}
            />
            {showConcentratedLiqIntro && (
              <ConcentratedLiquidityLearnMoreModal
                isOpen
                onRequestClose={() => setShowConcentratedLiqIntro(false)}
              />
            )}
            <UserUpgradesModal
              isOpen={isUserUpgradesOpen}
              onRequestClose={onCloseUserUpgrades}
            />
          </section>
        )}
      {featureFlags.concentratedLiquidity &&
        queryOsmosis.queryAccountsPositions.get(account?.address ?? "")
          .positions.length > 0 && (
          <section ref={myPositionsRef}>
            <div className="flex w-full flex-col flex-nowrap gap-5 pb-[3.75rem]">
              <h5>{t("clPositions.yourPositions")}</h5>
              <MyPositionsSection />
            </div>
          </section>
        )}
      <section ref={myPoolsRef}>
        <MyPoolsSection />
      </section>

      <section>
        {featureFlags.newPoolsTable ? (
          <AllPoolsTableV2
            topOffset={
              myPositionsHeight +
              myPoolsHeight +
              poolsOverviewHeight +
              superchargeLiquidityHeight +
              convertToStakeHeight
            }
            {...quickActionProps}
          />
        ) : featureFlags._isInitialized ? (
          <AllPoolsTableV1
            topOffset={
              myPositionsHeight +
              myPoolsHeight +
              poolsOverviewHeight +
              superchargeLiquidityHeight +
              convertToStakeHeight
            }
            {...quickActionProps}
          />
        ) : null}
      </section>
    </main>
  );
});

export default Pools;
