import type { ConcentratedPoolRawResponse } from "@osmosis-labs/server";
import {
  NotInitializedError,
  ObservableAddLiquidityConfig,
} from "@osmosis-labs/stores";
import { Dec } from "@osmosis-labs/unit";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { FunctionComponent } from "react";

import { AddConcLiquidity } from "~/components/complex/add-conc-liquidity";
import { AddLiquidity } from "~/components/complex/add-liquidity";
import { AddInitialLiquidity } from "~/components/complex/pool/create/cl/add-initial-liquidity";
import { SelectionToken } from "~/components/complex/pool/create/cl-pool";
import type { PoolType } from "~/components/complex/pools-table";
import { Spinner } from "~/components/loaders";
import { tError } from "~/components/localization";
import { useTranslation } from "~/hooks";
import {
  useAddConcentratedLiquidityConfig,
  useAddLiquidityConfig,
  useConnectWalletModalRedirect,
} from "~/hooks";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

import { SuperfluidValidatorModal } from "./superfluid-validator";

export const AddLiquidityModal: FunctionComponent<
  {
    poolId: string;
    /**
     * Known pool type, when the caller already has it (e.g. from the pools
     * table row). Lets the modal render the correct add-liquidity UI
     * immediately instead of briefly flashing the share-pool UI while the
     * pool query resolves.
     */
    poolType?: PoolType;
    onAddLiquidity?: (result: Promise<void>) => void;
  } & ModalBaseProps
