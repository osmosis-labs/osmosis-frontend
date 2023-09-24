import { ConcentratedLiquidityPool } from "@osmosis-labs/pools";
import { ObservableAddLiquidityConfig } from "@osmosis-labs/stores";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { FunctionComponent, useCallback } from "react";
import { useTranslation } from "react-multi-lang";

import { AddConcLiquidity } from "~/components/complex/add-conc-liquidity";
import { AddLiquidity } from "~/components/complex/add-liquidity";
import { tError } from "~/components/localization";
import {
  useAddConcentratedLiquidityConfig,
  useAddLiquidityConfig,
  useConnectWalletModalRedirect,
} from "~/hooks";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { useStore } from "~/stores";

import { SuperfluidValidatorModal } from "./superfluid-validator";

export const AddLiquidityModal: FunctionComponent<
  {
    poolId: string;
    onAddLiquidity?: (
      result: Promise<void>,
      config: ObservableAddLiquidityConfig
    ) => void;
  } & ModalBaseProps
> = observer((props) => {
  const { poolId } = props;
  const { chainStore, accountStore, queriesStore, priceStore } = useStore();
  const t = useTranslation();

  const { chainId } = chainStore.osmosis;
  const account = accountStore.getWallet(chainId);
  const isSendingMsg = account?.txTypeInProgress !== "";

  const osmosisQueries = queriesStore.get(chainStore.osmosis.chainId).osmosis!;

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
  const queryPool = osmosisQueries.queryPools.getPool(poolId);
  const clPool =
    queryPool?.pool && queryPool.pool instanceof ConcentratedLiquidityPool
      ? queryPool.pool
      : undefined;
  const config = clPool ? addConliqConfig : addLiquidityConfig;

  const { showModalBase, accountActionButton } = useConnectWalletModalRedirect(
    {
      disabled: config.error !== undefined || isSendingMsg,
      onClick: () => {
        // New CL position: move to next step if superfluid validator selection is needed
        if (Boolean(clPool) && addConliqConfig.shouldBeSuperfluidStaked) {
          setShowSuperfluidValidatorModal(true);
          return;
        }

        const addLiquidityPromise = Boolean(clPool)
          ? addConLiquidity()
          : addLiquidity();
        const addLiquidityResult = addLiquidityPromise.finally(() =>
          props.onRequestClose()
        );

        if (!Boolean(clPool)) {
          props.onAddLiquidity?.(
            addLiquidityResult,
            config as ObservableAddLiquidityConfig
          );
        }
      },
      children: config.error
        ? t(...tError(config.error))
        : Boolean(clPool) && addConliqConfig.shouldBeSuperfluidStaked
        ? t("addConcentratedLiquidity.buttonCreateAndStake")
        : t("addLiquidity.title"),
    },
    props.onRequestClose
  );

  // add concentrated liquidity
  if (Boolean(clPool)) {
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
            getFiatValue={useCallback(
              (coin) => priceStore.calculatePrice(coin),
              [priceStore]
            )}
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
        getFiatValue={(coin) => priceStore.calculatePrice(coin)}
      />
    </ModalBase>
  );
});
