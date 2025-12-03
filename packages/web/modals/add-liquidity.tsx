import {
  NotInitializedError,
  ObservableAddLiquidityConfig,
} from "@osmosis-labs/stores";
import type { ConcentratedPoolRawResponse } from "@osmosis-labs/server";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { FunctionComponent } from "react";

import { AddConcLiquidity } from "~/components/complex/add-conc-liquidity";
import { AddLiquidity } from "~/components/complex/add-liquidity";
import { AddInitialLiquidity } from "~/components/complex/pool/create/cl/add-initial-liquidity";
import { SelectionToken } from "~/components/complex/pool/create/cl-pool";
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

  const { config: addConliqConfig, addLiquidity: addConLiquidity } =
    useAddConcentratedLiquidityConfig(chainStore, chainId, poolId);

  // initialize pool data stores once root pool store is loaded
  const { data: pool } = api.local.pools.getPool.useQuery({ poolId });

  const config =
    pool?.type === "concentrated" ? addConliqConfig : addLiquidityConfig;

  const { showModalBase, accountActionButton } = useConnectWalletModalRedirect(
    {
      disabled: config.error !== undefined || isSendingMsg,
      onClick: () => {
        // New CL position: move to next step if superfluid validator selection is needed
        if (
          pool?.type === "concentrated" &&
          addConliqConfig.shouldBeSuperfluidStaked
        ) {
          setShowSuperfluidValidatorModal(true);
          return;
        }

        const addLiquidityPromise =
          pool?.type === "concentrated" ? addConLiquidity() : addLiquidity();
        const addLiquidityResult = addLiquidityPromise.then(() =>
          props.onRequestClose()
        );

        if (pool?.type !== "concentrated" && props.onAddLiquidity) {
          props.onAddLiquidity(addLiquidityResult);
        }
      },
      isLoading: config.error && config.error instanceof NotInitializedError,
      children: config.error
        ? t(...tError(config.error))
        : pool?.type === "concentrated" &&
          addConliqConfig.shouldBeSuperfluidStaked
        ? t("addConcentratedLiquidity.buttonCreateAndStake")
        : t("addLiquidity.title"),
    },
    props.onRequestClose
  );

  // add concentrated liquidity
  if (pool?.type === "concentrated") {
    // Pool state detection based on liquidity
    const poolRaw = pool.raw as ConcentratedPoolRawResponse;
    const currentSqrtPrice = poolRaw?.current_sqrt_price;
    const currentTickLiquidity = poolRaw?.current_tick_liquidity;
    const hasTVL = !pool.totalFiatValueLocked.toDec().isZero();

    // Check if values are zero (handles both "0" and "0.000000..." strings)
    const isSqrtPriceZero = currentSqrtPrice
      ? parseFloat(currentSqrtPrice) === 0
      : false;
    const isTickLiquidityZero = currentTickLiquidity
      ? parseFloat(currentTickLiquidity) === 0
      : false;

    // Tier 1: Uninitialized Pool - has never been initialized (no price set)
    // Only classify as uninitialized if there's NO TVL at all
    // Note: Inactive pools (TVL > 0 but zero tick liquidity) are handled inside AddConcLiquidity component
    const isUninitializedPool =
      isSqrtPriceZero && isTickLiquidityZero && !hasTVL;

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
            actionButton={accountActionButton}
            onRequestClose={props.onRequestClose}
          />
        </ModalBase>
      </>
    );
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