> = observer((props) => {
  const { poolId } = props;
  const { chainStore, accountStore, queriesStore } = useStore();
  const { t } = useTranslation();

  const { chainId } = chainStore.osmosis;
  const account = accountStore.getWallet(chainId);
  const isSendingMsg = account?.txTypeInProgress !== "";

  const { config: addLiquidityConfig, addLiquidity } = useAddLiquidityConfig(
    chainStore,
    chainId,
    poolId,
    queriesStore
  );

  const [showSuperfluidValidatorModal, setShowSuperfluidValidatorModal] =
    useState(false);

  // High price-impact acknowledgement for the single-asset zap-in. Mirrors the
  // swap confirmation modal's high-loss treatment: the user must explicitly
  // confirm before a high-impact deposit can be submitted.
  const [zapCostAcknowledged, setZapCostAcknowledged] = useState(false);

  const {
    config: addConliqConfig,
    addLiquidity: addConLiquidity,
    zapInLiquidity,
    zapQuote,
    zapSlippageConfig,
  } = useAddConcentratedLiquidityConfig(chainStore, chainId, poolId);

  // Same high-impact threshold the swap tool uses (price impact worse than -10%).
  const zapHighCost = Boolean(
    addConliqConfig.singleAssetMode &&
      zapQuote.quote?.priceImpactTokenOut?.toDec().lt(new Dec(-0.1))
  );

  // initialize pool data stores once root pool store is loaded
  const { data: pool, isLoading: isPoolLoading } =
    api.local.pools.getPool.useQuery({ poolId });

  // Prefer the caller-provided type so we can pick the correct UI synchronously;
  // fall back to the fetched pool type for callers that only pass an id. Callers
  // that omit poolType still render correctly (loading -> correct UI, never a
  // weighted flash) via the guards below; passing it only skips the brief fetch.
  // TODO(follow-up PR): the remaining id-only callers — pool-detail
  // (components/pool-detail/share.tsx, pool-detail/concentrated.tsx) and the
  // create-pool "use existing pool" flow (pages/pools.tsx -> CreatePoolModal
  // onUseExistingPool, where the duplicate-pool callout already has the type) —
  // could pass `poolType` to skip the refetch. Left out here to keep the
  // footprint small (threading the type through several create-pool components).
  const resolvedPoolType = props.poolType ?? pool?.type;
  const isConcentrated = resolvedPoolType === "concentrated";

  const config = isConcentrated ? addConliqConfig : addLiquidityConfig;

  // In single-asset mode, block submission until the swap quote is ready
  // (unless the range is one-sided and no swap is needed).
  const zapNotReady =
    isConcentrated &&
    addConliqConfig.singleAssetMode &&
    Boolean(addConliqConfig.requiredSwap?.needsSwap) &&
    (zapQuote.isLoading || !zapQuote.quote);

  const { showModalBase, accountActionButton } = useConnectWalletModalRedirect(
    {
      disabled:
        config.error !== undefined ||
        isSendingMsg ||
        zapNotReady ||
        (zapHighCost && !zapCostAcknowledged),
      onClick: () => {
        // Single-asset zap-in (CL only): swap + create position in one tx.
        // Superfluid staking is full-range two-asset only, so it never applies
        // here.
        if (isConcentrated && addConliqConfig.singleAssetMode) {
          zapInLiquidity().then(() => props.onRequestClose());
          return;
        }

        // New CL position: move to next step if superfluid validator selection is needed
        if (isConcentrated && addConliqConfig.shouldBeSuperfluidStaked) {
          setShowSuperfluidValidatorModal(true);
          return;
        }

        const addLiquidityPromise = isConcentrated
          ? addConLiquidity()
          : addLiquidity();
        const addLiquidityResult = addLiquidityPromise.then(() =>
          props.onRequestClose()
        );

        if (!isConcentrated && props.onAddLiquidity) {
          props.onAddLiquidity(addLiquidityResult);
        }
      },
      isLoading: config.error && config.error instanceof NotInitializedError,
      children: config.error
        ? t(...tError(config.error))
        : isConcentrated && addConliqConfig.shouldBeSuperfluidStaked
        ? t("addConcentratedLiquidity.buttonCreateAndStake")
        : t("addLiquidity.title"),
    },
    props.onRequestClose
  );

  const loadingModal = (
    <ModalBase {...props} isOpen={props.isOpen && showModalBase}>
      <div className="flex items-center justify-center py-16">
        <Spinner />
      </div>
    </ModalBase>
  );

  const errorModal = (
    <ModalBase {...props} isOpen={props.isOpen && showModalBase}>
      <div className="flex w-full flex-col items-center justify-center py-8">
        <h6 className="mb-2">{t("addLiquidity.title")}</h6>
        <p className="text-body1 font-body1 text-osmoverse-300">
          {t("errors.fallbackText1")}
        </p>
      </div>
    </ModalBase>
  );

  // add concentrated liquidity
  if (isConcentrated) {
    // The concentrated UI needs the full fetched pool data (raw sqrt price,
    // reserve coins). When the type came from the caller, the query may still
    // be resolving, so wait for it without flashing the weighted UI. Once the
    // query settles without a pool (error / not found), surface an error
    // instead of spinning forever.
    if (!pool) return isPoolLoading ? loadingModal : errorModal;

    // Pool state detection based on liquidity
    const poolRaw = pool.raw as ConcentratedPoolRawResponse;
    const currentSqrtPrice = poolRaw?.current_sqrt_price;
    const currentTickLiquidity = poolRaw?.current_tick_liquidity;

    // Check if values are zero (handles both "0" and "0.000000..." strings)
    const isSqrtPriceZero = currentSqrtPrice
      ? parseFloat(currentSqrtPrice) === 0
      : false;
    const isTickLiquidityZero = currentTickLiquidity
      ? parseFloat(currentTickLiquidity) === 0
      : false;

    // Tier 1: Uninitialized Pool - has never been initialized (no first
    // position created). On Osmosis CL, current_sqrt_price only becomes
    // non-zero when the first position is created, so this is a reliable
    // chain-derived signal regardless of whether TVL is known. Avoid relying
    // on hasTVL here so a future regression in the TVL signal cannot route
    // an uninitialized pool into the inactive flow.
    // Note: Inactive pools (positions exist but all out of range) are handled inside AddConcLiquidity component
    const isUninitializedPool = isSqrtPriceZero && isTickLiquidityZero;

    // For uninitialized pools (but NOT inactive pools), show the initial liquidity addition interface
    // Inactive pools already have out-of-range liquidity, so they should use the normal add liquidity flow
    if (isUninitializedPool) {
      const [baseCoin, quoteCoin] = pool.reserveCoins;

      const selectedBase: SelectionToken | undefined = baseCoin?.currency
        ? {
            token: {
              coinDenom: baseCoin.currency.coinDenom,
              coinDecimals: baseCoin.currency.coinDecimals,
              coinMinimalDenom: baseCoin.currency.coinMinimalDenom,
              coinImageUrl: baseCoin.currency.coinImageUrl,
            },
            chainName: "osmosis", // Default to osmosis chain
          }
        : undefined;

      const selectedQuote: SelectionToken | undefined = quoteCoin?.currency
        ? {
            token: {
              coinDenom: quoteCoin.currency.coinDenom,
              coinDecimals: quoteCoin.currency.coinDecimals,
              coinMinimalDenom: quoteCoin.currency.coinMinimalDenom,
              coinImageUrl: quoteCoin.currency.coinImageUrl,
            },
            chainName: "osmosis", // Default to osmosis chain
          }
        : undefined;

      return (
        <ModalBase
          {...props}
          isOpen={props.isOpen && showModalBase}
          hideCloseButton
          className="max-h-[98vh] !max-w-[57.5rem] overflow-auto"
          title={
            isUninitializedPool
              ? t("pools.createSupercharged.addInitialLiquidity", {
                  poolNumber: pool.id,
                })
              : t("addLiquidity.title") + " - Pool " + pool.id
          }
        >
          <AddInitialLiquidity
            selectedBase={selectedBase}
            selectedQuote={selectedQuote}
            poolId={pool.id}
            onClose={props.onRequestClose}
          />
        </ModalBase>
      );
    }

    // For pools with existing liquidity, show the normal interface
    return (
      <>
        {showSuperfluidValidatorModal &&
          addConliqConfig.shouldBeSuperfluidStaked && (
            <SuperfluidValidatorModal
              isOpen={true}
              onRequestClose={() => setShowSuperfluidValidatorModal(false)}
              onSelectValidator={(address) =>
                addConLiquidity(address).then(() => props.onRequestClose())
              }
              ctaLabel={t("addConcentratedLiquidity.buttonCreateAndStake")}
            />
          )}
        <ModalBase
          {...props}
          isOpen={
            props.isOpen && showModalBase && !showSuperfluidValidatorModal
          }
          hideCloseButton
          className="max-h-[98vh] !max-w-[57.5rem] overflow-auto"
        >
          <AddConcLiquidity
            addLiquidityConfig={addConliqConfig}
            zapQuote={zapQuote}
            zapSlippageConfig={zapSlippageConfig}
            zapHighCost={zapHighCost}
            zapCostAcknowledged={zapCostAcknowledged}
            onZapCostAcknowledgedChange={setZapCostAcknowledged}
            actionButton={accountActionButton}
            onRequestClose={props.onRequestClose}
          />
        </ModalBase>
      </>
    );
  }

  // If we still don't know the pool type at all (no hint from the caller and
  // the query hasn't produced a pool), don't fall through to the share-pool
  // (weighted) UI below — otherwise a concentrated (supercharged) pool flashes
  // the weighted modal before the query resolves. Show loading while the query
  // is in flight, or an error once it has settled without a pool (error /
  // offline / not found).
  if (!resolvedPoolType) {
    return isPoolLoading ? loadingModal : errorModal;
  }

  // add share pool liquidity
  return (
    <ModalBase
      title={t("addLiquidity.title")}
      {...props}
      isOpen={props.isOpen && showModalBase}
    >
      <AddLiquidity
        className="pt-4"
        addLiquidityConfig={config as ObservableAddLiquidityConfig}
        actionButton={accountActionButton}
      />
    </ModalBase>
  );
});
