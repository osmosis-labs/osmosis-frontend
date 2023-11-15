import { CoinPretty } from "@keplr-wallet/unit";
import { Duration } from "dayjs/plugin/duration";
import { observer } from "mobx-react-lite";
import type { NextPage } from "next";
import { NextSeo } from "next-seo";
import { ComponentProps, useCallback, useState } from "react";

import { AllPoolsTable } from "~/components/complex";
import { EventName } from "~/config";
import { useTranslation } from "~/hooks";
import {
  useAmplitudeAnalytics,
  useDimension,
  useLockTokenConfig,
  useSuperfluidPool,
  useWindowSize,
} from "~/hooks";
import { useFeatureFlags } from "~/hooks/use-feature-flags";
import { SuperfluidValidatorModal } from "~/modals";
import { useStore } from "~/stores";

const History: NextPage = observer(function () {
  const { chainStore, accountStore, queriesStore, userUpgrades } = useStore();
  const { t } = useTranslation();
  const { isMobile } = useWindowSize();
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

  const flags = useFeatureFlags();

  // create pool dialog
  const [isCreatingPool, setIsCreatingPool] = useState(false);

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

  return (
    <main className="m-auto max-w-container bg-osmoverse-900 px-8 md:px-3">
      <NextSeo
        title={t("seo.pools.title")}
        description={t("seo.pools.description")}
      />
      {/* <section ref={myPoolsRef}>
        <MyPoolsSection />
      </section> */}

      <section>
        <AllPoolsTable
          topOffset={
            myPositionsHeight +
            myPoolsHeight +
            poolsOverviewHeight +
            superchargeLiquidityHeight +
            convertToStakeHeight
          }
          {...quickActionProps}
        />
      </section>
    </main>
  );
});

export default History;
